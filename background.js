/**
 * @author Tom Wendland
 * @function logic
 */

"use strict";

var cartTab;

/**
 * manages the logic steps by send and response
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    // REMOVES SUPREMEITEM FROM STORAGE BY ITEM ID)
    if (message.removeItem !== undefined) {
        chrome.storage.local.get("supremeitems", function (items) {
            chrome.storage.local.set({"supremeitems": removeItem(items.supremeitems, message.removeItem)}, function () {
                sendResponse();
            })
        });
        return true; // http://stackoverflow.com/questions/27823740/chrome-extension-message-passing-between-content-and-background-not-working
    }

    // STEP 1: CREATE TAB FOR EVERY ITEM AND SEARCH IT IN HIS CATEGORIE
    else if (message.startBot === "start") {

        chrome.tabs.create({url: "https://www.supremenewyork.com/shop/cart", active: true}, function (tab) {
            cartTab = tab;
        });

        chrome.storage.local.get("supremeitems", function (items) {
            const supremeitems = items.supremeitems;
            let i = 0;

            function f() {
                if (i < supremeitems.length) {
                    const item = supremeitems[i];
                    chrome.tabs.create({
                        url: "https://www.supremenewyork.com/shop/all/" + item.categorie, active: false
                    }, function (tab) {
                        chrome.tabs.executeScript(tab.id, {code: 'var item = ' + JSON.stringify(item)}, function () {
                            chrome.tabs.executeScript(tab.id, {file: "working_scripts/shopItem_1.js"}, function (tab) {
                                if (!tab) {
                                    console.log("Error: stopped bot caused by closing last tab")
                                } else {
                                    i++;
                                    f();
                                }
                            });
                        })
                    })
                }
            }

            f();
        })
    }


    // STEP 1.1 RELOAD TAB AND INJECT SCRIPT AGAIN
    else if (message.reloadTab !== undefined) {
        // TODO: if session.firstfound == false updateTab
        updateTab(sender.tab, sender.url, "working_scripts/shopItem_1.js", message.reloadTab.item);
    }

    // STEP 2: SELECT SIZE AND ADD IT TO BASKET
    else if (message.itemLink !== undefined) {
        updateTab(sender.tab, message.itemLink.url, "working_scripts/shopItem_2.js", message.itemLink.item);
    }

    // STEP 3: STOP/CONTINUE IF ALL ITEMS ARE ADDED
    else if (message.itemStatus !== undefined) {
        //TODO 1.1 hier includieren? reload/notfound parallel dazu dann firstFound = true speichern
        //TODO was wenn bereits im warenkorb
        /*
         chrome.storage.local.get(["settings"], function (items) {
         let stopautocheckout = items.settings.stopautocheckout;
         if(itemStatus.status === "inCart");
         else if(stopautocheckout === "so" && itemStatus.status === "soldOut");
         else if(stopautocheckout === "nf" && itemStatus.status === "notFound");
         else if(stopautocheckout === "so_nf" && itemStatus.status === "soldOut" || itemStatus.status === "notFound");
         else if(stopautocheckout === "never");
         }
         */


        if (message.itemStatus.status === "inCart") {
            chrome.storage.local.get(["supremeitems", "gotocheckout", "manuelmode"], function (items) {

                const removed = removeItem(items.supremeitems, message.itemStatus.itemId);
                chrome.storage.local.set({"supremeitems": removed});
                //chrome.tabs.remove(sender.tab.id)

                if (removed.length === 0 && items.gotocheckout === 1) {
                    if (items.manuelmode === 1)
                    // gotocheckout will be executed on url match
                        chrome.tabs.update(cartTab.id, {url: "https://www.supremenewyork.com/checkout"});
                    else
                        updateTab(cartTab, "https://www.supremenewyork.com/checkout", "/working_scripts/shopItem_3.js");
                }
            })
        }
    }
});


/**
 * fires on every tab update. good for ajax matches
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if(changeInfo.status === "complete")
    {
        if (tab.url.match(/^(http|https):\/\/www.supremenewyork.com\/shop$/)) {
            chrome.storage.local.get("settings", function (items) {
                // nowelcome is a string
                if (items.settings.nowelcomepage == 1)
                    chrome.tabs.update(tabId, {url: "https://www.supremenewyork.com/shop/all"})
            })
        }
        else if (tab.url.match(/^(http|https):\/\/www.supremenewyork.com\/shop\/*/)) {
            chrome.storage.local.get("settings", function (items) {
                // showsoldout is a string
                if (items.settings.showsoldout == 1)
                    chrome.tabs.insertCSS(tabId, {file: "working_scripts/new.css", allFrames: true}, function () {
                    });
            })
        }
        else if (tab.url.match(/^(http|https):\/\/www.supremenewyork.com\/checkout$/)) {
            chrome.storage.local.get("manuelmode", function (items) {
                if (items.manuelmode === 1) {
                    chrome.tabs.executeScript(tabId, {file: "working_scripts/shopItem_3.js"});
                }
            })
        }
    }
});


function removeItem(array, item_id) {
    const i = getArrayIndex(array, item_id);
    if (i !== null) array.splice(i, 1);
    return array;
}

function getArrayIndex(supremeitems, item_id) {
    for (let i = 0; i < supremeitems.length; i++) {
        const item = supremeitems[i];
        // do not change equivalencies. item_id is a string
        if (item.id == item_id) {
            return i;
        }
    }
    return null;
}


// http://stackoverflow.com/questions/4584517/chrome-tabs-problems-with-chrome-tabs-update-and-chrome-tabs-executescript
// http://stackoverflow.com/questions/20046803/remove-listener-when-given-url-is-visited-after-using-chrome-tabs-onupdated-addl
function updateTab(tab, url, script, item) {
    chrome.tabs.update(tab.id, {url: url}, function (updated_tab) {
        chrome.tabs.onUpdated.addListener(listener);
        function listener(tabId, changeInfo, tab) {
            if (updated_tab.id === tabId && changeInfo.status === 'complete') {
                let code = "";
                if (item) code = 'var item = ' + JSON.stringify(item);
                chrome.tabs.executeScript(tabId, {code: code}, function () {
                    chrome.tabs.executeScript(tabId, {file: script});
                    chrome.tabs.onUpdated.removeListener(listener);
                })
            }
        }
    })
}


/*
 Bot beenden, wenn
 - alle geöffneten Tabs geschlossen sind
 - verlmüpfung von ausgangs array item ids mit tab ids
 - je nach setting (sold out, didnt found,..) dann "stop" bot

 wenn erste item gefunden andere tabs noch 1x suchen lassen und dann stoppen

 check if option values are valid

 testen obs klappt dass beim Drop mehrere Items hinzugefügt werden (oder bei jedem dann gleichzeitig auf hinzufügen gedrückt wird und es sich wieder blockiert)
 mögliche Lösung: "ready to add" häufen und dann nacheinander mit delay ausführen (ausführ stack)

 icons für settings h3

 //TODO was wenn carttab wurde geschlossen

 //TODO proxy für us seite und gucken ob klappt

 //TODO: online time api

 //TODO prevent save message if not saved
 */










