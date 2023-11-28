---
layout: post
title: 用curl结合crontab执行PHP定时任务
date: 2016-03-03 03:51:00
category: 服务器运维
permalink: /526.html
tags:
- crontab
- curl
---

<!--markdown-->我是个喜欢重复造轮子的人，网上的教程很多，还是喜欢自己写一份。这样比较容易加深印象，也给其他人做一个参考。

在工作中遇到了需要每日定时执行PHP脚本同步数据的需求，之前有尝试[ThinkPHP的Cron][1]，但是成功执行2天之后就没有响应了。为了保证任务稳定，还是考虑采用Linux自身的crontab来执行计划任务吧。

执行脚本
--------

在Linux下执行PHP脚本可以使用三个工具，curl，wget和lynx，其中第三个是个终端文字版浏览器，可以实现的功能更多。我这里只是需要简单执行一下，所以直接使用curl就可以了。

例如要执行http://www.ktsee.com/task.php，那么直接使用

    /usr/bin/curl -o ~/result.txt http://www.ktsee.com/task.php

等待执行完成，执行结果会保存到result.txt文档内

crontab设置
-----------

接着将该命令写入crontab的配置文件中，使用crontab自带的编辑命令：

    crontab -e

打开配置文件，这里我的需求是每天夜里4点执行一次同步脚本，那么在配置文件里加入：

    0 4 * * * /usr/bin/curl -o ~/result.txt http://www.ktsee.com/task.php

如此就完成了计划任务的配置

关于crontab的具体用法，这里未完待续

crontab具体语法
---------------
一直说未完待续，今天抽空终于把这个坑填了。

对定时任务的设置主要通过写入crontab的配置文件中，如同上面所说的，使用命令crontab -e可以快速进度配置编辑。

这里可以看到类似这样的内容

    */20 * * * * /usr/sbin/ntpdate ntpupdate.tencentyun.com >/dev/null &
    */20 * * * * /usr/sbin/ntpdate pool.ntp.org > /dev/null 2>&1
    #secu-tcs-agent monitor, install at Mon Nov 16 12:29:04 CST 2015
    * * * * * /usr/local/sa/agent/secu-tcs-agent-mon-safe.sh  > /dev/null 2>&1
    #ktsee
    * 4 * * * /usr/bin/curl -o ~/result.txt http://www.ktsee.com/task.php

其中前面的几行是所在服务商配置的时间同步，安全检查等定时任务，而最后一行是上面我们配置的定时任务。

每一行任务的组成都是由五个时间标记（暂且这么来称呼，*或者数字）组成，后面紧接着的是执行的命令

    * * * * * cli balabala

前5个时间标记分别对应的是分钟，小时，日，月，周，如果某个标记显示的是*，则表示这个标记内每一个单位时间都将触发，而如果显示的是数字（如3），则表示在这个时间单位（如3分钟时）触发。

举个例子：
如果要每一分钟执行一次`cli balabala`命令，这样写

    * * * * * cli balabala

表示，而如果要每小时的第3分钟执行`cli balabala`命令

    3 * * * * cli balabala

如果要在多个时间点执行，可以用逗号分隔多个时间点，如需要在每小时的3分钟和5分钟分别执行一次

    3,5 * * * * cli balabala

如果要在间隔的每个固定时间段时执行，如每隔2分钟执行一次，则这样

    */2 * * * * cli balabala

  [1]: http://www.thinkphp.cn/topic/7435.html