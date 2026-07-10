---
title: "CF407C Curious Array 题解"
date: 2022-07-18 17:00:13
categories:
  - OI
tags:
  - OI
luogu_lid: "2j4v4dz9"
source_url: "https://www.luogu.com/article/2j4v4dz9"
---
### 前言

优秀的高阶差分/前缀和练习题。

### Solution

**思路**

题意很清晰，不加以赘述。

注意到区间修改，但是我们发现修改的不同，因此设法将其转化为相同的值。

经过打表或手膜等一系列方式，我们发现修改值之间存在一些美妙的关系。

考虑差分。

- $k=1$ 时

一次差分后的差分序列的值均为 1 ，可以配合数据结构修改。

但更好的方法是二次差分，转化为形如 ${1,0,0,0… ,-1}$ 单点修改的形式。

- $k=2$ 时

经过一次差分我们发现其转化为了上述 $k=1$ 的形式。

直接三次差分。

- $k = x$ 时

我们从 $k$ 较小的情况推广，容易发现我们修改的应该是 $k+1$ 阶差分数组。

这也不难通过组合意义证明，另一篇题解已经讲得很清楚了。

**具体实现**

我们发现在具体实现中，难以直接对 $k$ 阶差分数组进行修改。

因为每次差分一次后，修改的序列都会增长。

具体例子如下：

```cpp
修改序列 1  2  3  4  5  0  0  0
一阶差分 1  1  1  1  1  -5 0  0
二阶差分 1  0  0  0  0  -6 5  0
```

我们不难发现，每次为了消除上一阶差分的影响，都需要多伸长一位。

对此，我们可以对于每一阶差分直接消除其影响。

再次以上面的为例：

```cpp
修改序列 1  2  3  4  5  0  0  0
一阶差分 0  0  0  0  0  -5 0  0
二阶差分 1  0  0  0  0  -1 0  0
```

每一阶在 $r+1$ 位置都删去这一阶的前缀，也就是上一阶的最后一个数，即为 $\dbinom{r-l+k-j+1}{r-l}$ 。

这样最终只需要从下向上做前缀和即可。

### [Code](https://codeforces.com/contest/407/submission/164698886)

```cpp
//#pragma GCC optimize(3)
#include<bits/stdc++.h>
#define N 200005
#define int long long
using namespace std;

int read(){
    int x=0,w=1;
    char ch=getchar();
    while(ch>'9'||ch<'0') {if(ch=='-')w=-1;ch=getchar();}
    while(ch>='0'&&ch<='9')x=(x<<1)+(x<<3)+(ch^48),ch=getchar();
    return x*w;
}

int mod = 1e9+7;
int n,m;
int fac[N],inv[N];
int a[N],d[100005][105];

int qpow(int x,int k){
	int res=1;
	while(k){
		if(k&1) res=res*x%mod;
		x=x*x%mod;k>>=1;
	}
	return res;
}
void init(){
	fac[0]=inv[0]=1; int maxn = 200000;
	for(int i=1;i<=maxn;++i) fac[i]=fac[i-1]*i%mod;
	inv[maxn]=qpow(fac[maxn],mod-2); 
	for(int i=maxn-1;i>=1;--i) inv[i]=inv[i+1]*(i+1)%mod;
}
int C(int x,int y){return fac[x]*inv[y]%mod*inv[x-y]%mod;}

signed main(){	
	init(); //cout<<C(4,2);
	n=read();m=read();
	for(int i=1;i<=n;++i) a[i]=read();
	for(int i=1;i<=m;++i){
		int l=read(),r=read(),k=read();
		d[l][k+1]=(d[l][k+1]+1)%mod;
		for(int j=1;j<=k+1;++j) d[r+1][j]=(d[r+1][j]-C(r-l+k-j+1,r-l)+mod)%mod;
	}
	for(int i=101;i>=1;--i){
		int res=0;
		for(int j=1;j<=n;++j) {
			res=(res+d[j][i])%mod;
			d[j][i-1]=(d[j][i-1]+res)%mod;
		}
	}
	for(int i=1;i<=n;++i) printf("%lld ",(a[i]+d[i][0])%mod);
	return 0;
}
```
