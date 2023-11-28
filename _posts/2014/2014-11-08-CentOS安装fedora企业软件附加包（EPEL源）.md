---
layout: post
title: CentOS安装fedora企业软件附加包（EPEL源）
date: 2014-11-08 15:56:00
category: 架构设计
permalink: /153.html
tags:
- CentOS
---

<!--markdown-->CentOS安装后自带的源，包含的为一部分比较稳定的软件包，而对于需要安装部分不在CentOS源中的软件，则需要添加扩充源，网上比较推荐的是fedora的EPEL源，虽然安装是比较简单的，但是由于常常需要根据不同的版本去官网查询相应的连接，对于有时经常重装CentOS用于软件测试时稍微麻烦，因此在这里我简单列出各个版本的安装方法，以备后用。

首先简单 CentOS的版本，根据不同的版本安装不同的RPM包。

CentOS 5 32位

    rpm -ivh http://dl.fedoraproject.org/pub/epel/5/i386/epel-release-5-4.noarch.rpm 
    

CentOS 5 64位

    rpm -ivh http://dl.fedoraproject.org/pub/epel/5/x86_64/epel-release-5-4.noarch.rpm
    

CentOS 6 32位

    rpm -ivh http://dl.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
    

CentOS 6 64位

    rpm -ivh http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
    

安装完成后，运行以下命令检测一下是否安装成功

    yum repolist
    

查看源里是否有相应的软件包，执行以下命令：

    yum info 软件包名
    

update:有的机器安装后，执行yum会报错，提示：

> Error: Cannot retrieve metalink for repository: epel. Please verify its path and try again

解决方法是，编辑/etc/yum.repos.d/epel.repo，将其中

    baseurl=http://xxxxx
    #mirrorlist=https://xxxxx
    

改成

    #baseurl=http://xxxxx
    mirrorlist=https://xxxxx
    

问题解决