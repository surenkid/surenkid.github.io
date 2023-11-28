---
layout: post
title: AMH添加HTTPS，使用Let's Encrypt部署并自动更新，优化SSL配置
date: 2017-03-25 08:03:00
category: 服务器运维
permalink: /631.html
tags:
- AMH
- nginx
- https
---

<!--markdown-->从苹果官方强制https接口开始，今年的https安全变的更加火热。之前的Let's Encrypt免费https证书越发完善起来，而且随着XP以及Android 2等老旧的系统慢慢的淡出主流的市场，我觉得是可以尝试为自己的网站部署全站https的时候了。

由于我这里用AMH4.2（一个稳定的LNMP平台）部署，所以这里也是以这个平台为例，记录一下我部署全站https，使用脚本自动更新Let's Encrypt证书，并且根据[ssllabs的评级测试][1]进行优化，给同样需要切换https的同学一个参考。

这里插一句，那天看到一条笑话挺有意思，说各大运营商为了推动https做出了巨大的努力，想想确实如此:D
不多说开始吧

# 使用脚本签署并自动更新Let's Encrypt的https证书

因为证书打算采用Let's Encrypt的证书，因此需要选择签署与更新脚本。最好的选择应该是官方的[certbot][2]，而我这里其实用的是[另一个][3]比较小巧的脚本，针对AMH做了一定的修改。

![Let's Encrypt][4]

## 下载证书签署与更新脚本

首先下载脚本，进入`~/letsencrypt/`目录，下载并赋予执行权限：

    wget https://raw.githubusercontent.com/xdtianyu/scripts/master/lets-encrypt/letsencrypt.sh
    chmod +x letsencrypt.sh

根据需要设置https的网站设置不同的配置文件，我这里需要设置的域名分别有3sv.ktsee.com和hi.ktsee.com，因此需要新建`let3sv.conf`和`lethi.conf`两个配置文件（命名可以随意）

接着编辑配置文件，这里以`let3sv.conf`为例，添加内容如下：

    ACCOUNT_KEY="letsencrypt-account.key"
    CERT_NAME="certfilename"
    DOMAIN_KEY="3sv.key"
    DOMAIN_DIR="/home/wwwroot/path/web"
    DOMAINS="DNS:3sv.ktsee.com"

- `ACCOUNT_KEY`对应公钥，一般不用修改。
- `CERT_NAME`是我修改后新加的参数，用于与AMH中BBShijieSSL-1.1插件自动生成的SSL证书文件名对应。
- `DOMAIN_KEY`是为该域名签署生成的key文件名
- `DOMAIN_DIR`是网站内容具体存放的路径，实际可以通过3sv.ktsee.com访问到
- `DOMAINS`是签署的域名，如果该站点绑定多个域名，可以使用逗号同时签多个域名
    -（例子`DOMAINS="DNS:3sv.ktsee.com,DNS:hi.ktsee.com"`）

## 配置AMH后台HTTPS插件

在AMH后台开启BBShijieSSL-1.1插件，配置3sv.ktsee.com和hi.ktsee.com两个站点的ssl证书，内容可以先随意填写

![插件界面][5]

保存即可，注意pem和crt文件名前缀部分要和刚刚上面`CERT_NAME`参数保持一致。

## 修改脚本的部分代码

编辑之前下载的脚本文件`letsencrypt.sh`，在文件最后添加：

    yes | cp $DOMAIN_CHAINED_CRT /usr/local/nginx/conf/ssl/$CERT_NAME.crt
    yes | cp $KEY_PREFIX.key /usr/local/nginx/conf/ssl/$CERT_NAME.pem
    echo -e "\e[01;32mUpdate cert: $CERT_NAME.pem and $CERT_NAME.crt has been updated\e[0m"

这样脚本将会把生成的证书按照AMH插件的路径直接复制过去。

## 开始签署证书

这里我有3sv.ktsee.com和hi.ktsee.com两个站点，对应两个配置文件分别为`let3sv.conf`和`lethi.conf`，因此分别执行：

    ./letsencrypt.sh let3sv.conf
    ./letsencrypt.sh lethi.conf

完成后进入AMH后台，之前我们随意填写的内容就已经被自动替换为实际证书的内容，这里我就不截图了。

## 设置自动更新计划任务

最后配置一下自动更新，`crontab -e`编辑计划任务，添加：

    0 0 1 * * ~/letsencrypt/letsencrypt.sh ~/letsencrypt/let3sv.conf >> /var/log/let3sv.log 2>&1
    5 0 1 * * ~/letsencrypt/letsencrypt.sh ~/letsencrypt/lethi.conf >> /var/log/lethi.log 2>&1
    10 0 1 * * amh nginx restart

这样每个月执行一次更新，基本可以保证https证书的时效问题。

# 为Nginx优化SSL配置

## 关闭SSLv3协议

开启https后，SSLv3协议很容易遭受Poodle攻击，所以一般最好关闭。

编辑`/usr/local/nginx/nginx.conf`，添加一行：

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

重启Nginx服务后完成配置。

## 生成更强的DH-key

正常SSL证书都是RSA证书，这其中涉及到了证书密钥交换密钥，简称DH-key。只有DH-key比要加密的密钥更长才能更加安全，因此这里需要配置一下强DH-key。

首先进入Nginx配置目录，生成强DH-key：

    cd /usr/local/nginx/conf/
    openssl dhparam -out dhparam.pem 4096

然后编辑`/usr/local/nginx/nginx.conf`，添加一行：

    ssl_dhparam /usr/local/nginx/conf/dhparam.pem;

重启Nginx服务后完成配置。

## 配置Cipher suite

这个是兼容大多数浏览器的加密套件，编辑`/usr/local/nginx/nginx.conf`，添加一行：

    ssl_ciphers "ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4";

继续添加：

    ssl_prefer_server_ciphers on;

这里是优先使用服务器支持的加密套件，重启Nginx服务后完成配置。

## 开启SSL Session缓存

主要用于当连接断开时，如果开启缓存，则可以恢复连接，无需重新建立加密过程，可能一定程度上缓解了CPU压力，但线程开销可能有所加大。这里的10M指的的是10MB内存空间。

同样编辑`/usr/local/nginx/nginx.conf`，添加一行：

    ssl_session_cache shared:SSL:10m;

重启Nginx服务后完成配置。

到这里，基本已经配置完毕了，接下来可能还需要考虑全站的图片，视频，js，css等引入文件的处理，需要引入的文件均不能继续使用http协议。这个过程是需要一定时间的，因此可以看到本站目前还没有开启HSTS，等一切准备妥当在考虑切换吧。


  [1]: https://www.ssllabs.com/ssltest
  [2]: https://github.com/certbot/certbot
  [3]: https://github.com/xdtianyu/scripts/tree/master/lets-encrypt
  [4]: https://letsencrypt.org/images/letsencrypt-logo-horizontal.svg
  [5]: https://static.ktsee.com/s1/2017/03/20170325172702909.png