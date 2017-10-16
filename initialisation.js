/**
 * @author Tom Wendland
 * @function initialises variables at installation
 */

chrome.storage.local.get(null, function (items) {

    if (Object.keys(items).length === 0) {
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
            delay: 2250,
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

    else {
        items.settings.autocheckout = 0;
        chrome.storage.local.set({settings: items.settings});
    }
});