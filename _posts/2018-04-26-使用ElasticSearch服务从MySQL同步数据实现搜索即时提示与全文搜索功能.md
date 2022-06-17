---
layout: post
title: 使用ElasticSearch服务从MySQL同步数据实现搜索即时提示与全文搜索功能
date: 2018-04-26 09:20:00
category: 架构设计
permalink: /697.html
tags:
- CentOS
- MySQL
- url
- backup
- test
---

<!--markdown-->最近用了几天时间为公司项目集成了全文搜索引擎，项目初步目标是用于搜索框的即时提示。数据需要从MySQL中同步过来，因为数据不小，因此需要考虑初次同步后进行持续的增量同步。这里用到的开源服务就是ElasticSearch。

![ElasticSearch][1]

ElasticSearch是一个非常好用的开源全文搜索引擎服务，同事推荐之前我并没有了解过，但是看到亚马逊专门提供该服务的实例，没有多了解之前便猜想应该是和Redis一样名声在外的产品，估计也是经得起考验可以用在生产环境中了。上网了解一番之后发现果然如此:

> 全文搜索属于最常见的需求，开源的Elasticsearch是目前全文搜索引擎的首选。它可以快速地储存、搜索和分析海量数据。维基百科、Stack Overflow、Github 都采用它。

废话不多说，按照惯例记录一下我的搭建过程。

# 安装ElasticSearch
安装有几种方式，我个人还是比较喜欢CentOS的yum从源安装。

## CentOS的Yum方式安装
首先进入`/etc/yum.repos.d`目录，建立一个名为`elasticsearch.repo`的源，内容填写如下：

    [elasticsearch-6.x]
    name=Elasticsearch repository for 6.x packages
    baseurl=https://artifacts.elastic.co/packages/6.x/yum
    gpgcheck=1
    gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
    enabled=1
    autorefresh=1
    type=rpm-md

这里Elastic目前最新版本为6.2，但与之对应的Elasticsearch-PHP需要PHP版本为7.0以上。由于公司的PHP版本是5.x，因此只有退而求其次，选择了稍微老一点的5.6.9版本，5.x版本的安装，只需要在这一步将上面源文件内容中的所有6.x换成5.x即可。

接下来执行

    yum install elasticsearch

完成安装后，默认服务是仅仅本地可以访问，如果需要从另一台内网服务器访问，还需要打开监听范围。进入安装目录`/usr/share/elasticsearch`，编辑`elasticsearch.yml`文件，修改以下部分：

    network.host: 0.0.0.0
    path.data: /var/lib/elasticsearch
    path.logs: /var/log/elasticsearch
    http.host: 0.0.0.0
    transport.host: 127.0.0.1

其中`network.host`是开启外部网络访问，而`path.data`和`path.logs`由于默认路径没有设置正确，这里需要手工设置一下。路径设置完成后需要确认一下这两个目录是否存在，如果目录内有上一次安装的残余内容，需要备份后清空，否则会引发一些问题。

接着重启服务：

    service elasticsearch restart

## 安装完成测试

重启完成后，在浏览器中输入

    http://127.0.0.1:9200/?pretty

如果能看到对应的信息，表示安装成功

# 安装LogStash

接着安装LogStash服务，这个服务用于汇总各类log日志信息到一个地方统一管理，而这里我们用到这个服务，是因为需要用它来实现数据从MySQL到Elastic的同步。

## YUM方式安装LogStash

这同样是Elastic家的产品，因此包含在前面设置的源中，现在安装只需要执行：

    yum install logstash

这样就完成了安装。接下来别急，还需要安装一个插件。

## 安装logstash-input-jdbc插件

首先进入`/usr/share/logstash/bin`目录，执行：

    ./logstash-plugin install logstash-input-jdbc

插件安装完成后，logstash的安装目前算是完成了。还有很多插件可以实现各种丰富的功能，而这里就咱不多说了。

## 配置同步MySQL数据到Elastic

接着就是比较重点的地方，配置数据从MySQL库同步到Elastic。首先在任意目录建立同步配置文件，我这里的同步脚本并不多，因此就直接把他们放在logstash的执行目录里：

    cd /usr/share/logstash/bin
    mkdir ktsee
    cd ktsee

然后新建两个文件`jdbc.conf`和`jdbc.sql`，其中`jdbc.conf`是同步配置文件，`jdbc.sql`同步的mysql脚本。首先编辑`jdbc.conf`，填入内容：

    input {
      stdin {
      }
      jdbc {
      # mysql jdbc connection string to our backup databse  后面的ktsee对应mysql中的test数据库
      jdbc_connection_string => "jdbc:mysql://192.168.1.1:3306/ktsee"
      # the user we wish to excute our statement as
      jdbc_user => "root"
      jdbc_password => "password"
      # the path to our downloaded jdbc driver 这里需要设置正确的mysql-connector-java-5.1.38.jar路径，找不到可以从网上下载后放在配置路径中
      jdbc_driver_library => "/elasticsearch-jdbc-2.3.2.0/lib/mysql-connector-java-5.1.38.jar"
      # the name of the driver class for mysql
      jdbc_driver_class => "com.mysql.jdbc.Driver"
      jdbc_paging_enabled => "true"
      jdbc_page_size => "50000"
    # 以下对应着要执行的sql的绝对路径
      statement_filepath => "/usr/local/logstash/bin/logstash_jdbc_test/jdbc.sql"
    # 定时字段 各字段含义（由左至右）分、时、天、月、年，全部为*默认含义为每分钟都更新
      schedule => "* * * * *"
    # 设定ES索引类型
      type => "ktsee_type"
      }
    }
    
    filter {
      json {
      source => "message"
      remove_field => ["message"]
      }
    }
    
    output {
      elasticsearch {
    #ESIP地址与端口
      hosts => "192.168.1.1:9200"
    #ES索引名称（自己定义的）
      index => "ktsee_index"
    #自增ID编号
      document_id => "%{id}"
      }
      stdout {
    #以JSON格式输出
      codec => json_lines
      }
    }

