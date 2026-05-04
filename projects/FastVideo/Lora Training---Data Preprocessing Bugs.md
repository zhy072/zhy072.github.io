---
title: Bug fixs
excerpt: Lora Training---Data Preprocessing Bugs
publishedAt: 2026-04-18
star: false
tags: [Data Preprocessing, Bugs]
---

## 前情提要
要给Wan-AI/Wan2.1-T2V-1.3B-Diffusers做lora finetuning，需要去处理crush-smol_processed_t2v/combined_parquet_dataset数据，数据顺利下载下来了，然后在做preprocessing时候OOM（RTX 4090 24GB），于是去/workspace/FastVideo/fastvideo/pipelines/preprocess下修改策略，采用offload策略：
``` python
kwargs = {
 "vae_precision": "bf16",
 "vae_config": WanVAEConfig(load_encoder=True, load_decoder=True),
        }

    fastvideo_args = FastVideoArgs(
        model_path=args.model_path,
        num_gpus=get_world_size(),
        dit_cpu_offload=False,
        vae_cpu_offload=True,
        text_encoder_cpu_offload=True,
        image_encoder_cpu_offload=True,
        pipeline_config=pipeline_config,
    )
```
codex给我改bf16的VAE精度丢给CPU，但是传进来的视频Tensor还是fp32的，不出意外就报错了：
```python
/opt/venv/lib/python3.12/site-packages/torchvision/io/_video_deprecation_warning.py:9: UserWarning: The video decoding and encoding capabilities of torchvision are deprecated from version 0.22 and will be removed in version 0.24. We recommend that you migrate to TorchCodec, where we'll consolidate the future decoding/encoding capabilities of PyTorch: https://github.com/pytorch/torchcodec
  warnings.warn(
/opt/venv/lib/python3.12/site-packages/torchvision/io/video.py:199: UserWarning: The pts_unit 'pts' gives wrong results. Please use pts_unit 'sec'.
  warnings.warn("The pts_unit 'pts' gives wrong results. Please use pts_unit 'sec'.")
Processing videos:   0%|                                                                  | 0/32 [00:02<?, ?batch/s]
[rank0]: Traceback (most recent call last):
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/v1_preprocess.py", line 123, in <module>
[rank0]:     main(args)
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/v1_preprocess.py", line 69, in main
[rank0]:     pipeline.forward(batch=None, fastvideo_args=fastvideo_args, args=args)
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/utils/_contextlib.py", line 124, in decorate_context
[rank0]:     return func(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/preprocess_pipeline_base.py", line 49, in forward
[rank0]:     self.preprocess_video_and_text(fastvideo_args, args)
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/preprocess_pipeline_base.py", line 292, in preprocess_video_and_text
[rank0]:     latents = self.get_module("vae").encode(valid_data["pixel_values"].to(
[rank0]:               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/vaes/wanvae.py", line 1144, in encode
[rank0]:     out = self.encoder(x[:, :, :1, :, :])
[rank0]:           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1787, in _call_impl
[rank0]:     return forward_call(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/vaes/wanvae.py", line 687, in forward
[rank0]:     x = self.conv_in(x, _feat_cache[idx])
[rank0]:         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1787, in _call_impl
[rank0]:     return forward_call(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/vaes/wanvae.py", line 201, in forward
[rank0]:     return super().forward(x)
[rank0]:            ^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/conv.py", line 723, in forward
[rank0]:     return self._conv_forward(input, self.weight, self.bias)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/conv.py", line 718, in _conv_forward
[rank0]:     return F.conv3d(
[rank0]:            ^^^^^^^^^
[rank0]: RuntimeError: Input type (float) and bias type (c10::BFloat16) should be the same
[rank0]:[W417 23:50:25.019233077 ProcessGroupNCCL.cpp:1553] Warning: WARNING: destroy_process_group() was not called before program exit, which can leak resources. For more info, please see https://pytorch.org/docs/stable/distributed.html#shutdown (function operator())
E0417 23:50:34.065000 12551 torch/distributed/elastic/multiprocessing/api.py:984] failed (exitcode: 1) local_rank: 0 (pid: 12627) of binary: /opt/venv/bin/python3
```
把 VAE 挪到 CPU 之后，VAE 参数还是 bf16，但喂进去的 pixel_values 还是 fp32，于是 Conv3d 看到 input 和 bias dtype 不一致，直接炸了。 FastVideo 当前这段预处理代码里，VAE encode 前只做了 .to(device)，没有把输入显式 cast 到和 VAE 相同的 dtype。对应代码就在 preprocess_pipeline_base.py 里：
```python
self.get_module("vae").encode(valid_data["pixel_values"].to(get_local_torch_device()))，
```
外面还包了一层`torch.autocast("cuda", dtype=torch.float32)`
之后给VAE 改回fp32后，出现了这样的错误：
```python
/opt/venv/lib/python3.12/site-packages/torchvision/io/_video_deprecation_warning.py:9: UserWarning: The video decoding and encoding capabilities of torchvision are deprecated from version 0.22 and will be removed in version 0.24. We recommend that you migrate to TorchCodec, where we'll consolidate the future decoding/encoding capabilities of PyTorch: https://github.com/pytorch/torchcodec
  warnings.warn(
/opt/venv/lib/python3.12/site-packages/torchvision/io/video.py:199: UserWarning: The pts_unit 'pts' gives wrong results. Please use pts_unit 'sec'.
  warnings.warn("The pts_unit 'pts' gives wrong results. Please use pts_unit 'sec'.")
Processing videos:   0%|                                                                  | 0/32 [00:03<?, ?batch/s]
[rank0]: Traceback (most recent call last):
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/v1_preprocess.py", line 123, in <module>
[rank0]:     main(args)
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/v1_preprocess.py", line 69, in main
[rank0]:     pipeline.forward(batch=None, fastvideo_args=fastvideo_args, args=args)
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/utils/_contextlib.py", line 124, in decorate_context
[rank0]:     return func(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/preprocess_pipeline_base.py", line 49, in forward
[rank0]:     self.preprocess_video_and_text(fastvideo_args, args)
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/preprocess_pipeline_base.py", line 304, in preprocess_video_and_text
[rank0]:     latents = vae.encode(pixel_values).mean
[rank0]:               ^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/vaes/wanvae.py", line 1144, in encode
[rank0]:     out = self.encoder(x[:, :, :1, :, :])
[rank0]:           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1787, in _call_impl
[rank0]:     return forward_call(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/vaes/wanvae.py", line 687, in forward
[rank0]:     x = self.conv_in(x, _feat_cache[idx])
[rank0]:         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1787, in _call_impl
[rank0]:     return forward_call(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/vaes/wanvae.py", line 201, in forward
[rank0]:     return super().forward(x)
[rank0]:            ^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/conv.py", line 723, in forward
[rank0]:     return self._conv_forward(input, self.weight, self.bias)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/conv.py", line 718, in _conv_forward
[rank0]:     return F.conv3d(
[rank0]:            ^^^^^^^^^
[rank0]: RuntimeError: Input type (CUDABFloat16Type) and weight type (CPUBFloat16Type) should be the same
[rank0]:[W417 23:58:04.570293247 ProcessGroupNCCL.cpp:1553] Warning: WARNING: destroy_process_group() was not called before program exit, which can leak resources. For more info, please see https://pytorch.org/docs/stable/distributed.html#shutdown (function operator())
E0417 23:58:14.358000 13321 torch/distributed/elastic/multiprocessing/api.py:984] failed (exitcode: 1) local_rank: 0 (pid: 13397) of binary: /opt/venv/bin/python3
```
这次不是“精度不对”了，而是“东西不在同一个地方”。
解决办法：just-in-time offload
模块默认在 CPU，执行前自动迁到 GPU，执行后再迁回 CPU。
1）从模块本身读它当前的 device/dtype；2）输入跟着模块走；3）如果启用了 offload，就先把模块迁到执行设备，再喂输入；
当然VAE似乎不是很大，没有必要纠结他的offload，放在GPU里也一样能跑，关键是text_encoder的offload问题：
```python
[rank0]: Traceback (most recent call last):
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/v1_preprocess.py", line 123, in <module>
[rank0]:     main(args)
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/v1_preprocess.py", line 69, in main
[rank0]:     pipeline.forward(batch=None, fastvideo_args=fastvideo_args, args=args)
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/utils/_contextlib.py", line 124, in decorate_context
[rank0]:     return func(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/preprocess_pipeline_base.py", line 49, in forward
[rank0]:     self.preprocess_video_and_text(fastvideo_args, args)
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/preprocess/preprocess_pipeline_base.py", line 320, in preprocess_video_and_text
[rank0]:     result_batch = self.prompt_encoding_stage(batch, fastvideo_args)
[rank0]:                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/stages/base.py", line 163, in __call__
[rank0]:     result = self.forward(batch, fastvideo_args)
[rank0]:              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/utils/_contextlib.py", line 124, in decorate_context
[rank0]:     return func(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/stages/text_encoding.py", line 64, in forward
[rank0]:     prompt_embeds_list, prompt_masks_list = self.encode_text(
[rank0]:                                             ^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/utils/_contextlib.py", line 124, in decorate_context
[rank0]:     return func(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/pipelines/stages/text_encoding.py", line 239, in encode_text
[rank0]:     outputs = text_encoder(
[rank0]:               ^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1882, in _call_impl
[rank0]:     return inner()
[rank0]:            ^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1830, in inner
[rank0]:     result = forward_call(*args, **kwargs)
[rank0]:              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/encoders/t5.py", line 667, in forward
[rank0]:     hidden_states = self.encoder(
[rank0]:                     ^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1787, in _call_impl
[rank0]:     return forward_call(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/workspace/FastVideo/fastvideo/models/encoders/t5.py", line 530, in forward
[rank0]:     hidden_states = self.embed_tokens(input_ids)
[rank0]:                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1776, in _wrapped_call_impl
[rank0]:     return self._call_impl(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1882, in _call_impl
[rank0]:     return inner()
[rank0]:            ^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/nn/modules/module.py", line 1809, in inner
[rank0]:     args_kwargs_result = hook(self, args, kwargs)  # type: ignore[misc]
[rank0]:                          ^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/distributed/fsdp/_fully_shard/_fsdp_state.py", line 62, in fsdp_hook_wrapper
[rank0]:     return torch._dynamo.disable(
[rank0]:            ^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/_dynamo/eval_frame.py", line 1181, in _fn
[rank0]:     return fn(*args, **kwargs)
[rank0]:            ^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/distributed/fsdp/_fully_shard/_fsdp_state.py", line 253, in _pre_forward
[rank0]:     args, kwargs = self._fsdp_param_group.pre_forward(module, args, kwargs)
[rank0]:                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/distributed/fsdp/_fully_shard/_fsdp_param_group.py", line 449, in pre_forward
[rank0]:     self.wait_for_unshard()
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/distributed/fsdp/_fully_shard/_fsdp_param_group.py", line 389, in wait_for_unshard
[rank0]:     with torch.autograd._unsafe_preserve_version_counter(tensor):
[rank0]:          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/autograd/grad_mode.py", line 413, in __init__
[rank0]:     self.prev_versions = tuple(t._version for t in self.tensors)
[rank0]:                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
[rank0]:   File "/opt/venv/lib/python3.12/site-packages/torch/autograd/grad_mode.py", line 413, in <genexpr>
[rank0]:     self.prev_versions = tuple(t._version for t in self.tensors)
[rank0]:                                ^^^^^^^^^^
[rank0]: RuntimeError: Inference tensors do not track version counter.
[rank0]:[W418 00:06:17.806207820 ProcessGroupNCCL.cpp:1553] Warning: WARNING: destroy_process_group() was not called before program exit, which can leak resources. For more info, please see https://pytorch.org/docs/stable/distributed.html#shutdown (function operator())
E0418 00:06:26.909000 14425 torch/distributed/elastic/multiprocessing/api.py:984] failed (exitcode: 1) local_rank: 0 (pid: 14502) of binary: /opt/venv/bin/python3
```
关键信息：`RuntimeError: Inference tensors do not track version counter.`
preprocess 代码外面套了`torch.inference_mode()`，这个模式会生成一种“更轻量”的 tensor，这种 tensor 没有 version counter，但这里的 text encoder 被 FSDP 包了一层，FSDP 在 forward 前要检查/管理 tensor 状态，它 需要 version counter，结果它拿到 inference tensor，就直接报错了。
解决办法：
preprocess 不要用 `torch.inference_mode()`，改成 `torch.no_grad()`
你听好了，我做如下修改：
1）fastvideo/pipelines/preprocess/preprocess_pipeline_base.py (line 267)
2）fastvideo/pipelines/preprocess/preprocess_pipeline_text.py (line 59)
3）fastvideo/pipelines/preprocess/preprocess_pipeline_ode_trajectory.py (line 85)

