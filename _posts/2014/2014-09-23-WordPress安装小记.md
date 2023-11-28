---
layout: post
title: WordPress安装小记
date: 2014-09-23 14:55:00
category: 软件应用
permalink: /6.html
tags:
- WordPress
---

<!--markdown-->WordPress也不是第一次装了，安装过程中还是遇到了一些问题，

# 安装遇到问题

下载安装wordpress比较简单，只是安装4.0后直接报错让我比较郁闷。由于空间默认关闭了php的错误输出，所以首先要打开php的错误输出。

### 打开php的错误显示

找到php.ini，将其中的display_errors由Off改为On

    display_errors = On
    

在这之后错误提示显示

> Allowed memory size of 41943040 bytes exhausted (tried to allocate 122880 bytes)

根据google发现，原来是php的内存限制太小，修改方法有几种，一种是在php.ini中将memory_limit改大一些，由于我的主机上暂时放置了多个站点，不想随便更改这个值，因此采用第二种方法

### 在wp的配置文件中更改内存限制

在wp-config.php中添加

    define('WP_MEMORY_LIMIT', '64M');
    

之后保存，在此安装，这次安装总算顺利进行。

# 配置插件问题

安装完成后，基本的插件有两个是需要装的，作为原创为主的博客，偏重于技术，少不了要贴一些代码，那么WP-Markdown，Crayon Syntax Highlighter这两个是必不可少的。

### 配置WP-Markdown插件

安装启用后，在后台设置-撰写里选择可以使用的地方，还有显示markdown编辑器帮助和预览的帮助栏，保存后即可开启markdown编辑。

### 配置Crayon Syntax Highlighter插件

Crayon Syntax Highlighter插件的可设置项很多，我做的几个设置是：

*   工具栏显示方式 -> 始终显示（防止工具栏跳来跳去影响复制） 
*   默认显示行编号 -> 关闭（防止复制代码时带行号）
*   在代码中进行 HTML 转义 -> 开启（这个比较重要，防止&之类的符号被转义）
*   禁止动画 -> 开启(对动画实在无爱)

基本这两个插件够我刚开始使用了，后期慢慢上手后再添加其他插件。

# 调整open sans字体

因为wp默认用的是google的open sans字体，由于某些原因无法连接，导致每次加载open sans都很慢，这时需要将字体的连接改为国内的镜像源。试了wp后台里搜索出来的几个插件，基本都没有用。不知道是不是由于wp升级到4.0的原因，最终在360前端库网站里找到了[soulteary童鞋的插件][1]，上传加载后一切OK。

 [1]: http://www.soulteary.com/2014/06/08/replace-google-fonts.html