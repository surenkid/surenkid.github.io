---
layout: post
title: Debian安装davfs2挂载webdav空间
date: 2014-10-01 14:04:00
category: 架构设计
permalink: /79.html
tags:
- webdav
---

<!--markdown-->国外一家老牌网盘稳定性很好，但是国内访问速度很慢，网上找到了Debian安装davfs2挂载webdav空间的方法，挂载成功后可以像操作本地文件一样使用终端命令，同时还可以使用ftp管理文件，甚至使用nginx作为前端提供外链也没问题……跑题了，那么来看一下如果安装和配置davfs2吧

首先Debian下直接使用命令安装davfs2

    apt-get install davfs2 -y
    

这样就安装完成了，安装完成后，可以使用mount.davfs命令记性挂载了，如：

    mount.davfs https://www.your_webdav_url.com /mnt
    

之后，根据提示输入认证账户名及密码即可，你可以通过df -h查看空间容量，也可以进行所有其他的操作。

如果需要自动挂载，需要做一下配置，编辑/etc/davfs2/davfs2.conf文件，加入或修改use_locks值为0

    use_locks 0
    

同时编辑/etc/davfs2/secrets，加入webdav地址和认证账户密码等信息

    https://www.your_webdav_url.com 账户 密码
    

这样，之后执行

    mount.davfs https://www.your_webdav_url.com /mnt
    

这时就不需要输入账户和密码了，同时将上面这行代码加入到/etc/rc.local以便于开机时自动挂载，注意还是要放在exit 0上面