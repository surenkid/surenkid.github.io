---
layout: post
title: 使用git结合bitbucket私有仓库进行版本控制
date: 2015-09-07 08:20:00
category: 软件应用
permalink: /444.html
tags:
- git
- bitbucket
---

<!--markdown-->### 初始化本地git仓库

首先在使用前先设置一下git用户信息

    git config --global user.name "youname"
    git config --global user.email yourname@example.com
    

然后本地初始化git仓库，进入到项目目录，执行

    git init
    

### 创建.gitignore忽略文件

在项目根目录下创建.gitignore文件用于忽略某些文件及文件夹的提交，这个功能是很强大的。在项目开发中，config文件以及一些log文件是不需要上传到远端服务器上的，一来可能透露隐私，二来文件过于细碎，上传较慢，对这些文件进行版本控制是完全没有意义的，所以我们需要忽略掉这些文件。

通过ThinkPHP的.gitignore文件来简单看一下写法

    # Other
    /ErrorPages/
    /Public/
    # ThinkPHP3.2.3
    # Logs and Cache files
    /Application/Runtime/
    # Common configure file
    /Application/Common/Conf/config.php
    

这里排除的是文件夹与文件，同时可以对文件做通配符设置，如*.log则表示排除所有以.log为后缀的文件。编写完成后保存至项目的根目录下。

对于已经完成commit加入git的文件，需要使用`git rm --cached`命令从缓存中删除，应用.gitnore文件的规则。参考[这篇文章][1]：

如果需要从缓存中删除单个文件，输入

    git rm --cached <file>
    更新 .gitignore 忽略掉目标文件 
    git commit -m "We really don't want Git to track this anymore!"
    

如果需要完全清空缓存，重新提交，则输入

    git commit -m 'any changes'
    git rm -r --cached .
    git add .
    git commit -m ".gitignore is now working"
    

### 连接bitbucket

首先需要在本地生成ssh密钥

    ssh-keygen -t rsa -C "email@email.com"
    

注意这里的email必须是和bitbucket的账户email一致。一路回车下去，会在/root/.ssh/目录下生成两个文件，将其中id_rsa.pub保存的公钥内容复制，添加到bitbucket管理账户里的SSH密钥中，保存，完成SSH公钥的添加。

接着测试并添加bitbucket远程服务器

    ssh -T git@bitbucket.org
    git remote set-url origin git@bitbucket.org:xxxxx/xxxx.git.
    

这样就完成了bitbucket远程服务器的连接。

 [1]: http://laozhan.net/2015/01/gitignore-npmignore/index.html