---
title: Lora Training
excerpt: Lora Training---Training logs
publishedAt: 2026-04-19
star: false
tags: [Lora training, Bugs]
---

```python
q_proj
k_proj
v_proj
o_proj
to_q
to_k
to_v
to_out
to_qkv
to_gate_compress
```
这些字段有什么区别吗？

`q_proj / k_proj / v_proj / o_proj`:

常见于 Hugging Face / LLM 风格命名。意思就是 attention 的 query/key/value/output 投影层。

`to_q / to_k / to_v / to_out`:

也是 attention 投影层，但更常见于 diffusion / DiT / diffusers 风格实现。对 Wan 来说你现在实际匹配到的是这组。

`to_qkv`:

这是 把 q/k/v 合成一个线性层 的写法。也就是说一个层一次性输出 q、k、v，而不是 3 个单独线性层。

`to_gate_compress`:

这不是标准 attention 四件套里的层。它是某些 FastVideo 自定义 block 里的额外投影层，用在特定 attention / sparse attention 路径里。不是每个模型都有。

---
训练开始前有这么一段：
```python
INFO 04-18 21:48:09.758 [component_loader.py:400] Loading weights took 6.43 seconds
INFO 04-18 21:48:27.323 [composed_pipeline_base.py:396] Loaded module text_encoder from /root/.cache/huggingface/hub/models--Wan-AI--Wan2.1-T2V-1.3B-Diffusers/snapshots/0fad780a534b6463e45facd96134c9f345acfa5b/text_encoder
INFO 04-18 21:48:27.324 [component_loader.py:1111] Loading tokenizer using transformers from /root/.cache/huggingface/hub/models--Wan-AI--Wan2.1-T2V-1.3B-Diffusers/snapshots/0fad780a534b6463e45facd96134c9f345acfa5b/tokenizer
INFO 04-18 21:48:27.324 [component_loader.py:520] Loading tokenizer from /root/.cache/huggingface/hub/models--Wan-AI--Wan2.1-T2V-1.3B-Diffusers/snapshots/0fad780a534b6463e45facd96134c9f345acfa5b/tokenizer
INFO 04-18 21:48:27.671 [component_loader.py:584] Loaded tokenizer: T5TokenizerFast
INFO 04-18 21:48:27.671 [composed_pipeline_base.py:396] Loaded module tokenizer from /root/.cache/huggingface/hub/models--Wan-AI--Wan2.1-T2V-1.3B-Diffusers/snapshots/0fad780a534b6463e45facd96134c9f345acfa5b/tokenizer
INFO 04-18 21:48:27.671 [composed_pipeline_base.py:379] Using module transformer already provided
INFO 04-18 21:48:27.671 [component_loader.py:1111] Loading vae using diffusers from /root/.cache/huggingface/hub/models--Wan-AI--Wan2.1-T2V-1.3B-Diffusers/snapshots/0fad780a534b6463e45facd96134c9f345acfa5b/vae
INFO 04-18 21:48:28.051 [composed_pipeline_base.py:396] Loaded module vae from /root/.cache/huggingface/hub/models--Wan-AI--Wan2.1-T2V-1.3B-Diffusers/snapshots/0fad780a534b6463e45facd96134c9f345acfa5b/vae
INFO 04-18 21:48:28.052 [lora_pipeline.py:135] trainable_transformer_modules: dict_keys(['transformer'])
INFO 04-18 21:48:28.053 [composed_pipeline_base.py:187] Creating pipeline stages...
INFO 04-18 21:48:28.140 [validation_dataset.py:92] Rank 0 (SP group 0): Original samples: 3, Extended samples: 3, SP group samples: 3, Range: [0:3]
INFO 04-18 21:48:28.141 [composed_pipeline_base.py:448] Running pipeline stages: dict_keys(['input_validation_stage', 'prompt_encoding_stage', 'conditioning_stage', 'timestep_preparation_stage', 'latent_preparation_stage', 'denoising_stage', 'decoding_stage'])
100%|██████████| 5/5 [00:27<00:00,  5.50s/it]
INFO 04-18 21:49:14.146 [composed_pipeline_base.py:448] Running pipeline stages: dict_keys(['input_validation_stage', 'prompt_encoding_stage', 'conditioning_stage', 'timestep_preparation_stage', 'latent_preparation_stage', 'denoising_stage', 'decoding_stage'])
100%|██████████| 5/5 [00:24<00:00,  5.00s/it]
INFO 04-18 21:50:03.040 [composed_pipeline_base.py:448] Running pipeline stages: dict_keys(['input_validation_stage', 'prompt_encoding_stage', 'conditioning_stage', 'timestep_preparation_stage', 'latent_preparation_stage', 'denoising_stage', 'decoding_stage'])
100%|██████████| 5/5 [00:25<00:00,  5.00s/it]
```
这是在做什么？

