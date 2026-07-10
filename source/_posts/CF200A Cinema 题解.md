---
title: "CF200A Cinema 题解"
date: 2022-08-18 07:43:11
categories:
  - OI
tags:
  - OI
luogu_lid: "j1jjwxsu"
source_url: "https://www.luogu.com/article/j1jjwxsu"
---
根据题意，若要填的位置已经被占了，那么就按照半径递增的曼哈顿距离圆填入。

我们发现，一个点周围最密集的情况下也只可能有 $k$ 个点，也就是说这个正方形的边长不会超过 $\sqrt k$ 。

所以我们需要找的只有对角线为 $\sqrt{2k}$ 的正方形，用并查集分别维护每一行的联通块的左右边界就可以在 $O(\sqrt{k})$ 的时间复杂度内实现单次查询。 

但是当 $m$ 很小的时候，左右边界被填满了，那么就会导致这时候不是一个正方形，需要遍历的行数增多。

但是这时候我们发现中间的一部分已经填满，不需要再填，那么我们也用并查集维护一下，这样可以保证查询的区间一定是一个正方形。

总时间复杂度 $O(k\sqrt{k})$ 。

[aclink](https://codeforces.com/contest/200/submission/168743887)
