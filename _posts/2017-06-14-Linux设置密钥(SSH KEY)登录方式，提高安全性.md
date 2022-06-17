---
layout: post
title: Linux设置密钥(SSH KEY)登录方式，提高安全性
date: 2017-06-14 03:26:00
category: 服务器运维
permalink: /652.html
tags:
- ssh
- openssl
---

<!--markdown--># 前言

对于Linux服务器，默认以密码登陆，安全性比较差，很早前就有计划修改为使用密钥登陆，一直觉得比较麻烦搁置着，其实步骤并不难，只是当时没觉得安全问题有那么严重而已。如果你也是这么认为，那么可以尝试登陆Linux服务器，输入以下命令：

    lastb | less

然后你会看到以下的情形：

![登陆失败记录][1]

这里显示的是尝试登陆，但是登陆失败的记录。可以看到几乎每天都会有大量的尝试登陆存在。为了服务器安全，禁止密码登陆，使用密钥方式登陆还是必要的。这里我尽量简单的记录下我设置的过程。

# 生成密钥
由于密钥是这里最为重要的部分，所以生成密钥务必亲自动手，切勿使用第三方不靠谱的服务生成。

## Windows
如果你在Windows平台，那么直接去下载putty，使用其中的PuTTYgen生成即可。注意，一定不要从任何第三方网站下载。

官网下载：[https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html][2]

这里操作比较简单，生成完成后，分别保存公钥和私钥即可。

## Linux/MacOS

使用`ssh-keygen`生成，输入以下命令：

    ssh-keygen -t rsa

之后会在`~/.ssh/`目录下生成两个文件，其中`id_rsa`是私钥，`id_rsa.pub`是公钥，分别保存以备用。

# 上传公钥并配置服务器

## 配置上传生成的公钥

登陆需要配置密钥登陆的服务器，将公钥内容填入`~/.ssh/authorized_keys`文件中：

    cd ~/.ssh/
    vi authorized_keys

保存后，对`.ssh`目录和其中的`authorized_keys`公钥文件设置相应的权限：

    chown -R 0700  ~/.ssh
    chown -R 0644  ~/.ssh/authorized_keys

## 配置ssh服务以使用密钥登陆

接着修改`ssh`配置文件：

    vi /etc/ssh/sshd_config

对以下内容去掉注释：

    StrictModes no
    RSAAuthentication yes 
    PubkeyAuthentication yes 
    AuthorizedKeysFile    .ssh/authorized_keys

保存后重启sshd服务：

    systemctl restart sshd

退出重新登陆服务器，这次使用密钥登陆，测试是否成功。

## 关闭原密码登陆方式

如果使用密钥登陆成功，可以继续修改`ssh`配置文件，关闭密码登陆：

    vi /etc/ssh/sshd_config

设置：

    PasswordAuthentication no

保存后重启sshd服务的步骤同上，这样就完成了密钥登陆的配置。

# 结语
其实除了安全性的提升，在使用方面反而比以前更方便了。登陆只需要载入证书，然后点击连接即可。如果怕密钥丢失引起问题，可以在私钥文件本身加上一个密码，每次登陆时就可以再验证一次密码。这样，基本已经能满足日常的安全需求了。


  [1]: https://static.ktsee.com/s1/2017/06/20170614112937793.png
  [2]: https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html