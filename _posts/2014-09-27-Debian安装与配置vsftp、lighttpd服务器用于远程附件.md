---
layout: post
title: Debian安装与配置vsftp、lighttpd服务器用于远程附件
date: 2014-09-27 15:53:00
category: 服务器运维
permalink: /50.html
tags:
- vsftp
- lighttpd
---

<!--markdown-->由于我的一个小内存vps平日闲置，想通过架设ftp为Discuz和WordPress用做远程图片服务器。大致看了vsftpd，ProFTPd，PureFTPd等三个Linux下的FTP Server的介绍后，考虑到本身作用只需要上传，并无其他ftp功能需求，选用了vsftpd作为FTP Server

### 安装vsftpd

安装过程很简单，输入命令

    $ apt-get install vsftpd
    

### 配置vsftpd

对vsftpd配置文件/etc/vsftpd.conf进行设置

    $ vi /etc/vsftpd.conf
    

将其中的部分参数做更改

    # 是否允许匿名登录FTP服务器
    anonymous_enable=YES
    
    # 是否允许本地用户(即linux系统中的用户帐号)登录FTP服务器
    local_enable=YES
    
    # 是否允许本地用户对FTP服务器文件具有写权限
    write_enable=YES 
    
    # 掩码，默认为022，表示权限为777-022=755，这里设置为000表示权限为777-0=777
    local_umask=000
    
    # 是否允许匿名用户上传文件
    anon_upload_enable=NO
    
    # 是否允许匿名用户创建新文件夹
    anon_mkdir_write_enable=NO 
    
    # 登录FTP服务器时显示的欢迎信息
    ftpd_banner=Welcome to KTSee FTP service.
    
    # 默认为vsftpd，此处设置为ftp可解决本地用户登陆失败的问题，此处具体说明需要抽空了解
    pam_service_name=ftp
    

之后新建本地用户ktsee（用于访问ftp）

    $ useradd -d /home/ktsee -s /sbin/nologin ktsee
    $ passwd ktsee
    

完成后重启vsftpd服务，配置完毕

    $ service vsftpd restart
    

此时通过ftp客户端登陆ktsee账号，即可ftp访问位于home/ktsee目录。此外为了作为图片服务器，还需要安装http服务器用于图片外链。在对比了apache，nginx和lighttpd三个web server的介绍之后，发现选用lighttpd比较合适，网上找到这样的介绍：

> Apache 后台服务器（主要处理php及一些功能请求 如：中文url） Nginx 前端服务器（利用它占用系统资源少得优势来处理静态页面大量请求） Lighttpd 图片服务器

### 安装并配置Lighttpd服务器

执行命令安装

    $ apt-get install lighttpd
    

之后修改/etc/lighttpd/lighttpd.conf

    server.document-root        = "/home/ktsee"
    

将http主目录设置为ftp目录，重启lighttpd服务

    $ service lighttpd restart
    

之后访问服务器ip或域名即可访问图片。

## 使用七牛云做镜像加速

由于我的vps是国外线路，因此为了保证访问速度，使用七牛云的镜像存储功能对服务器进行加速，其原理是在第一次访问七牛云给出的地址时，七牛服务器即时在后端抓取我的vps上的图片资源，并缓存在七牛云服务器中，随后的访问均只需访问七牛云服务器上的图片资源，无需访问vps，不但减轻了vps的压力，同时由于七牛云的服务器在国内，访问速度也大大加快

进入七牛云后台，设置“镜像存储”的源地址为前面vps的ip或域名，然后将图片引用地址改为七牛云的地址即可。地址就不给出了，以下是我设置后的图片存储演示：

![卖萌小狗狗][1]

 [1]: https://static.ktsee.com/s1/2016/07/20160722110853453.jpg