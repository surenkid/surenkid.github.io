---
layout: post
title: AMH面板中ambmail加密分卷附件解压方法
date: 2014-11-04 01:47:00
category: 软件应用
permalink: /138.html
tags:
- AMH
---

<!--markdown-->网上几个面板都有大概的用过，AMH面板由于针对对象为个人用户，所以它的低内存占用，远程备份等功能吸引了不少个人用户。我在使用中比较喜欢的是AMBmail这个远程备份插件，它可以将服务器备份通过邮件附件形式发送到邮箱保存，如果备份文件过大，还可以自动分卷发送（记得调整postfix的最大发送附件限制，直接使用命令`echo "message_size_limit = 102400000" >>/etc/postfix/main.cf && service postfix reload`）。使用方法比较简单，这里不做说明，主要想记录的是用AMBmail备份后的加密分卷如何解压。

在邮箱里可以看到y-20141104-080001.amh.000,y-20141104-080001.amh.001,y-20141104-080001.amh.002等等这样的分卷附件。下载下来后，现在有个问题，我们该如何解压呢

### 合并分卷

参考论坛里的[回复][1]，直接将所有文件放置在同一路径下，然后在Linux终端输入命令：

    cat y-20141104-080001.amh.* > backup.tar.gz
    

这样就会将分卷文件合并

### 解压备份文件

如果备份文件没有加密，直接

    tar xvzf backup.tar.gz
    

如果备份文件有密码，输入（password替换成你的密码）

    openssl des3 -d -k password -salt -in backup.tar.gz | tar xzf -

20190606更新：在openssl1.1.1下，需要添加-md md5参数解压

    openssl des3 -d -k password -md md5 -salt -in backup.tar.gz | tar xzf -


这样就提取了备份的档案

 [1]: http://amh.sh/bbs/forum.php?mod=redirect&goto=findpost&ptid=1166&pid=8118