---
layout: post
title: ThinkPHP中Auth类的简单使用
date: 2014-10-10 09:37:49
category: Web开发
permalink: /117.html
tags:
- ThinkPHP
---

<!--markdown-->初学ThinkPHP，根据网上的教程折腾了auth类权限控制，使用起来非常方便，不得不说ThinkPHP的编程思想很好，值得仔细的去学习。这里我就将我跟着教程学的Auth类使用方法分享一下。

这里项目里有个Member控制器，用来显示后台所有会员信息，这个页面显然只有管理员才有权限浏览，因此我们的目的是在访问Member控制器的Index方法时，进行权限判断。

### 建立AuthController.class.php权限控制器继承类

考虑到权限控制是覆盖整个项目，因此新建立的AuthController.class.php放置在Common模块目录下的Controller目录里，即路径为Common/Controller/AuthController.class.php。写入以下代码：

    <?php
    namespace Common\Controller;
    use Think\Controller;
    use Think\Auth;
    
    class AuthController extends Controller {
    }
    

### 改写member控制器MemberController.class.php

因为需要应用到权限控制器，因此我们需要将导入的别名从Think\Controller换成我们的Common\Controller\AuthController，并且将继承的Controller父类换成我们自己的AuthController类。

    <?php
    namespace Home\Controller;
    //use Think\Controller;
    use Common\Controller\AuthController;
    
    class MemberController extends AuthController {
        /**
         * 显示会员列表
         * @access public
         * @param int $p 页码
         */
        public function index($p=1){
            /*加入会员列表显示页面代码*/
            echo '<a href="'.U('Login/logout').'">退出</a>';
        }
    }
    

### 建立Login控制器LoginController.class.php

这里我们建立登录控制器，首先判断是否POST提交数据，如果不是，显示登录表单。如果有POST提交的数据，那么将提交的输入作为查询条件，从MySQL的admin表中查询相关用户信息，返回给$userinfo数组。判断$userinfo数组是否为空，如果为空则提示“用户名密码错误”。如果不是，将用户信息写入session，提示“登录成功”并跳转到Member控制器的Index方法页进行权限认证。代码如下

    <?php
    namespace Home\Controller;
    use Think\Controller;
    
    class LoginController extends Controller {
        public function index(){
            if(IS_POST){
                $admin = M('admin');
                $login['username'] = I('post.username',null,false);
                $login['password'] = I('post.password',null,false);
                $userinfo = $admin->where($login)->find();
                //var_dump($userinfo);
                if(count($userinfo)){
                    session('auth',$userinfo);
                    $this->success('登录成功！',U('Member/index'));
                }else{
                    $this->error('用户名密码错误！');
                }
            }else{
                $this->show('<form method="post" action="{:U(\'Login/index\')}">用户名：<input type="text" name="username" /><br />密码：<input type="password" name="password" /><br /><input type="submit" /></form>');
            }
        }
    
        public function logout(){
            session('[destroy]');
            $this->success('退出成功！',U('Login/index'));
        }
    }
    

### 修改刚刚建立的AuthController权限控制器并写入权限控制代码

这里由于权限控制类无需对外访问，因此使用protected申明，建立_initialize方法，该方法会在该类实例化时自动运行，相当于构造函数。

在_initialize方法中写入权限控制代码，首先获取session中的用户信息，判断如果是超级管理员，则返回true，这时会中止执行函数，略过下面的代码。如果不是超级管理员，则需要进行权限判断。

首先new一个新的Auth()对象，使用该对象的check方法，check方法参中，第一个参数是规则（这里是url模式规则，格式为模块/控制器/方法，如Home/Index/index），第二个是uid，这里调用的是之前从数据库里读取的AdminID。然后根据Auth类自带的三张表进行权限控制

这里解释一下三张表的含义：

*   think\_auth\_rule：规则表，这里存放的是每一条规则，如Home/Index/index对应某个用户组ID的可访问权限
*   think\_auth\_group：用户组表， 这里存放的是每个用户组对应的规则ID
*   think\_auth\_group_access：用户组明细表，这里存放的是我们自己的admin表里的管理员id对应的用户组

最终代码如下：

    <?php
    namespace Common\Controller;
    use Think\Controller;
    use Think\Auth;
    
    class AuthController extends Controller {
        protected function _initialize(){
            $sess_auth = session('auth');
            if(!$sess_auth){
                $this->error('非法访问，正在跳转到登录页',U('Login/index'));
            }
            //如果是超级管理员，就不用验证权限
            if($sess_auth['AdminID']==1){
                return true;
            }
            //权限判断
    
            $auth = new Auth();
            if(!$auth->check(MODULE_NAME.'/'.CONTROLLER_NAME.'/'.ACTION_NAME,$sess_auth['AdminID'])){
                $this->error('没有权限',U('Login/index'));
            }
        }
    }
    

这样我们就完成了一个简单的Auth类使用。