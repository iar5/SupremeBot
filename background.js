/**
 * @author Tom Wendland
 * @description
 * after starting the bot it creates a tab for every supremeitem.
 * the tabs keep refreshing until the injected item were located
 */

"use strict";

var cartTab;

/**
 * manages the logic steps by send and response
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    // STEP 1.0:
    // CREATE TAB FOR EVERY ITEM AND SEARCH IT IN HIS CATEGORIE
    if (message.bot !== undefined) {
        if (message.bot === "start") {
            chrome.tabs.create({url: "https://www.supremenewyork.com/shop/cart", active: true}, function (tab) {cartTab = tab;});
            chrome.storage.local.get("supremeitems", function (items) {
                const supremeitems = items.supremeitems;
                let i = 0;

                function f() {
                    if (i < supremeitems.length) {
                        const item = supremeitems[i];
                        chrome.tabs.create({
                            url: "https://www.supremenewyork.com/shop/all/" + item.categorie,
                            active: false
                        }, function (tab) {
                            chrome.tabs.executeScript(tab.id, {code: 'var item = ' + JSON.stringify(item)}, function () {
                                chrome.tabs.executeScript(tab.id, {file: "working_scripts/shopItem_1.js"}, function (tab) {
                                    if (!tab) console.log("Error: stopped bot caused by closing last tab");
                                    else {
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
        else if (message.bot === "stop"){

        }
    }

    else if (message.itemStatus !== undefined) {
        const status = message.itemStatus.status;
        const item = message.itemStatus.item;

         // STEP 1.1:
        // RELOAD TAB AND INJECT SCRIPT AGAIN
        //TODO wenn erste item gefunden andere tabs noch 1x suchen lassen und dann stoppen
        if (status === "notFound") {
            updateTab(sender.tab, sender.url, "working_scripts/shopItem_1.js", item);
        }

         // STEP 2:
        // SELECT SIZE AND ADD IT TO BASKET
        else if (status === "itemFound") {
            updateTab(sender.tab, message.itemStatus.url, "working_scripts/shopItem_2.js", item);
        }

        else if (status === "soldOut") {
        }

        else if (status === "stillInCart") {
        }

         // STEP 3:
        // STOP/CONTINUE IF ALL ITEMS ARE ADDED
        else if (status === "inCart") {
            removeSupremeItem(item.id, function (removed) {
                //chrome.tabs.remove(sender.tab.id)
                if (removed.length === 0) {
                    chrome.storage.local.get("settings", function (items) {
                        const settings = items.settings;
                        if (settings.gotocheckout === 1) {
                            if (settings.manuelmode === 1) {
                                // gotocheckout will be executed on url match
                                chrome.tabs.update(cartTab.id, {url: "https://www.supremenewyork.com/checkout"});
                            }
                            else {
                                updateTab(cartTab, "https://www.supremenewyork.com/checkout", "/working_scripts/shopItem_3.js");
                            }
                        }
                    })
                }
            })
        }
    }
});


/**
 * Fires on every tab update. good for matching urls even on ajax changes
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        if (tab.url.match(/^(http|https):\/\/www.supremenewyork.com\/shop$/)) {
            getSetting("nowelcomepage", function (nowelcomepage) {
                // nowelcome is a string
                if (nowelcomepage == 1)
                    chrome.tabs.update(tabId, {url: "https://www.supremenewyork.com/shop/all"})
            })
        }
        else if (tab.url.match(/^(http|https):\/\/www.supremenewyork.com\/shop\/*/)) {
            getSetting("showsoldout", function (showsoldout) {
                // showsoldout is a string
                if (showsoldout == 1)
                    chrome.tabs.insertCSS(tabId, {file: "working_scripts/new.css", allFrames: true}, function () {
                    });
            })
        }
        else if (tab.url.match(/^(http|https):\/\/www.supremenewyork.com\/checkout$/)) {
            getSetting("manuelmode", function (manuelmode) {
                if (manuelmode == 1) {
                    chrome.tabs.executeScript(tabId, {file: "working_scripts/shopItem_3.js"});
                }
            })
        }
    }
});


// http://stackoverflow.com/questions/4584517/chrome-tabs-problems-with-chrome-tabs-update-and-chrome-tabs-executescript
// http://stackoverflow.com/questions/20046803/remove-listener-when-given-url-is-visited-after-using-chrome-tabs-onupdated-addl
/**
 * @param {chrome.tabs.Tab} tab - tab which has to be updated
 * @param {String} url - new url
 * @param {String} script - String to script location
 * @param {Object} [object] - will inject in the updated tab and appear as "var item = object"
 */
function updateTab(tab, url, script, object) {

    chrome.tabs.update(tab.id, {url: url}, function (updated_tab) {
        chrome.tabs.onUpdated.addListener(listener);
        function listener(tabId, changeInfo, tab) {
            if (updated_tab.id === tabId && changeInfo.status === 'complete') {
                let code = "";
                if (object) code = 'var item = ' + JSON.stringify(object);
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

 testen obs klappt dass beim Drop mehrere Items hinzugefügt werden (oder bei jedem dann gleichzeitig auf hinzufügen gedrückt wird und es sich wieder blockiert)
 mögliche Lösung: "ready to add" häufen und dann nacheinander mit delay ausführen (ausführ stack)

 //TODO was wenn carttab wurde geschlossen

 //TODO: online time api
 */



//http://stackoverflow.com/questions/27823740/chrome-extension-message-passing-between-content-and-background-not-working