这里需要注意的地方，在上面配置文件中有相应的注释。

# 使用Elasticsearch-PHP库集成到项目中
这里选择使用Elasticsearch的官方PHP库Elasticsearch-PHP，如果项目使用composer进行包管理，那么很简单，直接安装对应的版本即可，composer会自动下载其他的依赖库。在项目中添加代码：

    $client = \Elasticsearch\ClientBuilder::create()
        ->setHosts(['192.168.1.1:9200'])
        ->allowBadJSONSerialization()
        ->build();
    $params = [
        'index' => 'ktsee_index',
        '_source' => [
            "id",
            "product_name",
            "product_type"
        ],
        'body' => [
            'query' => [
                'match_phrase_prefix' => [
                    'product_name' => [
                        "query" => $post['keyword'],
                        "slop" => 10
                    ]
                ],
            ]
        ]
    ];
    $response = $client->search($params);

这样就实现了简单的根据关键词搜索调用ElasticSearch。

# 实现搜索即时提示代码

HTML部分：

    <form method="get" action="/search" id="header_search">
        <input type="text" id="keyword" name="keyword" value="" autocomplete="off" />
        <input type="submit" value="" />
    </form>
    <ul id="header_search_suggest"></ul>

这里值得注意的是，搜索框input控件加上`autocomplete="off"`关闭原生下拉提示框，避免和我们即将要做的智能提示冲突。

CSS部分：

    #header_search_suggest{
        position: absolute;
        width: calc(100% - 10px);
        left: 4px;
        border: solid 1px #ccc;
        background-color: white;
        text-align: left;
        z-index: 101;
        display: none;
    }
    #header_search_suggest li{
        font-size: 14px;
        border-bottom: 1px solid #eeeeee;
    }
    #header_search_suggest li a{
        padding:0.5em 1em;
        color:#333333;
        display: block;
        text-decoration: none;
    }
    #header_search_suggest li a:hover{
        background-color: #EDF0F2;
        color:#2F7EC4;
    }
    #header_search_suggest li a em{
        font-style: italic;
        color:#999;
        font-size:0.8em;
    }

JS部分：

    var xhr = null;
    $('#keyword').bind('input propertychange', function () {
        if (xhr) {
            xhr.abort();//如果存在ajax的请求，就放弃请求
        }
        var inputText = $.trim(this.value);
        if (inputText != "") { //检测键盘输入的内容是否为空，为空就不发出请求
            xhr = $.ajax({
                type: 'POST',
                url: '/search/suggest',
                cache: false,//不从浏览器缓存中加载请求信息
                // data: "keyword=" + inputText,
                data: {keyword: inputText},
                dataType: 'json',
                success: function (json) {
                    //console.log(json);
                    if (json.count != 0) {
                        //检测返回的结果是否为空
                        var lists = "";
                        $.each(json.data, function (index, obj) {
                            //处理高亮关键词
                            var searchContent = obj.product_name;
                            var suggestItem = '';
                            if (searchContent.toLowerCase().indexOf(inputText.toLowerCase()) > -1) {
                                var searchRegExp = new RegExp('(' + inputText + ')', "gi");
                                suggestItem = searchContent.replace(searchRegExp, ("<strong>$1</strong>"));
                            }
                            suggestItem = suggestItem + "<em> - " + obj.product_type + "</em>";

                            //遍历出每一条返回的数据
                            lists += "<li class='listName' ><a href='/search/suggest?id=" + obj.id + "&key=" + encodeURI(searchContent + ' - ' + obj.product_type) + "'>" + suggestItem + "</a></li>";
                        });

                        $("#header_search_suggest").html(lists).show();//将搜索到的结果展示出来
                    } else {
                        $("#header_search_suggest").hide();
                    }

                    //记录搜索历史记录
                    $.post('/search/savesearchlog',{keyword: inputText,count: json.count});
                }
            });
        } else {
            $("#header_search_suggest").hide();//没有查询结果就隐藏搜索框
        }
    }).blur(function () {
        setTimeout('$("#header_search_suggest").hide()',500);//输入框失去焦点的时候就隐藏搜索框，为了防止隐藏过快无法点击，设置延迟0.5秒隐藏
    });

# 演示效果
如图：

![即时搜索提示框效果图][2]


  [1]: https://static.ktsee.com/s1/2018/05/20180515180338855.png
  [2]: https://static.ktsee.com/s1/2018/05/20180515174752000.gif