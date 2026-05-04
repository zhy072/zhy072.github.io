---
title: MultiHead Attention
excerpt: Implement of MHA
publishedAt: 2026-04-23
star: true
tags: [MHA, Attention]
---

```python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
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

    def forward(self, x, mask=None):
        # x:(B,T,C)
        B, T, C = x.shape

        # 1) Projection
        q = self.q_proj(x)
        k = self.k_proj(x)
        v = self.v_proj(x)

        # 2) spilt heads
        # (B, T, C) => (B, T, H, d_h) => (B, H, T, d_h)
        q = q.view(B, T, self.num_heads, self.head_dim).transpose(1,2)
        k = k.view(B, T, self.num_heads, self.head_dim).transpose(1,2)
        v = v.view(B, T, self.num_heads, self.head_dim).transpose(1,2)

        # 3) compute attention scores
        # (B, H, T, d_h) @ (B, H, d_h, T) => (B, H, T, T)
        attn_scores = torch.matmul(q, k.transpose(-2,-1)) / math.sqrt(self.head_dim)

        # 4) mask?
        if mask is not None:
            attn_scores = attn_scores.masked_fill(mask==0, float("-inf"))
        
        # 5) softmax
        attn_weights = torch.softmax(attn_scores)

        # 6) weighted sum
        # (B, H, T, T) @ (B, H, T, d_h) => (B, H, T, d_h)
        o = torch.matmul(attn_weights, v)

        # 7) merge heads
        #(B, H, T, d_h) => (B, T, H, d_h) => (B, T, C)
        o = o.transpose(1, 2).contiguous().view(B, T, C)

        # 8) o projection
        out = self.o_proj(o)

        return out
```