/**
 * @description SELECT SIZE AND ADD ITEM TO BASKET
 * */

//var item = supremeitem; delivered from background.js

const availablesizes = document.getElementById('size');
const cctrl = document.getElementById("cctrl");


if(document.getElementById("cart-addf") !== null) {
    // one size item
    if (availablesizes.options === undefined && item.size === "") {
        commit();
    }
    // multiple size item
    else if (availablesizes.options !== undefined) {
        if(item.size === "anysize_r"){
            const random = Math.floor(Math.random() * availablesizes.options.length);
            availablesizes.selectedIndex = random;
            commit();
        }
        else if(item.size === "anysize_s") {
            availablesizes.selectedIndex = 0;
            commit();
        }
        else if(item.size === "anysize_l") {
            availablesizes.selectedIndex = availablesizes.options.length;
            commit();
        }
        else{
            for (let i = 0; i < availablesizes.options.length; i++) {
                if (availablesizes.options[i].text === item.size) {
                    availablesizes.selectedIndex = i;
                    commit();
                    break;
                }
            }
        }
    }
    else {
        console.log("Error: unexpected state");
    }
}
else if (document.getElementById("cart-remove") !== null) {
    // item is already in cart
    chrome.runtime.sendMessage({itemStatus: {item: item, status: "alreadyInCart"}});
}
else if (cctrl.getElementsByClassName("disabled").length !== 0) {
    // item in different colorway is already in cart
    chrome.runtime.sendMessage({itemStatus: {item: item, status: "alreadyInCart"}});
}
else if (cctrl.getElementsByClassName("button sold-out").length !== 0) {
    chrome.runtime.sendMessage({itemStatus: {item: item, status: "soldOut"}});
}
else{
    console.log("Error: unexpected state");
}


/**
 * @description finally adds the item to card
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

