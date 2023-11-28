---
layout: post
title: AMH面板安装ownCloud注意事项
date: 2015-01-26 08:40:00
category: 服务器运维
permalink: /251.html
tags:
- AMH
- ownCloud
---

<!--markdown-->AMH面板安装ownCloud遇到诸多问题，经过各种搜索排查之后，总算是解决了。安装过程其实比较简单，只是在安装过程中，需要解决一下几个问题，然后按照常规方式安装ownCloud即可

### 重新编译加入php-pdo扩展

AMH面板自带的PDO_MYSQL-1.0.2插件在ownCloud安装界面提示出错

> SQLSTATE[HY000]: General error: 2014 Cannot execute queries while other unbuffered queries are active. Consider using PDOStatement::fetchAll(). Alternatively, if your code is only ever going to run against mysql, you may enable query buffering by setting the PDO::MYSQL\_ATTR\_USE\_BUFFERED\_QUERY attribute.

原因未知，解决办法是重新编译AMH的php并加入`--with-pdo-mysql=/usr/local/mysql/bin/mysql_config`，将php-pdo扩展也同时编译进去，如果你看到这里时尚未开始安装amh，可以将amh.sh脚本中的php编译那段稍作修改：

打开amh.sh，找到：

    ./configure --prefix=/usr/local/php --enable-fpm --with-fpm-user=www --with-fpm-group=www --with-config-file-path=/etc --with-config-file-scan-dir=/etc/php.d --with-openssl --with-zlib --with-curl --enable-ftp --with-gd --with-jpeg-dir --with-png-dir --with-freetype-dir --enable-gd-native-ttf --enable-mbstring --enable-zip --with-iconv=/usr/local/libiconv --with-mysql=/usr/local/mysql --without-pear $PHPDisable;
    

替换为：

    ./configure --prefix=/usr/local/php --enable-fpm --with-fpm-user=www --with-fpm-group=www --with-config-file-path=/etc --with-config-file-scan-dir=/etc/php.d --with-openssl --with-zlib --with-curl --enable-ftp --with-gd --with-jpeg-dir --with-png-dir --with-freetype-dir --enable-gd-native-ttf --enable-mbstring --enable-zip --with-iconv=/usr/local/libiconv --with-mysql=/usr/local/mysql --with-mysqli=/usr/local/mysql/bin/mysql_config --with-pdo-mysql=/usr/local/mysql/bin/mysql_config --without-pear $PHPDisable;
    

保存，继续amh.sh安装即可。

### 下载安装Pathinfo模块

在AMH模块扩展中心找到模块AMPathinfo-1.0，下载并安装，完成后打开pathinfo

### 导入符合Nginx的rewrite规则

根据ownCloud官网的规则，修改后如下：

    client_max_body_size 10G;
    rewrite ^/caldav(.*)$ /remote.php/caldav$1 redirect;
    rewrite ^/carddav(.*)$ /remote.php/carddav$1 redirect;
    rewrite ^/webdav(.*)$ /remote.php/webdav$1 redirect;
    
    location / {
        # The following 2 rules are only needed with webfinger
        rewrite ^/.well-known/host-meta /public.php?service=host-meta last;
        rewrite ^/.well-known/host-meta.json /public.php?service=host-meta-json last;
        rewrite ^/.well-known/carddav /remote.php/carddav/ redirect;
        rewrite ^/.well-known/caldav /remote.php/caldav/ redirect;
        rewrite ^(/core/doc/[^\/]+/)$ $1/index.html;
        try_files $uri $uri/ index.php;
    }
    
    location ~ ^(?<script_name>.+?.php)(?<path_info>/.*)?$ {
    try_files $script_name = 404;
    
    include fastcgi.conf;
    fastcgi_param PATH_INFO $path_info;
    fastcgi_pass unix:/tmp/php-cgi.sock;
    }
    

将以上代码保存为owncloud.conf，上传到/usr/local/nginx/conf/rewrite目录下，然后在虚拟主机的Rewrite 规则选中这个规则，保存即可。