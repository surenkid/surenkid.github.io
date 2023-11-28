---
layout: post
title: 树莓派omxplayer播放电影小记
date: 2015-06-10 12:45:39
category: 软件应用
permalink: /372.html
tags:
- RaspberryPi
---

<!--markdown-->树莓派现在已经是全能的电影点播机，观看视频效果非常棒。之前3.5寸耳机孔输出声音总有杂音，后来买了一个转接头之后，基本没有杂音，看电影效果更加完美了。这里不得不说的是omxplayer这个命令行播放器，专门为树莓派优化的一个软件。这里记录一下使用omxplayer从零到基本完美的实现树莓派安逸看电影的过程。

首先下载并安装omxplayer，当然也可以去[官方][1]下载最新版

    wget http://omxplayer.sconde.net/builds/omxplayer_0.3.6~git20150505~b1ad23e_armhf.deb
    dpkg -i omxplayer_0.3.6~git20150505~b1ad23e_armhf.deb
    

这样就完成了安装，测试播放视频，打开终端输入命令

    sudo omxplayer -o local /mnt/disk/movie.mp4
    

注意这里我是通过3.5寸耳机孔输出音频，如果你是通过hdmi输出，需要换成

    sudo omxplayer -o hdmi /mnt/disk/movie.mp4
    

可以看到视频开始播放，键盘上下左右可以控制进度，+和-控制声音，空格控制暂停播放。这样基本的播放功能实现了。可是画面不是全屏，上下本应该是黑条的地方现在看到的是桌面，于是通过搜寻，发现使用xtrem终端打开并设置终端的背景色为黑色，可以模拟出全屏的效果。

    sudo xterm -fullscreen -fg black -bg black -e omxplayer -o local /mnt/disk/movie.mp4
    

这样基本就实现了全屏播放视频。剩下还有个问题，对于习惯了win双击的我们来说，每次播放还得输入命令行实在有些不方便，那么如何来设置双击调用omxplayer播放视频呢，右击视频文件，选择“打开方式”，找到“自定义命令行”，在应用程序名称中输入`sudo xterm -fullscreen -fg black -bg black -e omxplayer -o local %f`，勾上“将选择的应用程序作为对这种文件类型的默认操作”，确认即可。此时再双击这个视频，既可以直接调用omxplayer播放了。

对于mp3等音频文件，也可以用omxplayer播放，在设置双击打开方式时，记得选中“在终端模拟器中执行”，对于oxmplayer播放mp3失败，提示“failed to open vchiq instance”的情况，执行以下命令

    sudo chmod a+rw /dev/vchiq
    

之后就可以正常播放了。

 [1]: http://omxplayer.sconde.net/