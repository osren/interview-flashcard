# AI系统软件 - 分布式训练框架 - 一面面试题

## 1. 请介绍一下你理解的分布式训练框架的核心架构是什么？

## 答案

### 分布式训练框架核心架构

**整体架构分层：**

```
┌─────────────────────────────────────────────────────────────┐
│                      用户层 (User Layer)                      │
│              PyTorch / TensorFlow 用户代码                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    框架层 (Framework Layer)                    │
│         Distributed Data Parallel (DDP) / Horovod            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   通信层 (Communication Layer)                 │
│                  NCCL / GLOO / MPI / UCX                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    硬件层 (Hardware Layer)                    │
│              GPU Cluster / CPU + Memory / Network             │
└─────────────────────────────────────────────────────────────┘
```

**核心组件：**

| 组件 | 职责 | 关键技术 |
|------|------|----------|
| **Parameter Server** | 集中管理模型参数 | 异步更新、梯度压缩 |
| **AllReduce** | 分布式梯度聚合 | Ring-AllReduce、Tree-AllReduce |
| **DataLoader** | 分布式数据加载 | DataParallel、Sharding |
| **Checkpoint** | 模型状态保存/恢复 | 增量保存、弹性训练 |
| **Profile** | 性能分析与调优 | GPU监控、通信分析 |

**主流框架对比：**

| 框架 | 架构模式 | 通信后端 | 适用场景 |
|------|----------|----------|----------|
| **PyTorch DDP** | AllReduce 模式 | NCCL/GLOO | 通用深度学习 |
| **Horovod** | AllReduce 模式 | NCCL/MPI | TensorFlow/PyTorch |
| **Ray Tune** | Parameter Server | GCS | 超参数搜索 |
| **DeepSpeed** | ZeRO 优化 + AllReduce | NCCL | 大模型训练 |

---

## 2. 讲讲数据并行和模型并行的区别，以及各自的优缺点？

## 答案

### 数据并行 vs 模型并行

**1. 数据并行 (Data Parallelism)**

```
原理：每个 GPU 持有完整模型副本，处理不同数据批次

┌─────────┐    ┌─────────┐    ┌─────────┐
│ GPU 0   │    │ GPU 1   │    │ GPU N   │
│ Model 0 │    │ Model 1 │    │ Model N │
│ Data 0  │    │ Data 1  │    │ Data N  │
└────┬────┘    └────┬────┘    └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     ↓
              AllReduce 梯度平均
                     ↓
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
  更新 Model     更新 Model      更新 Model
```

**优点：**
- 实现简单，框架原生支持
- 扩展性好，GPU越多训练越快
- 通信量小（只传梯度）

**缺点：**
- 每个GPU需要完整模型内存
- 大模型无法在单卡放下

**2. 模型并行 (Model Parallelism)**

```
原理：模型拆分到不同GPU，每个GPU只负责部分模型

┌─────────────────┐
│    Input Data    │
└────────┬────────┘
         ↓
┌────────┴────────┐
│   GPU 0         │
│  Layer 0-7     │ ←→ GPU 1: Layer 8-15 ←→ GPU 2: Layer 16-23
└─────────────────┘
```

**优点：**
- 可以训练超大模型
- 内存需求分摊到多卡

**缺点：**
- 实现复杂，需要手动切分
- GPU 利用率低（只有相邻通信时利用）
- 通信开销大

**3. 混合并行 (Hybrid Parallelism)**

```
常用策略：数据并行 + 模型并行

Pipeline 并行：
┌────────────────────────────────────────────┐
│  GPU0 → GPU1 → GPU2 → GPU3 → GPU0 (循环)   │
│  Layer 0-7    8-15   16-23  24-31          │
└────────────────────────────────────────────┘

Tensor 并行（Megatron-LM）：
- 注意力头拆分到不同GPU
- 需要 AllReduce 通信

ZeRO 优化：
- ZeRO-1: 优化器状态分片
- ZeRO-2: + 梯度分片
- ZeRO-3: + 参数分片
```

---

## 3. 什么是 ZeRO 优化？它是如何减少显存占用的？

## 答案

### ZeRO (Zero Redundancy Optimizer) 优化

**核心思想：消除数据并行中的显存冗余**

**三个阶段：**

| Stage | 优化内容 | 显存节省 |
|-------|----------|----------|
| ZeRO-1 | 优化器状态分片 | 4x |
| ZeRO-2 | + 梯度分片 | 8x |
| ZeRO-3 | + 参数分片 | Nx (N=GPU数) |

**ZeRO-1 原理：**

```
传统 DDP：每个GPU保存完整优化器状态（FP32副本）

ZeRO-1：
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ GPU 0       │  │ GPU 1       │  │ GPU 2       │
│ Optim State │  │ Optim State │  │ Optim State │
│ 1/N         │  │ 1/N         │  │ 1/N         │
└─────────────┘  └─────────────┘  └─────────────┘

优化器状态按 GPU 数量分片
```

**ZeRO-2 原理：**

```
在 ZeRO-1 基础上，梯度也分片

通信策略：AllReduce + Gather
- 计算梯度时：本地计算
- 更新参数时：需要 gather 完整梯度
```

**ZeRO-3 原理：**

```
参数也分片到不同GPU

前向/反向计算时：
1. 按需从其他GPU获取参数分片
2. 本地计算
3. 丢弃不需要的参数

通信量增加，但显存大幅减少
```

**DeepSpeed ZeRO 实战配置：**

```python
import deepspeed

ds_config = {
    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {
            "device": "cpu",  # 优化器状态卸载到CPU
            "nvme_path": "/tmp"
        },
        "offload_param": {
            "device": "cpu"
        },
        "stage3_param_persistence_threshold": 1e4,
        "stage3_gather_16bit_weights_on_model_save": True
    },
    "gradient_clipping": 1.0,
    "fp16": {"enabled": True}
}
```

**适用场景：**

| 场景 | 推荐配置 |
|------|----------|
| 7B 模型单节点多卡 | ZeRO-1 |
| 30B 模型多节点 | ZeRO-2 |
| 70B+ 大模型 | ZeRO-3 + CPU/NVMe Offload |

---

## 4. 介绍一下 PyTorch 分布式数据并行 (DDP) 的实现原理？

## 答案

### PyTorch DDP 实现原理

**核心流程：**

```
1. 初始化
   torch.distributed.init_process_group()
          ↓
2. 模型封装
   model = DistributedDataParallel(model)
          ↓
3. 前向传播
   每个GPU独立计算
          ↓
4. 反向传播
   - 本地计算梯度
   - 调用 all_reduce 同步梯度
   - 梯度求平均
          ↓
5. 参数更新
   每个GPU使用相同的平均梯度更新
```

**源码核心逻辑：**

```python
# 伪代码实现
class DistributedDataParallel:
    def __init__(self, model):
        self.model = model
        self.process_group = get_process_group()

        # 注册梯度 hooks
        for param in model.parameters():
            param.register_hook(self._all_reduce_hook)

    def _all_reduce_hook(self, grad):
        # 梯度到达时自动触发 all_reduce
        return self._all_reduce(grad)

    def _all_reduce(self, tensor):
        # NCCL allreduce: 梯度求平均
        torch.distributed.all_reduce(
            tensor,
            op=torch.distributed.ReduceOp.SUM,
            group=self.process_group
        )
        return tensor / self.world_size
```

**关键优化点：**

| 优化 | 原理 | 收益 |
|------|------|------|
| **Ring-AllReduce** | GPU 形成环形，梯度传递 | 通信均衡 |
| **Bucket** | 梯度分桶批量通信 | 减少通信次数 |
| **NoSync** | 连续多个前向不需要同步 | 减少同步开销 |
| **Finder** | 异步梯度同步 | 隐藏通信延迟 |

**启动方式对比：**

```bash
# 单机多卡
torchrun --nproc_per_node=8 train.py

# 多机多卡
torchrun --nproc_per_node=8 \
  --nnodes=2 --node_rank=0 \
  --master_addr=192.168.1.1 \
  --master_port=29500 \
  train.py
```

**DDP 常见问题：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| OOM | bucket 过大 | 减小 batch size / 梯度累积 |
| 通信慢 | NCCL 配置问题 | 检查 IB / 优化 NCCL 参数 |
| 负载不均 | 数据分片不均 | 使用 DistributedSampler |

---

## 5. 什么是梯度累积 (Gradient Accumulation)？为什么它能解决大模型训练问题？

## 答案

### 梯度累积 (Gradient Accumulation)

**核心思想：把大 batch 拆分为多个小 batch 累加梯度**

**原理：**

```python
# 目标 batch_size = 32
# 但显存只能支持 batch_size = 8

# 传统做法：直接使用 batch_size=8
# 问题：batch 太小影响收敛

# 梯度累积做法：
accumulation_steps = 4  # 32 / 8

optimizer.zero_grad()
for i, (data, target) in enumerate(dataloader):
    output = model(data)
    loss = criterion(output, target)
    loss.backward()  # 梯度累加到 .grad

    if (i + 1) % accumulation_steps == 0:
        optimizer.step()  # 一次性更新
        optimizer.zero_grad()
```

**为什么能解决大模型训练问题：**

```
显存占用分解：

1. 模型参数 (Model Parameters)
   - 无法通过梯度累积解决
   - 需要模型并行 / ZeRO / CPU Offload

2. 优化器状态 (Optimizer States)
   - ZeRO-1/2/3 分片
   - CPU Offload

3. 激活值 (Activations)
   - checkpointing 减少
   - 梯度累积不影响

4. 梯度 (Gradients)
   - ✅ 梯度累积可以让小显存 GPU 训练大 effective batch
   - 梯度保存在 fp32，累积时用 fp16 临时存储
```

**数学等价性：**

```
传统 batch=32：
  gradient = ∑ Loss(x_i) / 32
  θ_new = θ_old - lr * gradient

梯度累积 batch=32 (每次8)：
  gradient = (g1 + g2 + g3 + g4) / 4
           = (∑ Loss(x_i) / 8) / 4
           = ∑ Loss(x_i) / 32
  θ_new = θ_old - lr * gradient

数学上完全等价！
```

**注意事项：**

| 要点 | 说明 |
|------|------|
| Batch Norm | 需要相应调整 momentum |
| Dropout | 行为一致 |
| 学习率 | 大 batch 可用更大 LR (Linear Scaling) |

---

## 6. 讲讲模型推理服务化的常见架构和优化策略？

## 答案

### 模型推理服务化架构

**1. 基本架构模式**

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                               │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/gRPC
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              负载均衡 + 限流 + 鉴权                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Model Server                            │
│         TorchServe / TensorFlow Serving / Triton            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      GPU Cluster                            │
│            GPU 0    GPU 1    GPU 2    GPU 3                 │
└─────────────────────────────────────────────────────────────┘
```

**2. 推理优化策略**

| 优化维度 | 技术方案 | 效果 |
|----------|----------|------|
| **计算优化** | TensorRT / ONNX Runtime | 2-10x 加速 |
| **显存优化** | 动态 Batch / 请求调度 | 吞吐提升 |
| **内存优化** | FP16 / INT8 量化 | 50% 显存节省 |
| **通信优化** | GPU Direct RDMA | 减少 CPU 瓶颈 |

**3. 动态 Batch 策略**

```python
class DynamicBatcher:
    def __init__(self, max_batch_size=32, max_wait_ms=10):
        self.queue = asyncio.Queue()
        self.max_batch_size = max_batch_size
        self.max_wait_ms = max_wait_ms

    async def add_request(self, request):
        future = asyncio.Future()
        self.queue.put((request, future))
        return await future

    async def process_loop(self):
        while True:
            batch = []
            deadline = time.time() + self.max_wait_ms / 1000

            while len(batch) < self.max_batch_size:
                timeout = max(0, deadline - time.time())
                try:
                    req, future = self.queue.get(timeout=timeout)
                    batch.append((req, future))
                except:
                    break

            # 批量推理
            if batch:
                inputs = [r[0].input for r in batch]
                outputs = await self.infer(inputs)
                for (_, future), output in zip(batch, outputs):
                    future.set_result(output)
```

**4. 量化推理**

```python
# INT8 量化流程
# 1. Post-Training Quantization
quantized_model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)

# 2. Quantization-Aware Training
model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
torch.quantization.prepare(model, inplace=True)
# 训练 steps
torch.quantization.convert(model, inplace=True)
```

**5. 服务化框架对比**

| 框架 | 优点 | 缺点 |
|------|------|------|
| **TorchServe** | PyTorch 原生 | 功能较新 |
| **TensorFlow Serving** | 成熟稳定 | 只支持 TF |
| **Triton** | 多框架支持、性能好 | 配置复杂 |
| **vLLM** | PagedAttention、吞吐高 | 主要针对 LLM |

---

## 7. 什么是 PagedAttention？它是如何提升 LLM 推理吞吐的？

## 答案

### PagedAttention 与 vLLM

**问题背景：**

```
传统 LLM 推理问题：
- KV Cache 需要连续内存
- 显存碎片化严重
- Batch 利用率低

举例：LLaMA-7B 需要约 16GB KV Cache
如果每个序列长度不同，碎片化导致实际只能使用 60% 显存
```

**PagedAttention 核心思想：**

```
把 KV Cache 管理类比为操作系统的虚拟内存分页

操作系统：固定大小页面 + 页表 + 按需调度
PagedAttention：固定大小 KV Cache Block + Block Table
```

**实现原理：**

```python
# Block 大小配置
block_size = 16  # 每个 block 16 个 token

# 序列 "Hello, world!" 的 KV Cache 布局
┌──────────────────────────────────────┐
│           Physical Blocks            │
├──────────────────────────────────────┤
│ Block 0: [KV(0), KV(1), ..., KV(15)]│
│ Block 1: [KV(16), KV(17), ..., KV(31)]│
│ Block 2: [KV(32), ...]               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│           Block Table                │
├──────────────────────────────────────┤
│ Seq A: [0] → Block 0                 │
│        [1] → Block 1                 │
│        [2] → Block 3                 │
└──────────────────────────────────────┘

# 逻辑连续，物理分散
```

**核心优势：**

| 特性 | 传统方式 | PagedAttention |
|------|----------|----------------|
| 显存利用率 | ~60% | ~90% |
| Batch Size | 限制大 | 可动态扩展 |
| Prefix Cache | 不支持 | 共享前缀 |
| 吞吐提升 | 1x | 2-5x |

**Prefix Caching：**

```python
# 多个请求共享 system prompt
prompt = "你是一个有帮助的AI助手"  # 100 tokens

request_1 = prompt + "用户问题1"
request_2 = prompt + "用户问题2"
request_3 = prompt + "用户问题3"

# 传统：每个请求独立存储完整 KV Cache
# PagedAttention：prompt 的 KV Cache 共享
```

**vLLM 使用示例：**

```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-2-7b-hf")

sampling_params = SamplingParams(
    temperature=0.8,
    max_tokens=256,
)

