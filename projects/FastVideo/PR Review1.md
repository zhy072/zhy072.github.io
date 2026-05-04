---
title: PR Review fix01
excerpt: Fix problems
publishedAt: 2026-04-23
star: false
tags: [PR Review, Bugs]
---

PR Path:
https://github.com/hao-ai-lab/FastVideo/pull/1242

---
本次 Review Fix 说明
这次修改主要是回应 reviewer 提出的几个问题，范围包括：

- preprocessing 阶段 `torch.inference_mode()` 和 text encoder CPU offload/FSDP 的兼容性问题
- training path 中 `dit_precision` 不应该被放宽为 bf16 master weights
- LoRA 相关状态不应该只写在 `WanModel` 里
- LoRA enable 逻辑应该抽到 `ModelBase`，避免未来模型重复实现

---
## 1. Preprocess 中  inference_mode()  和 text encoder CPU offload 的问题

**遇到的问题**：
原来的 preprocess 代码外层统一使用：
`torch.inference_mode()`
这在普通 preprocessing 场景下是合理的，因为 preprocessing 不需要梯度，`inference_mode()` 比 `no_grad()` 更轻量。
但是当：
`text_encoder_cpu_offload=True`
text encoder 会走 CPU offload / FSDP 相关路径。这个时候 FSDP 在 forward 前后可能需要检查、管理 tensor 状态，其中包括 tensor 的 version counter。

问题是：`torch.inference_mode()` 产生的 inference tensor 不 tracking version counter。因此在 offload/FSDP path 中可能触发：
`RuntimeError: Inference tensors do not track version counter.`

**为什么这个问题重要?**
这个问题不是普通的性能差异，而是会直接导致 preprocessing 崩溃。
尤其是 `text_encoder_cpu_offload=True` 通常是为了在显存较小的机器上跑 preprocessing，比如 4090 这类场景。如果这个路径不能工作，那么用户在低显存环境下就无法正常生成 text embedding / latent 数据。
同时，我们也不希望把所有 preprocess 都无脑改成 torch.no_grad()，因为默认不开 offload 的情况下，torch.inference_mode() 仍然是更合适、更轻量的选择。

**解决方案**:
现在根据是否启用 text encoder CPU offload 来选择 context：
```python
if text_encoder_cpu_offload:
    torch.no_grad()
else:
    torch.inference_mode()
```
也就是说：
默认情况 `text_encoder_cpu_offload=False`：继续使用 `torch.inference_mode()`
offload 情况 `text_encoder_cpu_offload=True`：改用 `torch.no_grad()`

这样既保留了默认路径的效率，也修复了 FSDP/offload path 的兼容性问题。
同时把 `text_encoder_cpu_offload` 作为可传递参数接入 preprocess pipeline，默认值保持为：False

---
## 2. dit_precision 不应该放宽为 bf16 master weights
Reviewer **指出的问题**:
之前我把 training path 里的 dit_precision 从只允许 fp32 放宽成了允许：
`{"fp32", "bf16"}`
Reviewer 指出这里不应该这样改。原因是这里的 dit_precision 在 ComposedPipelineBase 这条旧 training path 里实际上被当成 `model load / master weight precision` 使用，而不是单纯的 compute precision。

**为什么这个问题重要?**
这里很容易混淆两个概念：
- master weights precision
- forward/backward/reduce 的 mixed precision compute dtype
  
FSDP2 训练里更合理的设计是：
- master weights 仍然使用 fp32
- forward/backward/reduction 使用 FSDP2 MixedPrecisionPolicy 控制，比如 bf16 compute
  
也就是说，如果用户想“用 bf16 训练”，不应该通过把 master weights 直接 load 成 bf16 来实现，而应该通过 mixed precision policy 实现。
如果这里允许 `dit_precision=bf16`，可能会让旧 training pipeline 直接用 bf16 master weights，这会改变训练数值行为，也和当前 FSDP2 mixed precision 设计不一致。

