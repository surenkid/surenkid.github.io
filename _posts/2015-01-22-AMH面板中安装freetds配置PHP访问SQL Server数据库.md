---
layout: post
title: AMH面板中安装freetds配置PHP访问SQL Server数据库
date: 2015-01-22 03:22:00
category: 架构设计
permalink: /249.html
tags:
- AMH
---

<!--markdown-->由于公司开发需求，需要使用php访问sql server数据，查阅了相关资料，在amh官方论坛里找到了老大的回复，根据老大的回复整理了一下，将其中版本更新后记录下来，以备后用。

1、安装freetds

    cd /usr/local/
    wget http://mirrors.xmu.edu.cn/ubuntu/archive/pool/main/f/freetds/freetds_0.91.orig.tar.gz
    tar zxf freetds_0.91.orig.tar.gz
    cd freetds-0.91
    ./configure --prefix=/usr/local/freetds --with-tdsver=7.1 --enable-msdblib --enable-dbmfix --with-gnu-ld --enable-shared --enable-static
    make && make install
    

freetds这里使用了0.91版，由于新版取消了TDS protocol version中8.0版和7.2版，因此设置参数--with-tdsver=7.1，适用于sql server 2008

2、下载php源码，安装mssql模块

    cd /usr/local/
    wget http://cn2.php.net/distributions/php-5.3.27.tar.gz
    tar zxf php-5.3.27.tar.gz
    cd php-5.3.27/ext/mssql
    /usr/local/php/bin/phpize;
    ./configure --with-php-config=/usr/local/php/bin/php-config  --with-mssql=/usr/local/freetds
    make && make install
    

这里由于当前的php版本为5.3.27，因此下载了相应的php源码。 接下来修改php.ini，在末尾加入mssql扩展。

    vi /etc/php.ini
    extension = /usr/local/php/lib/php/extensions/no-debug-non-zts-20090626/mssql.so
    

3、重启面板php、虚拟主机php

    amh php restart amh-web y
    amh php restart