/**
 * @author Tom Wendland
 * @function initialises variables at installation
 */


/**
 * @description initializes storage
 * on Installation: sets basic settings
 * on version Update: adds new settings to current settings
 *
 */
chrome.runtime.onInstalled.addListener(function(){

    let fields = {
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
    let settings = {
        //stopautocheckout: "so_nf",
        addtocartdelay: 330,
        checkoutdelay: 1250,
        refreshrate: 1000,

        nowelcomepage: 1,
        showsoldout: 1,
        gotocheckout: 1,
        autofill: 1,
        autocheckout: 0,
        manualmode: 0
    };

    MSH.isStorageEmpty(function (empty) {
        if (!empty) {
            MSH.getSettingsAndFields(null, function(items){
                const currentSettings = items.settings;
                const currentFields = items.fields;

                for (let s in settings) {
                    if (currentSettings[s]) settings[s] = currentSettings[s];
                }
                for (let f in fields) {
                    if (currentFields[f]) fields[f] = currentFields[f];
                }
            })
        }

        chrome.storage.local.set({
            "lastId": 0,
            "supremeitems": [],
        }, function () {
            MSH.setSettingsAndField(settings, fields, function () {
                console.log("Initialised");
            })
        })
    })
});


/*
turns off autocheckout on skript reload
return if storage is not initialized yet;
-> mac: quit Chrome application
-> win: //TODO check if it works
*/

MSH.getSettings(null, function (settings) {
    if (!settings) return;
    settings.autocheckout = 0;
    MSH.setSettings(settings);
});

