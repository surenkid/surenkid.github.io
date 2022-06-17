---
layout: post
title: 给Nexus5手动刷入Android6.0正式版（线刷）
date: 2015-10-19 15:18:00
category: 软件应用
permalink: /501.html
tags:
- Nexus
- Android
---

<!--markdown-->android 6.0更新于10月5日更新，相信不少人已经更新了。我这里由于某些原因，之前Nexus5（以下简称N5）一直用的是MIUI，因此此次OTA推送并不适合我，只能采取线刷的方法，手动将android 6.0正式版刷入。其实手动刷入，也就是线刷，本身不是太难，但是在这个过程中由于一些小问题，导致花了1个半小时才完全搞定这个简单的过程，在这里我记录一下，方便参考。

下载android6.0官方固件
---------------------
由于是线刷，自然首先要去下载官方固件，在[这个页面][1]可以找到所有谷歌亲儿子的官方固件，找到[Nexus5的6.0固件][2]，下载即可。

官方固件下载页面：[https://developers.google.com/android/nexus/images][3]
官方6.0固件下载地址：[https://dl.google.com/dl/android/aosp/hammerhead-mra58k-factory-52364034.tgz][4]

解压并修改固件脚本
----------------
固件下载完成后，首先要解压，由于是tar格式，在win下需要解压2次。解压两次之后，打开解压的文件夹，找到其中image-hammerhead-mra58k.zip，再次将这个文件解压。

解压完成后，编辑flash.bat文件，找到

    fastboot -w update image-hammerhead-mra58k.zip

修改为

    ::fastboot -w update image-hammerhead-mra58k.zip

并在此行下面加入

    fastboot flash boot boot.img
    fastboot flash cache cache.img
    fastboot flash recovery recovery.img
    fastboot flash system system.img
    fastboot flash userdata userdata.img
    fastboot reboot

保存脚本，这样修改是为了避免刷机过程中的报错。

开始刷机
--------

将N5接上数据线，连接电脑，双击执行flash.bat，等待固件自动刷入，完成后会自动重启。

如果看到4个并排的彩色圆点，表示刷机成功，等待初始化完成即可。

![开始开机初始化][5]

刷机过程到这里就结束了，目前root需要刷入第三方内核，对我来说目前系统自带的一些特性应该足够我在未root的情况下正常使用，所以root如果在稍后需要的话，我再更新上来吧。


  [1]: https://developers.google.com/android/nexus/images
  [2]: https://dl.google.com/dl/android/aosp/hammerhead-mra58k-factory-52364034.tgz
  [3]: https://developers.google.com/android/nexus/images
  [4]: https://dl.google.com/dl/android/aosp/hammerhead-mra58k-factory-52364034.tgz
  [5]: https://static.ktsee.com/s1/2016/05/20160502120622673.jpg