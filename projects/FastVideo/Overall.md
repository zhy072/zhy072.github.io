---
title: FV Fintune Manual
excerpt: User Manual
publishedAt: 2026-04-20
star: true
tags: [Lora training, User Manual]
---

本文记录一次把 FastVideo 新训练框架 `fastvideo/train/` 扩展到 LoRA
finetuning 的过程。目标不是做完整训练 recipe，而是验证 support matrix 中
常见模型在单张 RTX 4090 上是否可以启动、是否会 OOM、哪些数据路径可以复用，
并把每次训练结果写入 Excel。

## 背景

FastVideo 原本已有推理侧 LoRA 和部分旧训练 pipeline，但新 YAML 训练框架
`fastvideo/train/` 缺少一个统一的训练侧 LoRA 注入入口。本次改动选择了最小
侵入路线：

- 在 model plugin 加载 transformer 后，把目标线性层替换为 LoRA wrapper。
- 保持训练方法仍然使用 `FineTuneMethod`。
- 用 YAML 参数控制 `lora_rank`、`lora_alpha` 和 `lora_target_modules`。
- 训练结束后通过 `run.sh` 统一生成 run record，并追加到 Excel。

这套实现适合“快速验证能否跑通”，不等价于官方完整训练 recipe。

## 主要改动

### LoRA 注入

核心文件：

- `fastvideo/train/utils/lora.py`
- `fastvideo/train/models/wan/wan.py`
- `fastvideo/train/models/hunyuan/hunyuan.py`
- `fastvideo/train/models/wan/wan_causal.py`

`enable_lora_training(...)` 会做三件事：

- 冻结 base transformer。
- 遍历目标模块名，把可兼容线性层替换成 `BaseLayerWithLoRA`。
- 分布式初始化后，把新增的 LoRA 参数包装成 replicated DTensor。

默认匹配模块：

```yaml
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - to_q
  - to_k
  - to_v
  - to_out
  - to_qkv
  - to_gate_compress
```

实际使用时建议显式写目标模块。Wan 系常用：

```yaml
lora_target_modules:
  - to_q
  - to_k
  - to_v
  - to_out
```

Hunyuan 系常用：

```yaml
lora_target_modules:
  - img_attn_qkv
  - img_attn_proj
  - txt_attn_qkv
  - txt_attn_proj
  - self_attn_qkv
  - self_attn_proj
```

### Excel 训练记录

核心文件：

- `examples/train/run.sh`
- `scripts/training/build_run_record.py`
- `scripts/training/append_run_log.py`

运行时设置：

```bash
TRAINING_RUN_LOG_XLSX="/workspace/FastVideo/result/train_log.xlsx" \
TRAINING_RUN_LOG_SHEET="train_log" \
TRAINING_RUN_LOG_OWNER="$USER" \
NUM_GPUS=1 WANDB_MODE=offline \
bash examples/train/run.sh \
  examples/train/configs/fine_tuning/wan/t2v_lora.yaml
```

训练成功和失败都会生成 record。失败时会记录 `status` 和
`failure_reason`，训练成功时会尽量补充：

- `final_train_loss`
- `avg_step_time_sec`
- `peak_vram_gb`
- `wall_time_hours`
- 模型、数据、分辨率、LoRA rank、precision、输出目录等配置字段

注意：`peak_vram_gb` 目前主要来自 `torch.cuda.max_memory_allocated()`。
它表示 PyTorch tensor allocated peak，不等于 `nvidia-smi` 看到的进程总显存。
`nvidia-smi` 还包括 allocator reserved memory、CUDA context、NCCL、cuDNN /
FlashAttention 工作区等。

## 数据准备

### Wan T2V 数据

示例数据：

```bash
python scripts/huggingface/download_hf.py \
  --repo_id "wlsaidhi/crush-smol-merged" \
  --local_dir "data/crush-smol" \
  --repo_type "dataset"
```

准备 `merge.txt`：

```bash
printf 'data/crush-smol/videos,data/crush-smol/videos2caption.json\n' \
  > data/crush-smol/merge.txt
```

旧 preprocess 入口更稳定：

