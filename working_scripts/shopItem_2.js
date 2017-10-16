/* SELECT SIZE AND ADD IT TO BASKET */

var item; // delivered from background.js

if (document.getElementsByClassName("button sold-out").length != 0) {
    chrome.runtime.sendMessage({setItemStatus: {itemId: item.id, status: "soldOut"}});
    window.close();
}
else {
    var availablesizes = document.getElementById('size');

    if (document.getElementById("in-cart") != null)
        chrome.runtime.sendMessage({setItemStatus: {itemId: item.id, status: "inCart"}});

    else if (availablesizes.options === undefined && item.size === "")
        commit();

    else if (availablesizes.options != undefined) {
        for (var i = 0; i < availablesizes.options.length; i++) {
            if (availablesizes.options[i].text === item.size) {
                availablesizes.selectedIndex = i;
                commit();
                break;
            }
        }
    }
}

function commit() {
    var buttons = document.getElementsByClassName("button");
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].name == "commit") {
            chrome.runtime.sendMessage({setItemStatus: {itemId: item.id, status: "inCart"}}, function (response) {});
            buttons[i].click();
            break;
        }
    }
}