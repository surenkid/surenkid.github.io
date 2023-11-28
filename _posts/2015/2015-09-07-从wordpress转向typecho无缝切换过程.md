---
layout: post
title: 从wordpress转向typecho无缝切换过程
date: 2015-09-07 09:19:00
category: Web开发
permalink: /468.html
tags:
---

<!--markdown-->起因
====
纠结了很久还是从wordpress转向typecho，转过来之后，甚至连主题风格都选择了类似的仿wordpress（以下简称wp）默认风格，可见其实我换掉wp并非为了好看，其实原因还是wp过慢，在速度体验上让我用起来还是有一些不舒服的地方。好吧，加上其官方商店慢如牛的下载速度，考虑到我并不经常折腾插件，需要的功能仅仅是markdown写作，反垃圾评论，代码高亮，评论邮件提醒等少量插件功能，于是换了typecho这个以简洁为设计理念的博客程序。

其实很早就接触typecho，只见很多人推荐，那时候的0.8版本还不支持markdown语法写作，功能上也很简单，心想也许只适合体验一下，不适合长久使用。而今typecho在去年已经更新到1.0，并且在操作上及功能上有了很大的改进，尤其是让我兴奋的原生支持markdown语法，光这点就足够吸引我了。

于是就如同折腾电子产品一下，开始折腾无缝更换系统（本想昨晚就开始进行，无奈昨晚MOTO G故障，重新刷了系统，而博客的更换到今天才完成）

过程
====
参考了这篇文章，结合自己的方法，以符合我自己习惯且方便的方式做了切换。具体如下：

下载并安装Typecho
---------------------------
首先从Typecho官网下载

下载：[http://typecho.org/download][1]

将下载的包上传至服务器解压，访问自动出现安装界面。安装还是比较简单的，根据提示一步一步填入数据库信息及账户信息，最终完成安装并进入后台。

转换wordpress数据
---------------------------
转换wordpress这里用的是一款typecho官方出的插件[wordpress-to-typecho][2]，下载该插件后，上传并解压到usr/plugins目录。这时进入typecho后台-插件，可以看到插件显示在列表里，启用该插件，点设置，填入wordpress数据库的连接信息，保存提交。

然后控制台下的菜单里多了“从wordpress导入”菜单，点击进入，按提示进行导入即可。虽然这个插件是针对wordpress低版本的，但经测试wordpress最新版本转换也是正常的。

转换html至markdown
-------------------------------
由于wordpress是以html格式存储文章内容，因此转换过来的格式是html，在用typecho编辑器编辑时，无法自动转换为markdown格式进行二次编辑。本来这并不是什么大问题，但是对于追求细节的程序猿们来说还是不可忍受的，因此就有了[html2text][3]这个插件。这个插件的作用是将html日志转换为markdown格式并进行存储，这样解决了前述的问题。插件被添加到了[typecho基友团][4]的主页里，只需要从他们的github里下载源码就可以获得该插件。

下载后同之前的wordpress-to-typecho一样，上传，启用并根据提示转化。这里注意转换钱记得备份数据库，因为转换时可能会因每个人文章内容的不同出现不可预料的问题，因此，多备份总是好习惯。

安装其他插件及主题
----------------------------
剩下的事情就是通过安装插件和主题使得typecho更好用。常用的插件及主题在[typecho基友团][5]里基本都能找到：

官方插件列表：[https://github.com/typecho/plugins][6]
基友团插件列表：[https://github.com/typecho-fans/plugins][7]
基友团主题列表：[https://github.com/typecho-fans/themes][8]

这里我用的是仿wordpress默认主题twentytwelve的风格，因为之前wordpress一直用的这款主题，刚转过来有些不习惯，用上这个主题，减少一些不适感。

这样基本就完成了转换，在学习的过程中，希望自己在熟悉了typecho之后，也能作出受欢迎的插件或主题，为typecho添一份力吧。


  [1]: http://typecho.org/download
  [2]: http://docs.typecho.org/_media/plugins/wordpresstotypecho_v1.0.3.zip
  [3]: https://github.com/typecho-fans/plugins/tree/master/Html2Text
  [4]: http://typecho-fans.github.io/
  [5]: http://typecho-fans.github.io/
  [6]: https://github.com/typecho/plugins
  [7]: https://github.com/typecho-fans/plugins
  [8]: https://github.com/typecho-fans/themes