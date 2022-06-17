---
layout: post
title: CentOS7下使用YUM手工搭建LNMP环境记录
date: 2016-06-20 02:22:00
category: 架构设计
permalink: /545.html
tags:
- CentOS
- lnmp
---

<!--markdown-->在以前经验不足的时候，搭建服务器LNMP环境，基本都是从网络上搜寻LNMP一键安装脚本，用脚本直接完成环境的所有部署。网络上的一键包有些高质量的，在安全，性能等方面都已经足够好，完全可以满足大多数情况下的需求，为什么还需要用手工搭建环境呢？

其实在现在看来，由于Linux的源提供的包安装方式已经越来越完善，使用YUM指令可以完成大多数环境的直接安装，不需要重新编译。再一个就是一键LNMP安装包大多是固化好作者的配置，如果你需要在后面的环境中添加新的模块，可能需要根据作者的配置规则来添加。而我们自己手工搭建的环境，对于环境配置会更加熟悉，也更容易拓展安装更多的环境模块。

## Linux基础环境配置

这里使用的CentOS 7，如果使用的是vps等云服务，直接选择服务商提供的CentOS 7系统就可以。如果准备在物理服务器上安装，可以在官网下载CentOS 7，版本可以选择Minimal ISO最小组件版本。

CentOS官网下载：https://www.centos.org/download/

安装过程不多说，安装后检查是否有添加了FedoraProject的epel源，如果系统默认没有加入这个源，加入的方法很简单：

    yum install epel-release

安装完成后执行

    yum update

更新源即可

## 安装Nginx

Nginx提供源码编译安装，对CentOS来说还可以直接添加官方源后通过yum方式安装。

编辑/etc/yum.repos.d/nginx.repo，添加以下内容（以下适用于CentOS 7,其他版本可以看[官网说明][1]）

    [nginx]
    name=nginx repo
    baseurl=http://nginx.org/packages/centos/7/$basearch/
    gpgcheck=0
    enabled=1

之后运行`yum update`更新系统，然后安装nginx

    yum install nginx

之后运行

    systemctl start nginx
    systemctl enable nginx

## 安装Mysql(MariaDB)

CentOS7官方源中把mysql换成了MariaDB，它是mysql的一个分支，主要由开源社区维护升级，因此我们这里以MariaDB代替Mysql，首先执行安装：

    yum install mariadb-server

安装完成后启动MariaDB并设置为开机启动：

    systemctl start mariadb
    systemctl enable mariadb

执行脚本通过交互的方式对MariaDB进行一些设置：

    /usr/bin/mysql_secure_installation

## 安装PHP(php-fpm)

使用yum同样方便的安装php-fpm，这里同时安装php-mysql扩展用于连接mysql数据库，如果你的php应用中需要用到更多的扩展，也可以在这里一并安装

    yum install php-fpm php-mysql

之后运行

    systemctl start php-fpm
    systemctl enable php-fpm

## 为web服务添加用户

为了统一管理权限，将nginx与之php-fpm设为同样的用户，因此这里需要新建一个账户用于web服务

    useradd -s /sbin/nologin ktseewww

修改/etc/nginx/nginx.conf文件，找到`user nginx`，修改为刚刚创建的用户

    user ktseewww

修改/etc/php-fpm.d/www.conf，找到

    user = apache
    group = apache

修改为

    user = ktseewww
    group = ktseewww

## 修改目录权限

修改var/lib/nginx目录权限

    chown -R ktseewww:ktseewww /var/lib/nginx

修改var/lib/php/session目录权限

    mkdir /var/php/session
    chown -R ktseewww:ktseewww /var/php/session

## 设置站点配置文件

编辑/etc/nginx/conf.d/thinkphp.conf，增加

    server {
        listen 80;
        server_name www.ktsee.com;
        root /data/wwwroot/www.ktsee.com;
        index index.html index.htm index.php;

        #charset koi8-r;
        access_log  /data/wwwlogs/www.ktsee.com.access.log  main;

        location / {
            if (!-e $request_filename) {
                    rewrite ^/(.*) /index.php?s=/$1 last;
                    #rewrite ^(.*) index.php?s=$1 last;
            }
        }

        error_page  404                 /404.html;
        error_page  500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
        
        location ~ \.php/?.* {
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
            include fastcgi_params;

            set $path_info "";
            set $real_script_name $fastcgi_script_name;
            if ($fastcgi_script_name ~ "^(.+?\.php)(/.+)$"){
                    set $real_script_name $1;
                    set $path_info $2;
            }
            fastcgi_param SCRIPT_FILENAME $document_root$real_script_name;
            fastcgi_param SCRIPT_NAME $real_script_name;
            fastcgi_param PATH_INFO $path_info;
        }

        location ~ /.ht {
            deny all;
        }

        location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
        {
            expires 10d;
        }

        location ~ .*\.(js|css)?$
        {
            expires 1d;
        }
    }

