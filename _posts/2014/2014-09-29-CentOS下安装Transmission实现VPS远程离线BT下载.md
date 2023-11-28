---
layout: post
title: CentOS下安装Transmission实现VPS远程离线BT下载
date: 2014-09-29 04:38:00
category: 服务器运维
permalink: /57.html
tags:
- BT
---

<!--markdown-->最近百度网盘和迅雷等离线下载功能由于某些原因开始关闭或限制，导致越来越难以找到一合适的bt离线下载工具。我的解决方法是买一个年付VPS，搭建Transmission离线下载服务端，然后本地安装Transmission-Remote-GUI实现远程离线BT下载。下面说一下搭建和使用过程

### 在vps上安装并配置Transmission服务端

我用的是CentOS 6.5，其他系统请[参考这里][1]，首先更新源：

    $ cd /etc/yum.repos.d/
    $ wget http://geekery.altervista.org/geekery-el6-i686.repo
    $ yum update
    

然后执行安装

    $ yum install transmission transmission-daemon
    

接下来启动Transmission-daemon服务，这一步主要是为了生成默认的配置文件：

    $ service transmission-daemon start
    

接下来停止服务，并修改配置文件（如果是CentOS 5，配置文件路径在`/var/lib/transmission/.config/transmission-daemon/settings.json`）

    $ service transmission-daemon stop
    $ vi /var/lib/transmission/settings.json
    

对以下信息几行进行编辑，第一行是打开用户认证，三四行是登录用户名及密码，自行设定一下就OK，最后一行是关闭白名单，这样就可以随处登录离线下载了：

    "rpc-authentication-required": true,
    "rpc-enabled": true,
    "rpc-password": "管理密码密码",
    "rpc-username": "管理用户名",
    "rpc-whitelist-enabled": false,
    

接下来重新启动Transmission-daemon服务：

    $ service transmission-daemon start
    

服务启动成功，这时可以通过web页面进行管理和离线下载了，管理页面默认是`你的服务器IP或域名:9091`

### 安装Transmission-Remote-GUI客户端

通过web页面管理总不是那么方便，下载Transmission-Remote-GUI并登入服务器才是最方便：

**Transmission-Remote-GUI下载：** <https://code.google.com/p/transmisson-remote-gui/downloads/list>

根据你的操作系统下载相应的版本，首次登录会提示填入服务器地址和账户密码等信息，正确填入后，操作方式跟本地使用μTorrent差不多，enjoy！

![Transmission][2]

 [1]: http://geekery.altervista.org/dokuwiki/doku.php?id=start
 [2]: https://static.ktsee.com/s1/2016/05/20160502120704627.png