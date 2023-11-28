---
layout: post
title: PHP连接SQL Server数据库编码问题
date: 2016-07-05 03:33:00
category: 服务器运维
permalink: /560.html
tags:
- SQLServer
- charset
---

<!--markdown-->公司ERP系统采用的是SQL Server服务器，默认编码是GBK，导致在Web开发时，连接数据库时需要进行编码转换，否则会出现乱码，并且这种乱码用iconv函数各种转换后，依旧显示乱码。这里记录下我的解决过程，以备后用。

生产环境由于历史遗留的系统PHP版本需求较低，因此采用了AMH这个LNMP环境，这里以该环境为基础来操作，其他环境可能有一些不同。

## 查看当前数据库编码

首先查看当前需要连接的各种库的编码，首先是mysql：

    show variables like 'character\_set\_%';
    show variables like 'collation_%';

接着是sql server：

    SELECT  COLLATIONPROPERTY('Chinese_PRC_Stroke_CI_AI_KS_WS', 'CodePage') 

查询结果说明

> 936 简体中文GBK
> 950 繁体中文BIG5
> 437 美国/加拿大英语
> 932 日文
> 949 韩文
> 866 俄文
> 65001 unicode UFT-8

这样可以确定各库的编码，以判断是否进行下一步操作。

## 检查当前PHP连接配置

检查phpinfo中mssql扩展中是否配置了正确的编码

找到mssql.charset，如果后面的值是no value，表示并没有配置对应的编码参数，这时候需要进行下一步操作。

## 设置freetds编码

如果需要连接的SQL Server库是GBK，则需要调整PHP环境中mssql扩展连接参数中的编码，首先调整freetds.conf配置文件，编辑/usr/local/freetds/etc/freetds.conf，加入

    client charset = GBK

因为编译mssql.so扩展时需要用到该处配置，所以更改后需要重新对mssql扩展进行编译，编译就不多说了，具体可以[参考这里][1]

## 设置php中mssql编码

如果上述编译已经完成，接着编辑/etc/php.ini，修改`mssql.charset`的值

    mssql.charset = "GBK"

修改后保存，重启php服务，这时查看phpinfo信息，看到mssql.charset的值已经更改为GBK，表示已经成功设置。接下来在开发中使用iconv函数进行正常转码即可。

![请输入图片描述][2]


  [1]: http://hi.ktsee.com/249.html
  [2]: https://static.ktsee.com/s1/2016/07/20160705133738623.png