outputs = llm.generate(
    ["Hello, world!", "What is AI?"],
    sampling_params
)
```

---

## 8. 介绍一下GPU的内存层级，以及它对深度学习训练的影响？

## 答案

### GPU 内存层级

**内存架构：**

```
┌─────────────────────────────────────────────────────────────┐
│                        GPU                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Register File (64KB)                 │   │
│  │              最快，按需分配，线程私有                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Shared Memory (48-96KB/SM)             │   │
│  │           可编程，线程块共享，程序员控制               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 L1 Cache (128KB/SM)                  │   │
│  │              自动管理，命中率高则性能好                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 L2 Cache (Shared)                    │   │
│  │              约 40-48MB，所有 SM 共享                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 HBM / VRAM (GB级别)                  │   │
│  │           显存带宽: 900-1600 GB/s                    │   │
│  │           容量: 16-80 GB                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**带宽对比：**

| 内存类型 | 带宽 | 延迟 | 容量 |
|----------|------|------|------|
| Register | ~20 TB/s | 1 cycle | 256 KB |
| Shared Memory | ~20 TB/s | 1 cycle | 48-96 KB/SM |
| L1 Cache | ~8 TB/s | ~20 cycles | 128 KB/SM |
| L2 Cache | ~4 TB/s | ~100 cycles | 40-48 MB |
| HBM | ~1-1.6 TB/s | ~400 cycles | 16-80 GB |

**对深度学习训练的影响：**

**1. 算子融合 (Operator Fusion)**

```cuda
// 未融合：多次显存访问
output = relu(conv(conv(input)))
// 1. conv1: input → shared mem → HBM
// 2. relu: HBM → HBM
// 3. conv2: HBM → shared mem → HBM

// 融合后：减少 HBM 访问
// 在 shared mem 中完成所有计算
// 最终结果写回 HBM
```

**2. 内存布局优化**

```python
# NCHW vs NHWC
# NCHW: 通道连续，便于卷积算子
# NHWC: 像素点连续，利于 TensorCore

# PyTorch 默认 NCHW
# TensorFlow 默认 NHWC
```

**3. 显存分配策略**

```python
# PyTorch 显存分配
torch.cuda.set_per_process_memory_fraction(0.9)  # 预留 10%

# 显存池
torch.cuda.empty_cache()  # 释放显存碎片

# CUDA Malloc 调优
# 环境变量: CUDA_CACHE_MAXSIZE
```

**4. 性能调优技巧**

| 场景 | 优化方法 | 效果 |
|------|----------|------|
| 小算子多 | 算子融合 | 减少 50%+ 显存访问 |
| 大模型 | 混合精度训练 | 减少 50% 显存 |
| 重复计算 | Checkpointing | 线性显存 vs 平方 |
| Batch 小 | 动态 Batching | 提高 GPU 利用率 |

---

## 9. 什么是混合精度训练？FP16 和 BF16 有什么区别？

## 答案

### 混合精度训练

**核心思想：不同计算使用不同精度**

```
前向/反向：FP16 计算（快）
优化器状态：FP32（保持精度）

自动混合精度 (AMP)：
┌────────────────────────────────────────┐
│           Forward/Backward             │
│         使用 FP16 计算                  │
│        loss.scale 防止下溢              │
└────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────┐
│           Optimizer States             │
│         保持 FP32 精度                  │
└────────────────────────────────────────┘
```

**PyTorch AMP 实现：**

```python
from torch.cuda.amp import autocast, GradScaler

scaler = GradScaler()

for data, target in dataloader:
    optimizer.zero_grad()

    with autocast():
        output = model(data)
        loss = loss_fn(output, target)

    # 缩放 loss，防止下溢
    scaler.scale(loss).backward()

    # 反向传播前先 unscale
    scaler.step(optimizer)
    scaler.update()
```

**FP16 vs BF16 对比：**

```
FP16 (Half Precision):
┌──────┬───────┬──────────────────┐
│ Sign │ Exponent (5bit) │ Mantissa (10bit) │
└──────┴───────┴──────────────────┘
Range: ~6e4 (65504)
Precision: ~3-4 decimal digits

BF16 (Brain Float):
┌──────┬─────────┬──────────────────┐
│ Sign │ Exponent (8bit) │ Mantissa (7bit) │
└──────┴─────────┴──────────────────┘
Range: ~3e38
Precision: ~2-3 decimal digits
```

| 特性 | FP16 | BF16 |
|------|------|------|
| 动态范围 | 较小 (~6e4) | 大 (~3e38) |
| 精度 | 较高 | 较低 |
| 溢出风险 | 较高 | 极低 |
| 硬件支持 | 广泛 | Turing+ |
| 训练效果 | 好 | 更好 (大模型) |
| 适用场景 | CV、语音 | LLM、Transformer |

**为什么 LLM 训练用 BF16：**

```
梯度消失/爆炸问题：

LLaMA-7B 训练：
- Loss 可能在训练过程中大幅波动
- FP16 动态范围不足 → 溢出 → NaN
- BF16 动态范围接近 FP32 → 稳定训练

实验数据：
| 精度 | 训练稳定性 | 最终 Loss |
|------|-----------|----------|
| FP16 | 容易溢出 | NaN |
| BF16 | 稳定 | 2.1 |
```

---

## 10. 讲讲你对 CUDA 编程模型的理解，线程层级是如何组织的？

## 答案

### CUDA 编程模型

**线程层级组织：**

```
┌─────────────────────────────────────────────────────────────┐
│                      Grid                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Block (0,0)                          │   │
│  │   Thread(0,0)  Thread(1,0)  Thread(2,0)  ...        │   │
│  │   Thread(0,1)  Thread(1,1)  Thread(2,1)  ...        │   │
│  │   ...                                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Block (1,0)                          │   │
│  │   ...                                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Thread Hierarchy                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Block ID:  blockIdx.x, blockIdx.y, blockIdx.z             │
│  Thread ID: threadIdx.x, threadIdx.y, threadIdx.z          │
│                                                             │
│  global_id = blockIdx.x * blockDim.x + threadIdx.x        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**硬件映射：**

```
┌─────────────────────────────────────────────────────────────┐
│                       GPU                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   SM (Streaming Multiprocessor)                             │
│   ┌──────────────┐  ┌──────────────┐                       │
│   │  Warp (32 threads) │  Warp (32 threads)              │
│   └──────────────┘  └──────────────┘                       │
│         ↓                                                    │
│   ┌──────────────────────────────────────────────┐           │
│   │  CUDA Core (ALU) × 64 / 128                 │           │
│   │  Register File (65536 × 32-bit)              │           │
│   │  Shared Memory (48-96 KB)                    │           │
│   │  L1 Cache                                     │           │
│   └──────────────────────────────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Block 调度到 SM：
- 一个 Block 只能在一个 SM 上执行
- 一个 SM 可以同时运行多个 Block (资源足够时)
- Warp 是执行调度的最小单位 (32 threads)
```

**CUDA 编程示例：**

```cuda
__global__ void matrixMul(float *A, float *B, float *C, int N) {
    // 计算全局线程 ID
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < N && col < N) {
        float sum = 0.0f;
        for (int k = 0; k < N; k++) {
            sum += A[row * N + k] * B[k * N + col];
        }
        C[row * N + col] = sum;
    }
}

// 调用
dim3 block(16, 16);  // 256 threads per block
dim3 grid((N + 15) / 16, (N + 15) / 16);
matrixMul<<<grid, block>>>(d_A, d_B, d_C, N);
```

**性能优化关键点：**

| 原则 | 说明 | 收益 |
|------|------|------|
| **合并访问** | 相邻线程访问相邻内存 | 提高带宽利用率 |
| **Shared Memory** | 线程块内共享数据 | 减少 HBM 访问 |
| **Warp 合并** | 同一 Warp 执行相同分支 | 避免分支分化 |
| **Occupancy** | 最大化并行度 | 隐藏延迟 |

**合并访问示例：**

```cuda
// 合并访问 ✓
__global__ void copy_coalesced(float *dst, float *src, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        dst[idx] = src[idx];  // 相邻线程访问相邻地址
    }
}

// 非合并访问 ✗
__global__ void copy_strided(float *dst, float *src, int N, int stride) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        dst[idx] = src[idx * stride];  // 分散访问
    }
}
```

---

## 11. 什么是 NCCL？它是如何实现高效的 GPU 通信？

## 答案

### NCCL (NVIDIA Collective Communications Library)

**核心功能：多 GPU 集合通信**

```
NCCL 支持的集合通信操作：

1. AllReduce     - 所有节点获取归约结果
2. Broadcast      - 一对多分发
3. AllGather      - 收集所有节点数据
4. ReduceScatter  - 分片归约
5. AllToAll       - 全对全交换
```

**AllReduce 实现 - Ring Algorithm：**

```
假设 4 个 GPU，GPU0 有数据 [1,0,0,0]

Ring-AllReduce 过程：

Step 1: 发送接收
GPU0 ──[1,0,0,0]──→ GPU1
GPU1 ──[0,1,0,0]──→ GPU2
GPU2 ──[0,0,1,0]──→ GPU3
GPU3 ──[0,0,0,1]──→ GPU0

Step 2: 本地归约
GPU0: [1,0,0,0] + [0,0,0,1] = [1,0,0,1]
GPU1: [0,1,0,0] + [1,0,0,0] = [1,1,0,0]
GPU2: [0,0,1,0] + [0,1,0,0] = [0,1,1,0]
GPU3: [0,0,0,1] + [0,0,1,0] = [0,0,1,1]

Step 3-4: 重复直到完成

最终：所有 GPU 持有 [0.25, 0.25, 0.25, 0.25]
```

**NCCL 优化技术：**

| 优化 | 原理 | 收益 |
|------|------|------|
| **P2P Direct** | GPU 直接通信，不走 PCIe | 延迟降低 50%+ |
| **NVLink** | GPU 间高速互联 | 带宽 300 GB/s |
| **GPU Direct RDMA** | 直接网络传输 | 绕过 CPU |
| **Network Fusion** | 合并小消息 | 减少通信次数 |

**拓扑感知：**

```bash
# NCCL 自动检测 GPU 拓扑
nvidia-smi topo -m

# 输出示例：
#     GPU0  GPU1  GPU2  GPU3  CPU Affinity  NIC
# GPU0  X    NV1   NV1   SYS   0-31
# GPU1  NV1   X    SYS   NV1   0-31
# NV1 = connected via NVLink
# SYS = connected via PCIe
```

**PyTorch 使用 NCCL：**

```python
import torch.distributed as dist

# 初始化
dist.init_process_group(
    backend="nccl",
    init_method="env://",
    world_size=8,
    rank=rank
)

# AllReduce
dist.all_reduce(tensor, op=dist.ReduceOp.SUM)

# AllGather
dist.all_gather(tensor_list, tensor)

# 广播
dist.broadcast(tensor, src=0)
```

**常见问题与调优：**

| 问题 | 解决方案 |
|------|----------|
| 通信慢 | 检查 NVLink 连接 |
| GIL 阻塞 | 使用异步通信 |
| 负载不均 | 调整 NCCL_IXIO_ENABLE |
| 多机通信慢 | 启用 GPU Direct RDMA |

---

## 12. 讲讲深度学习框架（如 PyTorch）中 autograd 的实现原理？

## 答案

### PyTorch Autograd 原理

**核心组件：**

```
┌─────────────────────────────────────────────────────────────┐
│                       Autograd Engine                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │  Tensor     │ → │  Function   │ → │  Tensor     │     │
│  │  (data)     │   │  (op + grad_fn)│  │  (grad)     │     │
│  └─────────────┘   └─────────────┘   └─────────────┘     │
│         ↑                ↓                    ↓              │
│         │         反向传播时调用          累积梯度          │
│         └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**计算图结构：**

```python
import torch

x = torch.tensor([1.0, 2.0], requires_grad=True)
y = x ** 2
z = y.sum()  # z = x1^2 + x2^2 = 1 + 4 = 5

# 计算图：
# x → (pow) → y → (sum) → z
#          ↑                  ↑
#        grad_fn           grad_fn

z.backward()
# 反向传播：dz/dx = 2x = [2, 4]
print(x.grad)  # tensor([2., 4.])
```

**Function 类实现：**

```python
# 伪代码：ReLU 的前向和反向
class ReLU(Function):
    @staticmethod
    def forward(ctx, input):
        ctx.save_for_backward(input)
        return input.clamp(min=0)

    @staticmethod
    def backward(ctx, grad_output):
        input, = ctx.saved_tensors
        # dL/dx = dL/dy * dy/dx
        # dy/dx = 1 if x > 0 else 0
        grad_input = grad_output.clone()
        grad_input[input < 0] = 0
        return grad_input
```

**反向传播流程：**

```python
# torch.autograd 反向传播源码逻辑
def backward(self, grad=None):
    # 1. 从 tensor 获取 grad_fn
    for tensor in self.leaves():
        tensor.grad_fn._backward()

    # 2. 拓扑排序，确保按顺序执行
    # 3. 从后向前调用每个 Function 的 backward
    # 4. 梯度累积到 .grad 属性

class Node:
    def _backward(self):
        # 计算当前节点的梯度
        grad = self.grad_fn.apply(self.grad)
        # 传递给上游输入
        for parent in self.parents:
            parent.grad += grad
```

**图结构与逃逸：**

```python
# 动态图：每个前向传播创建新图
x = torch.tensor([1.0], requires_grad=True)
for i in range(3):
    y = x * 2
    x = y

# y 依赖的图：x→2x→4x→8x

# 控制流：if/while 会创建不同分支
def fn(x):
    if x > 0:
        return x ** 2
    else:
        return x ** 3
```

**性能优化 - torch.jit：**

```python
# 追踪优化
@torch.jit.script
def fused_kernel(x):
    return x * 2 + 1  # 融合为一个 kernel

# 图优化：
# 1. 算子融合 (Fusion)
# 2. 内存规划 (Memory Planning)
# 3. 常量折叠 (Constant Folding)
```

---

## 13. 什么是模型量化？INT8 量化是如何保证精度的？

## 答案

### 模型量化 (Quantization)

**量化原理：**

```
FP32 → INT8

FP32: 符号(1) + 指数(8) + 尾数(23) = 32 bits
INT8: 符号(1) + 指数(7) = 8 bits = 256 个值

量化映射：
FP32[−3.0, 3.0] → INT8[−128, 127]

scale = 3.0 / 127 ≈ 0.0236
quant(x) = round(x / scale)
dequant(x) = x * scale
```

**量化方法对比：**

| 方法 | 描述 | 精度 | 速度 |
|------|------|------|------|
| **动态量化** | 权重实时量化，推理时量化 | 较好 | 中 |
| **静态量化** | 离线标定，推理前量化 | 中 | 快 |
| **量化感知训练** | 在训练中模拟量化 | 最好 | 快 |

**Post-Training Quantization (PTQ)：**

```python
import torch.quantization

# 1. 模型准备
model.eval()
model.fuse_model()  # 融合 conv+bn+relu

# 2. 标定 (Calibration)
model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
torch.quantization.prepare(model, inplace=True)

# 3. 标定数据前向传播
with torch.no_grad():
    for data, _ in calib_loader:
        model(data)

# 4. 转换
torch.quantization.convert(model, inplace=True)
```

**量化感知训练 (QAT)：**

