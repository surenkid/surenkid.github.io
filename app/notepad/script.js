/*! Minimalist Web Notepad | https://github.com/pereorga/minimalist-web-notepad */

function uploadContent() {

    // If textarea value changes.
    if (content !== textarea.value) {
        var temp = textarea.value;
        
        localStorage.setItem("notepad-txt",temp);
        content = temp;
        setTimeout(uploadContent, 1000);

        // Make the content available to print.
        printable.removeChild(printable.firstChild);
        printable.appendChild(document.createTextNode(temp));
    }
    else {

        // Content has not changed, check again after 1 second.
        setTimeout(uploadContent, 1000);
    }
}

var textarea = document.getElementById('content');
var printable = document.getElementById('printable');
var content = localStorage.getItem("notepad-txt");

document.getElementById('content').innerHTML = content; 

// Make the content available to print.
printable.appendChild(document.createTextNode(content));

textarea.focus();
uploadContent();
