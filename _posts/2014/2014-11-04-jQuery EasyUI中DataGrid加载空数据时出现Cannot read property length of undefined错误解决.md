---
layout: post
title: jQuery EasyUI中DataGrid加载空数据时出现Cannot read property length of undefined错误解决
date: 2014-11-04 06:09:25
category: Web开发
permalink: /143.html
tags:
- EasyUI
---

<!--markdown-->使用EasyUI的DataGrid加载数据时，如果遇到返回NULL，则会报错误：

> Cannot read property 'length' of undefined

网上查了解决方案（[文章一][1]和[文章二][2]），虽然写的很详细，但是还是有点不知所以，后在百度知道里找到了相应的答案，原来EasyUI的DataGrid对加载数据NULL时处理似乎有问题，因此必须要按照相应的格式进行加载，在服务端把返回NULL的语句做相应修改，令其返回符合DataGrid格式的空值即可。

将返回的JSON结果由返回

    NULL
    

修改设定返回值为：

    {total:1,rows:''}
    

问题解决。

 [1]: http://blog.csdn.net/sat472291519/article/details/18038889
 [2]: http://blog.csdn.net/zhyl8157121/article/details/19634037