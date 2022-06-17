---
layout: post
title: Linux上搭建饥荒联机版Don't Starve Together服务器
date: 2016-12-05 03:15:00
category: 架构设计
permalink: /608.html
tags:
- wget
- Ubuntu
- tar
- klei
- run_shared
- steam
- 服务器
- mod
---

<!--markdown-->最近的小伙伴开始迷上饥荒这个游戏，甚至不惜重金买来人生的第一份正版游戏，显然在我的鼓动之下，大家买的都是STEAM版本，秋季促销双人份31元，还是比较不错的。这里要说的是搭建STEAM正版用户的联机服务器。（如果你还没购买，或者购买了TGP版本的游戏，估计是无法使用这里的步骤进行搭建和游玩的）

![Don't Starve Together][1]

# 配置服务器Linux环境
这里用的是Ubuntu，根据不同环境安装不同的依赖库

Ubuntu 64位环境：

    sudo apt-get install libstdc++6:i386 libgcc1:i386 libcurl4-gnutls-dev:i386

Ubuntu 32位环境：

    sudo apt-get install libstdc++6 libgcc1 libcurl4-gnutls-dev

# 安装STEAMCMD命令行平台及游戏包
下载SteamCMD：

    mkdir ~/steamcmd
    cd ~/steamcmd
    wget http://media.steampowered.com/installer/steamcmd_linux.tar.gz
    
你也可以使用饥荒官网提供的精简版SteamCMD：

    wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz

接着解压并运行安装：

    tar -xvzf steamcmd_linux.tar.gz
    ./steamcmd.sh

在`steam>`模式下，登录及安装游戏包

    login anonymous
    force_install_dir ../dstserver
    app_update 343050 validate
    quit

上面的命令中，第一行以匿名方式登录，当然你也可以登录你自己的SteamID，然后第三行的`343050`是Don't Starve Together在Steam平台中的ID。

等待更新结束后，平台和游戏包就安装好了，已经完成了一半的工作，接下来是配置了。

# 配置Don't Starve Together
## 生成默认配置文件

    cd ~/dstserver/bin
    ./dontstarve_dedicated_server_nullrenderer

当看到以下提示

    [200] Account Failed (6): "E_INVALID_TOKEN"
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    !!!! Your Server Will Not Start !!!!
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

按Ctrl+C中断，然后完善生成的默认配置

## 设置Token
这里由于搭建的Steam平台的正版服务器，需要在游戏中获取一个Token，正常进入Don't Starve Together游戏，然后选择我的资料，在弹出的页下方可以生成token，复制到cluster_token.txt中

    cd ~/.klei/DoNotStarveTogether/MyDediServer
    vi cluster_token.txt

粘贴后保存该文件

## 设置服务器全局配置
    
    cd ~/.klei/DoNotStarveTogether/MyDediServer
    vi cluster.ini

填入以下内容：

    [GAMEPLAY]
    game_mode = survival
    max_players = 6
    pvp = false
    pause_when_empty = true
    
    [NETWORK]
    cluster_description = KTSee.com DST Server
    cluster_name = KTSee.com DST Server
    cluster_intention = cooperative
    cluster_password = 
    
    [MISC]
    console_enabled = true
    
    [SHARD]
    shard_enabled = true
    bind_ip = 127.0.0.1
    master_ip = 127.0.0.1
    master_port = 10889
    cluster_key = supersecretkey

注意上面的`cluster_name`是服务器房间名，`cluster_password`是服务器房间密码，可以自行修改.

## 设置局部配置

    cd ~/.klei/DoNotStarveTogether/MyDediServer/Master
    vi server.ini

填入

    [NETWORK]
    server_port = 11000
    
    [SHARD]
    is_master = true
    
    [STEAM]
    master_server_port = 27018
    authentication_port = 8768

接着在改洞穴部分

    cd ~/.klei/DoNotStarveTogether/MyDediServer/Caves
    vi server.ini

填入

    [NETWORK]
    server_port = 11001
    
    [SHARD]
    is_master = false
    name = Caves
    
    [STEAM]
    master_server_port = 27019
    authentication_port = 8769

## 增加Mod（可选）

这里只加载了一个全局地图定位的Mod，加载其它可以根据Steam社区中Mod地址URL中的ID替换

创建下载Mod的脚本

    cd ~/.klei/DoNotStarveTogether/MyDediServer
    vi dedicated_server_mods_setup.lua

填入
         
    ServerModSetup("378160973")
    --ServerModCollectionSetup("id")

创建Mod配置文件

    cd ~/.klei/DoNotStarveTogether/MyDediServer/Master
    vi modoverrides.lua

填入

    return {
    ["workshop-378160973"] = { enabled = true }
    }

同样创建洞穴部分的

    cd ~/.klei/DoNotStarveTogether/MyDediServer/Caves
    vi modoverrides.lua

填入

    return {
    ["workshop-378160973"] = { enabled = true }
    }

## 启动服务器

创建启动服务器脚本

    cd ~/
    vi rundst.sh

填入

    #!/bin/bash
    
    steamcmd_dir="$HOME/steamcmd"
    install_dir="$HOME/dontstarvetogether_dedicated_server"
    cluster_name="MyDediServer"
    dontstarve_dir="$HOME/.klei/DoNotStarveTogether"
    
    function fail()
    {
            echo Error: "$@" >&2
            exit 1
    }
    
    function check_for_file()
    {
        if [ ! -e "$1" ]; then
                fail "Missing file: $1"
        fi
    }
    
    cd "$steamcmd_dir" || fail "Missing $steamcmd_dir directory!" # TODO
    
    check_for_file "steamcmd.sh"
    check_for_file "$dontstarve_dir/$cluster_name/cluster.ini"
    check_for_file "$dontstarve_dir/$cluster_name/cluster_token.txt"
    check_for_file "$dontstarve_dir/$cluster_name/Master/server.ini"
    check_for_file "$dontstarve_dir/$cluster_name/Caves/server.ini"
    
    ./steamcmd.sh +force_install_dir "$install_dir" +login anonymous +app_update 343050 validate +quit
    
    check_for_file "$install_dir/bin"
    
    cd "$install_dir/bin" || fail 
    
    run_shared=(./dontstarve_dedicated_server_nullrenderer)
    run_shared+=(-console)
    run_shared+=(-cluster "$cluster_name")
    run_shared+=(-monitor_parent_process $$)
    run_shared+=(-shard)
    
    "${run_shared[@]}" Caves  | sed 's/^/Caves:  /' &
    "${run_shared[@]}" Master | sed 's/^/Master: /'

给脚本赋予执行权限

    chmod u+x ~/rundst.sh

 接着进入screen，执行脚本，开启服务器

    screen
    ./rundst.sh

这样就大功告成了，enjoy!

**2019-11-19更新**：根据评论区Anony的建议，将`rundst.sh`中的

    ./steamcmd.sh +force_install_dir "$install_dir" +login anonymous +app_update 343050 validate +quit

更换为

    ./steamcmd.sh +force_install_dir "$install_dir" +login anonymous +app_update 343050 +quit

即可实现mod自动下载

参考：http://forums.kleientertainment.com/topic/64441-dedicated-server-quick-setup-guide-linux/


  [1]: https://static.ktsee.com/s1/2016/12/20161205132755191.png