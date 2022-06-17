---
layout: post
title: rclone定时自动备份VPS服务器上网站数据到网盘
date: 2017-05-11 21:42:00
category: 服务器运维
permalink: /646.html
tags:
- crontab
- vps
- backup
- rclone
- systemd
- timer
---

<!--markdown-->如今VPS价格基本都不贵，搭建自己的网站大多都用上VPS了，而数据备份这个问题也是需要关注的。大多数的廉价VPS服务器，本身是不会对数据丢失负责的，因此在一开始就要考虑网站数据备份的问题。

我个人来说，有一台数据量不大的服务器，直接通过AMH的ambmail扩展每日定时将数据打包，以邮件形式发送到邮箱备份。而另一台专门用于存放大文件的下载服务器，则使用了备份工具，结合vps定时器每日增量备份到网盘。

这里我就记录一下使用vps服务器工具rclone备份定时增量备份数据到Google Drive的方法。

# 前期准备
首先你得有一台vps服务器，安装有Linux或者Windows都可以，这里我以Linux CentOS 7为例。

## 网盘选择
首先对于备份来说，一个稳定的网盘尤为重要。这里我们数据并不做分享用，同时vps在夜间自动备份，对速度的要求也不是特别的苛刻，那么需要关注的就只有稳定和容量了。

这里常用的网盘有[Box][1]，[Dropbox][2]，[Google Drive][3]，[Hubic][4]，[OneDrive][5]，[Yadex Disk][6]。当然如果对于数据安全性更高要求，可以使用Amazon S3，Backblaze B2等付费空间进行备份。

我这里选择的是Google Drive。

## 工具选择

对于Google Drive来说，可以使用的工具很多：[Gdrive][7]，[skicka][8]，[google-drive-ocamlfuse][9]，[Rclone][10]等。

这里由于我对备份到网盘的路径有要求，需要保持备份到Drive的文件相对路径与源网站一致，因此选择了rclone进行备份。

# 安装与配置备份工具rclone

## 下载安装rclone
rclone官网有已经编译好的二进制文件，因此可以直接下载使用。我这里是CentOS7，其他系统在[这里][11]找对应的版本

    wget https://downloads.rclone.org/rclone-v1.36-linux-amd64.zip
    unzip rclone-v1.36-linux-amd64.zip
    cd rclone-v1.36-linux-amd64
    cp rclone /usr/local/sbin/
    chmod +x /usr/local/sbin/rclone

这样就可以在命令行中直接输入rclone进行操作了

## 配置网盘连接
接下来需要连接到Drive，进入配置交互界面：

    rclone config
    
这里的配置非常简单，根据提示进行即可。这里我们命名Google Drive连接名为`gdrive`

## 测试手工备份

配置完成后，手工备份一次，测试一下效果。这里我要将服务器`/hi_ktsee_com/attachments/201705`目录下的所有文件，备份到网盘中的`/hi_ktsee_com/attachments/201705`中，执行：

    rclone copy --ignore-existing /hi_ktsee_com/attachments/201705 gdrive:hi_ktsee_com/attachments/201705

这里使用了`copy`命令，主要是由于备份是单向的。`--ignore-existing`则是忽略掉网盘中已经备份过的文件，相当于增量备份了。

稍等片刻，如果没有任何错误信息返回，那么这次备份就完成了，可以在网盘中看到对应备份文件。用rclone备份真的的是很简单。

# 设置按月备份脚本
由于我这服务器的文件是按月归档到不同文件夹，文件夹命名格式为"年月"，如`201705`，那么每个月只需要对当月目录进行增量备份即可，避免了每次备份rclone都要重新检查所有目录。

比如现在是2017年5月，那么今天备份脚本就应该执行：

    rclone copy --ignore-existing /hi_ktsee_com/attachments/201705 gdrive:hi_ktsee_com/attachments/201705

而到了6月，那么我希望脚本自动执行：

    rclone copy --ignore-existing /hi_ktsee_com/attachments/201706 gdrive:hi_ktsee_com/attachments/201706

这时可以编写一个简单的脚本，自动获取当前时间，对应不同备份指令，执行：

    vi sync2gdrive.sh

写入脚本内容：

    #!/bin/bash
    cur_month=$(date +%Y%m)
    if [ -d "/hi_ktsee_com/attachments/$cur_month" ]; then
      /usr/local/sbin/rclone copy --ignore-existing /hi_ktsee_com/attachments/$cur_month gdrive:hi_ktsee_com/attachments/$cur_month >> ~/sync2gdrive_$cur_month.log
    fi

这里定义了一个变量cur_month获取当前时间，组合成我们需要的目录形式`201705`，接着调用备份命令对指定目录备份，最后输出到log文件，以便于备份出错时查看错误记录。

# 设置系统定时器（计划任务）
定时执行脚本有几种方案，包括AT，crontab和systemd.timer。

其中AT常用于只执行一次的任务，虽然结合守护进程atd也可以实现定时效果。crontab之前非常常用，是不错的选择，但是这里对于CentOS7上新的systemd的用法，还是要学习一下，因此这次使用了systemd.timer定时器。

## 配置定时器

首先进入systemd服务文件存放目录，新建一个`sync2gdrive.service`文件：

    cd /etc/systemd/system
    vi sync2gdrive.service

填入内容：

    [Unit]
    Description=Sync local files to google drive

    [Service]
    Type=simple
    ExecStart=/root/sync2gdrive.sh
    User=root

这里`/root/sync2gdrive.sh`是上一步编写的脚本的路径。另外这里指定了用户为root，因为测试脚本执行环境中，需要调用的配置文件是以root用户的身份生成的，因此这里指定定时脚本也同样以root身份执行。如果你需要指定其他用户身份来执行这个脚本，更改User配置即可。

然后新建`sync2gdrive.timer`文件：

    vi sync2gdrive.timer

填入内容：

    [Unit]
    Description=Daily sync local files to google drive
    [Timer]
    OnBootSec=5min
    OnUnitActiveSec=1d
    TimeoutStartSec=1h
    Unit=sync2gdrive.service

    [Install]
    WantedBy=multi-user.target

- `OnBootSec`表示开机后五分钟后启动
- `OnUnitActiveSec`表示每隔1天执行一次
- `TimeoutStartSec`表示脚本执行后1小时后检查结果，防止备份时间过长，脚本认为没有响应，认为任务失败而中断任务

## 启用定时器并加入开机启动

这里启用以及加入开机启动，就与其他服务一样，只是注意末位是`timer`：

    systemctl enable sync2gdrive.timer
    systemctl start sync2gdrive.timer

这样自动备份就基本配置完成了。


  [1]: https://www.box.com
  [2]: https://www.dropbox.com
  [3]: https://drive.google.com
  [4]: https://hubic.com/
  [5]: https://onedrive.live.com?invref=fbbb2b65eb7aaf0d&invscr=90
  [6]: https://disk.yandex.com/invite/?hash=66NKBTKK
  [7]: https://github.com/prasmussen/gdrive
  [8]: https://github.com/google/skicka
  [9]: https://github.com/astrada/google-drive-ocamlfuse
  [10]: https://github.com/ncw/rclone
  [11]: https://rclone.org/downloads/