```python
from torch.quantization import quantize_qat

model.qconfig = torch.quantization.get_default_qconfig('fbgemm')
quantize_qat.prepare(model, inplace=True)

# 训练流程会自动模拟量化

# 转换
quantize_qat.convert(model, inplace=True)
```

**INT8 精度保证技术：**

| 技术 | 原理 | 效果 |
|------|------|------|
| **Per-tensor** | 整个 tensor 用一个 scale | 简单，可能精度损失 |
| **Per-channel** | 每个 channel 独立 scale | 精度好，计算稍慢 |
| **SmoothQuant** | 平滑异常值 | 保持精度 |
| **GPTQ** | 逐层量化优化 | 大模型效果好 |

**SmoothQuant 示例：**

```python
# 平滑异常激活值，减少量化损失
# 核心思想：把激活值的难度转移到权重
for i in range(n_layers):
    # 逐 channel 计算缩放因子
    scale = torch.max(torch.abs(W[i]), torch.abs(A[i])) ** (-1)
    W[i] = W[i] * scale.view(-1, 1)
    A[i] = A[i] * scale.view(1, -1)
```

---

## 14. 讲讲你理解的推理引擎架构是怎样的？有哪些核心组件？

## 答案

### 推理引擎架构

**整体架构：**

```
┌─────────────────────────────────────────────────────────────┐
│                      用户 API 层                             │
│           Python / C++ / HTTP / gRPC 接口                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    图优化层 (Graph Optimization)              │
│         算子融合 / 内存规划 / 布局转换 / 常量折叠             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   算子执行层 (Kernel Execution)               │
│              CUDA / CPU / TensorRT / ONNX Runtime            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    运行时引擎 (Runtime)                       │
│          内存管理 / 线程调度 / 设备管理 / 调度器               │
└─────────────────────────────────────────────────────────────┘
```

**核心组件详解：**

| 组件 | 职责 | 技术要点 |
|------|------|----------|
| **模型解析器** | 加载模型文件 | ONNX / TensorFlow Proto / TorchScript |
| **图优化器** | 计算图优化 | 算子融合、布局转换、子图匹配 |
| **内存管理器** | GPU/CPU 内存分配 | 显存池、内存复用、paging |
| **调度器** | 请求调度 | 动态 batch、优先级队列 |
| **Kernel 库** | 算子实现 | CUDA / MKL / TensorRT |

**算子融合 (Operator Fusion)：**

```
融合前：
Conv → BatchNorm → ReLU → Conv → ReLU

融合后：
FusedConvBNReLU → FusedConvReLU

收益：减少显存访问 2-3x
```

**内存优化策略：**

```python
# 显存复用
class MemoryPlanner:
    def allocate(self, size):
        # 预分配显存池
        # 按需分配，支持复用
        pass

    def can_allocate(self, size):
        # 检查是否有足够显存
        pass

# 内存复用示例
# 算子 A 输出 → 算子 B 输入 → 复用同一块显存
```

**TensorRT 优化流程：**

```
1. 模型解析 (ONNX Parser)
         ↓
2. 网络定义 (INetworkDefinition)
         ↓
3. Builder 优化
   - 算子融合
   - 精度校准 (INT8)
   - 层归约
   - 动态 shape
         ↓
4. Engine 生成 (IExecutionEngine)
         ↓
5. 推理执行 (Context.execute)
```

**ONNX Runtime vs TensorRT：**

| 特性 | ONNX Runtime | TensorRT |
|------|--------------|----------|
| 框架支持 | 跨框架 | 主要 CUDA |
| 优化能力 | 中等 | 深度优化 |
| 部署方便性 | 高 | 中 |
| INT8 支持 | 支持 | 更好 |
| 动态 shape | 支持 | 部分支持 |
| 适用场景 | 通用推理 | GPU 高性能 |

---

## 15. 什么是 CUDA Stream？为什么它对深度学习性能很重要？

## 答案

### CUDA Stream

**概念：CUDA 操作的有序队列**

```
Stream 0 (Default):
┌──────────────────────────────────────────────────┐
│  Kernel A → Memcpy → Kernel B → Memcpy → ...   │
└──────────────────────────────────────────────────┘

Stream 1:
┌──────────────────────────────────────────────────┐
│  Kernel C → Memcpy → Kernel D                   │
└──────────────────────────────────────────────────┘

多 Stream 并行：
┌──────────────────────────────────────────────────┐
│  Stream 0:  [Kernel A ────────────][Kernel B]     │
│  Stream 1:  [Kernel C]  [Kernel D ───]           │
│  Time:      ──────────────────────────────────→  │
└──────────────────────────────────────────────────┘
```

**基本使用：**

```cuda
__global__ void kernel(float *data, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        data[idx] *= 2.0f;
    }
}

int main() {
    cudaStream_t stream;
    cudaStreamCreate(&stream);

    // 异步 kernel 执行
    kernel<<<256, 1024, 0, stream>>>(d_data, N);

    // 异步内存拷贝
    cudaMemcpyAsync(d_src, h_src, size, cudaMemcpyHostToDevice, stream);

    // 同步
    cudaStreamSynchronize(stream);

    cudaStreamDestroy(stream);
}
```

**对深度学习的重要性：**

| 场景 | Stream 用法 | 收益 |
|------|------------|------|
| **计算与通信并行** | 通信在 Stream 1，计算在 Stream 0 | 隐藏通信延迟 |
| **多 Kernel 流水线** | 连续 Kernel 不同 Stream | 提高 GPU 利用率 |
| **内存拷贝与计算重叠** | H2D 在 Stream 1，计算在 Stream 0 | 减少等待 |
| **动态 Batch** | 每个请求独立 Stream | 灵活性提升 |

**PyTorch 中的 Stream：**

```python
import torch

# 创建独立 Stream
s1 = torch.cuda.Stream()
s2 = torch.cuda.Stream()

# 在不同 Stream 上执行
with torch.cuda.stream(s1):
    out1 = model(input1)  # Stream 1

with torch.cuda.stream(s2):
    out2 = model(input2)  # Stream 2

# 等待所有 Stream 完成
torch.cuda.synchronize()
```

**CUDA 事件 (Events) - 同步机制：**

```python
start_event = torch.cuda.Event(enable_timing=True)
end_event = torch.cuda.Event(enable_timing=True)

start_event.record()
# 执行操作
result = model(input)
end_event.record()

torch.cuda.synchronize()
elapsed_time = start_event.elapsed_time(end_event)
```

---

## 16. 讲讲模型部署中常见的性能瓶颈及排查方法？

## 答案

### 模型部署性能瓶颈

**常见瓶颈类型：**

```
┌─────────────────────────────────────────────────────────────┐
│                    性能瓶颈分布                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────┐                              │
│                    │   CPU   │                              │
│                    │ 瓶颈    │  30%                         │
│                    └────┬────┘                              │
│                         │                                   │
│    ┌────────────────────┼────────────────────┐               │
│    │                    │                    │               │
│    ▼                    ▼                    ▼               │
│ ┌──────┐          ┌──────────┐          ┌──────┐             │
│ │ GPU  │          │  内存/   │          │ 网络 │             │
│ │ 瓶颈 │          │ 显存瓶颈 │          │ I/O  │             │
│ │ 40%  │          │  20%    │          │ 10%  │             │
│ └──────┘          └─────────┘          └──────┘             │
└─────────────────────────────────────────────────────────────┘
```

**瓶颈 1：GPU 利用率低**

| 原因 | 排查方法 | 解决方案 |
|------|----------|----------|
| Kernel 执行时间短 | Nsight / 火焰图 | 算子融合 |
| 显存带宽瓶颈 | Bandwidth Test | 优化数据布局 |
| 调度开销 | 增大 Grid/Block | 减少小 Kernel |
| CPU 拖慢 | async GPU 操作 | CUDA Stream |

```bash
# GPU 利用率监控
nvidia-smi dmon -s u

# 详细 profiling
nvprof --metrics achieved_occupancy python inference.py
nsys profile python inference.py
```

**瓶颈 2：数据传输**

```python
# 问题：CPU-GPU 传输成为瓶颈
for i in range(batches):
    data = preprocess(batch[i])      # CPU
    output = model(data)             # GPU
    result = output.cpu()            # CPU ← 频繁传输

# 优化：批量传输 + CUDA Stream
with torch.cuda.stream(s):
    data = data.cuda(non_blocking=True)  # 异步传输
    output = model(data)
```

**瓶颈 3：动态 Shape**

```python
# 问题：动态 shape 导致推理计划每次重新生成
output = model(dynamic_input)

# 解决：使用优化后的 engine
# TensorRT 优化时指定 profile
with trt.Builder(TRT_LOGGER) as builder:
    network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
    # 优化多个 profile
```

**瓶颈 4：内存碎片**

```python
# 问题：显存碎片导致 OOM
for i in range(1000):
    output = model(batch)
    del output
    torch.cuda.empty_cache()  # 不够

# 解决：预分配 + 内存池
class MemoryPool:
    def __init__(self, size):
        self.buffer = torch.cuda.FloatTensor(size)

    def allocate(self, shape):
        # 从池中分配，不重复申请
        pass
```

**性能分析工具：**

| 工具 | 用途 | 特点 |
|------|------|------|
| **nvidia-smi** | 实时监控 | 简单快速 |
| **nvprof** | 简单 profiling | 命令行 |
| **Nsight Systems** | 系统级分析 | 全面 |
| **Nsight Compute** | GPU kernel 分析 | 深度 |
| **PyTorch Profiler** | Python 级别分析 | 易用 |
| **TensorBoard** | 可视化 | 直观 |

**PyTorch Profiler 示例：**

```python
with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,
        torch.profiler.ProfilerActivity.CUDA,
    ],
    record_shapes=True,
    profile_memory=True,
) as prof:
    model(input)

print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
```

---

## 17. 什么是 Checkpointing (Gradient Checkpointing)？它是如何节省显存的？

## 答案

### Gradient Checkpointing (激活重计算)

**核心思想：用计算换显存**

```
传统前向传播显存占用：
Input → Layer1 → Layer2 → Layer3 → ... → LayerN
  ↓        ↓        ↓        ↓              ↓
  L1       L2       L3       L4              LN
(保存所有中间激活)

Gradient Checkpointing：
Input → Layer1 → Layer2 → Layer3 → ... → LayerN
  ↓                          ↓              ↓
  L1                          L3             LN
(只保存部分激活，反向时重新计算)
```

**显存对比：**

| 网络深度 | 传统方式 | Checkpointing | 节省 |
|----------|----------|---------------|------|
| 50 层 | O(N) | O(√N) | ~80% |
| 100 层 | O(N) | O(√N) | ~90% |
| 1000 层 | O(N) | O(√N) | ~95% |

**PyTorch 实现：**

```python
from torch.utils.checkpoint import checkpoint_sequential

# 方法 1：checkpoint_sequential
# 把网络分成多个模块，只保存部分激活
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.ModuleList([
            nn.Linear(512, 512) for _ in range(12)
        ])

    def forward(self, x):
        # 分成 3 个 chunk，每个 chunk 用 checkpoint
        chunks = 3
        chunk_size = len(self.layers) // chunks
        modules = [nn.Sequential(*self.layers[i:i+chunk_size])
                   for i in range(0, len(self.layers), chunk_size)]
        return checkpoint_sequential(modules, 3, x)

# 方法 2：checkpoint 手动控制
output = checkpoint(module, input)
```

**实现原理：**

```python
# checkpoint 伪代码实现
def checkpoint(function, *inputs):
    forward_outputs = []

    def forward_with_save(*inputs):
        output = function(*inputs)
        forward_outputs.append(output)
        return output

    # 第一次前向：保存部分输出
    output = forward_with_save(*inputs)

    # 反向传播时：如果激活不在内存，重新计算
    def backward(*grad_outputs):
        # 从保存的输出或重新计算获取激活
        # 执行反向
        return grad

    return output
```

**适用场景：**

| 场景 | 效果 |
|------|------|
| 大模型训练 | 节省 50-80% 显存 |
| 长序列 RNN | 节省 70% 显存 |
| 图像生成模型 | 节省 60% 显存 |
| **不适用** | 小模型 / 显存充足 |

**注意事项：**

```
副作用 (Side Effects)：
- 有副作用的操作不能用 checkpoint
- 例如：print、random、in-place 修改

解决方案：
- 使用 torch.random.manual_seed
- 避免 in-place 操作
- 使用 checkpoint_sequential 时确保无状态依赖
```

---

## 18. 讲讲你对模型服务化中 Batching 策略的理解？

## 答案

### 动态 Batching 策略

**静态 vs 动态 Batching：**

```
静态 Batching：
┌────────────────────────────────────────┐
│  Batch 1: [Req1][Req2][Req3][Req4]     │
│  等待 4 个请求，然后一起处理             │
└────────────────────────────────────────┘
问题：延迟高（必须等满）

动态 Batching：
┌────────────────────────────────────────┐
│  Time 0ms: [Req1]           → 执行? 否  │
│  Time 5ms: [Req1][Req2]     → 执行? 否  │
│  Time 10ms: [Req1][Req2][Req3] → 执行? 是│
│  执行 batch=[Req1,Req2,Req3]           │
└────────────────────────────────────────┘
平衡：延迟 vs 吞吐
```

**Batching 策略类型：**

| 策略 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **Static** | 固定 batch size | 稳定 | 延迟高 |
| **Dynamic** | 按时间/batch 动态 | 平衡好 | 实现复杂 |
| **Prefill-Decode** | 分离 prefill 和 decode | LLM 友好 | 需要分离调度 |
| **Continuous** | continuous batching | 最大吞吐 | 资源管理复杂 |

**Continuous Batching (Iteration-level)：**

```
传统 Batch：
[Req1, Req2, Req3] → 一起迭代，直到全部完成
      ↓
[Req1完成] [Req2进行中] [Req3进行中] → 等待

Continuous Batch：
[Req1, Req2, Req3] → 每次迭代后释放完成的
      ↓
[Req1完成] → 插入新请求
[Req4] [Req2进行中] [Req3进行中] → 继续
      ↓
GPU 利用率最大化
```

**实现代码：**

```python
class DynamicBatcher:
    def __init__(self,
                 max_batch_size=32,
                 max_wait_time=0.05,
                 timeout=60.0):
        self.queue = asyncio.Queue()
        self.max_batch_size = max_batch_size
        self.max_wait_time = max_wait_time
        self.timeout = timeout

    async def add_request(self, request):
        future = asyncio.Future()
        await self.queue.put((request, future, time.time()))
        return await asyncio.wait_for(future, self.timeout)

    async def run(self, model_fn):
        while True:
            batch = []
            start_time = time.time()

            # 收集请求直到满 batch 或超时
            while (len(batch) < self.max_batch_size and
                   time.time() - start_time < self.max_wait_time):
                try:
                    req, future, enqueue_time = self.queue.get_nowait()
                    batch.append((req, future, enqueue_time))
                except asyncio.QueueEmpty:
                    if batch:  # 已有请求，等待更多
                        await asyncio.sleep(0.001)
                    else:      # 无请求，等待
                        await asyncio.sleep(0.01)

            if batch:
                # 批量推理
                requests = [r[0] for r in batch]
                outputs = await model_fn(requests)

                # 返回结果
                for (_, future, _), output in zip(batch, outputs):
                    future.set_result(output)
```

