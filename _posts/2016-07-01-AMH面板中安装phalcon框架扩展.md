---
layout: post
title: AMH面板中安装phalcon框架扩展
date: 2016-07-01 02:35:00
category: 架构设计
permalink: /547.html
tags:
- phalcon
---

<!--markdown-->因为系统使用的是amh4.2，其集成的是php 5.3.27p1版本，而适用于php5.3的版本目前应该是phalcon 1.3.6，暂且在这里安装这个版本。

### 编译phalcon

从git上拉取phalcon的1.3.6分支

    git clone --depth=1 git://github.com/phalcon/cphalcon.git -b 1.3.6

进入编译前需要修改install脚本适合于amh环境下的路径变量，编辑

    cd cphalcon/build
    vi install

在install脚本中找到`phpize`，修改为`/usr/local/php/bin/phpize`，然后找到`configure`,后面加上`--with-php-config=/usr/local/php/bin/php-config`，修改完毕后保存，接着执行编译脚本

    sudo ./install

### 配置amh

添加扩展，编辑etc/php.ini文件，加入：

    extension = /usr/local/php/lib/php/extensions/no-debug-non-zts-20090626/phalcon.so

保存后重启php-fpm服务

    amh php restart amh-web y
    amh php restart

这样就完成了phalcon扩展的安装，检查phpinfo中是否有相应的模块显示：

![phalcon in phpinfo][1]

### 文档

中文文档：https://github.com/aisuhua/phalcon-zh-doc

相关资料：http://blog.csdn.net/QZFZZ/article/category/2514807


  [1]: https://static.ktsee.com/s1/2016/07/20160701105610660.png