训练循环开始前，先执行了一次`self.callbacks.on_validation_begin(method, iteration=start_step) `, 如果   `start_step=0`，而且 YAML 里有：
```python
callbacks:
  validation:
    every_steps: 5
    sampling_steps: [5]
```

那它会在step 0 先跑一轮验证生成，相当于“开训前先出一版 baseline 样片”。

`Loaded module text_encoder / tokenizer / vae`
为了做验证生成，临时搭了一套 推理 pipeline

`trainable_transformer_modules: dict_keys(['transformer'])`
这套 pipeline 里可训练/可替换的主模块就是 transformer

`Creating pipeline stages...`
在组装推理阶段：prompt 编码、latent 准备、denoising、decoding 这些

`Original samples: 3`
说明validation.json (line 1) 里有 3 条验证 prompt

`Running pipeline stages...`
开始对某一条验证样本做生成

`100%|...| 5/5`
这里的 5/5 是 5 个 denoising steps，因为配的是 sampling_steps: [5]

所以整体就是：
```
1) 训练启动
2) 先加载验证用的推理组件
3) 用 3 条 prompt 各生成 1 个视频，每个视频用 5 个 inference steps
4) 作为 step 0 的验证结果写到输出目录 / tracker
```
然后才正式进入训练

好处：
- 对比训练前后明显变化
- 尽早发现推理链路问题
- 训练能跑，不代表验证生成一定能跑。
- 先在 step 0 跑一轮，可以尽早暴露这些问题：
  
        pipeline 组装错

        validation json 有问题

        VAE / tokenizer / text encoder 没加载对

        生成分辨率/帧数不匹配

- 确认当前 checkpoint 真能出样
  
对 finetune 来说，这很实用。一开跑就知道 base model 在这套配置下能不能正常出视频。

---
为什么训练时候在控制面板或者nvidia-smi看到显存几乎占满了（23GB往上），但是最后log里打印出来的peak_vram只有15GB不到？

现在打印的 peak_vram_gb 来自 fastvideo/train/trainer.py (line 201)：`torch.cuda.max_memory_allocate(train_device) `

这个指标的含义是：PyTorch 张量实际占用过的峰值显存。

它不包含这些东西：

- `PyTorch caching allocator` 预留但当前没被张量占着的显存

- `CUDA context`:
`cuDNN / cuBLAS / FlashAttention / NCCL` 的工作区

- 其他非 PyTorch CUDA 分配

PyTorch 官方文档也明确说过，`memory_allocated()/max_memory_allocated()`往往会小于nvidia-smi，更接近nvidia-smi的是`max_memory_reserved()`。

---
在训练Wan2.1-T2V-1.3B：`avg_step_time_sec = 49.61；Wan2.2-TI2V-5B：avg_step_time_sec = 27.35`
这俩模型时候的平均步时常，为什么除了精度不一样（fp32和bf16）外其余参数都一样（包括num_latent, flow shift之类的），5B的训练时长会快了接近一倍呢？

bf16会更好地吃到 Tensor Core（老黄啊老黄）

---
finetune 启动时不再提前做 `ensure_negative_conditioning()` 只有真的走 unconditional 分支时，才会去构建 negative prompt embedding 是何意味？

经典写法是：
$$
ϵ_{guided}=ϵ_{uncond}+s⋅(ϵ_{cond}−ϵ_{uncond})
$$
直觉上：
- unconditional = 模型“什么都不太指定”时会怎么生成 
- conditional = 模型“按 prompt 来”时会怎么生成 
- 两者差值 = prompt 真正带来的方向 
- 再乘一个系数(s: guidance scale) = 加强 prompt 约束 

因为 训练 和 推理 不一样。
很多 finetune 场景里：
- 只做正常的 conditional forward 
- 不做 inference-style CFG 双分支推理 
- 或者训练时 guidance 根本没开 
  
这时候：
- 正向 prompt embedding 要用 
- 但 negative/unconditional 那一路根本不走 
- 
所以提前构建 negative_conditioning 就成了浪费。

---
Flow shift(为什么5B的模型给我建议了5而1.3B的建议了3)

shift = 3：偏保守、常见低分辨率配置。FastVideo 训练接口默认就是 3.0，Diffusers 的 Wan 文档也建议低分辨率场景用较低 shift（大致 2–5）。 

shift = 7：更激进，更偏高噪声/全局结构，通常更适合更高分辨率设置；Diffusers 文档建议高分辨率用更高 shift（大致 7–12），Wan 官方问答里也说 480p 训练可设 2，更高分辨率如 720p 及以上应相应增大。

训练时，shift 影响的是在什么噪声区间上教模型，也就是 supervision 更偏向哪段 timestep；Wan 训练被广泛描述为使用 logit-normal timestep sampling，而官方问答里也明确给了训练时按分辨率调 flow_shift 的建议。推理时，shift 影响的是采样器怎么走 denoising 轨迹，scheduler 会在 set_timesteps() 时用上面的公式重建一条 shifted 的 sigma/timestep 序列。