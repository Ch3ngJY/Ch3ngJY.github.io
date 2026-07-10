---
title: "CF 板刷记录"
date: 2022-11-19 07:57:12
categories:
  - OI
tags:
  - OI
luogu_lid: "tmqheyfo"
source_url: "https://www.luogu.com/article/tmqheyfo"
---
### CF1748E (*2300)

经过观察可以发现符合要求的 b 序列的充要条件是和 a 的笛卡尔树相同。

这个笛卡尔树比较特别，单看权值时是一个大根堆不是小根堆，把权值取反即可，差不多的。

想到笛卡尔树就好办了，建出笛卡尔树然后在上面 dp 即可。

[Code](https://codeforces.com/contest/1748/submission/181170096)

### CF 1737D (*2200)

先说结论：最短路一定是将某一条边变为连接 1 和 n ，然后直接走这条边。容易反证得出。

那么我们现在的问题就是求出对于每一条边，同时经过两个端点和这条边的最短路径，求出来之后乘以边权再取最小值即可。

做法很多，但是既然 n 这么小就还是 Floyed 好了。

总时间复杂度 $O(n^3+nm)$。

[Code](https://codeforces.com/contest/1737/submission/181391513)

### CF 1726E (*2400)

很厉害的数数题。

首先有一个性质：将 $i$ 与 $p_i$ 连边，则只会出现一元环，二元环和四元环，且四元环形如 $(i,i+1,j,j+1)$。

然后开始统计，一元环和二元环的情况是平凡的，容易递推得到：$f_i=f_{i-1}+(i-1)f_{i-2}$。

考虑四元环，此时我们已经求出了 $f$，不妨枚举四元环的个数，设为 $i$。

首先从 $n$ 个数中选出 $2i$ 个相邻数对乘以 $\tbinom{n-2i}{2i}$，其中有一半是翻转的，乘以 $\tbinom{2i}{i}$，最后两两任意组合为 $i!$。

最终递推式为：
$$
\sum\limits_{i=0}^{n/4}\dbinom{n-2i}{2i}\dbinom{2i}{i}i!f_{n-4i}
$$
时间复杂度 $O(n)$。

[Code](https://codeforces.com/contest/1726/submission/181408597)

### CF 1725L (*2400)

这波，这波是复刻经典。

考过 NOIP 2021 的同学都不难发现这个操作是交换相邻两个前缀和，不能交换最后两个。

那么如果有前缀和小于 $0$ 或者前 $n-1$ 个数中有的数前缀和比第 $n$ 个大则无解。

反之求一下逆序对即可。

[Code](https://codeforces.com/contest/1725/submission/182186945)
