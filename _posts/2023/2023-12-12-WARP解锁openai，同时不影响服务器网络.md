---
layout: post
title: WARP解锁openai，同时不影响服务器网络
date: 2023-12-12
category: Linux
excerpt: 本篇介绍了如何在不影响服务器本身网络的情况下，使用Cloudflare的Warp服务来安全访问网络和解锁OpenAI服务。内容包括安装Docker并配置Docker子网，使用Docker镜像启动Warp服务，以及测试Warp服务是否成功运行等。
permalink: /805.html
tags:
- VPS
- server
- linux
- WARP
- openai
---

Cloudflare是一个令人尊敬的企业，免费为大家提供优质的服务，这其中就包括它的warp服务。它不仅仅提供了PC和手机端的加密网络访问，同时也为Linux提供加密网络访问。具体的信息可以去[官网](https://1.1.1.1/)查询。这里surenkid主要想介绍的是，如何在服务器上，不影响本身网络的前提下，解锁openai网络。

## 安装docker

首先，你需要安装docker，因为接下来介绍的方法是基于docker容器运行的。安装方法很简单，使用官网的脚本即可：

```bash
bash <(curl -Ls https://get.docker.com)
```

国内服务器可以使用aliyun的镜像源加入，命令改为如下：

```bash
bash <(curl -Ls https://get.docker.com) --mirror Aliyun
```

安装完成后，创建一个子网：
```
docker network create internalnet
```

## 启动warp服务

这里使用打包好的镜像，该镜像的优点是，docker运行时无需提供额外的宿主机权限，仅在容器内部通过socat转发暴露端口。

终端中执行以下命令启动warp服务：
```bash
docker run -d \
  --name warp-cli-$USER \
  --restart unless-stopped \
  --cpus 0.12 \
  --memory 256M \
  --network internalnet \
  -e USER_UID=1000 \
  -e USER_GID=1000 \
  -p 65535:65535 \
  surenkid/warp-cli:20230706
```

 启动之后，服务器便开启了一个端口号为65535的socket代理。

## 测试warp

使用以下命令，可以测试warp是否成功运行：

```bash
curl --socks5-hostname 127.0.0.1:65535 cip.cc
```

对比一下不使用warp时的ip：

```bash
curl cip.cc
```

## 解锁openai

在服务器上部署你喜欢的openai服务，使用`socks://127.0.0.1:65535`作为本地代理即可。这一步相信大部分人都已经很熟悉了，毕竟从3月大火到现在已经过去9个多月了。

这样就完成了warp的部署，看起来很简单不是？