
chrome.runtime.sendMessage({MSH: "getSettingsAndFields"}, function (response) {
    let settings = response.settings;
    let fields = response.fields;

    if (settings.autofill === 1) {
        for (let key in fields) {
            const element = document.getElementById(key);
            const value = fields[key];

            if(value === "") {}
            else if (element === null) {
                console.log("Error: Could not find element for field " + key);
                return;
            }
            else if (element.tagName === "SELECT") {
                for(let i = 0; i < element.options.length; i++){
                    if(element.options[i].value === value){

                        element.selectedIndex = i;
                        //element.options[i].selected = "selected";
                        //element.options[i].selected = true;
                        //element.click();
                        //TODO display paypal toggle
                    }
                }
            }
            else{
                element.value = value;
            }
        }
        document.getElementById("order_terms").nextSibling.click();

        if (settings.autocheckout === 1) {
            setTimeout(function () {
                settings.autocheckout = 0;
                chrome.storage.local.set({"settings": settings});
                document.getElementById("checkout_form").submit();
            }, settings.checkoutdelay);
        }
    }
});