**优先级调度：**

```python
class PriorityBatcher(DynamicBatcher):
    async def get_batch(self):
        # 优先队列
        items = []
        while len(items) < self.max_batch_size:
            try:
                # 阻塞获取，高优先级先出
                item = await self.queue.get()
                heapq.heappush(items, item)
            except:
                break

        # 按优先级排序
        return sorted(items, key=lambda x: -x[2])  # priority
```

**最佳实践：**

| 配置 | 推荐值 | 说明 |
|------|--------|------|
| Batch Size | 8-32 | 根据模型大小调整 |
| Wait Time | 10-50ms | 延迟敏感用小值 |
| Max Queue | 1000+ | 防止请求丢失 |
| Timeout | 30-120s | LLM 生成用大值 |

---

## 19. 什么是 CUDA 内存对齐？为什么它对性能很重要？

## 答案

### CUDA 内存对齐

**对齐要求：**

```
内存对齐：数据的起始地址必须是其大小的倍数

| 数据类型 | 大小 | 对齐要求 |
|----------|------|----------|
| float | 4 bytes | 4 bytes |
| float2 | 8 bytes | 8 bytes |
| float4 | 16 bytes | 16 bytes |
| float4x4 | 64 bytes | 16 bytes |

错误示例：
float *ptr = (float*)((char*)base + 1);  // 未对齐 ❌

正确示例：
float *ptr = (float*)((char*)base + 4);  // 对齐 ✓
```

**Tensor Core 对齐要求：**

```
Tensor Core 要求输入数据按特定格式对齐：

WGMMA (Warp Group Matrix Multiply Accumulate):
- M dimension: 128 bytes 对齐
- N dimension: 128 bytes 对齐
- K dimension: 64 bytes 对齐

即：矩阵必须是 16x16 FP16 blocks 的整数倍
```

**未对齐的影响：**

```cuda
// 性能损失：未对齐访问可能导致 2-10x 减速

__global__ void convolution_unaligned(float *input, float *output) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    // 如果 idx 导致 input 访问未对齐
    float val = input[idx];  // 可能的非合并访问
}

__global__ void convolution_aligned(float *input, float *output) {
    int idx = (blockIdx.x * blockDim.x + threadIdx.x) * 4;  // 对齐访问
    float4 val = ((float4*)input)[idx];  // 一次读取 16 bytes
}
```

**内存访问效率对比：**

| 访问模式 | 带宽利用率 | 延迟 |
|----------|-----------|------|
| 合并访问 (Coalesced) | ~100% | 低 |
| 部分合并 | 50-80% | 中 |
| 随机访问 | 10-20% | 高 |
| 广播访问 | 100% | 低 |

**PyTorch 内存布局：**

```python
# PyTorch tensor 内存默认是连续的
x = torch.randn(32, 64, 112, 112)  # NCHW 格式

# 检查是否连续
print(x.is_contiguous())  # True

# 手动转置后不连续
y = x.permute(0, 2, 3, 1)  # NCHW → N H W C
print(y.is_contiguous())  # False

# contiguous() 重新拷贝为连续内存
z = y.contiguous()
print(z.is_contiguous())  # True

# TensorRT 优化需要连续内存
# .contiguous() 确保内存布局正确
```

**自动内存对齐技巧：**

```python
# 1. 使用 padded tensor
x = torch.randn(3, 5)  # 未对齐
x_padded = torch.randn(3, 8)  # 对齐到 8
x_padded[:, :5] = x

# 2. CUDA 内存分配时自动对齐
ptr = torch.cuda.FloatTensor(32)  # 分配自动对齐
print(ptr.data_ptr() % 16)  # 通常是 0

# 3. 数组结构 (AoS) vs 结构数组 (SoA)
# SoA 对齐更友好
class PointsSoA:
    x: float[]  # 连续
    y: float[]  # 连续
    z: float[]  # 连续
```

---

## 20. 讲讲深度学习框架中算子融合的原理和收益？

## 答案

### 算子融合 (Operator Fusion)

**核心思想：将多个连续算子合并为一个 kernel**

```
融合前：
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ Conv │ → │ BN   │ → │ ReLU │ → │ Conv │
└──────┘    └──────┘    └──────┘    └──────┘
  ↓          ↓          ↓          ↓
 HBM写      HBM写      HBM写      HBM写

融合后：
┌─────────────────────────┐
│    FusedConvBNReLU       │
└─────────────────────────┘
           ↓
        一次 HBM 访问
```

**常见融合模式：**

| 融合模式 | 包含算子 | 收益 |
|----------|----------|------|
| **Conv+BN** | Conv + BatchNorm | 40% 推理加速 |
| **Conv+BN+ReLU** | Conv + BN + ReLU | 50% 推理加速 |
| **MatMul+Add** | GEMM + Bias | 减少内存访问 |
| **Softmax+CrossEntropy** | Softmax + Log + NLL | 数值稳定 + 快速 |
| **LayerNorm+Attention** | LN + Attention | 减少同步点 |

**融合实现原理：**

```python
# 伪代码：Conv + ReLU 融合
class FusedConvReLU:
    @torch.jit.script
    def forward(x, weight, bias):
        # 融合计算：一次 kernel 调用
        y = torch.conv2d(x, weight, bias, ...)
        y = torch.relu_(y)  # inplace
        return y

# 融合后：
# 1. 减少 kernel 启动开销
# 2. 减少中间结果写 HBM
# 3. 编译器可做更多优化
```

**TensorRT 中的融合：**

```
TensorRT 自动融合规则：

1. Convolution + ReLU → CudaConvolution + ReLU kernel
2. MatMul + Add → FullyConnected kernel
3. Concat + Slice → Skip
4. Scale + Shift + Pow → ScalePWN kernel
5. attention mask + Softmax → MaskedSoftmax kernel

限制：
- 融合要求 shape 静态可确定
- 动态 shape 可能阻止某些融合
- 融合需要硬件支持 (CUDA cores / TensorCores)
```

**手动融合示例：**

```cuda
// 未融合版本：3次 kernel 调用
__global__ void conv_kernel(float* out, const float* in, ...);
__global__ void bias_kernel(float* out, const float* bias);
__global__ void relu_kernel(float* out);

// 融合版本：1次 kernel 调用
__global__ void fused_conv_bias_relu_kernel(
    float* out, const float* in,
    const float* weight, const float* bias) {

    // 在 shared memory 中计算
    float val = conv(in, weight);  // 本地计算
    val = val + bias[ch];         // 加上 bias
    val = max(0, val);            // ReLU
    out[idx] = val;
}
```

**融合收益分析：**

| 指标 | 融合前 | 融合后 | 改善 |
|------|--------|--------|------|
| Kernel 启动次数 | N | 1 | N 倍 |
| HBM 访问次数 | 2N | 2 | N 倍 |
| GPU 利用率 | ~30% | ~80% | 2.6x |
| 端到端延迟 | 100ms | 40ms | 2.5x |

**不适用融合的场景：**

```
1. 显存限制
   - 融合后中间结果大，可能 OOM
   - 解决：分段融合

2. 算子间有条件分支
   - if (x > 0) conv1 else conv2
   - 无法简单融合

3. 内存受限
   - 大 kernel 占用寄存器多
   - 反而降低 occupancy
```

---

## 21. 什么是异构计算？为什么深度学习需要异构计算？

## 答案

### 异构计算 (Heterogeneous Computing)

**定义：CPU + GPU (或其他加速器) 协同计算**

```
传统 CPU 计算：
┌─────────────────┐
│   CPU           │
│ ┌─────────────┐ │
│ │ Control     │ │ 少量计算单元
│ │ + ALU        │ │ 复杂控制逻辑
│ └─────────────┘ │
└─────────────────┘

异构计算 (CPU + GPU)：
┌─────────────────┐     ┌─────────────────┐
│   CPU           │     │   GPU           │
│ 控制 + 逻辑     │ ←→  │ 大规模并行计算   │
└─────────────────┘     └─────────────────┘
        ↑                         ↑
        └───────── PCIe ─────────┘
              数据传输
```

**为什么深度学习需要 GPU：**

| 特性 | CPU | GPU | 深度学习需求 |
|------|-----|-----|-------------|
| 算力 | 10-100 GFLOPS | 10-1000 TFLOPS | 超高算力 |
| 并行度 | 4-16 cores | 1000s cores | 大规模并行 |
| 内存带宽 | 50-100 GB/s | 500-1600 GB/s | 大数据吞吐 |
| 能效比 | 1x | 10-50x | 成本/功耗 |

**深度学习计算特点：**

```
矩阵乘法 (GEMM)：O(N³) 计算，O(N²) 数据
        ↓
大量乘加运算 (MAC)
        ↓
规律的数据访问模式
        ↓
天然适合 SIMD/SIMT 并行

示例：Transformer Self-Attention
┌────────────────────────────────────────┐
│ Q @ K^T:  [seq, seq] × [seq, heads]   │
│              ↓                         │
│         矩阵乘法，适合 GPU              │
└────────────────────────────────────────┘
```

**CPU-GPU 协同编程：**

```python
# CUDA 编程模型
# CPU 端：控制流 + 数据准备
# GPU 端：大规模并行计算

# 示例：向量加法
# CPU 端
import numpy as np
a = np.random.randn(1000000).astype(np.float32)
b = np.random.randn(1000000).astype(np.float32)
d_a = torch.cuda.FloatTensor(a)  # CPU → GPU
d_b = torch.cuda.FloatTensor(b)
d_c = torch.cuda.FloatTensor(1000000)

# GPU 端执行
# (隐式调用 GPU kernel)
c = d_a + d_b

# CPU 端获取结果
result = c.cpu().numpy()
```

**不同加速器对比：**

| 加速器 | 适用场景 | 优点 | 缺点 |
|--------|----------|------|------|
| **GPU (NVIDIA)** | 通用深度学习 | 生态好、性能强 | 价格高 |
| **GPU (AMD)** | 通用深度学习 | ROCm 生态 | CUDA 兼容性 |
| **TPU** | TensorFlow | Google 优化 | 专用 |
| **NPU** | 移动端推理 | 低功耗 | 生态弱 |
| **FPGA** | 低延迟推理 | 可定制 | 编程复杂 |
| **AWS Inferentia** | 云端推理 | 成本低 | 灵活性 |

**现代深度学习硬件架构：**

```
NVIDIA A100/H100：
┌─────────────────────────────────────────────────────┐
│                   GPU Chip                          │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │  SM 0   │ │  SM 1   │ │  SM 2   │ │  SM N   │ │
│  │  64 Cores│ │ 64 Cores│ │ 64 Cores│ │ 64 Cores│ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────────────────────┤
│                   HBM2/3 Memory                      │
│                    40-80 GB                          │
│                   1-2 TB/s                           │
└─────────────────────────────────────────────────────┘
```

---

## 22. 讲讲你对并行计算中负载均衡的理解？

## 答案

### 负载均衡 (Load Balancing)

**问题定义：**

```
┌────────────────────────────────────────┐
│        负载不均衡示例                   │
├────────────────────────────────────────┤
│ GPU0: [████████████] 100% 利用率        │
│ GPU1: [██] 20% 利用率                   │
│ GPU2: [████████████] 100% 利用率        │
│ GPU3: [██] 20% 利用率                   │
├────────────────────────────────────────┤
│ 总时间 = 最慢 GPU 时间                  │
│ 总体效率 = 平均利用率 = 60%             │
└────────────────────────────────────────┘
```

**负载不均衡原因：**

| 原因 | 场景 | 影响 |
|------|------|------|
| **计算不均匀** | 不同 batch 复杂度不同 | GPU 空闲 |
| **数据不均** | Batch 内序列长度差异大 | 尾部 GPU 等待 |
| **通信不均** | AllReduce 同步点 | 短时间 GPU 空闲 |
| **动态 shape** | NLP/语音变长输入 | 难以静态分配 |

**数据并行负载均衡：**

```python
# 问题：不同 GPU 分配数据量不同
sampler = DistributedSampler(dataset, shuffle=False)
# 如果某些 shard 数据量大，该 GPU 负载重

# 解决：动态负载均衡
class DynamicBatchSampler:
    def __init__(self, dataset, batch_size):
        # 按序列长度排序
        self.lengths = [(i, len(dataset[i])) for i in range(len(dataset))]
        self.lengths.sort(key=lambda x: x[1])

    def __iter__(self):
        # 把相似长度的样本分到一起
        batches = []
        for i in range(0, len(self.lengths), self.batch_size):
            batch = self.lengths[i:i+self.batch_size]
            batches.append([idx for idx, _ in batch])

        # shuffle batches
        random.shuffle(batches)
        return iter(batches)
```

**模型并行负载均衡：**

```python
# 问题：模型不同层计算量差异大
# 例如：Transformer Encoder 中间层计算量大

# 解决方案：按计算量切分
class BalancedModelPartitioner:
    def partition(self, model, num_parts):
        # 估算每层计算量 (FLOPs)
        layer_flops = []
        for layer in model.layers:
            flops = estimate_layer_flops(layer)
            layer_flops.append(flops)

        # 贪心切分：平衡每个 part 的总 FLOPs
        partitions = balanced_split(layer_flops, num_parts)
        return partitions
```

**通信负载均衡：**

```python
# 问题：AllReduce 时某些 GPU 数据量大
# 解决：梯度分片 + 流水线

class BalancedAllReduce:
    def __init__(self, world_size):
        self.world_size = world_size

    def reduce(self, tensors):
        # 分片通信，避免某个 GPU 通信量过大
        chunks = len(tensors) // self.world_size
        results = []
        for i in range(self.world_size):
            chunk = tensors[i*chunks:(i+1)*chunks]
            results.append(self._reduce_chunk(chunk))
        return results
```

**自适应负载均衡：**

```
策略：根据实时监控动态调整

1. 监控：GPU 利用率、队列长度、执行时间
2. 判断：负载不均衡时触发调整
3. 调整：重新分配任务/迁移计算

┌────────────────────────────────────────┐
│            自适应调度器                 │
├────────────────────────────────────────┤
│ GPU0: [███] → [████]  增加 worker       │
│ GPU1: [███] → [██]    减少 worker       │
│ GPU2: [███] → [███]   保持不变          │
└────────────────────────────────────────┘
```

**负载均衡算法对比：**

| 算法 | 原理 | 适用场景 | 开销 |
|------|------|----------|------|
| **静态分配** | 事先划分 | 计算量确定 | 低 |
| **贪心分配** | 按需分配 | 简单场景 | 中 |
| **轮询** | Round Robin | 无状态请求 | 低 |
| **加权轮询** | 按权重分配 | 异构硬件 | 低 |
| **最小连接** | 分配到负载最小 | 长连接 | 中 |
| **动态反馈** | 实时监控调整 | 复杂场景 | 高 |

---

## 23. 什么是流水线并行 (Pipeline Parallelism)？它是如何工作的？

## 答案

### 流水线并行 (Pipeline Parallelism)

