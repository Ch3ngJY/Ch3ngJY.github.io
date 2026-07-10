---
title: "CF746F Music in Car 题解"
date: 2022-07-10 14:32:58
categories:
  - OI
tags:
  - OI
luogu_lid: "0xu4f5lg"
source_url: "https://www.luogu.com/article/0xu4f5lg"
---
无内鬼，来点主席树做法。

~~其实是因为不会 stl。~~

### Solution

看这个连续区间加上，区间长度不限制，还有 $t$ 的单调性，考虑双指针。 

那么复杂度瓶颈就在如何快速计算区间中前 $w$ 大的数的时间的一半。

区间前 $k$ 大，考虑主席树。

其实就是经典区间第 $k$ 大的变种，实现起来并不是特别困难。

时间复杂度 $O(n\log n)$ 。

### Code

```cpp
//#pragma GCC optimize(3)
#include<bits/stdc++.h>
#define N 500005
using namespace std;

int read(){
    int x=0,w=1;
    char ch=getchar();
    while(ch>'9'||ch<'0') {if(ch=='-')w=-1;ch=getchar();}
    while(ch>='0'&&ch<='9')x=(x<<1)+(x<<3)+(ch^48),ch=getchar();
    return x*w;
}

int n,w,k,tot,ans;
int root[N],t[N],sum[N],sum1[N],a[N];
struct node{int l,r,sum,val;}tree[N<<5];

void update(int &p,int l,int r,int x){
	tot++;
	tree[tot]=tree[p];tree[tot].sum++;tree[tot].val+=x/2;
	p=tot;
	int mid=(l+r)>>1;
	if(l<r){
		if(x<=mid) update(tree[p].l,l,mid,x);
		else update(tree[p].r,mid+1,r,x);
	}
}
int query(int t1,int t2,int l,int r,int k){
	if(l>=r) return l/2*(tree[t1].sum-tree[t2].sum-k+1);
	int x=tree[tree[t1].l].sum-tree[tree[t2].l].sum;
	int y=tree[t1].val-tree[t2].val-(tree[tree[t1].l].val-tree[tree[t2].l].val);
	int mid=(l+r)>>1;
	if(x>=k) return query(tree[t1].l,tree[t2].l,l,mid,k)+y;
	else return query(tree[t1].r,tree[t2].r,mid+1,r,k-x);
}

signed main(){
	n=read();w=read();k=read();
	for(int i=1;i<=n;++i) a[i]=read();
	for(int i=1;i<=n;++i) sum[i]=sum[i-1]+a[i];
	for(int i=1;i<=n;++i){
		t[i]=read();
		root[i]=root[i-1];
		update(root[i],1,10000,t[i]);
	}
	for(int i=1;i<=n;++i) sum1[i]=sum1[i-1]+t[i];
	int r=0;
	for(int l=1;l<=n;++l){
		while(r<n&&sum1[r+1]-sum1[l-1]-query(root[r+1],root[l-1],1,10000,r+3-l-min(w,r+2-l))<=k) r++;
		ans=max(ans,sum[r]-sum[l-1]);
	}
	printf("%d\n",ans);
	return 0;
}
```

因为一一些细节调了很久，可读性并不是很好，感性理解一下。
