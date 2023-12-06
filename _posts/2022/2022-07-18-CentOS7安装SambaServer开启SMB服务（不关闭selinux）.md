---
layout: post
title: CentOS7 安装Samba Server，开启SMB服务（不关闭selinux）
date: 2022-07-18 11:26:00
category: 服务器运维
permalink: /803.html
tags:
- CentOS
- Samba
- smb
- selinux
---

## 前言

局域网传输文件，有多种协议可以实现，samba（以下简称smb）协议无疑是使用上最方便的一种。本次我们尝试在全新的CentOS7 2009上安装smb服务，同时在不关闭selinux的情况下搞定权限问题。开工。

## 思路

想法是，创建两个smb账户，分别为：

- ktsee
- surenkid

其中**ktsee**作为smb管理员，可以读写所有smb共享文件夹下的数据；**surenkid**作为一个普通用户，可以读写自己的共享文件夹。

## 开始

### 安装samba

CentOS7 2009直接从源仓库进行安装，避免使用编译或第三方仓库，防止系统变“野”

```bash
yum install samba samba-client
systemctl start smb
systemctl start nmb
systemctl enable smb
systemctl enable nmb
```

这里smb服务用于文件共享或打印服务，监听端口139和445。nmb服务用于通过网络名直接代替IP访问smb服务，监听端口137

### 防火墙配置

接着放行smb服务

```bash
firewall-cmd --permanent --zone=public --add-service=samba
firewall-cmd --zone=public --add-service=samba
```

### 创建文件夹

```bash
mkdir /home/samba
mkdir /home/samba/ktsee
mkdir /home/samba/surenkid
```

其中`/home/samba/ktsee`用于存放公用的用户数据，`/home/samba/surenkid`用于存放指定用户的数据

### 创建用户

首先创建smb用户组

```bash
groupadd sambashare
```

接着创建两个用户

```bash
useradd -M -d /home/samba/ktsee -s /usr/sbin/nologin -G sambashare ktsee
useradd -M -d /home/samba/surenkid -s /usr/sbin/nologin -G sambashare surenkid
```

### 配置用户与文件夹

首先设置用户smb密码并启用

```bash
smbpasswd -a ktsee
smbpasswd -e ktsee

smbpasswd -a surenkid
smbpasswd -e surenkid
```

接着对文件夹设置权限

```bash
chgrp sambashare /home/samba

chown surenkid:sambashare /home/samba/surenkid
chmod 2770 /home/samba/surenkid

chown ktsee:sambashare /home/samba/ktsee
chmod 2770 /home/samba/ktsee
```

### 配置Samba

编辑smb配置文件

```bash
vi /etc/samba/smb.conf
```

填入以下内容

```ini
[ktsee]
    path = /home/samba/ktsee
    browseable = yes
    read only = no
    force create mode = 0660
    force directory mode = 2770
    valid users = @sambashare @ktsee

[surenkid]
    path = /home/samba/surenkid
    browseable = no
    read only = no
    force create mode = 0660
    force directory mode = 2770
    valid users = surenkid @ktsee
```

保存后重启smb和nmb服务

```bash
systemctl restart smb.service
systemctl restart nmb.service
```

### 设置selinux安全上下文

检查一下当前安全上下文

```bash
ls -dZ /home/samba/*
```

为`/home/samba`下的文件夹设置samba安全上下文

```bash
semanage fcontext -a -t samba_share_t "/home/samba(/.*)?"
restorecon -Rv /home/samba
```

如果共享文件夹不仅仅用于smb服务，同时还需要用于其他服务，则需要使用另一套安全上下文

```bash
setsebool -P smbd_anon_write=1
semanage fcontext -a -t public_content_rw_t "/home/samba/public(/.*)?"
restorecon -Rv /home/samba/public
```

## 验证

在Explorer中输入服务器IP（这里假设ip为`192.168.1.35`）

```bash
\\192.168.1.35
```

打开文件夹，试试复制文件，打开文件等操作

## 结语

至此centos 7安装samba server结束，其实我搭建这个服务，是为了让我的那台前段时间入手的[升腾C30小主机](https://3sv.ktsee.net/2022/07/c3035nas.html)物尽其用。

![升腾C30小主机](https://static.ktsee.com/s1/2022/7/19/cljbc4yhtb8w.png)

部署smb服务，还可以用[docker](https://hub.docker.com/r/dperson/samba)来实现，但由于我的机器配置较差，用docker总是出现各种问题，也因此还是使用了CentOS的原生组件。



参考：

- https://linuxize.com/post/how-to-install-and-configure-samba-on-centos-7/
- https://www.lisenet.com/2016/samba-server-on-rhel-7/