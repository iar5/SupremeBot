/*
 "content_scripts": [{
 "matches": ["*://www.supremenewyork.com/checkout"],
 "js": ["content.js"]
 }]
 */

chrome.storage.local.get(["autofill", "autocheckout", "fields", "settings"], function(items) {
    if (items.autofill === 1) {
        const fields = items.fields;
        let ok = true;
        for (let key in fields) {
            const element = document.getElementById(key);
            const value = fields[key];
            if (element !== null) {
                //if(element.tagName === "SELECT"); //TODO emulate manually handled option select to trigger local events (country -> refreshes tax box, paypal toggle,..)
                //else
                element.value = value;
            }
            else {
                console.log("Error: Cannot find Field for " + key);
                ok = false;
            }
        }

        if (ok === true) {
            document.getElementById("order_terms").nextSibling.click();
            if (items.autocheckout === 1) {
                setTimeout(function () {
                    chrome.storage.local.set({"autocheckout": 0});
                    document.getElementById("checkout_form").submit();
                }, items.settings.delay);
            }
        }
    }
});