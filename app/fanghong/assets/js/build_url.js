function build_url(){
    var url = encodeURI(document.querySelector('#url').value);
    url = "https://surenkid.github.io/app/fanghong/api/?url=" + url;
    document.getElementById("b_url").innerHTML=`<a href=${url} target='_blank'>${url}</a>`;
}