### Differnce Between torch.no_grad() and torch.inference_mode() 
`torch.no_grad()`: 
PyTorch 默认每次做运算都会记录"我是怎么算出来的"，方便之后 .backward() 反向传播。但推理时根本不需要反向传播，这个记录纯属浪费内存和时间。no_grad() 就是把这个记录关掉。
`torch.inference_mode()`:
它是 PyTorch 1.9 之后加的，比 no_grad() 更激进的推理模式。除了不构建计算图之外，还额外做了一件事：在这个上下文里产生的 tensor，完全切断了和 autograd 系统的一切联系。具体来说，no_grad() 下产生的 tensor，虽然不会参与梯度计算，但它还保留着 requires_grad 等属性，理论上还能被"拉回"到 autograd 里去。而 inference_mode() 下产生的 tensor 会直接打上标记，autograd 碰都不会碰它。 
但是为什么text_encoder经过FSDP包装后就没有遇到跟VAE一样不同device的报错呢？
FSDP 在 forward 之前有一个 hook，会自动把输入 tensor 搬到当前参数所在的设备上。

### FSDP 内部伪代码
```python
def forward(self, *args, **kwargs):

    # 1. 把分散的参数 allgather 回来（分布式场景）

    # 2. 关键：把输入搬到参数所在设备
    args = move_inputs_to_device(args, self.compute_device)

    # 3. 正常 forward
    output = self.module(*args, **kwargs)

    # 4. forward 结束后再把参数 offload 回去
    return output
```
裸的 nn.Module（VAE）没有任何自动搬运的逻辑，直接把你的输入和自己的权重做运算，设备不一致就直接炸。（nn.Module怎么这么坏啊）

为什么我们这么坏不把VAE也FSDP包一下呢？

这是一个工程权衡，主要有两个原因：

1). 体积差异
text_encoder（T5-XXL 等）动辄几十亿参数，不用 FSDP 根本塞不进显存。VAE 相对小得多，直接 .to(device) 就能用，不需要动用 FSDP 这种重型武器。

2). VAE 的计算特性不适合 FSDP
VAE 全是卷积操作，权重和输入的空间结构紧密耦合，FSDP 那种"用时拼回来、用完切碎"的方式对卷积不够友好，反而会引入额外开销。FSDP 最适合的是 Transformer 那种按层堆叠、每层相对独立的结构。

### FSDP 的做法：把权重切碎分摊
（for example）

`GPU 0: 1/3 权重分片 `

`GPU 1: 1/3 权重分片   `

`GPU 2: 1/3 权重分片`

需要用到某一层的完整权重时，临时 allgather（把大家的分片拼回来），算完立刻丢掉，不常驻显存。这样每张卡只需要存 1/N 的权重，显存压力大幅降低。CPU offload 是 FSDP 的一个附加选项，把暂时用不到的分片直接推到内存，显存占用进一步压缩。