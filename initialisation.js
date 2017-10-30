/**
 * @author Tom Wendland
 * @function initialises variables at installation
 */


/**
 * Setzt bei Neuinstallation und Update die Variablen neu.
 * TODO bei Update alte werte behalten aber neu hinzugekommenen variablen trotzdem setzen
 */
chrome.runtime.onInstalled.addListener(initializeStorage);

function initializeStorage(){

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
        checkoutdelay: 1750,
        refreshrate: 1000,

        nowelcomepage: 1,
        showsoldout: 1,
        gotocheckout: 1,
        autofill: 1,
        autocheckout: 0,
        manualmode: 0
    };
    chrome.storage.local.set({
        "lastId": 0,
        "supremeitems": [],
        "fields": fields,
        "settings": settings,
    });
    console.log("Initialised");
}

/*
turns off autocheckout on skript reload
-> mac: quit Chrome application
-> win: //TODO check if it works
*/

items.settings.autocheckout = 0;
chrome.storage.local.set({settings: items.settings});

