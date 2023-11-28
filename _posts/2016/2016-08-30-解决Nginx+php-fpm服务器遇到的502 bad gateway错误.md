---
layout: post
title: 解决Nginx+php-fpm服务器遇到的502 bad gateway错误
date: 2016-08-30 02:05:00
category: 服务器运维
permalink: /602.html
tags:
- nginx
- php-fpm
---

<!--markdown-->最近在微信服务器访问量上升，但实际并发量并不是很大的情况下，服务器频繁出现`502 bad gateway`错误，每次手动重启php-fpm服务后约保持2小时后又出现502错误。刚开始以为是php-fpm子进程数量设置过小，所以调整了该值后重启服务。之后问题依旧，这才觉得这个问题需要仔细的去排查一下。

排查问题
========
检查php-fpm子进程
----------------
首先检查是否是php-fpm子进程数量不足，执行

    netstat -anpo | grep "php-cgi" | wc -l

这里查询的是php-fpm子进程数量，如果这里的值与php-fpm.conf中设置的`pm.max_children`子进程数量接近，表示可能子进程数量设置不足，这时可能需要根据服务器配置进行相应的调整。

检查nginx错误日志
----------------
找到对应的nginx错误日志文件，默认日志在`/var/log/nginx`，如果有自定义日志路径，可以在`/etc/nginx/conf`中找到对应的`*.conf`配置文件，从配置文件中找到日志文件路径。然后从日志文件中找到对应的错误记录，根据记录中的问题进行调整。

排查结果
---------
经过排查，出现这个问题一般是因为PHP脚本的执行时间过长，也可能程序逻辑中出现死循环这样的错误，导致服务器连接数过多，并且一直无法释放连接。

解决问题
=======
调整PHP-FPM子进程数
------------------
对于php-fpm子进程不足的问题，可以通过编辑php-fpm.conf文件调整子进程数量来缓解这个问题。

如果是静态模式`pm = static`，只要调整`pm.max_children`值：

    pm.max_children = 50

如果是动态模式`pm = dynamic`，调整：

    pm.start_servers = 2
    pm.min_spare_servers = 1
    pm.max_spare_servers = 3

调整完成后重启php服务

调整脚本执行超时时间
-------------------

对于脚本执行时间过长或死循环的问题，设置`request_terminate_timeout`为一个较短并合理的值即可，我这里暂时设置的是60秒

    request_terminate_timeout = 60

当然你也可以通知开发人员修改程序逻辑，避免脚本长时间占用进程。

解决结果
-------
这样基本解决了这个问题，剩下就是优化程序逻辑了。保持程序逻辑没有问题的情况下，同时对一些高并发请求进行异步处理，利用队列来执行，可以解决一些类似的问题。