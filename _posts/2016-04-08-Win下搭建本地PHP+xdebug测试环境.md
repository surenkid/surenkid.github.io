---
layout: post
title: Win下搭建本地PHP+xdebug测试环境
date: 2016-04-08 02:36:00
category: 架构设计
permalink: /536.html
tags:
- xdebug
- iis
---

<!--markdown-->下载Microsoft Web Platform Installer
------------------------------------
用Microsoft Web Platform Installer安装PHP环境是windows下比较简易的一种方式

Web Platform Installer 下载：[https://www.microsoft.com/web/downloads/platform.aspx][1]

下载后完成安装，此时如果本地IIS服务没有安装，也可以在Web Platform Installer（下面就用webpi简称吧）里安装对应的服务。

安装PHP以及相关组件
-----------------
由于使用了webpi，安装PHP就变的相当简单，直接在webpi里搜索`php`，找到对应的版本，点击安装，平台就会自动安装PHP以及依赖的组件，安装完成后自动配置，不需要手工配置php.ini文件等。

这里根据生产环境的配置，我选择了安装php5.3版本进行安装

- PHP 5.3.19

除了PHP以外，其他相关组件也可以一并安装，一般会安装MySQL

- MySQL Windows 5.5
- 适用于 IIS 的 PHP Manager
- IIS 中的 Microsoft Drivers 3.0 for PHP v5.3 for SQL Server

下载xdebug
----------
接着是配置xdebug，首先从[xdebug官网][2]下载适用于php 5.3的版本。

最新版本已经不支持php5.3，所以这里找了相对旧的版本。这里要注意的是，通过前面WebPi安装的PHP 5.3是32位版本，这里需要下载对应32位版本的xdebug，之前以为PHP跟随系统是64位的，所以下载错了版本，导致xdebug扩展一直无法正常加载，坑了一个下午:(

同时注意由于是IIS下的PHP，不要选择线性安全版本（包含TS字符的版本）

下载32位：[https://xdebug.org/files/php_xdebug-2.2.7-5.3-vc9-nts.dll][3]

当然如果你自己手工配置的64位PHP5.3，也可以下载对应的64位xdebug

下载64位：[https://xdebug.org/files/php_xdebug-2.2.7-5.3-vc9-nts-x86_64.dll][4]

配置xdebug
----------
下载后把文件复制到你喜欢的文件夹内，然后打开IIS中的PHP Manager，修改PHP.ini文件，在文件最后添加如下内容：

	; XDEBUG Extension
	zend_extension = "C:\Program Files (x86)\iis express\PHP\v5.3\ext\php_xdebug-2.2.7-5.3-vc9-nts.dll"
	[xdebug]

	;开启自动跟踪 
	xdebug.auto_trace=On
	;开启异常跟踪
	xdebug.show_exception_trace=On
	;开启远程调试自动启动
	xdebug.remote_autostart = Off
	;收集参数
	xdebug.collect_params=on
	;收集返回值
	xdebug.collect_return=on
	;收集变量
	xdebug.collect_vars = On 
	xdebug.max_nesting_level=100
	xdebug.profiler_enable=on
	xdebug.profiler_trigger=1
	xdebug.profiler_append=1
	;开启远程调试
	xdebug.remote_enable=on
	;允许连接的zend studio的IP地址
	xdebug.remote_host=localhost
	;反向连接zend studio使用的端口
	xdebug.remote_port=9000
	;用于zend studio远程调试的应用层通信协议
	xdebug.remote_handler=dbgp
	;如果设得太小,函数中有递归调用自身次数太多时会报超过最大嵌套数错
	xdebugbug.max_nesting_level = 10000
	xdebug.trace_output_dir="E:/TMP/trace" 
	xdebug.profiler_output_dir="E:/TMP/profiler"

注意修改第一行的路径为你刚刚放置的路径，最后两行的路径也最好提前创建好。

接着在打开phpinfo页面，如果看到**with Xdebug v2.2.7, Copyright (c) 2002-2015, by Derick Rethans** ，就表示安装成功了。

![Xdebug安装成功判断][5]

这样，一个本地的测试环境就搭建好了，使用你喜欢的IDE工具开始编码吧。


  [1]: https://www.microsoft.com/web/downloads/platform.aspx
  [2]: https://xdebug.org
  [3]: https://xdebug.org/files/php_xdebug-2.2.7-5.3-vc9-nts.dll
  [4]: https://xdebug.org/files/php_xdebug-2.2.7-5.3-vc9-nts-x86_64.dll
  [5]: https://static.ktsee.com/s1/2016/04/20160429164855510.jpg