/*
 "content_scripts": [{
 "matches": ["*://www.supremenewyork.com/checkout"],
 "js": ["content.js"]
 }]
 */

chrome.storage.local.get(["settings", "fields"], function(items) {
    const settings = items.settings;
    const fields = items.fields;

    if (settings.autofill === 1) {
        for (let key in fields) {
            const element = document.getElementById(key);
            const value = fields[key];
            if (element === null) console.log("Error: Cannot find element for field " + key);
            else if (value === "");
            else {
                /*if(element.tagName === "SELECT"){
                    element.options[] .click()
                 element.selectedIndex = i;

                 }*/
                element.value = value;
            }
        }

        document.getElementById("order_terms").nextSibling.click();
        if (settings.autocheckout === 1) {
            setTimeout(function () {
                settings.autocheckout = 0;
                chrome.storage.local.set({"settings": settings});
                document.getElementById("checkout_form").submit();
            }, settings.delay);
        }

    }
});