---
layout: post
title: Linux通过iptables端口转发访问内网服务器上的内网服务
date: 2017-03-26 12:09:00
category: 服务器运维
permalink: /635.html
tags:
- iptables
- nat
---

<!--markdown-->其实很在之前已经写了一篇关于[内网转发服务的文章][1]，只是那次是使用shell反向主动连接，保持转发。这次因为有了一个新的需求，有两台服务器，其中一台有公网ip，另一台没有公网ip，只提供redis服务，供前面那台服务器内网访问，而现在有时候需要通过公网直接访问内网服务器上的redis服务测试用，这时候更好的解决办法是端口转发，即将公网ip的服务器转发到内网，实现直接访问内网服务器上的服务。

这个有点相当于路由器设置页面里的NAT端口转发，只是这里是用iptables命令来实现，因此做一下记录，也为有和我同样需求的同学提供一些参考。

# 需求概述

假设我们有两台Linux服务器，分别是Server A跟Server B，它们在统一内网中，其中A有公网ip，而B没有：

- Server A: 内网192.168.0.1，公网123.123.123.123
- Server B: 内网192.168.0.2，公网IP无，端口6543为Redis服务端口

生产环境中，Server A提供外网服务，同时通过`192.168.0.2:6543`内部直接访问Redis服务。

那么问题是，我们本地测试无法直接连接`192.168.0.2:6543`，这时候，只能通过端口转发，通过连接Server A的公网IP来访问Redis服务，假设我们的转发端口是3456，那么我们希望的Redis连接地址应该是`123.123.123.123:3456`

这里就需要做一个将`123.123.123.123:3456`转发到`192.168.0.2:6543`的配置

# 开始设置

## 开启Linux转发功能

首先需要开启Linux内核的转发功能，编辑`/etc/sysctl.conf`，添加：

    net.ipv4.ip_forward=1

保存退出后，执行以下命令使修改生效

    sysctl -p

完成后查看`/proc/sys/net/ipv4/ip_forward`的内容，如果是1表示设置成功生效。

## 添加iptables转发规则

开始添加转发规则到iptables规则表中，首先将Server A公网中3456的请求转发到Server B的6543端口，即`123.123.123.123:3456`=>`192.168.0.3:6543`，执行：

    iptables -t nat -A PREROUTING -p tcp --dport 3456 -j DNAT --to-destination 192.168.0.2:6543

接着还需要为转发请求指明请求来源

    iptables -t nat -A POSTROUTING -p tcp -d 192.168.0.2 -j SNAT --to-source 192.168.0.1

这里其实偷懒漏没有写端口，意思是所有转发到Server B的请求都是来源于Server A，如果需要指定只有转发到Server B的6543端口的请求的来源才是Server A，那么需要改为：

    iptables -t nat -A POSTROUTING -p tcp -d 192.168.0.2 --dport 6543 -j SNAT --to-source 192.168.0.1

## 保存设置并重启服务

最后保存路由规则并重启iptables服务，使得上面的配置生效

    service iptables save
    service iptables restart

# 结束
这样就完成了内网服务转发到公网IP的设置。iptables的功能十分强大，这里只是其中的一个非常简单的部分，如果有时间可以阅读[这篇文章][2]详细了解。

值得注意的是，这样相当于对外网公开了本来处于内网中的服务，因带来了安全隐患，建议对这方面的安全问题也做一些处理，例如限制指定IP访问该端口等。


  [1]: http://hi.ktsee.com/83.html
  [2]: http://wwdhks.blog.51cto.com/839773/1154032