**核心思想：将模型按层划分，不同 GPU 负责不同阶段的计算**

```
传统模型并行 (无流水线)：
         GPU0    GPU1    GPU2    GPU3
Time:    [====FW0====][====FW1====][====FW2====][====FW3====]
              ↓          ↓          ↓          ↓
         [====BW3====][====BW2====][====BW1====][====BW0====]

问题：只有 1/4 GPU 在工作，利用率极低！
```

**流水线并行的工作方式：**

```
流水线并行 (Micro-batch 流水)：
         GPU0    GPU1    GPU2    GPU3
Time:
         [m0][m1][m2][m3][m4][m5]  ← Forward
              ↓
         [m0][m1][m2][m3][m4][m5]  ← Backward
              ↓

Pipeline Schedule (1F1B):
         GPU0: [F0][F1][F2][F3][B3][B2][B1][B0]
         GPU1: [  ][F0][F1][F2][B2][B1][B0]
         GPU2: [  ][  ][F0][F1][B1][B0]
         GPU3: [  ][  ][  ][F0][B0]
```

**关键参数：**

| 参数 | 说明 | 影响 |
|------|------|------|
| **num_microbatches** | 把 batch 分成多少个小 batch | 流水线长度 |
| **pipe_schedule** | 调度策略 | 内存 vs 效率 |
| **chunk_size** | 每个 microbatch 的大小 | 计算粒度 |

**GPipe 调度：**

```python
# GPipe: 经典流水线调度
# 1. Warm-up: 前向传播填充流水线
# 2. 1F1B: 一个前向一个反向交替
# 3. Cool-down: 反向传播排空

def gpipe_schedule(model, microbatches, num_chunks):
    # Warm-up 阶段
    for i in range(num_chunks):
        forward(microbatches[i])

    # 1F1B 阶段
    for i in range(num_chunks, len(microbatches)):
        forward(microbatches[i])
        backward(microbatches[i - num_chunks])

    # Cool-down 阶段
    for i in range(num_chunks):
        backward(microbatches[i])
```

**PipeDream 调度：**

```python
# PipeDream: 异步流水线，提高效率
# 核心：允许前向和反向不同步

def pipedream_schedule(model, microbatches):
    # 多个 microbatch 同时在流水线中
    # 前向和反向可以重叠执行
    forward_queue = []
    backward_queue = []

    for m in microbatches:
        # 前向入队
        f = forward(m)
        forward_queue.append(f)

        # 当有可用的反向时执行
        if forward_queue:
            fw = forward_queue.pop(0)
            bw = backward(fw)
            backward_queue.append(bw)
```

**内存分析：**

```
GPipe 内存占用：

无流水线并行：
每个 GPU 保存完整模型 + 完整激活 + 完整梯度
总显存 = 模型参数量 × 4 (FP16) + 激活量

流水线并行：
每个 GPU 只保存部分层的激活
但是！需要保存多个 microbatch 的激活

内存节省：
= 激活量 / num_microbatches

代价：
= Pipeline bubble (流水线气泡)
```

**Bubble (流水线气泡)：**

```
         GPU0    GPU1    GPU2    GPU3
Time:
         [F0][F1][  ][  ][B3][B2][B1][B0]
              ↑
         Bubble: GPU 空闲

Bubble 时间占比 ≈ (num_chunks - 1) / num_microbatches
```

**常见流水线方案对比：**

| 方案 | 调度 | 内存 | 效率 | 实现 |
|------|------|------|------|------|
| **GPipe** | 同步 1F1B | 低 | 中 | 简单 |
| **PipeDream** | 异步 | 中 | 高 | 复杂 |
| **PipeDream-2BW** | 2 buffer | 高 | 高 | 复杂 |
| **Chimera** | 双向流水 | 中 | 高 | 复杂 |
| **Megatron-LM** | Tensor+Pipeline | 中 | 高 | 成熟 |

---

## 24. 讲讲深度学习训练中的梯度消失和梯度爆炸问题，以及解决方案？

## 答案

### 梯度消失与梯度爆炸

**问题定义：**

```
梯度消失 (Vanishing Gradient)：
- 链式法则连乘导致梯度趋近于 0
- 底层参数几乎不更新
- 影响：深层网络前期层无法学习

梯度爆炸 (Exploding Gradient)：
- 链式法则连乘导致梯度指数增长
- 梯度过大导致参数大幅更新
- 影响：训练不稳定，NaN
```

**原因分析：**

```python
# 梯度计算链式法则
∂L/∂W1 = ∂L/∂a3 * ∂a3/∂a2 * ∂a2/∂a1 * ∂a1/∂W1

# 如果每层梯度 < 1，连乘后趋近于 0
# 如果每层梯度 > 1，连乘后指数增长

# 例如：ReLU 激活
∂a/∂z = 1 (z > 0) 或 0 (z < 0)
# 相对稳定

# 例如：Sigmoid 激活
∂σ/∂z = σ(1-σ) ∈ [0, 0.25]
# 最大也只有 0.25，连乘后快速衰减
```

**解决方案汇总：**

| 方案 | 原理 | 适用场景 |
|------|------|----------|
| **ReLU/LeakyReLU** | 梯度恒为 1 或常数 | 通用 |
| **BatchNorm** | 归一化激活值 | CV |
| **LayerNorm** | 归一化特征维度 | NLP |
| **残差连接** | 跨层直接传递 | 深层网络 |
| **梯度裁剪** | 限制梯度范围 | 梯度爆炸 |
| **合适初始化** | 控制初始方差 | 通用 |
| **LSTM/GRU** | 门控机制 | RNN |
| **Gradient Checkpointing** | 减少连乘深度 | 大模型 |

**残差连接原理：**

```python
# 普通网络
y = f(x)
∂y/∂x = ∂f/∂x

# 残差网络
y = f(x) + x
∂y/∂x = ∂f/∂x + 1  # 即使 ∂f/∂x → 0，梯度仍为 1

# 核心：恒等映射保证梯度直接传回
```

**梯度裁剪：**

```python
# PyTorch 梯度裁剪
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
# 或
torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=1.0)

# 动态调整
if grad_norm > 10:
    # 梯度爆炸，裁剪
    optimizer.step()
else:
    # 正常更新
    optimizer.step()
```

**初始化方法：**

```python
# Xavier/Glorot 初始化 (适用于 sigmoid/tanh)
nn.init.xavier_uniform_(layer.weight)
# 方差 = 2 / (fan_in + fan_out)

# Kaiming/He 初始化 (适用于 ReLU)
nn.init.kaiming_uniform_(layer.weight, nonlinearity='relu')
# 方差 = 2 / fan_in

# 预训练 + 微调
model = load_pretrained_model()
# 预训练权重已避免梯度问题
```

**LSTM 的门控机制：**

```python
# LSTM 单元
class LSTMCell:
    def forward(self, x, h, c):
        # 遗忘门：控制上一时刻记忆
        f = sigmoid(W_f @ [h, x] + b_f)

        # 输入门：控制新记忆
        i = sigmoid(W_i @ [h, x] + b_i)
        g = tanh(W_g @ [h, x] + b_g)

        # 输出门：控制当前记忆
        o = sigmoid(W_o @ [h, x] + b_o)

        # 细胞状态更新 (连乘变为逐点乘)
        c_new = f * c + i * g  # 门控防止梯度消失

        # 隐藏状态
        h_new = o * tanh(c_new)

        return h_new, c_new

# 梯度流动：∂c_new/∂c = f (0~1)，门控保护
```

**BatchNorm 原理：**

```python
# BatchNorm 稳定梯度
class BatchNorm:
    def forward(self, x):
        # 归一化到均值0方差1
        mu = x.mean(dim=0)
        sigma = x.std(dim=0)
        x_norm = (x - mu) / (sigma + eps)

        # 仿射变换恢复表达能力
        y = gamma * x_norm + beta
        return y

# 梯度稳定原因：
# - 归一化使输入分布稳定
# - 链式求导时，归一化部分梯度为 1
```

---

## 25. 讲讲你对模型压缩技术的理解，包括剪枝和知识蒸馏？

## 答案

### 模型压缩技术

**压缩方法全景图：**

```
┌─────────────────────────────────────────────────────────────┐
│                      模型压缩                                │
├──────────────────┬──────────────────┬──────────────────────┤
│      剪枝        │      量化         │      蒸馏           │
│   (Pruning)      │  (Quantization)   │  (Distillation)     │
├──────────────────┼──────────────────┼──────────────────────┤
│ 权重大小剪枝      │ INT8 量化        │ Soft Label          │
│ 神经元剪枝        │ PTQ / QAT        │ Hint Loss           │
│ 结构化剪枝        │ INT4 / binary    │ 温度参数 T          │
└──────────────────┴──────────────────┴──────────────────────┘
```

**1. 剪枝 (Pruning)**

```python
# 非结构化剪枝：逐权重剪枝
# 稀疏矩阵，难以加速

# 统计：L1 范数最小的权重
mask = (abs(weight) > threshold).float()
pruned_weight = weight * mask

# 结构化剪枝：按 channel/filter 剪枝
# 保持原有结构，可直接加速

# Filter 重要性评估
import torch.nn.utils.prune as prune

# 方法 1：L1 范数
prune.l1_unstructured(module, name='weight', amount=0.3)

# 方法 2：随机剪枝
prune.random_unstructured(module, name='weight', amount=0.3)

# 方法 3：结构化剪枝 (channel)
prune.ln_structured(module, name='weight', amount=0.3, n=2, dim=0)
```

**剪枝流程：**

```
1. 训练：获得大模型
         ↓
2. 重要性评估：计算每个权重/神经元的重要性
         ↓
3. 剪枝：根据重要性移除不重要连接
         ↓
4. 微调：恢复精度
         ↓
5. 迭代：重复 2-4
```

**剪枝类型对比：**

| 类型 | 粒度 | 压缩率 | 加速效果 | 实现难度 |
|------|------|--------|----------|----------|
| **非结构化** | 权重 | 高 | 需稀疏库 | 低 |
| **结构化 (Channel)** | 输出通道 | 中 | 好 | 中 |
| **结构化 (Filter)** | 整个 Filter | 中 | 好 | 中 |
| ** Lottery Ticket** | 权重 | 高 | 需重训练 | 高 |

**2. 知识蒸馏 (Knowledge Distillation)**

```python
# 教师-学生架构
class DistillationLoss(nn.Module):
    def __init__(self, temperature=4.0, alpha=0.5):
        super().__init__()
        self.temperature = temperature
        self.alpha = alpha  # 硬标签权重

    def forward(self, student_logits, teacher_logits, labels):
        # Soft Loss: KL Divergence (知识转移)
        soft_loss = F.kl_div(
            F.log_softmax(student_logits / self.temperature, dim=-1),
            F.softmax(teacher_logits / self.temperature, dim=-1),
            reduction='batchmean'
        ) * (self.temperature ** 2)

        # Hard Loss: Cross Entropy (任务性能)
        hard_loss = F.cross_entropy(student_logits, labels)

        # 混合损失
        return self.alpha * soft_loss + (1 - self.alpha) * hard_loss
```

**蒸馏温度的作用：**

```
Temperature T = 1: 正常 softmax
                e^z_i / Σ e^z_j

Temperature T = 4: 更 soft 的概率分布
                e^z_i/T / Σ e^z_j/T

为什么有用？
- 教师模型的"软标签"包含类别间关系
- 例如：猫的图片 → 0.7 猫 + 0.2 狗 + 0.1 车
- 这种关系比硬标签更能指导学生学习
```

**中间层蒸馏 (Hint Loss)：**

```python
# 中间层特征对齐
class HintLoss(nn.Module):
    def forward(self, student_features, teacher_features):
        # MSE 对齐特征
        return F.mse_loss(student_features, teacher_features)

# 示例：FitNet
teacher_conv = model.teacher.layer4
student_conv = model.student.layer4

# 学习器投影层
projection = nn.Conv2d(student_channels, teacher_channels, 1)

# Hint: 对齐特征
hint_loss = F.mse_loss(
    projection(student_features),
    teacher_features
)
```

**压缩效果对比：**

| 方法 | 压缩率 | 精度保持 | 适用场景 |
|------|--------|----------|----------|
| **剪枝 50%** | 2x | 98% | CNN |
| **剪枝 80%** | 5x | 90-95% | CNN |
| **INT8 量化** | 4x | 99% | 通用 |
| **知识蒸馏** | 4-10x | 97-99% | 通用 |

**组合使用：**

```
大模型 → 剪枝 → 蒸馏 → 量化 → 小模型

效果叠加：
1. 原始模型: FLOPs = 100%
2. 剪枝 50%: FLOPs = 50%, Acc = 98%
3. 蒸馏: Acc = 97%
4. INT8 量化: FLOPs = 25%, Acc = 96%

最终: 4x 压缩，精度仅损失 2-3%
```

---

## 26. 讲讲你对深度学习编译器（如 TVM、TensorRT XLA）的理解？

## 答案

### 深度学习编译器

**为什么需要深度学习编译器：**

```
高层框架 (PyTorch/TensorFlow)
         ↓ 缺点
1. 依赖 Python 解释器，执行效率低
2. 算子粒度细，大量 kernel 调用
3. 无法充分利用硬件特性

解决方案：深度学习编译器
         ↓
1. Graph-level 优化：算子融合、常量折叠
2. Code Generation：生成高效 kernel
3. Hardware-specific 优化：充分利用硬件
```

**深度学习编译器架构：**

```
┌─────────────────────────────────────────────────────────────┐
│                      输入：高层框架模型                       │
│         (PyTorch / TensorFlow / ONNX)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    High-Level IR (Graph)                    │
│              计算图优化 (算子融合、布局转换)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Low-Level IR (MLIR)                       │
│              硬件相关优化 (内存规划、线程调度)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Code Generation                          │
│              生成目标代码 (CUDA / x86 / ARM)                 │
└─────────────────────────────────────────────────────────────┘
```

**主流深度学习编译器对比：**

| 编译器 | 开发方 | 特点 | 适用场景 |
|--------|--------|------|----------|
| **TVM** | Apache | 开源、跨平台、自动调度 | 通用 |
| **TensorRT** | NVIDIA | GPU 优化最强 | NVIDIA GPU |
| **XLA** | Google | TensorFlow 原生 | TPU/GPU |
| **MLIR** | Google | 通用基础设施 | 研究 |
| **TorchScript** | PyTorch | PyTorch 原生 | PyTorch |
| **ONNX Runtime** | Microsoft | 跨框架、跨硬件 | 部署 |

**TVM 工作流程：**

```python
import tvm
from tvm import te
import tvm.relay as relay

# 1. 加载模型 (ONNX)
model = onnx.load("model.onnx")
shape_dict = {"input": [1, 3, 224, 224]}
mod, params = relay.frontend.from_onnx(model, shape_dict)

# 2. 图优化
with tvm.transform.PassContext(opt_level=3):
    lib = relay.build(mod, target="cuda", params=params)

# 3. 自动调度 (AutoTVM)
# 定义搜索空间，让编译器找到最优 schedule
```

**TensorRT 优化流程：**

