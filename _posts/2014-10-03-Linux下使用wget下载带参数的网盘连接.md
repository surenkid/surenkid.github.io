---
layout: post
title: Linux下使用wget下载带参数的网盘连接
date: 2014-10-03 07:46:00
category: 软件应用
permalink: /89.html
tags:
- wget
---

<!--markdown-->因为需要，有时候需要从网盘中下载文件，但是由于现在的网盘大部分都对直链下载做了限制，因此wget无法顺利完成下载，这时需要多几个步骤，下面来说一下

### 准备工作

你需要wget，chrome浏览器，导出cookie插件，获取网盘真实地址插件。以下是下载链接：

*   Chrome浏览器：<http://www.google.com/chrome/browser/>
*   导出cookie插件：<https://chrome.google.com/webstore/detail/cookiestxt/njabckikapfpffapmjgojcnbfjonfjfg>
*   网盘助手：<http://www.duoluohua.com/app/showapp/?action=showapp&system=script&appname=dupanlink>

### 下载开始

首先在Chrome浏览器中装上导出cookie插件，打开需要下载的网盘页面，点击登陆，用自己的账号登陆（如果该网盘无需登陆即可下载的话，可以略过登录步骤）。然后点击导出cookie插件，将当前的cookie导入到cookies.txt文本文件中，并将该文件上传至linux服务器下载文件存档的目录下。

安装好网盘助手，根据网盘助手的说明，获取网盘文件的真实下载地址。

在Linux终端，使用命令

    wget -c –load-cookies=cookies.txt -O "文件名" "网盘文件真实下载地址" &
    

如果文件较大，需要离线下载，加上nohup命令即可。

    nohup wget -c –load-cookies=cookies.txt -O "文件名" "网盘文件真实下载地址" &
    

然后机会开始下载文件，之后就是等待了。