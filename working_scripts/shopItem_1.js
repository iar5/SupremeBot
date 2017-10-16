/* SEARCH ITEM IN CATEGORIE SECTIONS AND RETURNS ITEM LINK */

var item; // delivered from background.js
var articles = document.getElementsByClassName("inner-article");
var found = false;

for (var i = 0; i < articles.length && found == false; i++) {
    var article = articles[i];
    var name_regex = article.querySelectorAll("h1 > a")[0].innerHTML.toLowerCase().trim().match(new RegExp(".*" + item.name.toLowerCase().trim() + ".*"));
    var color_regex = article.querySelectorAll("p > a")[0].innerHTML.toLowerCase().trim().match(new RegExp(".*" + item.color.toLowerCase().trim() + ".*"));

    if (name_regex != null && color_regex != null) {
        found = true;
        if (article.getElementsByClassName("sold_out_tag").length == 0) {
            var url = article.querySelectorAll("h1 > a")[0].href;
            chrome.runtime.sendMessage({itemLink: {item: item, url: url}});
        } else {
            chrome.runtime.sendMessage({setItemStatus: {itemId: item.id, status: "soldOut"}});
            window.close();
        }
    }
}

if(found == false) {
    setTimeout(function(){chrome.runtime.sendMessage({reloadTab: {item: item}})}, 1000);
}


