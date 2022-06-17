---
layout: post
title: CentOS更新时提示could not retrieve mirrorlist mirrorlist.centos.org问题解决
date: 2014-09-25 02:31:14
category: 服务器运维
permalink: /35.html
tags:
- CentOS
---

<!--markdown-->新装好CentOS，执行yum update时，出现提示

> Loaded plugins: fastestmirror Loading mirror speeds from cached hostfile Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=6&arch=x86_64&repo=os error was 14: PYCURL ERROR 6 - "Couldn't resolve host 'mirrorlist.centos.org'" Error: Cannot find a valid baseurl for repo: base

网上搜寻后发现，原来是未设置dns，无法解析域名。

### 解决方法

修改/etc/resolv.conf文件，在其中加上dns即可

    # Google nameservers
    nameserver 8.8.8.8
    nameserver 8.8.4.4
    

当然你也可以加上其他dns服务器

    # OpenDNS servers
    nameserver 208.67.222.222
    nameserver 208.67.220.220
    

再次运行yum update，成功开始更新，到此问题解决。