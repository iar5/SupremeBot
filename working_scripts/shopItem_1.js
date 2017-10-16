/* SEARCH ITEM IN CATEGORIE SECTIONS AND RETURNS ITEM LINK */

//var item delivered from background.js
const articles = document.getElementsByClassName("inner-article");
let found = false;
let stop = false;

for (let i = 0; i < articles.length && found === false; i++) {
    const article = articles[i];
    const name_regex = article.querySelectorAll("h1 > a")[0].innerHTML.toLowerCase().trim().match(new RegExp(".*" + item.name.toLowerCase().trim() + ".*"));
    const color_regex = article.querySelectorAll("p > a")[0].innerHTML.toLowerCase().trim().match(new RegExp(".*" + item.color.toLowerCase().trim() + ".*"));

    if (name_regex !== null && color_regex !== null) {
        found = true;
        if (article.getElementsByClassName("sold_out_tag").length === 0) {
            const url = article.querySelectorAll("h1 > a")[0].href;
            chrome.runtime.sendMessage({itemLink: {item: item, url: url}});
        } else {
            chrome.runtime.sendMessage({itemStatus: {itemId: item.id, status: "soldOut"}});
        }
    }
}

if(found === false) {setTimeout(function(){
            if(stop === false) chrome.runtime.sendMessage({reloadTab: {item: item}})}, 1000);
}


