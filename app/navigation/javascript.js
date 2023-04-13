var tim = 1;
setInterval("tim++", 10);

var autourl = [];
$('.speedlist li').each(function () {
    var url = $(this).find('a').attr("href");
    var index = $(this).index();
    autourl[index] = url;

    // 设置要检测的组件ID
    $('#lineMs' + index).html(tim + 'ms');
});

function auto(url, index, time) {
    console.log(time);
    $('#lineMs' + index).html(time + 'ms');
}

function run() {
    for (var i = 0; i < autourl.length; i++) {
        var url = autourl[i];
        var index = i;
        $('<img />', {
            src: url + "/" + Math.random(),
            width: 1,
            height: 1,
            style: 'display:none'
        }).error(function () {
            auto(url, index, tim);
        });
    }
}

run();