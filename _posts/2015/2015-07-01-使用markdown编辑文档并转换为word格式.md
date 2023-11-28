---
layout: post
title: 使用markdown编辑文档并转换为word格式
date: 2015-07-01 03:30:00
category: 软件应用
permalink: /383.html
tags:
- markdown
---

<!--markdown-->在Windows下使用Word写文档是一件比较繁琐的事情，作为我来说，更加喜欢简单明了的Markdown来写文档（或许是我的文档写作水平不够好的缘故）。但由于公司其他同事习惯了使用Word进行文档工作，因此就需要在文档修改完成成为最终版时，使用工具转换为.doc或.docx格式，传给其他同事。以前一直采用复制粘贴的方式，而现在找到两个比较实用的工具，在这里做一下分享。

## Markdown编辑器选择

网上搜寻了大量的Markdown编辑器，有一些功能复杂且方便的工具，但就我个人而言，比较喜欢简单易于携带的工具，只要基本的功能不缺，就能够满足我的使用。这里我找到的是[MarkdownEditor][1]

这是一个单文件绿色编辑器，像记事本一样简单易用，软件开源免费，重点是预览窗口的样式也很让人满意，使用一段时间后发觉的比较上手，也就一直用了。

初次使用时，将电脑里的Markdown文件（.md文件）拖动到软件的窗口，软件会自动设置文件关联，以后在编辑Markdown文件时只需要像打开word文档一样双击即可。

![enter image description here][2]

下载：[MarkdownEditor.zip][3]

补充：另外大多数推荐的[MarkdownPad][4]使用更方便，只是安装包相对较大并且需要完成安装，如果不是临时使用，建议下载[MarkdownPad免费版][5]

## Markdown转换工具

在完成了文档编辑之后，生成的是.md格式的文档，需要转换成Word格式的文档传给同事，同事才不会一头雾水。那么这里就需要用到[Pandoc][6]这个文档转换工具了。这个转换工具支持多种格式之间互相转换，这里我们主要用于Markdown转Word。

由于是Windows平台，从[这里下载][7]已经编译好的版本，找到pandoc-1.14.0.1-windows.msi下载，双击完成安装。

接着运行命令行工具（开始->运行->CMD），通过以下命令转换格式：

    pandoc -f markdown -t docx ./test.md -o test.docx
    

如果Github风格的语法，需要将命令替换为：

    pandoc -f markdown_github -t docx ./test.md -o test.docx
    

当然网上还有人说为了提高文档格式的还原度，先转换为html在转为docx可能更好：

    pandoc -f markdown -t html ./test.md | pandoc -f html -t docx -o test.docx
    

这样，就完成了Markdown转Word文档的格式转换。

 [1]: https://github.com/jijinggang/MarkdownEditor
 [2]: https://static.ktsee.com/s1/2016/05/20160502121125815.jpg
 [3]: https://github.com/jijinggang/MarkdownEditor/blob/master/download/MarkdownEditor.zip?raw=true
 [4]: http://markdownpad.com/
 [5]: http://markdownpad.com/download.html
 [6]: http://pandoc.org/
 [7]: https://github.com/jgm/pandoc/releases/tag/1.14.0.1