/* AUTOFILL AND AUTO CHECKOUT */

chrome.storage.local.get(["autofill", "checkout", "fields"], function(items) {
    if(items.autofill == 1) {
        var fields = items.fields;
        var ok = true;
        for (var key in fields) {
            var element = document.getElementById(key);
            if (element != null) element.value = fields[key];
            else {
                console.log("Error: Cannot find Field for "+key);
                var ok = false;
            }
        }

        if(ok == true) document.getElementById("order_terms").nextSibling.click();

        if(items.checkout == 1) {
            chrome.storage.local.set({"checkout":0});
            document.getElementById("checkout_form").submit();
        }
    }
});