## 关闭selinux
修改/etc/sysconfig/selinux

    SELINUX=disabled

保存后重启

## 安装Redis
直接执行yum命令完成安装

    yum install redis

编辑/etc/redis.conf，修改redis目录及logfile存放目录：

    logfile /data/redislogs/redis.log
    dir /data/redisdata/

保存，然后对以上设置的两个目录赋予redis用户权限

    chown -R redis:redis /data/redislogs
    chown -R redis:redis /data/redisdata

为了安全，将部分命令设置为空，以禁止使用这些命令

    rename-command CONFIG ""
    rename-command FLUSHDB ""
    rename-command FLUSHALL ""

设置redis周期性将内容转储到硬盘上的频率

    save 900 1

继续对/etc/redis.conf文件进行配置，如果需要远程访问，可以设置每次访问redis都需要输入密码

    requirepass "inputyourstrongpassword"

编辑/etc/sysctl.conf，添加

    vm.overcommit_memery = 1
    net.core.somaxconn = 512

这里主要是避免系统内存机制导致redis数据被截断

## 配置站点防跨站隔离
为了在服务器上部署多个站点，同时每个站点只能访问自己目录下的内容（防止跨站访问其他站点的文件），需要对站点进行隔离。首先在全局范围进行限制，使PHP只能访问服务器指定目录

打开/etc/php.ini，找到open_basedir参数，设置如下：

    open_basedir = /data/wwwroot/:/tmp/:/proc/

这样只允许网页文件访问以上三个非系统目录（冒号分隔目录）

接着对每个站点进行单独配置，在站点根目录新建.user.ini文件，新增内容：

    open_basedir = /data/wwwroot/hi.ktsee.com/

这里的路径设置为站点自身的物理路径。接着保存即可。

## 升级到PHP 7（可选）
如果业务不考虑兼容老的应用，可以升级到php7，运行效率会得到提升。这里通过[IUS源][3]升级PHP7，首先导入源：

    cd ~
    curl 'https://setup.ius.io/' -o setup-ius.sh
    sudo bash setup-ius.sh

接着移除已经安装的php5及相关组件：

    yum remove php-fpm php-cli php-common

安装php7及相关组件：

    yum install php70u-fpm-nginx php70u-cli php70u-mysqlnd

修改/etc/php-fpm.d/www.conf文件，修改：

    ;listen = 127.0.0.1:9000
    listen = /run/php-fpm/www.sock

这里同时注意需要修改对应前面被覆盖掉的用户权限，新增listen.acl_users用户：

    user = ktseewww
    group = ktseewww
    listen.acl_users = ktseewww

修改/etc/nginx/nginx.conf文件，同样修改一下

    user ktseewww

接着修改/etc/nginx/conf.d/php.fpm：

    #server 127.0.0.1:9000;
    server unix:/run/php-fpm/www.sock;

在修改nginx站点配置文件/etc/nginx/conf.d/thinkphp.conf：

    #fastcgi_pass 127.0.0.1:9000;
    fastcgi_pass php-fpm;

修改配置完成后，重启一下nginx与php-fpm服务：

    systemctl restart nginx
    systemctl restart php-fpm

别忘了设置新安装的php-fpm开机自启动：

    systemctl enable php-fpm

## 安装composer（可选）

通过安装composer管理依赖包会大幅提高效率，首先下载：

    curl -sS https://getcomposer.org/installer | php //获取composer

这时使用使用php composer.phar就可以运行，

如果需要直接使用composer执行，则需要注册到系统运行路径中：

    mv composer.phar /usr/local/bin/composer   

这时直接使用composer运行即可。

## 安装YAF框架（可选）
下载yaf并编译成扩展文件，具体操作可以[参考此文][2]步骤，编译yaf.so文件。注意这里yaf.so需要存放在/usr/lib64/php/modules目录下。

这时为了将yaf.so加入php中，需要进入/etc/php.d目录，创建yaf.ini，写入

    ; Enable yaf extension module
    extension=yaf.so

保存后重启服务

## 结束
到此一个基本的LNMP环境就完成了


  [1]: https://nginx.org/en/linux_packages.html#stable
  [2]: http://hi.ktsee.com/547.html
  [3]: https://ius.io/