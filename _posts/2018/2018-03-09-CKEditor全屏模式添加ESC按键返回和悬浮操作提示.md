---
layout: post
title: CKEditor全屏模式添加ESC按键返回和悬浮操作提示
date: 2018-03-09 03:26:00
category: Web开发
permalink: /694.html
tags:
- CKEditor
---

<!--markdown-->最近在项目上有一个简单的需求，在使用CKEditor编辑器时，点击最大化按钮，需要让最大化的窗口获得焦点，弹出退出提示，同时提供按键盘ESC键退出全屏编辑模式。这个操作模式有点类似于在Chrome中按F11全屏的效果。

这里用了CKEditor中的几个事件解决了这个问题。问题本身并不是很复杂，主要是我对于CKEditor这个强大编辑器的不熟悉，导致查了不少资料，现在将过程记录一下。

本文用到的方法只是很少的一部分，如果你需要了解更多CKEditor的方法，可以看[这里的简单方法参考][2]，或者直接阅读[官方文档][3]。

![Chrome全屏模式的操作提示][1]

## 思路
1. 用户点击最大化按钮时，弹出提示，获取焦点
2. 用户按ESC键时，如果处于全屏状态，执行缩小化

## 用到的方法

### 监听最大化切换事件

    ev.editor.on('maximize', function(){//code...});

### 监听键盘按键事件

    ev.editor.on('key', function(){//code...});

### 获取当前全屏模式状态

    ev.editor.getCommand('maximize').state;

### 执行全屏模式动作

    ev.editor.execCommand('maximize');

## 实现代码
### JS部分：

    CKEDITOR.on('instanceReady', function (ev) {
        //When on fullscreen mode, set focus on editor, show tips of how to exit full-screen
        ev.editor.on('maximize', function(evt) {
            evt.editor.focus();
            if (evt.editor.getCommand('maximize').state == CKEDITOR.TRISTATE_ON) {
                var message = $('<div class="exit-full-screen-message" style="display: none;">Press ESC to exit full-screen mode</div>');
                message.appendTo($('body')).fadeIn(300).delay(2000).fadeOut(500);
            }
        });
        //When press "ESC" key, check maximize state, if on fullscreen mode, minimize editor
        ev.editor.on('key', function (evt) {
            if (evt.data.keyCode == 27) {
                if (evt.editor.getCommand('maximize').state == CKEDITOR.TRISTATE_ON) {
                    evt.editor.execCommand('maximize');
                }
            }
        });
    });

### CSS部分（主要为了设置全屏浮动提示框的样式）：

    .exit-full-screen-message {
        position: fixed;
        top: 3px;
        left: 50%;
        margin-left: -150px;
        width: 300px;
        z-index: 9999;
        background-color: rgba(0,0,0,0.5);
        color: white;
        text-align: center;
        font-size: 16px;
        line-height: 2em;
        border-radius: 8px;
    }

## 实现效果

![CKEditor全屏模式添加按键退出与提示框][4]


  [1]: https://static.ktsee.com/s1/2018/03/20180309123623401.png
  [2]: http://3sv.ktsee.com/viewthread.php?tid=4315
  [3]: https://docs.ckeditor.com/
  [4]: https://static.ktsee.com/s1/2018/03/20180309120920620.png