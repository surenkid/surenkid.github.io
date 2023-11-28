---
layout: post
title: 个人搭建的MineCraft服务器
date: 2015-03-10 09:58:00
category: 架构设计
permalink: /281.html
tags:
- MineCraft
---

<!--markdown-->## MineCraft服务器信息

在描述安装过程前，容许我公布一下服务器信息，有看到的同学可以偶尔进来玩玩，客户端的话，下载[mcsky.net的整合包][1]就可以。（随便PS了一下，没想到如今还能P点东西出来:D）

![MineCraft服务器信息][2]

### 联网服务器信息
见上面的图片，注意不要忘记端口。

### 客户端下载
由于mcsky.net网站无法访问，故我重新提供客户端下载，这里是MineCraft 1.7.10整合包，整合了JRE和启动器，直接就可以运行，下载以下三个分卷包后，请使用[zip][3]解压

下载：[Minecraft1.7.10_client.zip][6]

## 简短回忆玩麦块的时光

其实早几年就已经玩过MineCraft（以下简称MC）服务器，记得当时玩的很是疯狂，为了和几个朋友一起玩，特地用了一个测试电脑当服务器用，由于当时的环境是内网转发，加上测试服务器不稳定，玩一段时间就需要重启服务器，玩起来苦不堪言，但即使如此，我，鸟和猪也一起在MC的世界里完了很久，搭建了整个村落，甚至还进入了下界，记得刚进入下界时那份担心，只在下界的出口建造了一个全封闭的房子，偶尔敲个洞打开看看，觉得紧张不已。

然而，随着测试服务器的报废，在邮箱里备份的资料也因为当时存储空间不足，采用的是QQ邮箱中转站，导致档案失效无法下载，于是之前的地图档案和资料已经永远无法找回了。

如今在看了MC的视频之后，又再次燃起了筑造梦想世界的想法，虽然现在游戏的时间不如以前多了，就当作一个值得休闲的地方，偶尔玩一玩吧。

## 开始搭建服务器

### 服务器选用

这次服务器采用的不在是多年前的CreaftBukkit（水桶服务器），而是使用了更加稳定了低内存占用的Spigot，服务器上也使用了百度云提供的VPS，服务期到3年半以后，稳定性足够长期玩了。配置上虽然不高，但是考虑只搭建给几个死党玩，人数并不多，已经足够了。

![百度开放云服务器][4]

### JRE环境安装

Windows下搭建非常的简单，首先下载安装JRE，这里根据自己系统的版本选择相应的JRE版本下载

下载JRE：<http://java.com/zh_CN/download/manual.jsp>

下载后安装即可。

### MC服务器安装

安装完JRE之后，下载Spigot，由于一系列GPL协议授权的纠纷，官网不在提供服务端下载，需要通过其提供的工具自行编译。这里我在[这篇文章里][5]找到一个编译好的可用的版本，直接下载到了spigot-1.7.10.jar服务端文件。

有朋友反馈原始文章里的链接已经无法下载，因此我这里放上之前下载过的1.7.10服务端：

下载：[spigot-1.7.10.jar][6]

在服务器上新建一个文件夹（我这里新建了spigot文件夹），将spigot-1.7.10.jar上传到这个文件夹内，同时新建一个.bat批处理文件，写入如下内容，保存在这个文件夹内：

    @ECHO OFF
    java -jar -Xmx512m -Xms512m -XX:MaxPermSize=256M -Dfile.encoding=utf-8 -Duser.timezone=Asia/Hong_Kong spigot-1.7.10.jar
    pause
    

这里-Xmx512m和-Xms512m，是指MC服务端最大可以和最小可以使用的内存，MaxPermSize=256M这个值含义并不是太清楚，一般设置为物理内存的1/4，后面的是编码和时区。

保存后运行这个.bat批处理文件，第一次运行后，会自动结束退出。这时文件夹内会自动生成一些文件，打开生成的eula.txt，将其中的eula=false改为eula=true，保存，再次运行.bat批处理文件，这时会自动开始生成游戏世界地图，完成后，服务器的安装就完成了

### MC服务器配置

在命令行里输入stop，停止运行服务端，然后编辑server.properties，参考以下的注释对服务端进行相应参数配置（以下注释来自[这里][7]）。

    #Minecraft server properties
    #Tue Jul 08 10:45:07 HKT 2014
    generator-settings=                 #用於设置超平坦世界的函数，留空即可
    op-permission-level=4               #设置OP的许可权等级
    allow-nether=true                   #是否允许生成/进入下界
    level-name=world                    #世界名称及其文件夹名
    enable-query=false                  #允许使用GameSpy4协议的服务器监听器（用於收集服务器信息）
    allow-flight=false                  #是否允许玩家在生存模式透过MOD飞行
    announce-player-achievements=true   #是否公开显示玩家成就
    server-port=25565                   #服务器端口（默认为25565）
    level-type=DEFAULT                  #世界类型
    enable-rcon=false                   #是否允许远程访问服务器仪表盘
    level-seed=                         #世界种子
    force-gamemode=false                #玩家是否总是以默认游戏模式进入服务器
    server-ip=                          #服务器IP，一般来说留空即可
    max-build-height=256                #最高建筑高度（最高256）
    spawn-npcs=true                     #是否生成村民NPC
    white-list=false                    #是否开启白名单认证
    spawn-animals=true                  #是否生成动物
    hardcore=false                      #是否开启极限模式
    snooper-enabled=true                #是否允许服务器定期发送统计数据
    online-mode=true                    #是否开启正版认证（开启后只有正版玩家可进入）
    resource-pack=                      #资源包URL（可让玩家选择是否使用服务器提供的资源包）
    pvp=true                            #可否PVP
    difficulty=1                        #难度
    enable-command-block=false          #是否可以使用命令方块
    gamemode=0                          #默认游戏模式
    player-idle-timeout=0               #如果该玩家无反应超过设置值（单位：分钟），将会被踢出
    max-players=20                      #最大玩家数量
    spawn-monsters=true                 #是否生成怪物
    generate-structures=true            #是否生成建筑物
    view-distance=10                    #客户端视野距离的上限
    motd=A Minecraft Server             #服务器在服务器列表页所显示的信息
    

配置完成后保存，重新双击.bat批处理文件运行服务端。

### 客户端配置

客户端这里用的是mcsky.net的整合包，下载后直接运行，选择与服务器对应的版本（我这里是1.7.10），然后在多人游戏里填入服务器IP和端口号，进入游戏，开始愉快的玩耍吧。

![KTSee.com MineCraft Server][8]


  [1]: http://www.mcsky.net/
  [2]: https://static.ktsee.com/s1/2016/12/20161227143302850.jpg
  [3]: http://www.7-zip.org/download.html
  [4]: https://static.ktsee.com/s1/2016/05/20160502120928542.png
  [5]: http://mcmodteam.blogspot.com/2014/10/bukkit-and-spigot-minecraft-18-and-1710.html
  [6]: http://3sv.ktsee.com/viewthread.php?tid=2908
  [7]: http://www.arefly.com/spigot/
  [8]: https://static.ktsee.com/s1/2016/05/20160502120940433.png