```bash
torchrun --nproc_per_node=1 \
  fastvideo/pipelines/preprocess/v1_preprocess.py \
  --model_path Wan-AI/Wan2.1-T2V-1.3B-Diffusers \
  --data_merge_path data/crush-smol/merge.txt \
  --preprocess_video_batch_size 1 \
  --seed 42 \
  --max_height 480 \
  --max_width 832 \
  --num_frames 77 \
  --dataloader_num_workers 0 \
  --output_dir data/crush-smol_processed_t2v \
  --train_fps 16 \
  --samples_per_file 4 \
  --flush_frequency 4 \
  --video_length_tolerance_range 5 \
  --preprocess_task t2v
```

训练 YAML 使用：

```yaml
training:
  data:
    data_path: data/crush-smol_processed_t2v/combined_parquet_dataset
```

### Wan2.2 TI2V 5B 数据

这条在当前新训练栈里继续使用 T2V-style parquet，而不是 Wan I2V 的
`clip_feature` / `first_frame_latent` schema。

```bash
torchrun --nproc_per_node=1 \
  fastvideo/pipelines/preprocess/v1_preprocess.py \
  --model_path Wan-AI/Wan2.2-TI2V-5B-Diffusers \
  --data_merge_path data/crush-smol/merge.txt \
  --preprocess_video_batch_size 1 \
  --seed 42 \
  --max_height 480 \
  --max_width 832 \
  --num_frames 77 \
  --dataloader_num_workers 0 \
  --output_dir data/crush-smol_processed_ti2v \
  --train_fps 16 \
  --samples_per_file 1 \
  --flush_frequency 1 \
  --video_length_tolerance_range 5 \
  --preprocess_task t2v
```

训练 YAML 使用：

```yaml
training:
  data:
    data_path: data/crush-smol_processed_ti2v/combined_parquet_dataset
```

### MatrixGame 数据

MatrixGame 不是普通 Wan I2V。它需要：

- `clip_feature`
- `first_frame_latent`
- `keyboard_cond`
- `mouse_cond`

如果只是验证训练链路，动作字段可以为空或用假动作；但没有动作条件时，结果不代表
真正可控的 MatrixGame finetune。

官方示例假设本地已有 `footsies-dataset/`：

```bash
python fastvideo/pipelines/preprocess/v1_preprocess.py \
  --model_path FastVideo/Matrix-Game-2.0-Foundation-Diffusers \
  --data_merge_path footsies-dataset/merge.txt \
  --preprocess_video_batch_size 4 \
  --seed 42 \
  --max_height 352 \
  --max_width 640 \
  --num_frames 77 \
  --dataloader_num_workers 0 \
  --output_dir footsies-dataset/preprocessed \
  --samples_per_file 4 \
  --train_fps 25 \
  --flush_frequency 4 \
  --preprocess_task matrixgame
```

如果本地已有真正 I2V parquet，并且包含 `clip_feature` / `first_frame_latent`，
可以临时复用来调通 MatrixGame 训练；但 T2V/TI2V parquet 不能直接复用。

### Hunyuan / FastHunyuan 数据

Hunyuan debug YAML 默认使用：

```text
data/hunyuan_overfit_preprocessed
```

这个目录不是自动下载的数据集，而是由本地 `data/hunyuan_overfit/` 原始视频
preprocess 得到。`FastVideo/FastHunyuan-diffusers` 属于 Hunyuan 13B 级别，
4090 单卡 LoRA 训练大概率 OOM。

### GEN3C 数据

`FastVideo/GEN3C-Cosmos-7B-Diffusers` 当前只有推理链路，没有新训练栈的
LoRA 数据链。

它不是普通 I2V 数据。推理时需要：

- `image_path`
- MoGe 深度估计
- 3D cache 渲染
- `condition_video_pose`
- `condition_video_input_mask`
- 相机轨迹参数：`trajectory_type`、`movement_distance`、`camera_rotation`

因此不能直接复用现有 T2V/I2V parquet。

## 模型结论

