---
layout: post
title: 移动封顶卡使用ProxyDroid及OpemVPM实现正常上网
date: 2015-10-26 04:54:00
category: 软件应用
permalink: /504.html
tags:
- Mobile
---

<!--markdown-->前段时间把手机从LG E985T换成一加1，系统也从Android 4.2.2升级到Android 5.1，由于新版系统内置APN设置改变了，导致在新手机上使用ProxyDroid配合封顶卡时，无法正常访问https，这带来的结果就是，支付宝钱包，淘宝等涉及https访问的服务均无法访问，访问https://v2ex.com也无法显示，而http正常。

在论坛上找了其他人的帖子，遇到与我一样的问题，同样是换回旧手机一切正常，换用新手机就无法访问https，帖子里的作者最终解决了他自己的问题，但是只是说了一句“和手机系统有关”就再无回复，这让我着实比较头疼。在反复的搜索了大量的相关内容之后，<del>最终还是自行解决了问题</del>。

**2015.11.19 update:目前发现封顶卡每次联网获取的ip不一致，如果是112开头的公网ip，则可以使用ProxyDroid或者openvpm直接无障碍上网;反之如果获取到的是221开头的公网ip，则只能上http网站，无法访问https以及openvpm等加密连接。**

问题初步解决
-----------
问题很简单，主要是APN内置的设置有问题，新手机的内置APN设置与旧手机不一样，默认就存在多个APN设置。只需要直接把所有APN设置全部删除，然后按照以下的设置新建一个APN，并选用该设置。

	名称：cmwap
	APN：cmwap 
	代理：10.0.0.172 
	端口：80 
	用户名：不填 
	密码：不填 
	服务器：不填 
	MMSC：不填或http://mmsc.monternet.com 
	彩信代理：不填或010.000.000.172 
	彩信端口：不填或80  
	MCC：460 
	MNC：02（默认项，不用修改） 
	身份验证类型：无
	APN类型：default（如上面填了彩信地址，这里为default,sms）
	APN协议：IPv4
	APN漫游协议：IPv4

之后等待5-10分钟，就可以恢复到旧版手机系统的状态。这时候使用ProxyDroid配合封顶卡就可以正常使用了。

搜索的过程中，找到了最新版的ProxyDroid以及OpenVPM的最新设置方法，更新了手机内用于封顶卡的工具，目前使用ProxyDroid以及OpemVPM就可以实现完美正常上网。

使用ProxyDroid实现大部分正常上网（需root）
--------------------------------------
这个方法比较简单，直接下载ProxyDroid，设置好移动的地址和端口就可以使得大部分应用正常使用（包括微信以及HTTPS服务等）

下载：[ProxyDroid修改版2.7.3][1]（来自[这里][2]）

完成安装后，手机打开，找到“旁路地址”，点击“预设”，选择“Intranet”，然后设置主机位10.0.0.172，端口设置为80，最后开启即可。

![PD设置][3]

这种模式下是直接将安卓手机的全局流量从移动的代理通过，相当于另一种形式的直连，访问速度会比较快，大部分应用都可以正常运行。我的测试中闲鱼APP有时候无法正常打开，也许还有其他应用有类似问题。如果希望完美访问所有应用，可能还是需要用到下面的方法。

使用OpemVPM实现完全正常上网（无需root）
------------------------------------
这个方法比较复杂，网上流传的大多是通过家用路由器刷第三方固件，实现服务器的架设。架设的过程中需要配置相应的证书与配置文件。完成服务端配置后，再进行手机端的配置。具体的方法网络上已经有很多，我这里仅仅简单说一下。

首先在路由器或者自己的公网服务器上架设服务端，生成相应的证书文件与密钥文件，以及配置文件。同样生成一份手机需要用的客户端证书、密钥以及配置文件。这里生成证书与密钥文件可以参考网络的教程，而配置文件，我这里贴出我自己在公网Windows服务器上的配置。

服务器端server.ovpm

	local 172.16.9.101 # 这里填写自己的服务器，或者设置好DMZ的路由器公网ip
	port 1194
	proto tcp # 用代理必须是TCP
	dev tun # windows下必须是tap
	ca ca.crt
	cert server.crt
	key server.key # This file should be kept secret
	dh dh1024.pem
	server 192.168.9.0 255.255.255.0 # 这个地址随便，但不要与局域网相同
	ifconfig-pool-persist ipp.txt
	push "redirect-gateway def1 bypass-dhcp bypass-dns"
	push "dhcp-option DNS 114.114.114.114" # 本地的DNS
	keepalive 10 120
	comp-lzo
	persist-key
	persist-tun
	status openvpm-status.log
	verb 4
	mode server
	tls-server

客户端client.ovpm

	client
	dev tun
	proto tcp
	remote 172.16.9.101 1194 # 这里要填写一个服务器地址，或者路由器绑定的动态域名地址 例如3322.org
	resolv-retry infinite
	nobind
	persist-key
	persist-tun
	http-proxy 10.0.0.172 80 # 这里是中国移动的网关地址和端口
	ca ca.crt
	cert client.crt
	key client.key
	comp-lzo
	verb 4

这样，将客户端的证书、密钥以及配置文件复制到安卓手机里，并从官网下载安卓客户端并安装，打开后选择“import”，再选择“Import Profile from SD card”，找到刚刚复制到手机里的配置文件并导入。回到主界面，点选connect，完成连接即可。

![界面][4]

这种方式下是通过架设的服务器中转访问，访问的速度取决于服务器与移动网络之间的速度，如果恰好用的是电信网络，可能会有一定的延迟，但是优点是这种方式下，可以实现完美访问，再不用担心因移动限制而无法正常打开的APP。


  [1]: http://cloud.ktsee.eu.org/storage/2017/ProxyDroid2.7.3_for_ChinaMobile_NoAD.apk
  [2]: http://www.tdbeta.cn/thread-216217-1-1.html
  [3]: https://static.ktsee.com/s1/2016/05/20160502121220804.jpg
  [4]: https://static.ktsee.com/s1/2016/05/20160502121227224.jpg