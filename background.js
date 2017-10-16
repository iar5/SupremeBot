/* INITIALISATION */

chrome.storage.local.get(null, function (items) {
    if (Object.keys(items).length == 0) {
        var fields = {
            order_billing_name: "",
            order_email: "",
            order_tel: "",
            bo: "",
            oba3: "",
            order_billing_address_3: "",
            order_billing_city: "",
            order_billing_zip: "",
            order_billing_country: "",
            credit_card_type: "visa",
            cnb: "",
            credit_card_month: "12",
            credit_card_year: "2027",
            vval: ""
        };
        chrome.storage.local.set({
            "fields": fields,
            "gotobasket": 0,
            "autofill": 0,
            "checkout": 0,
            "supremeitems": [],
            "lastId": 0
        });
    }
});


/* PROCESSING */

var cartTab;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        // REMOVES SUPREMEITEM FROM STORAGE (BY Item ID)
        if (request.removeSuprItem != undefined) {
            chrome.storage.local.get("supremeitems", function (items) {
                var supremeitems = items.supremeitems;
                var removed = removeItem(supremeitems, request.removeSuprItem);
                if (removed != null) chrome.storage.local.set({"supremeitems": removed}, function () {
                    sendResponse();
                })
            })
            return true; // http://stackoverflow.com/questions/27823740/chrome-extension-message-passing-between-content-and-background-not-working
        }

        // STEP 1: CREATE TAB FOR EVERY ITEM AND SEARCH IT IN HIS CATEGORIE
        else if (request.startBot == "start") {
            chrome.tabs.create({url: "https://www.supremenewyork.com/shop/cart", active: true}, function (tab) {
                cartTab = tab;
            });

            chrome.storage.local.get("supremeitems", function (items) {
                var supremeitems = items.supremeitems;

                var i = 0

                function f() {
                    if (i < supremeitems.length) {
                        var item = supremeitems[i]
                        chrome.tabs.create({
                            url: "https://www.supremenewyork.com/shop/all/" + item.categorie,
                            active: false
                        }, function (tab) {
                            chrome.tabs.executeScript(tab.id, {code: 'var item = ' + JSON.stringify(item)}, function () {
                                chrome.tabs.executeScript(tab.id, {file: "working_scripts/shopItem_1.js"}, function () {
                                    i++
                                    f();
                                })
                            })
                        })
                    }
                }
                f();
            })
        }

        // STEP 1.1 RELOAD TAB A ND INJETCT SCRIPT AGAIN
        else if (request.reloadTab != undefined) {
            updateTab(sender.tab, sender.url, request.reloadTab.item, "working_scripts/shopItem_1.js");
        }

        // STEP 2: SELECT SIZE AND ADD IT TO BASKET
        else if (request.itemLink != undefined) {
            updateTab(sender.tab, request.itemLink.url, request.itemLink.item, "working_scripts/shopItem_2.js");
        }

        // STEP 3: STOP/CONTINUE IF ALL ITEMS ARE ADDED
        else if (request.setItemStatus != undefined) {
            //chrome.tabs.update(sender.tab.id, {active: true}, function () {});

            chrome.storage.local.get(["supremeitems", "gotobasket"], function (items) {
                if (request.setItemStatus.status === "inCart") {
                    var supremeitems = items.supremeitems;
                    var gotobasket = items.gotobasket;
                    var removed = removeItem(supremeitems, request.setItemStatus.itemId);
                    if (removeItem == null) return;
                    chrome.storage.local.set({"supremeitems": removed});

                    //if(gotobasket === 1 && removed.length === 0) {chrome.tabs.update(cartTab.id, {active: true, url: "https://www.supremenewyork.com/checkout"});}
                    //else {chrome.tabs.update(cartTab.id, {url: cartTab.url});}
                }
            })

        }
    }
);

function getArrayIndex(supremeitems, item_id) {
    for (var i = 0; i < supremeitems.length; i++) {
        var item = supremeitems[i];
        if (item.id == item_id) {
            return i;
        }
    }
    return null;
}

function removeItem(supremeitems, item_id) {
    var i = getArrayIndex(supremeitems, item_id);
    if (i == null) return null;
    supremeitems.splice(i, 1);
    return supremeitems;
}


// http://stackoverflow.com/questions/4584517/chrome-tabs-problems-with-chrome-tabs-update-and-chrome-tabs-executescript
// http://stackoverflow.com/questions/20046803/remove-listener-when-given-url-is-visited-after-using-chrome-tabs-onupdated-addl
function updateTab(tab, url, item, script) {
    chrome.tabs.update(tab.id, {url: url}, function (updated_tab) {
        chrome.tabs.onUpdated.addListener(listener);
        function listener(tabId, changeInfo, tab) {
            if (updated_tab.id == tabId && changeInfo.status === 'complete') {
                chrome.tabs.executeScript(tabId, {code: 'var item = ' + JSON.stringify(item)}, function () {
                    chrome.tabs.executeScript(tabId, {file: script});
                    chrome.tabs.onUpdated.removeListener(listener);
                })
            }
        }
    })
}

