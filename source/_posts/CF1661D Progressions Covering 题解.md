---
title: "CF1661D Progressions Covering 题解"
date: 2022-04-11 19:42:40
categories:
  - OI
tags:
  - OI
luogu_lid: "7denlqkn"
source_url: "https://www.luogu.com/article/7denlqkn"
---
[link](https://www.luogu.com.cn/problem/CF1661D)

### 简化题意

给定一个长度为 $n$ 的数组 $A$ ，和一种操作。

- 每次操作选定长度为 $k$ 的区间 $[L,R]$ , 将 $A_L-1$，$A_{L+1}-2$ …… $A_R-k$ 。

求使 $A$ 中所有元素小于等于0所需的最小操作个数。

### Sulution

一个显然的贪心思路：

- 从后往前枚举，对于每个大于等于1的 $A_i$，将区间 $[i-k+1,k]$ 操作 $\left\lfloor\dfrac{A_i}{k}\right\rfloor$ 次。  

证明略。

暴力实现是 $O(n^2)$ 的，我们考虑维护这个操作。

因为需要区间修改，单点查询，考虑线段树，但是每次修改的值不一定，考虑转化。

发现每次修改对于区间的差分数组改变一致，于是将原数组转化为差分数组。

那么我们就需要区间修改，区间查询，可以线段树实现。

### Code

```cpp
#include<bits/stdc++.h>
#define N 300005
#define int long long
#define ls(p) p<<1
#define rs(p) p<<1|1
using namespace std;

inline int read(){
    int x=0,w=1;
    char ch=getchar();
    while(ch>'9'||ch<'0'){if(ch=='-')w=-1;ch=getchar();}
    while(ch>='0'&&ch<='9')x=(x<<1)+(x<<3)+(ch^48),ch=getchar();
    return x*w;
}

int n,k,ans;
int a[N];
struct node{int sum,tag,len;}tree[N<<2];

void push_up(int p) {tree[p].sum=tree[ls(p)].sum+tree[rs(p)].sum;}
void push_down(int p){
    if(!tree[p].tag) return ;
    tree[ls(p)].tag+=tree[p].tag;tree[ls(p)].sum+=tree[ls(p)].len*tree[p].tag;
    tree[rs(p)].tag+=tree[p].tag;tree[rs(p)].sum+=tree[rs(p)].len*tree[p].tag;
    tree[p].tag=0;
}
void build(int p,int l,int r){
    tree[p].len=r-l+1;
    if(l==r){tree[p].sum=a[l];return ;}
    int mid=(l+r)>>1;
    build(ls(p),l,mid);build(rs(p),mid+1,r);
    push_up(p);
}
void update(int p,int l,int r,int L,int R,int k){
    if(L<=l&&r<=R){
        tree[p].tag+=k; tree[p].sum+=tree[p].len*k;
        return ;
    }
    push_down(p);
    int mid=(l+r)>>1;
    if(mid>=L) update(ls(p),l,mid,L,R,k);
    if(mid<R) update(rs(p),mid+1,r,L,R,k);
    push_up(p);
}
int query(int p,int l,int r,int L,int R){
    if(L<=l&&r<=R) return tree[p].sum;
    push_down(p);
    int mid=(l+r)>>1,res=0;
    if(mid>=L) res+=query(ls(p),l,mid,L,R);
    if(mid<R) res+=query(rs(p),mid+1,r,L,R);
    return res;
}

signed main(){
    n=read();k=read();
    for(int i=1;i<=n;++i) a[i]=read();
    for(int i=n;i>=1;--i) a[i]=a[i]-a[i-1];
    build(1,1,n);

    for(int i=n;i>k;--i){
        int w=query(1,1,n,1,i);
        if(w<=0) continue;
        update(1,1,n,i-k+1,i,-ceil(w*1.0/k));
        ans+=ceil(w*1.0/k);
    }
    int t=0;
    for(int i=1;i<=k;++i) {
        int w=query(1,1,n,1,i);
        t=max(t,(int)(ceil(w*1.0/i)));
    }

    printf("%lld\n",ans+t);
    return 0;
}
```
