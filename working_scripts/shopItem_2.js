/* SELECT SIZE AND ADD IT TO BASKET */

//var item = supremeitem; delivered from background.js
const availablesizes = document.getElementById('size');
const cctrl = document.getElementById("cctrl");


if(document.getElementById("cart-addf") !== null) {
    // one size item
    if (availablesizes.options === undefined && item.size === "") {
        commit();
    }
    // select size
    else if (availablesizes.options !== undefined) {
        for (let i = 0; i < availablesizes.options.length; i++) {
            if (availablesizes.options[i].text === item.size) {
                availablesizes.selectedIndex = i;
                commit();
                break;
            }
        }
    }
}
else if (document.getElementById("cart-remove") !== null) {
    //item is still in cart
    chrome.runtime.sendMessage({itemStatus: {item: item, status: "stillInCart"}});
}
else if (cctrl.getElementsByClassName("disabled").length !== 0) {
    //item in different colorway is still in cart
    chrome.runtime.sendMessage({itemStatus: {item: item, status: "stillInCart"}});
}
else if (cctrl.getElementsByClassName("button sold-out").length !== 0) {
    //item is sold out
    chrome.runtime.sendMessage({itemStatus: {item: item, status: "soldOut"}});
}
else{
    console.log("Error: unexpected state");
}


/**
 * @description
 * finally adds the item to card
 */
function commit() {
    const buttons = cctrl.getElementsByClassName("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].name === "commit") {
            chrome.runtime.sendMessage({itemStatus: {item: item, status: "inCart"}}, function(){});
            buttons[i].click();
        }
    }
}