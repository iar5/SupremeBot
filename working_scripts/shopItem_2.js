/* SELECT SIZE AND ADD IT TO BASKET */

//var item delivered from background.js
const availablesizes = document.getElementById('size');

if (document.getElementsByClassName("button sold-out").length !== 0) {
    chrome.runtime.sendMessage({itemStatus: {itemId: item.id, status: "soldOut"}});
}

else if (document.getElementById("in-cart") !== null) {
    chrome.runtime.sendMessage({itemStatus: {itemId: item.id, status: "inCart"}});
}

else if (availablesizes.options === undefined && item.size === "") {
    commit();
}

else if (availablesizes.options !== undefined) {
    for (let i = 0; i < availablesizes.options.length; i++) {
        if (availablesizes.options[i].text === item.size) {
            availablesizes.selectedIndex = i;
            commit();
            break;
        }
    }
}



function commit() {
    const buttons = document.getElementsByClassName("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].name === "commit") {
            chrome.runtime.sendMessage({itemStatus: {itemId: item.id, status: "inCart"}}, function(){});
            buttons[i].click();
        }
    }
}