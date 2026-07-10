---
title: "P7541 DOBRA の题解"
date: 2021-05-05 19:59:55
categories:
  - OI
tags:
  - OI
luogu_lid: "qctpoge9"
source_url: "https://www.luogu.com/article/qctpoge9"
---
- 题意：给定一个只包含下划线和大写字母的字符串，将下划线全部换成大写字母，问有多少种填法能使这个字符串不包含 3 个及以上连续的元音字母、3 个及以上连续的辅音字母，并且至少包含一个大写字母 L。
- 这道题可以用深搜做的，从左到右进行遍历，遇到一个下划线搜一次并进行讨论，由于最多只有十个下划线，因此并不会TLE。
- 附代码：
```c
#include<bits/stdc++.h>
using namespace std;
long long dfs(int n);
string s;
int a[105],lens,l,x; 
int main(){
	cin>>s;
	lens=s.size();//字符串长度 
	for(int i=0;i<lens;i++){
		if(s[i]=='L') l=1;
		if(s[i]=='A' or s[i]=='E' or s[i]=='I' or s[i]=='O' or s[i]=='U') a[i+2]=1;//前移两格防止RE; 
		else  if(s[i]!='_') a[i+2]=2;
		else{
			a[i+2]=3;
			x=i+2;//标记最后一个下划线的位置 
		}
	}
	cout<<dfs(2)<<endl;//搜！ 
	return 0;
} 
long long dfs(int n){
	if(n==lens+2)
		return 1;
	if(a[n]==1 or a[n]==2)
		return dfs(n+1);
	if((a[n-1]==1 and a[n-2]==1 and a[n+1]==2 and a[n+2]==2) or (a[n-1]==2 and a[n-2]==2 and a[n+1]==1 and a[n+2]==1))//这种情况下无法填入 
		return 0;
	long long w=0;
	else if((a[n-1]==1 and a[n-2]==1) or (a[n-1]==1 and a[n+1]==1) or (a[n+1]==1 and a[n+2]==1)){//只能填辅音字母 
		a[n]=2;
		if(n==x and l==0){//对有无L进行讨论 
			l=1;
			w+=dfs(n+1); 
			l=0;
		}
		else if(l==0){
			l=1;
			w+=dfs(n+1);
			l=0;
			w+=dfs(n+1)*20;
		} 
		else if(l==1){
			w+=dfs(n+1)*21;
		}
		a[n]=3;
	}
	else if((a[n-1]==2 and a[n-2]==2) or (a[n-1]==2 and a[n+1]==2) or (a[n+1]==2 and a[n+2]==2)){//只能填元音字母 
		a[n]=1;
		w+=dfs(n+1)*5;
		a[n]=3;
		if(n==x and l==0)//若搜到最后一个时必须填入L但是又只能填入元音字母，这种情况也不可能。 
			return 0;
	} 
	else{//二者都可以填 
		a[n]=2;
		if(n==x and l==0){
			l=1;
			w+=dfs(n+1); 
			l=0;
			a[n]=3;
			return w;
		}
		else if(l==0){
			l=1;
			w+=dfs(n+1);
			l=0;
			w+=dfs(n+1)*20;
		} 
		else{
			w+=dfs(n+1)*21;
		}
		a[n]=1;
		w+=dfs(n+1)*5;
		a[n]=3;
	}
	return w;
}
```
- 我的代码应该比较好理解，复杂度应该也比较优。

- 几个注意点：
1. 对下划线的讨论要细一些。(~~我就因为没讨论完全A了好几次~~)
1. 对L也要进行讨论！(~~这应该是这道题最恶心的一个点了~~)
1. 别忘了开long long!

------------

欢迎各位巨佬指正蒟蒻的错误或者麻烦之处。
