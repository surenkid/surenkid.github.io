---
layout: post
title: 关于wordpress使用markdown插件的选择
date: 2015-07-16 03:26:55
category: Web开发
permalink: /412.html
tags:
- WordPress
- markdown
---

<!--markdown-->用wordpress写博文时，最头疼的就是wordpress自身不带markdown支持，需要安装第三方插件支持，而上网搜寻后发现，大多都在推荐wordpress官方的[JetPack][1]包里包含的markdown模块。由于服务器在国内的原因，安装该插件无法轻松连接wordpress.com账号，另外为了一个markdown模块而安装整个JetPack包也略微有点多余，因此继续在网上搜寻。

这就找到了另外几款插件，分别是[JP Markdown][2]，[PrettyPress][3]，[TinyMCE Advanced][4]和[WP-Markdown][5]。经过各种测试后，最终选择了WP-Markdown，不过我做了一点小的修改。

简单说一下使用后的感受

### JP Markdown

据说是JetPack包里markdown模块的前身，因为并入JetPack后停止更新，安装后，在设置里打开“使用markdown支持评论”选项后就可以开启，但是我这里即时打开了这个选项也依旧无法使用，没有看到任何支持markdown语法的效果，不知道是否是我配置错误。

### PrettyPress

是一个界面比较友好的markdown编辑器，写博文时点击右侧的**Launch PrettyPress**按钮，进入markdown编辑模式，左侧是编辑器，右侧是实时预览，使用比较方便。只是我在切换回普通编辑器时，编辑后的内容并不能传回来，导致丢失了markdown编辑器里编辑的内容，而直接在markdown编辑器里直接提交发布，则同样丢失了markdown编辑内容，发布了一个空白文章。不知道是否是不能兼容新版，还是我配置错误。

### TinyMCE Advanced

是在知乎上看到的推荐，其实这是wordpress MCE编辑器的增强版，只是选项设置里勾选后可以支持markdown语法，试用了一下，基本可以成功，但是由于本身是MCE编辑器，插入图片时会插入`<img src=>`等html语句，只能说对markdown支持还不是特别完善。这也难怪，本身markdown的存在就是为了替代类似MCE编辑器，实现完全通过键盘简单标记完成格式编辑，这两者初衷就有矛盾，也无法指望能支持的更完善。

### WP-Markdown

这是一直以来在用的一个markdown插件，替换wordpress编辑器，并且自带的工具栏插入图片、链接时，也能很好的实现markdown语法的正确格式，算是我用的最顺手的一个插件。只是用了那么久以来，发现它的即时预览功能，在写长文时往往会因为性能问题，导致打字时卡顿，影响了写作的效率。网上看了好像没有看到有类似我这样的问题，也许大家都在用JetPack的markdown模块吧。我只好自己动手，简单的改了一下这个插件。修改如下：

打开wp-markdown插件目录下的wp-markdown.php文件，搜索`wmd-previewcontent`，找到

    $('#wp-content-editor-container').after("<div id='wmd-previewcontent' class='wmd-panel wmd-preview prettyprint'></div>");
    

将这句注释掉，也就是直接去掉预览层，不显示预览，保存。之后编辑文章，可以发现markdown编辑器下方的预览被关闭，文章内容即使很长，也不会出现卡顿，经过简单测试，发现没有引起错误，算是临时解决了这个问题。

 [1]: http://jetpack.me/
 [2]: https://wordpress.org/plugins/jetpack-markdown/
 [3]: https://wordpress.org/plugins/prettypress/
 [4]: https://wordpress.org/plugins/tinymce-advanced/
 [5]: https://wordpress.org/plugins/wp-markdown/