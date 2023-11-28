---
layout: post
title: SQL Server连接Mysql服务器配置
date: 2015-03-31 02:54:00
category: Web开发
permalink: /302.html
tags:
- MySQL
- SQLServer
---

<!--markdown-->由于公司报表需求，需要结合SQL Server数据与网站微信的MySQL数据联合查询，因此需要使用SQL Server连接MySQL服务器，这里需要做一下相应的配置才能完成。

### 安装MySQL Connector/ODBC驱动

首先需要在SQL Server服务器上安装MySQL Connector/ODBC驱动。

下载：[MySQL Connector/ODBC驱动][1]

完成后在服务器运行安装，我在安装过程中遇到了错误提示error 1918

> MySQL ODBC Driver Fails with Error 1918.Error installing ODBC driver MySQL ODBC 5.3 ANSI Driver.

这是因为安装依赖的VC++2010运行库没有安装

下载：[VC++2010运行库（32位）][2]或者[VC++2010运行库（64位）][3]

安装运行库后再次安装MySQL Connector/ODBC驱动，这次成功。

### 开启MySQL Server远程访问

MySQL Server是另一台远程服务器，因此需要开启远程访问，首先开启iptables的3306端口

    iptables -I INPUT -p tcp --dport 3306 -j ACCEPT
    

这里只是临时添加的这条规则，服务器重启后会失效，如果要长久保存着表规则，还应该保存到iptables配置文件里

    service iptables save
    

之后可以查看一下是否已经添加生效

    service iptables status
    

### SQL Server上创建链接服务器

点击【开始菜单】-【管理工具】-【数据源（ODBC）】，切换到【系统DSN】选项卡，选择【MySQL ODBC 5.3 ANSI Driver】，点击【添加】：

![添加数据源][4]

填写MySQL连接信息

![配置mysql连接信息][5]

确定添加，可以看到，命名为mysqlserver的数据源已经添加完成

![完成数据源添加][6]

接着打开SQL Server Management Studio，找到【服务器对象】-【链接服务器】，右击新建一个链接服务器，配置直接填写刚刚的数据源

![创建链接服务器并配置][7]

注意左边的第二栏【安全性】选项卡中，最下面设置一下MySQL Server的账户密码信息。

这样就完成了MySQL Server链接服务器的配置，试一下查询语句

    select * from openquery(mysqlserver,'select * from config');
    

得到查询结果。

PS：以上步骤是根据多篇教程整理出来的，之后同事小璐同学提供了[网上的配置方法][8]，貌似已经有人写的比较通俗了，看来我是重复造轮子了。

 [1]: https://dev.mysql.com/downloads/connector/odbc/
 [2]: http://www.microsoft.com/zh-CN/download/details.aspx?id=5555
 [3]: http://www.microsoft.com/zh-CN/download/confirmation.aspx?id=14632
 [4]: https://static.ktsee.com/s1/2016/05/20160502121025234.jpg
 [5]: https://static.ktsee.com/s1/2016/05/20160502121033245.jpg
 [6]: https://static.ktsee.com/s1/2016/05/20160502121039240.jpg
 [7]: https://static.ktsee.com/s1/2016/05/20160502121049172.jpg
 [8]: http://www.alixixi.com/program/a/2011012867360.shtml