**解决方案**:
恢复 reviewer 期望的 fp32-only assert：
```python
assert fastvideo_args.pipeline_config.dit_precision == "fp32", (
    "only fp32 is supported for training"
)
```
这表示这条 training path 仍然只支持 fp32 master weights。
如果用户需要 bf16 训练，正确方向应该是通过 FSDP mixed precision 控制 compute dtype，而不是放宽这里的 master weight precision。

---
## 3. LoRA constructor state 不应该只放在 WanModel
Reviewer **指出的问题**:
之前 LoRA 相关字段是在 WanModel.__init__() 里初始化的，例如：
```python
self._trainable
self._lora_rank
self._lora_alpha
self._lora_target_modules
self._num_lora_layers
```
Reviewer 的意思是，这些字段并不是 Wan 独有的逻辑，而是所有 model plugin 都可能需要的 common model state。

**为什么这个问题重要?**
如果这些字段只放在 WanModel，未来每加一个新的 model plugin，都可能需要重复写一遍相同逻辑。

这会带来几个问题：
- duplicated code
- 不同模型之间 LoRA 行为可能慢慢变得不一致
- 后续维护时容易漏改某个模型
- ModelBase 作为 per-role model abstraction，没有承接通用 training state
  
**解决方案**:
把这些通用字段移到 `ModelBase.__init__()`：
```python
self._trainable
self._lora_rank
self._lora_alpha
self._lora_target_modules
self._num_lora_layers
```
然后 WanModel 改成调用：
```python
super().__init__(
    trainable=trainable,
    lora_rank=lora_rank,
    lora_alpha=lora_alpha,
    lora_target_modules=lora_target_modules,
)
```
这样 common state 由 ModelBase 统一持有，WanModel 只负责 Wan 自己的 transformer loading、scheduler 和 batch 逻辑。

---
## 4. LoRA enable 逻辑应该抽到 ModelBase
Reviewer **指出的问题**:
之前 `WanModel._load_transformer()` 里直接写了 LoRA enable 逻辑：
```python
if self._lora_rank is not None:
    ...
    enable_lora_training(...)
```
Reviewer 认为这部分逻辑也是通用的，不应该绑定在 WanModel 内部。
不过 transformer 的具体加载逻辑仍然是 model-specific 的，因为不同模型可能有不同 transformer class、checkpoint override、config 处理方式。

**为什么这个问题重要?**
LoRA enable 逻辑本身是通用 training behavior：
- 检查是否配置了 lora_rank
- 检查 model 是否 trainable
- 调用 enable_lora_training
- 记录 LoRA layer 数量

这些逻辑不依赖 Wan 架构本身。如果每个模型都自己写一份，未来 Hunyuan、Wan Causal、MatrixGame 或新模型都可能产生重复实现和行为差异。

**解决方案**:
在 ModelBase 里新增 helper：
`_enable_lora_if_configured(transformer)`
这个名字是有意选择的，因为它不是无条件 enable LoRA，而是：
如果没有配置 lora_rank，返回 False
如果配置了 LoRA，则 enable LoRA 并返回 True
`WanModel._load_transformer()` 现在只需要调用：
```python
if self._enable_lora_if_configured(transformer):
    return transformer
```
如果没有启用 LoRA，则继续走普通 trainable/frozen path：
`transformer = apply_trainable(transformer, trainable=trainable)`
目前实际 call site 在 WanModel，但由于以下模型都复用了 WanModel 的 loading path，所以它们也会受益：
```
WanModel
HunyuanModel
WanCausalModel
MatrixGameModel
```
未来如果有新的模型直接继承 ModelBase，也可以在自己的 `_load_transformer()` 中复用同一个 helper。
涉及文件
```
Preprocess offload fix
fastvideo/pipelines/preprocess/preprocess_pipeline_base.py
fastvideo/pipelines/preprocess/preprocess_pipeline_text.py
fastvideo/pipelines/preprocess/preprocess_pipeline_ode_trajectory.py
fastvideo/pipelines/preprocess/v1_preprocess.py
Training precision / LoRA review fixes
fastvideo/pipelines/composed_pipeline_base.py
fastvideo/train/models/base.py
fastvideo/train/models/wan/wan.py
```
本地验证
已通过：
```bash
python -m py_compile ...
python3.12 -m py_compile ...
git diff --check
```