```
1. 模型解析 (Parser)
         ↓
2. Network Definition
         ↓
3. Builder Optimization
   - Layer fusion
   - Precision selection
   - Memory optimization
   - Dynamic shape support
         ↓
4. Engine Serialization
         ↓
5. Inference (Context.execute)
```

**算子融合案例：**

```python
# 输入图
Conv2d → BatchNorm → ReLU → Conv2d → ReLU

# TensorRT 融合后
[FusedConvBNReLU] → [FusedConvReLU]

# TVM 融合后
Stage 1: compute(N, C, H, W) {
  // Conv + BN + ReLU 融合计算
  O[n,c,h,w] = max(0, (Conv(n,c,h,w) - mean[c]) / sqrt(var[c] + eps) * gamma[c] + beta[c])
}
```

**Auto Tuning (AutoTVM)：**

```python
# 定义搜索空间
@autotvm.search_space
def conv2d_tune(i, o, ft念, hw):
    # 调度参数
    tile_h = hw.choice_int([1, 2, 4, 8])
    tile_w = hw.choice_int([1, 2, 4, 8])
    tile_rc = hw.choice_int([1, 2, 4, 8, 8])

    # 调度策略
    cfg.define_knob("tile_h", [1, 2, 4, 8])

# AutoTVM 自动搜索最优配置
# 比人工调度快 2-5x
```

**硬件抽象层 (HAL)：**

```
┌─────────────────────────────────────────────────────────────┐
│                    深度学习编译器                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │  CUDA   │  │  ROCm   │  │  x86    │  │  ARM    │        │
│   │  Target │  │  Target │  │  Target │  │  Target │        │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│        └────────────┴────────────┴────────────┘             │
│                          ↓                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │  NVCC   │  │  HCC    │  │  GCC    │  │  ARMCC  │        │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 27. 讲讲大模型 (LLM) 推理和普通深度学习模型推理的区别？

## 答案

### LLM 推理 vs 普通模型推理

**核心区别：**

```
普通模型推理 (如 ResNet)：
         ┌────────────────────────────────┐
Input    │                                │
  ──────→│  Forward (一次性完整计算)       │──────→ Output
         │                                │
         └────────────────────────────────┘
         计算时间固定，batch size 固定

LLM 推理 (如 GPT)：
         ┌────────────────────────────────┐
Input    │                                │
  ──────→│  Prefill (处理输入 tokens)     │──────→ Output
         │         ↓                       │
         │  Decode (逐 token 生成)         │
         │         ↓                       │
         │  token 1 ────────→              │
         │         ↓                       │
         │  token 2 ────────→              │
         │         ↓        ...           │
         └────────────────────────────────┘
         Prefill 算力密集，Decode 内存密集
```

**LLM 推理的两个阶段：**

| 阶段 | 特点 | 计算模式 |
|------|------|----------|
| **Prefill** | 处理输入 Prompt | 计算密集 (矩阵乘法) |
| **Decode** | 生成输出 Token | 内存密集 (KV Cache) |

**Decode 阶段详解：**

```python
# 自回归生成
output_ids = [start_token]

for step in range(max_length):
    # 每次只输入 1 个 token
    logits = model(output_ids)  # [1, vocab_size]
    next_token = argmax(logits)
    output_ids.append(next_token)

    # KV Cache 避免重复计算
    # 每个 layer 保存 K, V 矩阵
    # 新 token 只需计算当前层的 attention
```

**KV Cache 显存问题：**

```
LLM 70B 模型 KV Cache 估算：

每个 token 需要存储：
- K: [num_layers, num_heads, head_dim] × 2 bytes (FP16)
- V: [num_layers, num_heads, head_dim] × 2 bytes

总大小 = 2 × num_layers × num_heads × head_dim × 2 bytes × seq_len

LLaMA-70B:
- 80 layers, 128 heads, 128 head_dim
- 每个 token: 80 × 128 × 128 × 2 × 2 = 5.24 MB
- 1000 tokens: 5.24 GB

并发 100 个请求，每个请求 1000 tokens：
= 524 GB (远超单卡显存!)
```

**LLM 推理优化技术：**

| 优化 | 技术 | 效果 |
|------|------|------|
| **PagedAttention** | KV Cache 分页管理 | 显存利用率 2-3x |
| **Continuous Batching** | Iteration 级批处理 | 吞吐 5-10x |
| **Prefix Caching** | 共享 prompt 前缀 | 减少计算 |
| **投机解码 (Speculative)** | 小模型辅助大模型 | 延迟降低 |
| **Flash Attention** | IO 感知的注意力 | 显存减少 2x |
| **INT4/FP8 量化** | 低精度推理 | 显存减半 |

**普通模型 vs LLM 推理对比：**

| 维度 | ResNet | LLaMA-7B |
|------|--------|----------|
| **Prefill 时间** | ~50ms | ~200ms |
| **Per-token 时间** | N/A | ~50ms |
| **显存占用** | ~1 GB | ~28 GB |
| **Batch Size** | 32+ | 1-4 |
| **优化重点** | 算子融合 | KV Cache |
| **吞吐瓶颈** | 计算 | 内存带宽 |

**vLLM vs TensorRT-LLM：**

| 特性 | vLLM | TensorRT-LLM |
|------|------|-------------|
| **优化重点** | 吞吐 | 延迟 |
| **量化支持** | AWQ/SqueezeLLM | INT8/FP8 |
| **Prefix Cache** | 支持 | 部分支持 |
| **多模态** | 支持 | 扩展中 |
| **部署便捷性** | 高 | 中 |
| **适合场景** | 高吞吐服务 | 低延迟服务 |

---

## 28. 讲讲你对 CUDA 内存模型的理解，shared memory 和 local memory 的区别？

## 答案

### CUDA 内存模型

**CUDA 内存类型：**

```
┌─────────────────────────────────────────────────────────────┐
│                     GPU 内存层级                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Register (线程私有)                                         │
│  - 最快 (~1 cycle)                                          │
│  - 按需分配                                                 │
│  - 溢出到 Local Memory                                      │
│                                                             │
│  Local Memory (线程私有)                                    │
│  - 溢出寄存器的大数组使用                                    │
│  - 实际在 HBM 中，性能差                                    │
│                                                             │
│  Shared Memory (Block 共享)                                │
│  - 程序员显式管理                                           │
│  - 高带宽 (~20 TB/s)                                       │
│  - 同 Block 线程通信                                       │
│                                                             │
│  Global Memory (全局)                                        │
│  - 所有线程可访问                                            │
│  - 带宽 ~1 TB/s (A100)                                      │
│  - 需要合并访问优化                                          │
│                                                             │
│  Constant Memory (只读)                                      │
│  - 缓存在片上                                                 │
│  - 广播访问效率高                                            │
│                                                             │
│  Texture Memory (只读)                                       │
│  - 2D/3D 局部性优化                                          │
│  - 硬件插值支持                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Shared Memory vs Local Memory：**

```cuda
// Shared Memory: 显式声明，片上内存，高性能
__global__ void kernel_with_shared(float *data) {
    __shared__ float shared_data[256];  // 声明

    // 线程协作：先加载到 shared memory
    shared_data[threadIdx.x] = data[threadIdx.x];
    __syncthreads();  // 同步

    // 使用 shared memory 计算
    float sum = 0;
    for (int i = 0; i < 256; i++) {
        sum += shared_data[i];
    }
}

// Local Memory: 编译器决定，实际在 HBM 中
__global__ void kernel_local(float *data) {
    float local_array[100];  // 大数组会溢出到 local memory

    // local memory 访问：性能差
    local_array[threadIdx.x] = data[threadIdx.x];
}
```

**性能对比：**

| 内存类型 | 带宽 | 延迟 | 生命周期 | 作用域 |
|----------|------|------|----------|--------|
| **Register** | ~20 TB/s | 1 cycle | 线程 | 线程 |
| **Shared Memory** | ~20 TB/s | 1 cycle | Block | Block |
| **Local Memory** | ~1 TB/s | ~400 cycles | 线程 | 线程 |
| **Global Memory** | ~1 TB/s | ~400 cycles | 应用 | 全局 |
| **Constant Cache** | ~10 TB/s | ~100 cycles | 应用 | 只读 |

**Shared Memory 银行冲突：**

```
Shared Memory 被分成多个 banks (通常 32 banks)

无冲突：每个 bank 同时服务不同地址
┌──┬──┬──┬──┐
│B0│B1│B2│B3│  访问 [0,1,2,3] → 无冲突
└──┴──┴──┴──┘

冲突：多个线程访问同一 bank
┌──┬──┬──┬──┐
│B0│B1│B2│B3│  访问 [0,4,8,12] → 冲突 (同 bank)
└──┴──┴──┴──┘

解决：Padding 避免同 bank 访问
__shared__ float data[256][257];  // +1 padding
```

**Shared Memory 优化技巧：**

```cuda
// 技巧 1：数据预加载，减少 HBM 访问
__global__ void optimized_conv(float *input, float *output) {
    __shared__ float tile[16][16];

    // 一次加载，而非在循环中多次访问
    tile[ty][tx] = input[by*16 + ty][bx*16 + tx];
    __syncthreads();

    // 使用 tile 计算
    // ...
}

// 技巧 2：双缓冲流水线
__shared__ float tileA[16][16];
__shared__ float tileB[16][16];

// ping-pong 缓冲：计算与加载重叠
if (step % 2 == 0) {
    load(tileA);
    compute(tileB);
} else {
    load(tileB);
    compute(tileA);
}
```

**PyTorch 中的使用：**

```python
# PyTorch 中使用 shared memory
# 主要通过 flatten / reshape 实现数据局部性

# 技巧：利用数据的 shared memory 特性
x = torch.randn(1024, 1024, device='cuda')

# 列优先布局 (Column-major) 适合某些算子
x_t = x.t()
# 或
x_contiguous = x.t().contiguous()

# memory format: torch.channels_last
x_cl = x.to(memory_format=torch.channels_last)
# 某些卷积算子在 channels_last 下更快
```

---

## 29. 讲讲你对分布式训练中通信和计算重叠的理解？

## 答案

### 计算与通信重叠

**问题背景：**

```
传统分布式训练：
         时间
         ↓
GPU0: [计算][通信][计算][通信]...
GPU1: [计算][通信][计算][通信]...
                    ↑
              GPU0/1 必须互相等待

通信时间无法利用 → GPU 空闲 → 效率低
```

**重叠原理：**

```
优化后：
         时间
         ↓
GPU0: [计算][通信  ][计算]...
      ↙________________↘____↙____
GPU1: [计算][通信  ][计算]...
                    ↑
              计算和通信并行执行

关键：CUDA Stream 异步执行 + 事件同步
```

**CUDA Stream 实现：**

```python
import torch

# 创建独立的通信 Stream 和计算 Stream
compute_stream = torch.cuda.Stream()
comm_stream = torch.cuda.Stream()

# 计算 Stream 上执行前向
with torch.cuda.stream(compute_stream):
    output = model(input)

# 通信 Stream 上执行梯度 AllReduce
with torch.cuda.stream(comm_stream):
    dist.all_reduce(grad)

# 等待通信完成后再更新参数
torch.cuda.synchronize()
optimizer.step()
```

**梯度累加 + 通信重叠：**

```python
# 梯度累加期间可以进行通信
model.zero_grad()

for i, (data, target) in enumerate(dataloader):
    with torch.cuda.stream(compute_stream):
        output = model(data)
        loss = criterion(output, target)
        loss.backward()  # 累加梯度

    # 在独立的通信 stream 中执行 allreduce
    if (i + 1) % accumulation_steps == 0:
        with torch.cuda.stream(comm_stream):
            # 对梯度进行平均
            for param in model.parameters():
                dist.all_reduce(param.grad, op=dist.ReduceOp.SUM)
                param.grad /= world_size
        optimizer.step()
        model.zero_grad()
```

**异步集合通信：**

```python
# 非阻塞 AllReduce
handle = torch.distributed.all_reduce_async(
    grad,
    op=torch.distributed.ReduceOp.SUM,
    group=process_group
)

# 计算可以立即开始
# 在适当时候等待通信完成
torch.distributed.wait(handle)

# 或者使用事件同步
event = torch.cuda.Event()
event.record()
grad = event.synchronize()
```

**Overlap 策略对比：**

| 策略 | 原理 | 效果 | 实现难度 |
|------|------|------|----------|
| **Stream 并行** | 计算和通信在不同 Stream | 中等 | 低 |
| **梯度累加** | 多个 microbatch 隐藏通信 | 好 | 中 |
| **异步 AllReduce** | 通信计算完全重叠 | 最好 | 高 |
| **1F1B** | 流水线式重叠 | 好 | 中 |
| **PowerIteration** | 多次迭代重叠 | 最好 | 高 |

**实际代码示例：**

```python
class OverlapScheduler:
    def __init__(self, model, optimizer):
        self.model = model
        self.optimizer = optimizer
        self.compute_stream = torch.cuda.Stream()
        self.comm_stream = torch.cuda.Stream()

    def train_step(self, data_batch):
        # Step 1: 前向+反向 (计算 Stream)
        with torch.cuda.stream(self.compute_stream):
            output = self.model(data_batch)
            loss = self.criterion(output)
            loss.backward()

        # Step 2: 梯度通信 (通信 Stream) - 与下一次计算重叠
        with torch.cuda.stream(self.comm_stream):
            for param in self.model.parameters():
                if param.grad is not None:
                    torch.distributed.all_reduce(
                        param.grad,
                        op=torch.distributed.ReduceOp.SUM
                    )

        # Step 3: 等待通信完成
        torch.cuda.synchronize()

        # Step 4: 参数更新
        self.optimizer.step()
        self.optimizer.zero_grad()
```

**NCCL 通信优化：**

```python
# 1. 启用 NCCL 异步模式
torch.distributed.init_process_group(
    backend="nccl",
    init_method="env://",
    NCCL_ASYNC_ERROR_HANDLING=1  # 异步错误处理
)

# 2. 优化 buffer 大小
os.environ["NCCL_IB_QPS_PER_CONNECTION"] = "4"  # 提高带宽利用率

# 3. 通信原语选择
# AllReduce vs RingAllReduce vs TreeAllReduce
# 根据 GPU 数量和拓扑选择
```

---

## 30. 讲讲你对深度学习框架中自动并行 (Auto Parallel) 的理解？

## 答案

### 自动并行 (Auto Parallelism)

**为什么需要自动并行：**

```
手动并行的问题：
1. 多种并行策略组合爆炸
   - 数据并行 × 模型并行 × 流水线并行 × 张量并行
   = N 种可能的组合

2. 硬件拓扑差异
   - NVLink vs PCIe
   - 多节点网络
   - 内存大小差异

3. 动态因素
   - Batch size
   - 输入 shape
   - 算子实现差异

解决方案：自动搜索最优并行策略
```

**自动并行框架：**

```
┌─────────────────────────────────────────────────────────────┐
│                      输入：计算图                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    成本模型 (Cost Model)                      │
│           估算不同并行策略的执行时间                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    策略搜索 (Strategy Search)                │
│           启发式 / 强化学习 / 贝叶斯优化                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    代码生成 (Code Generation)                │
│              生成支持特定并行策略的代码                        │
└─────────────────────────────────────────────────────────────┘
```

