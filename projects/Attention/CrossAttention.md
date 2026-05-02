---
title: CrossAttention
excerpt: Implement of CrossAttention
publishedAt: 2026-04-23
star: true
tags: [CA, Attention]
---

```python
import torch
import torch.nn as nn

import math

class CrossAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        assert embed_dim % num_heads == 0

        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads

        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)

        self.o_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, q_input, kv_input, mask = None):
        Bq, Tq, Cq = q_input.shape
        Bkv, Tkv, Ckv = kv_input.shape
        assert Bq == Bkv and Cq == Ckv
        B, C = Bq, Cq

        # 1) project
        q = self.q_proj(q_input)    #(B, Tq, C)
        k = self.k_proj(kv_input)   #(B, Tkv, C)
        v = self.v_proj(kv_input)   #(B, Tkv, C)

        # 2) split heads
        q = q.view(B, Tq, self.num_heads, self.head_dim).transpose(1, 2) #(B, H, Tq, Dh)
        k = k.view(B, Tkv, self.num_heads, self.head_dim).transpose(1, 2) #(B, H, Tkv, Dh)
        v = v.view(B, Tkv, self.num_heads, self.head_dim).transpose(1, 2) #(B, H, Tkv, Dh)

        # 3) scores
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.head_dim) #(B, H, Tq, Tkv)

        if mask is not None:
            mask_scores = scores.masked_fill(mask==0, float("-inf"))
        
        # 4) softmax
        attn_scores =  torch.softmax(mask_scores, dim=-1)

        # 5) weight sum
        out = torch.matmul(attn_scores, v) #(B, H, Tq, Dh)

        # 6) merge heads
        out = out.transpose(1, 2).contiguous().view(B, Tq, C) #(B, Tq, C)

        # 7) output 
        o = self.o_proj(out)

        return o

```