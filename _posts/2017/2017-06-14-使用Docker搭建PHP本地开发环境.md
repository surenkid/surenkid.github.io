---
layout: post
title: 使用Docker搭建PHP本地开发环境
date: 2017-06-14 04:05:00
category: 架构设计
permalink: /655.html
tags:
- Ubuntu
- ThinkPHP
- MySQL
- nginx
- php-fpm
- redis
- 安装
- var
- 问题
- docker
- tar
- root
- pwd
---

<!--markdown-->每次换一台新电脑，或者强迫症的重装了一次系统之后，就必须重新配置一下本地的开发环境。对于配置本地开发环境，从很早以来就有多种方案，包括：

1. 从PHP, MySQL等官网下载并手工安装配置
2. 使用Windows自带的Web Pi一键式安装
3. 使用XAMPP，phpStudy之类的一键包
4. 使用VirtualBox安装开发专用集成镜像

现在多了另一种更方便的方法，就是使用docker。其实上面的方式也都是可以的，第一种可能有些麻烦，第二种对于生产为Linux平台来说，可能出现环境不一致导致的问题。第三种是比较方便的，此前我一直比较喜欢。而第四种则需要比较高配一些的电脑，整个开发IDE都放置在镜像中，基本相当于在电脑里内置了另一台开发机了。

使用Docker配置开发环境，原理上来说其实类似于第四种，但是由于Docker的特性，占用资源基本感觉不到虚拟机的存在（特指Win和Mac平台，如果你的开发平台是Linux的话，则连这个问题都不存在）。另外一个就是Docker的扩展性比较好，使用网上现成的官方镜像组合一下，就能快速变更开发环境，就像从苹果的APP STORE上下载软件一样。

废话不多说，接下来就直接开始使用Docker搭建PHP本地开发环境吧

# 安装Docker

根据不同平台去官网下载不同的版本即可：

官网：https://www.docker.com/community-edition

其中Windows平台需要Win10，否则可能需要安装[Docker Toolbox][1]

安装完毕后，托盘中有如图所示，表示已经正常运行：

![Docker正常运行][2]

# 配置Docker

## 配置国内源
首先要做的是设置一下docker hub的国内源，否则下载镜像的速度可以让人抓狂。这里推荐[daocloud.io][3]以及[aliyun][4]的加速器，配置步骤登录对应的账号后，根据其文档进行配置即可。

## 获取Docker Compose配置文件
这里以ThinkPHP 3.2 自用开发环境为例，对应的组件为Nginx1.12 + PHP5.3.29(php-fpm) + MySQL5.6.36 + Redis 3.0。

首先创建在我的文档中创建一个docker-dev目录，然在该目录中创建`docker-compose.yml`文件，填入：

	version: "3"
	services:
	  nginx:
		image: nginx:1.12-alpine
		container_name: tp3-nginx
		ports:
		  - "80:80"
		networks:
		  - dockerinnernet
		depends_on:
		  - "php"
		volumes:
		  - ~/docker_data/nginx:/etc/nginx/conf.d
		  - ~/docker_data/wwwroot:/var/www/html:ro

	  php:
		image: surenkid/php53:latest
		container_name: tp3-php
		ports:
		  - "9000:9000"
		networks:
		  - dockerinnernet
		depends_on:
		  - "mysql"
		  - "redis"
		volumes:
		  - ~/docker_data/wwwroot:/var/www/html

	  mysql:
		image: mysql:5.6.36
		container_name: tp3-mysql
		ports:
		  - "3306:3306"
		networks: 
		  - dockerinnernet
		volumes:
		  - mydata:/var/lib/mysql
		  - ~/docker_data/dbdump:/root
		environment:
		  MYSQL_ROOT_PASSWORD: "hi_ktsee_com"

	  redis:
		image: redis:3.0-alpine
		container_name: tp3-redis
		ports:
		  - "6379:6379"
		networks: 
		  - dockerinnernet
		volumes:
		  - ~/docker_data/redis:/data

	networks: 
	  dockerinnernet:
	volumes:
	  mydata:

保存即可。

在我的[github][5]中有我自己常用的两个PHP环境配置文件，可以直接拿来使用，后期我也会根据工作需求增加新的配置。