| 模型 | 当前 YAML / 路径 | 4090 结论 | 备注 |
| --- | --- | --- | --- |
| `Wan-AI/Wan2.1-T2V-1.3B-Diffusers` | `examples/train/configs/fine_tuning/wan/t2v_lora.yaml` | 可跑 | 最稳基线 |
| `FastVideo/FastWan2.1-T2V-1.3B-Diffusers` | `examples/train/configs/fine_tuning/wan/fast_t2v_lora_vsa.yaml` | 可尝试 | 需要 VSA；训练入口会按 `training.vsa.sparsity` 选 backend |
| `Wan-AI/Wan2.2-TI2V-5B-Diffusers` | `examples/train/configs/fine_tuning/wan/ti2v_lora.yaml` | bf16 后可尝试 | 5B 在 4090 上非常贴边；必须避免多余 validation/pipeline 常驻 |
| `FastVideo/FastWan2.2-TI2V-5B-FullAttn-Diffusers` | `examples/train/configs/fine_tuning/wan/fast_ti2v_fullattn_lora_vsa.yaml` | 可尝试但高风险 | 使用 VSA；数据仍用 T2V-style parquet |
| `loayrashid/TurboWan2.1-T2V-1.3B-Diffusers` | `examples/train/configs/fine_tuning/wan/turbo_t2v_lora_sla.yaml` | 可尝试 | 需要 SLA attention backend |
| `hunyuanvideo-community/HunyuanVideo` | `examples/train/configs/fine_tuning/hunyuan/t2v_lora.yaml` | 4090 大概率 OOM | 13B 级别 |
| `FastVideo/FastHunyuan-diffusers` | `examples/train/configs/fine_tuning/hunyuan/fast_t2v_lora.yaml` | 4090 大概率 OOM | bf16 后权重本体仍约 26GB 级别 |
| `FastVideo/Matrix-Game-2.0-*` | `examples/train/configs/fine_tuning/matrixgame/i2v_lora.yaml` | 取决于数据 | 需要 MatrixGame schema；动作条件最好真实存在 |
| `FastVideo/GEN3C-Cosmos-7B-Diffusers` | 无训练 YAML | 当前不支持 | 推理支持，不是 LoRA finetune 支持 |

## 运行命令

通用命令：

```bash
cd /workspace/FastVideo
export PYTHONPATH=/workspace/FastVideo:$PYTHONPATH
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True

TRAINING_RUN_LOG_XLSX="/workspace/FastVideo/result/train_log.xlsx" \
TRAINING_RUN_LOG_SHEET="train_log" \
TRAINING_RUN_LOG_OWNER="$USER" \
NUM_GPUS=1 WANDB_MODE=offline \
bash examples/train/run.sh \
  examples/train/configs/fine_tuning/wan/t2v_lora.yaml
```

MatrixGame 切模型可以用 override：

```bash
bash examples/train/run.sh \
  examples/train/configs/fine_tuning/matrixgame/i2v_lora.yaml \
  --models.student.init_from FastVideo/Matrix-Game-2.0-GTA-Diffusers \
  --training.checkpoint.output_dir outputs/matrixgame_gta_i2v_lora_debug \
  --training.tracker.run_name matrixgame_gta_i2v_lora_debug
```

## 常见问题复盘

### `ModuleNotFoundError: No module named 'fastvideo'`

训练进程没有把仓库根目录放进 `PYTHONPATH`。`run.sh` 已经设置：

```bash
export PYTHONPATH="${REPO_ROOT}${PYTHONPATH:+:${PYTHONPATH}}"
python -m torch.distributed.run -m fastvideo.train.entrypoint.train ...
```

手动跑时也要先设置：

```bash
export PYTHONPATH=/workspace/FastVideo:$PYTHONPATH
```

### `No parquet files found`

`data_path` 必须指向预处理后的 `combined_parquet_dataset`。原始视频目录不能直接
喂给新训练栈。

### `v1_preprocessing_new.py: unrecognized arguments`

当前环境里的新 preprocess CLI 不一定接了 `--preprocess.*` 参数。直接使用旧入口：

```bash
fastvideo/pipelines/preprocess/v1_preprocess.py
```