**成本模型 (Cost Model)：**

```python
# 成本模型估计
class CostModel:
    def estimate(self, op, parallelism_config):
        # 计算时间 = 计算时间 + 通信时间

        # 计算时间
        compute_time = op.flops / hardware.compute_bandwidth

        # 通信时间 (数据并行)
        if config.data_parallel:
            comm_time = op.grad_size / network_bandwidth

        # 内存占用
        memory = op.activations + op.parameters

        # 考虑内存限制
        if memory > available_memory:
            return float('inf')  # 不可行

        return compute_time + comm_time

# 策略选择
best_config = min(
    all_configs,
    key=lambda c: cost_model.estimate(op, c)
)
```

**策略搜索算法：**

| 算法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **穷举搜索** | 遍历所有策略 | 全局最优 | 搜索空间大 |
| **贪心搜索** | 每步选最优 | 快速 | 可能非最优 |
| **动态规划** | 子问题最优组合 | 效果好 | 状态爆炸 |
| **贝叶斯优化** | 基于历史搜索 | 高效 | 调参复杂 |
| **强化学习** | 学习最优策略 | 可学习复杂策略 | 训练成本高 |

**Google GShard 示例：**

```python
# GShard 自动张量并行
# 基于 SPMD (Single Program Multiple Data)

@mesh_split(mesh, "model", [1, 4])  # 自动切分模型
def transformer_block(x):
    return layer(x)

# 自动决定：
# 1. 在哪个维度切分
# 2. 如何重排通信
# 3. 如何合并计算
```

**FlexFlow 示例：**

```python
# FlexFlow: 基于采样 + 成本模型
from flexflow.core import FlexFlow

ff = FlexFlow()

# 定义算子
x = ff.placeholder()
for i in range(6):
    x = ff.dense(x, dim=14336)

# 自动并行策略搜索
policy = ff.auto_schedule(
    objective="throughput",  # 优化目标
    num_trials=100           # 搜索次数
)

ff.apply(solicy)
```

**Megatron-LM 的半自动并行：**

```python
# 手动指定 + 自动优化
from megatron.core import parallel_state

# 数据并行
parallel_state.set_data_parallel_size(8)

# 模型并行 (流水线)
parallel_state.set_pipeline_model_parallel_size(4)

# 张量并行 (单卡内)
parallel_state.set_tensor_model_parallel_size(2)

# 框架自动处理通信和调度
```

**自动并行的挑战：**

```
1. 搜索空间爆炸
   - 2^N 种可能的切分方式 (N=算子数)

2. 成本模型精度
   - 理论估计 vs 实际性能有差距

3. 动态 Shape
   - NLP/语音输入长度变化

4. 通信与计算重叠
   - 难以精确建模

5. 多目标优化
   - 延迟 vs 吞吐 vs 显存
```

**主流系统对比：**

| 系统 | 公司 | 特点 |
|------|------|------|
| **GShard** | Google | TPU 原生，支持 MoE |
| **Mesh TensorFlow** | Google | SPMD 编程模型 |
| **FlexFlow** | CMU | Sampling + Cost Model |
| **Alice** | 微软 | 元学习搜索 |
| **Ray** | Berkeley | 通用分布式框架 |
| **Tensor Parallel** | NVIDIA | Megatron-LM |

---

## 31. 讲讲你对大模型训练中 Loss 跑飞 (NaN) 问题的排查思路？

## 答案

### Loss NaN 问题排查

**常见原因：**

```
┌─────────────────────────────────────────────────────────────┐
│                    Loss NaN 原因分析                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 梯度爆炸                                                │
│     - 梯度值过大，超出 float16 表示范围                       │
│     - 解决：梯度裁剪、降低学习率                              │
│                                                             │
│  2. 数值不稳定                                              │
│     - log(0)、sqrt(0)、除零                                 │
│     - Softmax 溢出                                          │
│     - 解决：eps、log-sum-exp、混合精度                       │
│                                                             │
│  3. 学习率过大                                              │
│     - 参数更新幅度过大                                       │
│     - 解决：学习率衰减、热启动                               │
│                                                             │
│  4. 数据问题                                                │
│     - 异常值、NaN 值、缺失值                                 │
│     - 除零计算                                               │
│     - 解决：数据清洗、NaN 检查                               │
│                                                             │
│  5. 混合精度训练问题                                        │
│     - loss scaling 不当                                     │
│     - 解决：调整 scaler、使用 BF16                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**排查流程：**

```python
# Step 1: 检查数据
print("Data contains NaN:", torch.isnan(data).any())
print("Data contains Inf:", torch.isinf(data).any())

# Step 2: 检查梯度
for name, param in model.named_parameters():
    if param.grad is not None:
        print(f"{name}: grad norm = {param.grad.norm()}")
        if torch.isnan(param.grad).any():
            print(f"  ⚠️ NaN gradient in {name}")
        if torch.isinf(param.grad).any():
            print(f"  ⚠️ Inf gradient in {name}")

# Step 3: 检查 Loss 值
if torch.isnan(loss) or torch.isinf(loss):
    print(f"⚠️ Loss is NaN/Inf at step {step}")
    print(f"   Input mean: {data.mean()}, std: {data.std()}")
    print(f"   Output mean: {output.mean()}, std: {output.std()}")
```

**梯度爆炸排查：**

```python
# 方法 1: 梯度裁剪
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 方法 2: 检查梯度分布
import numpy as np
grad_norms = []
for param in model.parameters():
    if param.grad is not None:
        grad_norms.append(param.grad.norm().item())

print(f"Max grad norm: {max(grad_norms)}")
print(f"Mean grad norm: {np.mean(grad_norms)}")
print(f"Min grad norm: {min(grad_norms)}")

# 方法 3: 使用 AMP 自动处理
scaler = GradScaler()
with autocast():
    output = model(input)
    loss = criterion(output, target)

scaler.scale(loss).backward()
scaler.unscale_(optimizer)
torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
scaler.step(optimizer)
scaler.update()
```

**数值不稳定排查：**

```python
# 问题：softmax 溢出
# logits = [1000, 1001, 1002] → exp 溢出

# 解决：减去最大值
def safe_softmax(logits, dim=-1):
    # 减去最大值防止溢出
    logits_max = logits.max(dim=dim, keepdim=True).values
    probs = torch.exp(logits - logits_max)
    probs = probs / probs.sum(dim=dim, keepdim=True)
    return probs

# 问题：log(0)
# 解决：添加 eps
log_probs = torch.log(probs + 1e-8)

# 问题：sqrt(0) or 1/0
# 解决：标准化时加 eps
std = torch.sqrt(var + eps)
```

**混合精度训练问题：**

```python
# 问题：loss scaling 不当导致下溢
scaler = GradScaler()

# 如果连续 loss 为 inf，逐步减小 scale
if torch.isnan(loss):
    if scaler.get_scale() < 1.0:
        raise Exception("Loss scale too small")
    scaler.set_scale(scaler.get_scale() / 2)

# 使用 BF16 代替 FP16 (更稳定)
with autocast(dtype=torch.bfloat16):
    output = model(input)
    loss = criterion(output, target)
```

**数据问题排查：**

```python
# 检查数据
def validate_data(data, target):
    assert not torch.isnan(data).any(), "Data contains NaN"
    assert not torch.isinf(data).any(), "Data contains Inf"
    assert (data >= 0).all() or is_valid_range, "Data out of valid range"
    assert not torch.isnan(target).any(), "Target contains NaN"
    return True

# 数据归一化
class SafeNormalize:
    def __init__(self, eps=1e-8):
        self.eps = eps

    def __call__(self, x):
        # 安全归一化
        mean = x.mean()
        std = x.std()
        std = torch.where(std < self.eps, torch.ones_like(std), std)
        return (x - mean) / std
```

**Loss 监控与告警：**

```python
class LossMonitor:
    def __init__(self, window=100):
        self.history = []
        self.window = window

    def update(self, loss):
        self.history.append(loss)
        if len(self.history) > self.window:
            self.history.pop(0)

        # 检测异常
        if torch.isnan(loss) or torch.isinf(loss):
            return "CRITICAL: Loss is NaN/Inf"

        if loss > np.mean(self.history) + 3 * np.std(self.history):
            return "WARNING: Loss spike detected"

        if loss < 0 and is_classification:
            return "WARNING: Negative loss in classification"

        return "OK"
```

**预防措施：**

| 措施 | 作用 |
|------|------|
| 梯度裁剪 | 防止梯度爆炸 |
| 混合精度 (BF16) | 提高数值稳定性 |
| 学习率热启动 | 初期稳定训练 |
| NaN 检查 | 早期发现问题 |
| 权重衰减 | 正则化防止过大 |
| 合适初始化 | Xavier/Kaiming |

---

## 32. 讲讲你对模型推理中延迟和吞吐的理解，以及如何权衡？

## 答案

### 延迟 vs 吞吐

**基本概念：**

```
延迟 (Latency)：单个请求的处理时间
         ↓
Request ───→ [处理中] ───→ Response
         ↑
         ↑
      100ms

吞吐 (Throughput)：单位时间内处理的请求数
         ↓
在 1 秒内处理了 100 个请求
Throughput = 100 req/s
```

**延迟-吞吐关系：**

```
┌─────────────────────────────────────────────────────────────┐
│                    延迟 vs 吞吐                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Batch Size = 1:                                            │
│  请求 ──→ [处理 50ms] ──→ 完成                             │
│  吞吐 = 20 req/s                                            │
│                                                             │
│  Batch Size = 32:                                           │
│  请求 ──→ [处理 200ms] ──→ 完成                            │
│  Batch 1: ────→│                                           │
│  Batch 2:  ────→│  50ms per item, but 200ms for batch       │
│  Batch 32: ────→│                                           │
│  吞吐 = 160 req/s                                           │
│                                                             │
│  延迟增加 4x，但吞吐增加 8x！                                │
└─────────────────────────────────────────────────────────────┘
```

**优化策略对比：**

| 优化方向 | 延迟优化 | 吞吐优化 |
|----------|----------|----------|
| **Batch Size** | 小 batch | 大 batch |
| **并行度** | 多 Stream | 连续批处理 |
| **量化** | INT8 | INT8 |
| **Cache** | Prefetch | KV Cache 复用 |
| **调度** | 优先级队列 | Fair Sharing |

**延迟敏感场景：**

```python
# 实时对话 / 自动驾驶
class LowLatencyScheduler:
    def __init__(self, max_batch=4, timeout=10ms):
        self.max_batch = max_batch
        self.timeout = timeout  # 严格超时

    async def schedule(self, request):
        # 优先保证低延迟
        # 宁愿 batch 小，也要快速响应
        batch = await asyncio.wait_for(
            self.collect_batch(self.max_batch),
            timeout=self.timeout
        )
        return await self.execute(batch)
```

**吞吐敏感场景：**

```python
# 离线批处理 / 数据生成
class HighThroughputScheduler:
    def __init__(self, max_batch=128):
        self.max_batch = max_batch

    async def schedule(self, request):
        # 优先保证吞吐
        # 等待足够多请求，批量处理
        batch = await self.queue.wait_until_full(
            self.max_batch
        )
        return await self.execute(batch)
```

**Continuous Batching 平衡延迟和吞吐：**

```python
class BalancedScheduler:
    """
    用于 LLM 推理：
    - 新请求立即入队
    - 每次迭代后检查是否有完成的请求
    - 有空位就插入新请求
    """
    def __init__(self, max_batch=64):
        self.running_batch = []
        self.pending_queue = asyncio.Queue()

    async def step(self):
        # 1. 尝试填充空闲 slot
        while len(self.running_batch) < self.max_batch:
            try:
                request = self.pending_queue.get_nowait()
                self.running_batch.append(request)
            except:
                break

        # 2. 执行一步推理
        if self.running_batch:
            tokens = await self.model.step(self.running_batch)

            # 3. 检查完成
            completed = []
            remaining = []
            for req, token in zip(self.running_batch, tokens):
                if req.is_done(token):
                    completed.append(req)
                else:
                    remaining.append(req)

            self.running_batch = remaining
            return completed
```

**性能指标：**

```
┌─────────────────────────────────────────────────────────────┐
│                    性能指标定义                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  P50 Latency: 中位数，50% 请求在此时间内完成                  │
│  P90 Latency: 90 分位数，更好的用户体验指标                   │
│  P99 Latency: 99 分位数，保证 SLA                           │
│                                                             │
│  TTFT (Time To First Token): 首个 token 时间 (LLM)          │
│  TPOT (Time Per Output Token): 每个输出 token 的时间 (LLM)   │
│                                                             │
│  吞吐量: req/s 或 tokens/s                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**权衡策略：**

| 策略 | 延迟 | 吞吐 | 适用场景 |
|------|------|------|----------|
| Dynamic Batching | 中 | 高 | API 服务 |
| Continuous Batching | 中低 | 高 | LLM 推理 |
| Speculative Decoding | 低 | 略低 | LLM 延迟敏感 |
| Prefix Caching | 低 | 高 | 多请求共享 |
| 优先级调度 | 低 | 中 | 交互式 |

**优化建议：**

```python
# 延迟-吞吐权衡指南

# 1. 如果延迟敏感 (TTFT < 500ms):
# - 使用小 batch
# - 启用 prefix caching
# - 考虑 speculative decoding
# - 使用低延迟硬件 (A100 > A10G)

# 2. 如果吞吐敏感 (100+ req/s):
# - 使用大 batch
# - 启用 continuous batching
# - INT8 量化
# - 多 GPU 水平扩展

# 3. 监控指标:
metrics = {
    "latency_p50": 50,      # ms
    "latency_p99": 200,     # ms
    "throughput": 100,      # req/s
    "gpu_utilization": 80,  # %
}
```

---

## 33. 讲讲你对深度学习框架中算子调度 (Operator Scheduling) 的理解？

## 答案

### 算子调度 (Operator Scheduling)

**调度问题定义：**

```
给定：
- DAG 形式的计算图 (Directed Acyclic Graph)
- 可用的计算资源 (GPU cores, memory)

目标：
- 最小化总执行时间
- 或最大化资源利用率

约束：
- 数据依赖 (拓扑序)
- 资源限制 (显存、算力)
- 内存限制
```

**调度类型：**

| 类型 | 特点 | 适用场景 |
|------|------|----------|
| **拓扑排序** | 按依赖顺序执行 | 单设备 |
| **异步调度** | 允许异步执行 | 多设备 |
| **流水线调度** | 计算通信重叠 | 分布式训练 |
| **优先级调度** | 关键路径优先 | 延迟敏感 |

**拓扑排序：**

```python
# Kahn 算法实现
def topological_sort(graph):
    # 计算入度
    in_degree = {node: 0 for node in graph}
    for node in graph:
        for neighbor in graph[node]:
            in_degree[neighbor] += 1

    # 入度为 0 的节点入队
    queue = [node for node in graph if in_degree[node] == 0]
    result = []

    while queue:
        # 选择一个节点执行
        node = queue.pop(0)
        result.append(node)

        # 更新邻居入度
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return result
```

**异步调度：**

