/**
 * @description: Allows to submit delayed "add to basket" request to avoid to be blocked/ignored by website from too many requests
 * @usage: you only need to call the run() function
 */

var PERFORMER =  {
    items: [],
    inProcess: false,
    addToCartDelay: 0,

    process: function () {
        PERFORMER.inProcess = true;
        setTimeout(function () {
            let item = PERFORMER.items.shift();
            updateTab(item.tabId, {url: item.url}, "/src/content/selectSize.js", item);
            if (PERFORMER.items.length >= 1) PERFORMER.process();
            else PERFORMER.inProcess = false;
        }, PERFORMER.addToCartDelay);
    },

    run: function (item, delay) {
        PERFORMER.items.push(item);
        if (!PERFORMER.inProcess) {
            PERFORMER.addToCartDelay = delay;
            PERFORMER.process();
        }
    }
};