### preprocess OOM 或 system memory 爆

优先降低：

- `--preprocess_video_batch_size 1`
- `--samples_per_file 1`
- `--flush_frequency 1`
- 分辨率
- 帧数

RunPod 磁盘不足时，优先清理：

- `outputs/`
- 训练 log
- 生成视频
- 不再使用的 preprocess 输出
- 不再使用的大模型 Hugging Face cache

### VAE / text encoder dtype 或 device mismatch

预处理阶段如果开启 bf16 / CPU offload，必须保证输入 tensor 和模块权重处在同一
device、同一 dtype。否则会出现：

- `Input type (float) and bias type (BFloat16) should be the same`
- `Input type (CUDABFloat16Type) and weight type (CPUBFloat16Type) should be the same`

### `Inference tensors do not track version counter`

FSDP forward 不适合包在 `torch.inference_mode()` 下。preprocess / encoding 场景
应使用 `torch.no_grad()`，既不计算梯度，又保留正常 tensor version counter。

### TI2V validation 要用哪个 pipeline

`Wan-AI/Wan2.2-TI2V-5B-Diffusers` 和 FastWan TI2V 这条在新训练栈中继续走：

```yaml
pipeline_target: fastvideo.pipelines.basic.wan.wan_pipeline.WanPipeline
```

不要换成 `WanImageToVideoPipeline`，否则会强找 `image_encoder`。

### VSA 日志同时出现 FlashAttention

这是正常的。Wan 开 VSA 后，视频 self-attention 会走
`VIDEO_SPARSE_ATTN`，但 text/image cross-attention 仍可能回退到 FlashAttention。
这不是 VSA 没生效。

### 5B 模型训练前显存就接近 23GB

如果是 fp32 master weights，5B 参数本体约 20GB，加上 CUDA/context/buffer 后会
非常接近 4090 上限。必须使用：

```yaml
training:
  dit_precision: bf16
```

并配合：

- `enable_gradient_checkpointing_type: full`
- `train_batch_size: 1`
- 必要时关闭 validation
- 降低 `num_latent_t`

### `avg_step_time_sec` 为什么不能直接横比

`avg_step_time_sec` 只统计训练 step，不包含模型加载、preprocess、validation。
影响它的关键因素包括：

- `num_latent_t`
- 精度：`fp32` vs `bf16`
- `gradient_accumulation_steps`
- 模型规模
- attention backend
- LoRA rank

如果两个模型除了 precision 之外还有 `num_latent_t` 不同，就不能直接比较速度。

## 最小迁移文件清单

如果只迁移“LoRA 训练 + Excel 记录”能力，核心文件是：

- `fastvideo/train/utils/lora.py`
- `fastvideo/train/models/wan/wan.py`
- `fastvideo/train/models/hunyuan/hunyuan.py`
- `fastvideo/train/models/matrixgame/matrixgame.py`
- `fastvideo/train/utils/dataloader.py`
- `fastvideo/pipelines/pipeline_batch_info.py`
- `fastvideo/train/callbacks/validation.py`
- `fastvideo/train/entrypoint/train.py`
- `fastvideo/models/loader/fsdp_load.py`
- `examples/train/run.sh`
- `scripts/training/build_run_record.py`
- `scripts/training/append_run_log.py`
- `examples/train/configs/fine_tuning/**/**_lora*.yaml`

文档和测试不是运行必需，但建议一起保留：

- `docs/training/finetune.md`
- `docs/training/lora_finetune_4090_runbook.md`
- `fastvideo/tests/training/test_train_*_utils.py`

## 后续建议

- 为 `fastvideo/train` 增加 DCP checkpoint 到 standalone LoRA adapter 的导出入口。
- 对 `peak_vram_gb` 同时记录 allocated 和 reserved，避免和 `nvidia-smi` 口径混淆。
- 为 GEN3C 单独设计训练数据 schema，优先离线预计算 3D cache conditioning，避免训练时在线跑 MoGe。
- MatrixGame 如果要做真正有意义的 finetune，需要真实 keyboard/mouse action 数据，而不是复用普通 I2V parquet。