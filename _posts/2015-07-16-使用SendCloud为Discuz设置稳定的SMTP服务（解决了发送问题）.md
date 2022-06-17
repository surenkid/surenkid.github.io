---
layout: post
title: 使用SendCloud为Discuz设置稳定的SMTP服务（解决了发送问题）
date: 2015-07-16 06:30:00
category: 软件应用
permalink: /420.html
tags:
- smtp
- Discuz
---

<!--markdown-->Discuz论坛自带的邮件发送服务到达率不够高，需要使用一个稳定的外部SMTP服务器用于发送注册验证等邮件，而在试用了国外的[Mailgun][1]，[Mandrill][2]等著名SMTP服务商的服务之后，发现其发送速度缓慢并且容易丢信，而本身我的网站服务器在国内，因此还是考虑选用国内的服务。

了解了一下，国内这方面做的最好的应该是搜狐旗下的[SendCloud][3]（如果你有发现更好的请给我留言），开始注册帐号进行操作。

本身Discuz后台自带邮件服务器设置，直接填写SMTP服务商给出的账号，应该就是可以搞定，不需要写一篇文章来描述，可惜这过程比较艰辛，最终还需要对discuz的sendmail函数做一点小调整才能搞定，因此还是记录一下，以备参考。

### 注册并配置SendCloud

首先注册Sendcloud，不必多说

注册：<http://sendcloud.sohu.com/signup.html>

注册后，进入sendcloud界面，根据界面提示搞定**发信域名**，**API_USER**和**邮件模板**。

**发信域名**就是绑定自己的域名，根据提示绑定后，发信时可以将发件人显示为xxx@your.com这样，杜绝出现“由xxx@sendcloud.com代发”这样的提示。这个步骤需要修改域名的dns记录，由于sendcloud后台有详细的教程，就不多说了。

**API_USER**，这里需要新建一个，由于我是用于论坛通知邮件，因此这里建立的账号为“触发”类型。在SMTP发信中，API\_USER对应SMTP账号，而APP\_KEY对应SMTP密码。

**邮件模板**，这里需要大概说一下，其实就是设置一个大概的邮件模板内容，之后通过Sendcloud发送的邮件需要与你设置的模板内容类似，相近度够高，服务器才会允许发送。例如要发送取回密码的邮件，必须把Disucz的“取回密码邮件”的内容模板复制进去，变量使用`%param%`代替。模板提交后还需要人工审核，比较麻烦。不过这也是为了最大程度的杜绝垃圾邮件，保证SMTP邮件服务器的稳定。

到这里基本配置的差不多了

### 配置并调整Discuz

接下来是设置Discuz的SMTP发送，在discuz后台的邮件服务器设置里填写SMTP信息，Sendcloud的SMTP服务器信息如下：

	SMTP服务器：smtpcloud.sohu.com
	SMTP端口：25 
	SMTP验证用户名：sendcloud建立的API_USER 
	SMTP验证密码：sendcloud后台里的API_KEY

信息填入后，测试发送，发现提示发信成功，但怎么也收不到邮件。这里就是我花费大量时间的重点之处了，

接下来找到Discuz源码中sendmail函数，我的论坛是Discuz6.0，于是打开include/sendmail.inc.php，找到

    fputs($fp, "QUIT\r\n");
    

在这句话的上面加上

    sleep(2);//由于sendcloud服务器处理反应问题，这里需要等待两秒在发送QUIT指令
    

保存退出，测试邮件，这样就可以正常发送邮件了。

这个地方困扰了大量时间，我联系了SendCloud客服，客服比较耐心，多方测试发现无果，又找到其技术部门的人同样测试无果。而在我的测试过程中，Discuz本身使用其他SMTP服务器没问题，而使用foxmail等客户端通过SendCloud提供的SMTP服务器发送邮件也没问题，真是比较晕。

最终反复排查发现了是这个延时的问题。我猜想可能是php利用SOCKET链接smtp服务器时，处理速度过快，没有等处理完就直接发送QUIT退出了。虽然还不能完全断定是不是这么回事，但问题总算是解决了，长舒一口气。

 [1]: http://www.mailgun.com/
 [2]: https://www.mandrill.com/
 [3]: http://sendcloud.sohu.com/