---
title: "FHQ- Treap学习笔记"
date: 2021-11-09 10:18:19
categories:
  - OI
tags:
  - OI
luogu_lid: "8ii83oaz"
source_url: "https://www.luogu.com/article/8ii83oaz"
---
FHQ-Treap 与Treap都保证在第一关键字有序的情况下，维护第二关键字以达到平衡的目的。

但是Treap用的是旋转，FHQ-Treap 用的是分裂和合并。

- **FHQ-Treap 与Treap不同的地方：**

  1. 优美的分裂和合并。
  2. 非旋。
  3. 支持区间修改

- **FHQ-Treap 与Treap相同的地方：**

  1. 都保证在第一关键字有序的情况下，维护第二关键字。
  2. 本质上都是BST(二叉搜索树)。

- **注意点**

  1. 合并时要保证第一棵树的权值小于第二棵树的权值(因为合并操作只比较随机值)(**仅指作为平衡树时的操作**)。
  2. 排名分裂维护的是书的中序遍历。([例题](https://www.luogu.com.cn/problem/P2596))

- **Code of [P3369 【模板】普通平衡树](https://www.luogu.com.cn/problem/P3369)**


~~~c++
#include<bits/stdc++.h>
#define N 200005
using namespace std;

inline int read(){
	int x=0,w=1;
	char ch=getchar();
	while(ch>'9'||ch<'0'){if(ch=='-')w=-1;ch=getchar();}
	while(ch>='0'&&ch<='9')x=(x<<1)+(x<<3)+(ch^48),ch=getchar();
	return x*w;
}

int t,n,m,cnt,root;
bool flag[N];
struct node{int l,r,val,key,siz;}tree[N];

void push_up(int p){
	tree[p].siz=tree[tree[p].l].siz+1+tree[tree[p].r].siz;
}
int build_new(int x){
	tree[++cnt].siz=1;
	tree[cnt].val=x;
	tree[cnt].key=rand();
	return cnt;
}
int merge(int x,int y){
	if(!x||!y) return x+y;
	if(tree[x].key<tree[y].key){
		 tree[x].r=merge(tree[x].r,y);
		 push_up(x);
		 return x;
	}
	else{
		tree[y].l=merge(x,tree[y].l);
		push_up(y);
		return y;
	}
}
void split(int p,int k,int &x,int &y){
	if(!p) {
		x=y=0;
		return;
	}
	if(tree[p].val<=k) x=p,split(tree[p].r,k,tree[p].r,y);
	else y=p,split(tree[p].l,k,x,tree[p].l);
	push_up(p);
}
int kth(int p,int k){
	if(k<=tree[tree[p].l].siz) return kth(tree[p].l,k);
	else if(k==tree[tree[p].l].siz+1) return p;
	else return kth(tree[p].r,k-tree[tree[p].l].siz-1); 
}
signed main(){
	srand((unsigned)time(NULL));
	t=read();
	while(t--){
		int opt=read(),x=read();
		if(opt==1) {
			int a,b;
			split(root,x,a,b);
			root=merge(a,merge(build_new(x),b));
		}
		else if(opt==2) {
			int a,b,c;
			split(root,x,a,b);
			split(a,x-1,a,c);
			c=merge(tree[c].l,tree[c].r);
			root=merge(merge(a,c),b);
		}
		else if(opt==3){
			int a,b;
			split(root,x-1,a,b);
			printf("%d\n",tree[a].siz+1);
			root=merge(a,b);
		}
		else if(opt==4) printf("%d\n",tree[kth(root,x)].val);
		else if(opt==5){
			int a,b;
			split(root,x-1,a,b);
			printf("%d\n",tree[kth(a,tree[a].siz)].val);
			root=merge(a,b);
		}
		else{
			int a,b;
			split(root,x,a,b);
			printf("%d\n",tree[kth(b,1)].val);
			root=merge(a,b);
		}
	}
	return 0;
}
~~~

- **关于可持久化**

​	fhq_Treap 的可持久化和主席树类似，$\log{N}$ 级别的。

​	在进行split 新建节点即可，merge不用新建节点（大概）。

- **Code of [P3835 【模板】可持久化平衡树](https://www.luogu.com.cn/problem/P3835) **

~~~c++
#include<bits/stdc++.h>
#define N 500005
using namespace std;

inline int read(){
	int x=0,w=1;
	char ch=getchar();
	while(ch>'9'||ch<'0'){if(ch=='-')w=-1;ch=getchar();}
	while(ch>='0'&&ch<='9')x=(x<<1)+(x<<3)+(ch^48),ch=getchar();
	return x*w;
}

const int inf=2147483647;
int t,n,m,cnt;
int root[N];
struct node{int l,r,val,key,siz;}tree[N*50];

void push_up(int p){
	tree[p].siz=tree[tree[p].l].siz+1+tree[tree[p].r].siz;
}
int build_new(int x){
	tree[++cnt].siz=1;
	tree[cnt].val=x;
	tree[cnt].key=rand();
	return cnt;
}
int merge(int x,int y){
	if(!x||!y) return x+y;
	if(tree[x].key<tree[y].key){
		int p=++cnt;
		tree[p]=tree[x];
		tree[p].r=merge(tree[p].r,y);
		push_up(p);
		return p;
	}
	else{
		int p=++cnt;
		tree[p]=tree[y];
		tree[p].l=merge(x,tree[p].l);
		push_up(p);
		return p;
	}
}
void split(int p,int k,int &x,int &y){
	if(!p) {
		x=y=0;
		return;
	}
	if(tree[p].val<=k){
		x=++cnt;tree[x]=tree[p];	
		split(tree[x].r,k,tree[x].r,y);
		push_up(x);
	}
	else{
		y=++cnt;tree[y]=tree[p];
		split(tree[y].l,k,x,tree[y].l);
		push_up(y);
	}
}
int kth(int p,int k){
	if(k<=tree[tree[p].l].siz) return kth(tree[p].l,k);
	else if(k==tree[tree[p].l].siz+1) return p;
	else return kth(tree[p].r,k-tree[tree[p].l].siz-1); 
}
signed main(){
	srand((unsigned)time(NULL));
	t=read();
	for(int i=1;i<=t;++i){
		int used=read(),opt=read(),x=read();
		root[i]=root[used];
		if(opt==1) {
			int a,b;
			split(root[i],x,a,b);
			root[i]=merge(a,merge(build_new(x),b));
		}
		else if(opt==2) {
			int a,b,c;
			split(root[i],x,a,b);
			split(a,x-1,a,c);
			c=merge(tree[c].l,tree[c].r);
			root[i]=merge(merge(a,c),b);
		}
		else if(opt==3){
			int a,b;
			split(root[i],x-1,a,b);
			printf("%d\n",tree[a].siz+1);
			root[i]=merge(a,b);
		}
		else if(opt==4) printf("%d\n",tree[kth(root[i],x)].val);
		else if(opt==5){
			int a,b;
			split(root[i],x-1,a,b);
			if(!a) printf("%d\n",-inf);
			else {
				printf("%d\n",tree[kth(a,tree[a].siz)].val);
				root[i]=merge(a,b);
			}
		}
		else{
			int a,b;
			split(root[i],x,a,b);
			if(!b) printf("%d\n",inf);
			else {
				printf("%d\n",tree[kth(b,1)].val);
				root[i]=merge(a,b);
			}
		}
	}
	return 0;
}
~~~
其实就稍微改了一点东西。

- 最后

### FHQ-Treap 真是太阳间了！！！

### FHQ YYDS

---
 
过了半年稍微有了点新的认识。

和大多数平衡数一样，是已每棵树都是一整个数列来维护的。

可以是权值的二叉搜索树，也可以是数列中排名的二叉搜索树。

这是一种极其灵活的数据结构，深刻了解才能熟练运用。

**一些妙妙题**

https://www.luogu.com.cn/problem/P3960