```python
class AsyncScheduler:
    def __init__(self):
        self.execution_order = []

    def schedule(self, graph):
        # 跟踪每个节点的依赖是否满足
        pending = {node: len(graph[node]) for node in graph}  # 反向：被多少节点依赖
        ready = []

        # 初始：没有依赖的节点
        for node in graph:
            if not graph[node]:  # 无输入依赖
                ready.append(node)

        while ready or self.execution_order:
            # 选择可执行的节点
            if ready:
                node = ready.pop(0)
                self.execution_order.append(node)

                # 标记依赖此节点的节点
                for dependent in self.get_dependents(node):
                    pending[dependent] -= 1
                    if pending[dependent] == 0:
                        ready.append(dependent)

            # 如果有异步执行器，可以同时运行多个
            # while self.executor.has_available_slot() and ready:
            #     self.executor.submit(ready.pop(0))
```

**流水线调度 (用于分布式)：**

```python
# 1F1B (One Forward One Backward) 调度
class PipelineScheduler:
    def __init__(self, stages, num_microbatches):
        self.stages = stages  # 模型分段
        self.num_microbatches = num_microbatches

    def schedule(self):
        schedule = []

        # Warm-up: 填充流水线
        for i in range(len(self.stages)):
            schedule.append(('forward', i))

        # 1F1B: 交替执行
        for i in range(self.num_microbatches):
            # Forward
            schedule.append(('forward', i % len(self.stages)))
            # Backward
            schedule.append(('backward', i % len(self.stages)))

        # Cool-down: 排空流水线
        for i in range(len(self.stages)):
            schedule.append(('backward', len(self.stages) - 1 - i))

        return schedule
```

**调度优化策略：**

```python
# 1. 关键路径优先
def critical_path_first(graph):
    """优先调度在关键路径上的算子"""
    cpath = compute_critical_path(graph)
    return sorted(graph.keys(),
                  key=lambda x: -len(cpath.get(x, [])))

# 2. 算子融合优先
def fusion_first(graph):
    """优先调度可以融合的算子"""
    fusion_groups = find_fusion_opportunities(graph)
    schedule = []

    for group in fusion_groups:
        schedule.extend(group)  # 连续调度同一组的算子

    # 添加其他算子
    for node in graph:
        if node not in fusion_groups:
            schedule.append(node)

    return schedule

# 3. 内存感知调度
def memory_aware_schedule(graph, memory_limit):
    """考虑内存约束的调度"""
    schedule = []
    current_memory = 0

    for node in topological_sort(graph):
        node_memory = estimate_memory(node)

        if current_memory + node_memory <= memory_limit:
            schedule.append(node)
            current_memory += node_memory
        else:
            # 等待释放内存
            yield schedule
            schedule = [node]
            current_memory = node_memory

    if schedule:
        yield schedule
```

**运行时调度器：**

```python
# TensorRT 风格的运行时调度
class RuntimeScheduler:
    def __init__(self, model):
        self.model = model
        self.cuda_stream_pool = [cuda.Stream() for _ in range(4)]

    def execute(self, inputs):
        # 按层执行
        for layer in self.model.layers:
            # 选择最空闲的 stream
            stream = self.select_stream()

            # 准备输入
            input_tensors = self.prepare_inputs(layer, inputs)

            # 异步执行
            with cuda.stream(stream):
                output = layer.execute(input_tensors)

            # 更新依赖
            inputs = output

        return inputs

    def select_stream(self):
        # 选择负载最小的 stream
        return min(self.cuda_stream_pool,
                   key=lambda s: s.load)
```

---

## 34. 讲讲你对深度学习训练中 Batch Size 选择策略的理解？

## 答案

### Batch Size 选择策略

**Batch Size 的影响：**

```
┌─────────────────────────────────────────────────────────────┐
│                    Batch Size 影响                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  小 Batch Size:                                             │
│  ✓ 训练更稳定                                              │
│  ✓ 收敛到更好的局部最小值                                   │
│  ✗ GPU 利用率低                                             │
│  ✗ 梯度噪声大                                               │
│                                                             │
│  大 Batch Size:                                             │
│  ✓ GPU 利用率高                                             │
│  ✓ 梯度估计准确                                             │
│  ✓ 通信效率高 (分布式)                                      │
│  ✗ 可能收敛到尖锐的局部最小值                               │
│  ✗ 需要更多显存                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**收敛性对比：**

```
小 Batch (SGD):
       ↓
    ╲                    找到平滑的极小值
     ╲  ╱╲
      ╲╱  ╲
       ╲   ╲__
        ╲     ╲___
         ╲         ‾‾‾

大 Batch (LBS):
       ↓
    ╲
     ╲  ╲
      ╲  ╲___        找到尖锐的极小值
       ╲      ‾‾‾___
        ╲           ‾‾‾‾
```

**学习率缩放原则：**

```python
# Linear Scaling Rule
# Batch size 增大 k 倍 → 学习率增大 k 倍

if base_batch_size == 32 and base_lr == 0.1:
    new_batch_size = 256  # 8x
    new_lr = 0.1 * 8 = 0.8  # 学习率也增大 8 倍

# 注意事项：
# 1. 需要 warm-up 避免早期震荡
# 2. 不是线性关系，增大到一定程度收益递减
# 3. 不同模型最优缩放比例不同
```

**自适应 Batch Size：**

```python
class AdaptiveBatchScheduler:
    def __init__(self, base_batch=32, max_batch=512):
        self.base_batch = base_batch
        self.max_batch = max_batch
        self.current_batch = base_batch

    def update(self, loss_history, grad_norm_history):
        # 如果梯度爆炸，减小 batch
        if grad_norm_history[-1] > 10:
            self.current_batch = max(32, self.current_batch // 2)

        # 如果 loss 停滞，考虑增大
        elif len(loss_history) > 10:
            recent_trend = loss_history[-5:] - loss_history[-10:-5]
            if abs(sum(recent_trend)) < 0.01:  # 停滞
                self.current_batch = min(self.max_batch,
                                         self.current_batch * 2)

        return self.current_batch
```

**显存估算：**

```python
def estimate_memory(batch_size, model, seq_length=None):
    # 模型参数 (FP32)
    param_size = sum(p.numel() * 4 for p in model.parameters())

    # 梯度 (FP32)
    grad_size = param_size  # 梯度大小 = 参数大小

    # 优化器状态 (如果是 Adam，FP32 + FP16 copies)
    optimizer_size = param_size * 2  # Adam 需要动量估计

    # 激活值 (与 batch size 和 seq_length 相关)
    if seq_length:
        # Transformer: O(batch * seq_len * hidden^2 * layers)
        # 粗略估算
        activation_size = batch_size * seq_length * 1024 * 4  # 假设
    else:
        # CV 模型: O(batch * H * W * C)
        activation_size = batch_size * 512 * 4

    total = param_size + grad_size + optimizer_size + activation_size
    return total / (1024 ** 3)  # GB
```

**分布式训练 Batch Size：**

```python
# 数据并行：全局 Batch = 单卡 Batch × GPU 数
global_batch_size = per_gpu_batch_size * num_gpus

# 梯度累加：如果单卡显存不够
effective_batch = per_gpu_batch * accumulation_steps

# 建议配置：
# A100 80GB:
#   per_gpu_batch = 32
#   accumulation = 4
#   num_gpus = 8
#   global_batch = 32 * 4 * 8 = 1024

# V100 32GB:
#   per_gpu_batch = 8
#   accumulation = 8
#   num_gpus = 8
#   global_batch = 8 * 8 * 8 = 512
```

**不同场景推荐：**

| 场景 | Batch Size | 理由 |
|------|------------|------|
| **BERT 预训练** | 32-64/GPU | 大 batch 收敛更快 |
| **图像分类** | 128-512 | 经典 batch size |
| **目标检测** | 2-16 | 显存限制大 |
| **GPT 训练** | 1-8/GPU | 超大模型，显存紧张 |
| **LLM Fine-tune** | 4-16 | 任务较小 |
| **RL 训练** | 1 | 样本生成慢 |

**Batch Size 搜索策略：**

```
┌─────────────────────────────────────────────────────────────┐
│                    Batch Size 搜索                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 从小开始 (batch=1 或 2)                                  │
│     - 确认代码正确运行                                        │
│     - 测量单样本显存                                          │
│                                                             │
│  2. 倍增搜索                                                 │
│     - 2 → 4 → 8 → 16 → 32 → ...                            │
│     - 找到 OOM 前最大的 batch                                │
│                                                             │
│  3. 细化搜索                                                 │
│     - 在最大值附近细化 (如 28, 30, 32, 34, 36)               │
│                                                             │
│  4. 结合学习率                                               │
│     - 根据 Linear Scaling Rule 调整学习率                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 35. 讲讲你对模型推理服务中限流和降级策略的理解？

## 答案

### 限流与降级策略

**限流 (Rate Limiting) 目标：**

```
┌─────────────────────────────────────────────────────────────┐
│                    限流核心目标                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 保护系统：防止过载导致服务崩溃                            │
│                                                             │
│  2. 保证 SLA：维持稳定的响应延迟                              │
│                                                             │
│  3. 公平分配：防止单个用户占用全部资源                        │
│                                                             │
│  4. 成本控制：避免突发流量导致额外费用                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**限流算法对比：**

| 算法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **固定窗口** | 固定时间窗口内限流 | 简单 | 边界流量突刺 |
| **滑动窗口** | 滑动时间窗口 | 平滑 | 实现复杂 |
| **令牌桶** | 令牌补充速率 | 支持突发 | 需要实现 |
| **漏桶** | 固定速率输出 | 平滑 | 延迟增加 |
| **自适应** | 动态调整 | 自适应 | 需监控 |

**令牌桶实现：**

```python
import asyncio
import time

class TokenBucket:
    def __init__(self, rate: float, capacity: int):
        self.rate = rate  # 每秒补充的令牌数
        self.capacity = capacity  # 桶容量
        self.tokens = capacity
        self.last_update = time.time()

    async def acquire(self, tokens: int = 1):
        while True:
            now = time.time()
            # 补充令牌
            elapsed = now - self.last_update
            self.tokens = min(
                self.capacity,
                self.tokens + elapsed * self.rate
            )
            self.last_update = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True

            # 等待足够令牌
            wait_time = (tokens - self.tokens) / self.rate
            await asyncio.sleep(wait_time)

# 使用
limiter = TokenBucket(rate=100, capacity=200)  # 100 req/s，突发容量 200

@app.route("/predict")
async def predict(request):
    await limiter.acquire()  # 获取令牌
    return await model_predict(request)
```

**分布式限流：**

```python
import redis

class DistributedTokenBucket:
    def __init__(self, rate: float, capacity: int, redis_client: redis.Redis):
        self.rate = rate
        self.capacity = capacity
        self.redis = redis_client
        self.key = "rate_limit:token_bucket"

    async def acquire(self, user_id: str, tokens: int = 1) -> bool:
        key = f"{self.key}:{user_id}"

        # Lua 脚本保证原子性
        lua_script = """
        local key = KEYS[1]
        local rate = tonumber(ARGV[1])
        local capacity = tonumber(ARGV[2])
        local tokens = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])

        local data = redis.call('hgetall', key)
        local last_tokens = tonumber(data[2]) or capacity
        local last_update = tonumber(data[4]) or now

        -- 补充令牌
        local elapsed = now - last_update
        local current_tokens = math.min(capacity, last_tokens + elapsed * rate)

        if current_tokens >= tokens then
            redis.call('hmset', key, 'tokens', current_tokens - tokens, 'updated', now)
            redis.call('expire', key, 3600)
            return 1
        else
            redis.call('hmset', key, 'tokens', current_tokens, 'updated', now)
            return 0
        end
        """

        result = self.redis.eval(
            lua_script, 1, key, self.rate, self.capacity, tokens, time.time()
        )
        return bool(result)
```

**降级策略 (Degradation)：**

```
降级层次：
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Level 0: 完全降级                                          │
│  ├── 返回缓存结果 / 默认回答                                 │
│  └── 记录请求，后续处理                                     │
│                                                             │
│  Level 1: 功能降级                                          │
│  ├── 关闭非核心功能 (如日志、监控)                           │
│  ├── 切换到轻量模型                                         │
│  └── 减少处理精度                                           │
│                                                             │
│  Level 2: 性能降级                                          │
│  ├── 增大 batch timeout                                    │
│  ├── 减少 max tokens (LLM)                                  │
│  └── 使用更短的序列                                          │
│                                                             │
│  Level 3: 队列降级                                          │
│  ├── 延长排队等待时间                                       │
│  ├── 限制最大队列长度                                        │
│  └── 拒绝新请求 (429)                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**自动降级实现：**

```python
class AdaptiveDegradation:
    def __init__(self, model):
        self.model = model
        self.consecutive_errors = 0
        self.latency_history = []
        self.max_errors = 5
        self.degradation_level = 0

    async def process(self, request):
        # 检查是否需要降级
        if self.should_degrade():
            return await self.degraded_process(request)

        try:
            result = await self.model.predict(request)
            self.on_success()
            return result
        except TimeoutError:
            self.on_timeout()
            return await self.degraded_process(request)
        except MemoryError:
            self.on_oom()
            return await self.degraded_process(request)

    def should_degrade(self) -> bool:
        # 检查错误率
        if self.consecutive_errors >= self.max_errors:
            return True

        # 检查延迟
        if len(self.latency_history) > 10:
            avg_latency = sum(self.latency_history[-10:]) / 10
            if avg_latency > 1000:  # > 1s
                return True

        return False

    async def degraded_process(self, request):
        self.degradation_level += 1

        if self.degradation_level == 1:
            # Level 1: 切换到小模型
            return await self.small_model.predict(request)
        elif self.degradation_level == 2:
            # Level 2: 降低精度
            return await self.model.predict(request, precision="int8")
        else:
            # Level 3: 返回缓存或拒绝
            return self.fallback_response(request)
```

**优先级调度：**

```python
import heapq

class PriorityRequestQueue:
    def __init__(self, max_size=1000):
        self.queue = []  # [(priority, timestamp, request)]
        self.max_size = max_size

    def enqueue(self, request, priority=5):
        """
        优先级: 1-10, 1 最高
        """
        heapq.heappush(
            self.queue,
            (priority, time.time(), request)
        )

        # 超限，丢弃最低优先级
        if len(self.queue) > self.max_size:
            heapq.heappop(self.queue)

    def dequeue(self):
        if self.queue:
            return heapq.heappop(self.queue)[2]
        return None

    def get_wait_time(self, priority):
        # 估算等待时间
        ahead = sum(1 for p, _, _ in self.queue if p < priority)
        return ahead * self.avg_processing_time
```

**监控指标：**

```
限流降级监控：

1. 限流触发次数
   - 按用户、按接口
   - 趋势变化

2. 降级次数
   - 降级级别分布
   - 影响请求数

3. 请求队列
   - 队列长度
   - 等待时间 P99

4. 系统健康
   - GPU 利用率
   - 显存使用
   - 错误率

告警规则：
- 限流触发 > 100/min → P2 告警
- 降级 Level 2+ → P1 告警
- 队列等待 > 30s → P1 告警
```
