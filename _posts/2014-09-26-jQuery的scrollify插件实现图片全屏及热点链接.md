---
layout: post
title: jQuery的scrollify插件实现图片全屏及热点链接
date: 2014-09-26 07:15:02
category: Web开发
permalink: /37.html
tags:
- jQuery
---

<!--markdown-->昨天下午完成了一个公司网站专题，为了实现全屏滑动，采用了jQuery的[scrollify][1]插件，效果很炫。但是对于其中的图片，由于每次滚动强制一屏，所以每一屏的图片必须要适应屏幕的高度而调整宽和高，同时在图片中设置的热点(map)坐标也需要根据调整的宽和高比例进行重新设置，因此写了这样的js代码，很简陋：

    <script>
    $(function() {
        var wh = $(window).height();
        var bfb = wh/1389;
        $("img.imgktsee").attr("height",wh);
        $("img.imgktsee").attr("width",960*bfb);
    
        //遍历每个元素，为每个元素执行函数
          $("area").each(function(){
            //$(this).attr("coords",recoords($(this).attr("coords")));
            var t = recoords($(this).attr("coords"),bfb);
            $(this).attr("coords",t);
          });
    
        $.scrollify({
            section : "section",
            sectionName : "section-name",
            easing: "easeOutExpo",
            scrollSpeed: 1100,
            offset : 0,
            scrollbars: true,
            before:function() {},
            after:function() {}
        });
    });
    //重置map锚点坐标
    function recoords(cv,bfb)
    {
        var myStr = cv;
        var myArr = myStr.split(",");
        var x=0;
        for(x in myArr){
            myArr[x]=parseInt(myArr[x]*bfb,10);//取整
        }
        myStr = myArr.join(",");
        return myStr;
    }
    </script>
    

其中用到了关于jQuery选择器的用法。说下思路：

1.  首先获取屏幕的高度，然后根据高度设置每一屏大图的高度。然后计算图片调整后高度与原始高度的比例，用宽度乘以这个比例值，就可以得出图片需要调整的宽度。
2.  接着用jQuery的each方法对每个热点(map)属性执行调整自定义调整函数recoords，参数分别为coords坐标值（字符串型）和调整比例。
3.  recoords函数使用js的split方法切割，将每个坐标值进行计算，之后在用join方法进行合并，返回结果
4.  将返回值赋予每个热点(map)的coords，完成热点调整。

剩余部分就是scrollify插件的HTML部分，直接用js代码中申明的`section`标签分隔每一屏的代码即可：

    <section class="panel p0" data-section-name="p0">
        <img src="http://dl.vinistyle.cn/special/nationalday2014/p0.gif" width="960" height="1389" border="0" usemap="#Map" class="imgktsee" />
        <map name="Map" id="Map">
            <area shape="rect" coords="763,253,923,389" href="javascript:$.scrollify('move','#p1');" id="ptn1" />
        </map>
    </section>
    <section class="panel p1" data-section-name="p1">
        <img src="http://dl.vinistyle.cn/special/nationalday2014/p1.gif" width="960" height="1389" border="0" usemap="#Map2" class="imgktsee" />
        <map name="Map2" id="Map2">
            <area shape="rect" coords="747,55,906,191" href="javascript:$.scrollify('move','#p2');" id="ptn2" />
            <area shape="rect" coords="369,1009,509,1061" href="http://www.vinistyle.cn/search.html?keywords=%E5%BC%80" target="_blank" />
        </map>
    </section>
    

最终实现的效果[见这里][2]

 [1]: http://projects.lukehaas.me/scrollify/
 [2]: http://www.vinistyle.cn/s/2014NationalDay/