## 运行Docker环境
接下来打开终端，在命令行中执行：

    docker-compose up

Docker会自动根据配置运行对应找到需要的镜像开始创建容器，由于这里是第一次运行，所以会从Docker hub下载对应的镜像。由于前面配置了加速器，这里的下载速度应该是可以的。

等待下载并运行完成后，基本的开发环境就已经搭建成功。如果你打算开始一个新的项目，现在就可以在我的用户文件夹中，进入`docker_data/wwwroot`文件夹开始编码了。

注意：这里由于我们已经把nginx的配置文件目录暴露到本地，因此需要在本地~/docker_data/nginx目录中新建一个default.conf的nginx配置文件，文件内容如下：

    server {
       listen       80;
       server_name  localhost;
    
       location / {
           root   /var/www/html;
           index  index.html index.htm;
       }
    
       location ~ \.php$ {
           root           /var/www/html;
           fastcgi_pass   php:9000;
           fastcgi_index  index.php;
           fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
           include        fastcgi_params;
       }
    }

之后使用docker-compose命令重启docker项目即可。

# 备份还原docker环境中的开发数据
如果你之前在其他机器中的dockerhu环境中就有一个开发中的项目，现在需要把以前的数据导入继续开发，那么就需要继续下面的步骤。

## 备份开发数据
参考[官方的说明][6]，使用ubuntu镜像来打包备份其中的数据，首先创建一个一次性ubuntu镜像实例，将/root目录映射到本地磁盘，然后在镜像中将对应的数据备份到映射的路径(即/root)，之后就可以在本地磁盘中看到备份的数据文件。备份命令格式：

    docker run -rm --volumes-from 需要备份的实例 -v $(pwd):/root ubuntu bash -c "cd /需要备份的数据目录 && tar cvzf /root/备份.tar.gz *"

如：

    docker run --rm --volumes-from zf2-mysql -v $(pwd):/root ubuntu bash -c "cd /var/lib/mysql && tar cvzf /root/mysql.tar.gz *"
    
    docker run --rm --volumes-from zf2-postgres -v $(pwd):/root ubuntu bash -c "cd /var/lib/postgresql/data && tar cvzf /root/pgsql.tar.gz *"
    
    docker run --rm --volumes-from zf2-solr -v $(pwd):/root ubuntu bash -c "cd /opt/solr/server/solr/mycores && tar cvzf /root/solr.tar.gz *"
    
    docker run --rm --volumes-from zf2-webserver -v $(pwd):/root ubuntu bash -c "cd /zf2-app && tar cvzf /root/www.tar.gz *"

如果平台为当前宿主主机的操作系统是Windows，需要将其中的`$(pwd)`改为`%cd%`。

## 还原开发数据

恢复备份数据到docker实例则刚好相反，需要注意的是，恢复时最好将实例停止，防止出现数据冲突。恢复命令格式：

    docker run --rm --volumes-from 需要恢复的实例 -v $(pwd):/root ubuntu bash -c "cd /需要还原数据的目录 && tar xvzf /root/备份.tar.gz"

例如：

    docker run --rm --volumes-from zf2-mysql -v $(pwd):/root ubuntu bash -c "cd /var/lib/mysql && tar xvzf /root/mysql.tar.gz"
    
    docker run --rm --volumes-from zf2-postgres -v $(pwd):/root ubuntu bash -c "cd /var/lib/postgresql/data && tar xvzf /root/pgsql.tar.gz"
    
    docker run --rm --volumes-from zf2-solr -v $(pwd):/root ubuntu bash -c "cd /opt/solr/server/solr/mycores && tar xvzf /root/solr.tar.gz"
    
    docker run --rm --volumes-from zf2-webserver -v $(pwd):/root ubuntu bash -c "cd /zf2-app && tar xvzf /root/www.tar.gz"

这样基本的开发环境就算是完成了。

  [1]: https://www.docker.com/products/docker-toolbox
  [2]: https://static.ktsee.com/s1/2017/06/20170614122156939.png
  [3]: https://www.daocloud.io/mirror
  [4]: https://cr.console.aliyun.com/#/accelerator
  [5]: https://github.com/surenkid/docker-dev/
  [6]: https://docs.docker.com/engine/tutorials/dockervolumes/#backup-restore-or-migrate-data-volumes