/**
 * @author Tom Wendland
 * @description own methods which are accessible from every other script
 * works as a background script or as injected script in popup.html and options.html for easier storage access
 * BUT did not run beside content scripts. Even inject this file in content page use messagePassing
 *
 * storage hints and challenges
 * chrome.storage.set   : adds key/object pairs or overwrites if key still exist. so if i would like to change e.g. a variable from settings i have to replace the settings object with the new one containing all old variables and the updated one
 *
 **/

"use strict";

const MSH = {

    /*
    FIELDS_DEFAULT are saved decrypted. Only read or write the fields in combination with this class
     */
    FIELDS_DEFAULT: {
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
    },
    SETTINGS_DEFAULT: {
        //stopautocheckout: "so_nf",
        addtocartdelay: 330,
        checkoutdelay: 1250,
        refreshrate: 1000,

        nowelcomepage: 1,
        showsoldout: 1,
        gotocheckout: 1,
        autofill: 1,
        autocheckout: 0,
        manualmode: 0,
    },

    OPTION_SETTING_KEYS: ["addtocartdelay", "checkoutdelay", "refreshrate", "nowelcomepage", "showsoldout"], // "stopautocheckout"
    POPUP_SETTING_KEYS: ["gotocheckout", "autofill", "autocheckout", "manualmode"],
    REQ_SHIPPING_FIELDS_KEYS: ["order_billing_name", "order_email", "order_tel", "bo", "order_billing_city", "order_billing_zip", "order_billing_country"],






    /* ACCESS FUNCTIONS */
    /* GETTER */

    /**
     * @param {String} setting
     * @param {function(String)} callback function
     */
    getSetting: function (setting, callback) {
        chrome.storage.local.get("settings", function (items) {
            callback(items.settings[setting]);
        })
    },

    /**
     * @param {Array || null} settings
     * @param {function({})} callback function returns {Object}
     */
    getSettings: function (settings, callback) {
        chrome.storage.local.get("settings", function (items) {
            if (settings === null) callback(items.settings);
            else callback(getObjectSubset(items.settings, settings));
        })
    },

    /**
     * @param {function({})} callback function returns {Object}
     */
    getFields: function (callback) {
        chrome.storage.local.get("fields", function (items) {
            const decrypt = JSON.parse(sjcl.decrypt("fields", items.fields));
            callback(decrypt);
        })
    },

    /**
     * @param {Array || null} settings
     * @param {function({})} callback function returns {Object}
     */
    getSettingsAndFields: function (settings, callback) {
        MSH.getSettings(settings, function (settingItems) {
            MSH.getFields(function (fieldItems) {
                callback({settings: settingItems, fields: fieldItems});
            })
        })
    },


    /* SETTER */

    setSetting: function (name, value, callback) {
        chrome.storage.local.get("settings", function (items) {
            const settings = items.settings;
            settings[name] = value;
            chrome.storage.local.set({settings: settings}, function () {
                if (callback) callback();
            })
        })
    },

    setSettings: function (settings, callback) {
        chrome.storage.local.set({settings: settings}, function () {
            if (callback) callback();
        });
    },

    setFields: function (fields, callback) {
        const encrypt = sjcl.encrypt("fields", JSON.stringify(fields));
        chrome.storage.local.set({fields: encrypt}, function () {
            if (callback) callback();
        });
    },

    setSettingsAndField: function (settings, fields, callback) {
        MSH.setSettings(settings, function () {
            MSH.setFields(fields, function () {
                if (callback) callback();
            })
        })
    },

    isStorageEmpty: function (callback) {
        chrome.storage.local.get(null, function (items) {
            callback(Object.keys(items).length === 0);
        })
    },

    isReqShipFieldsComplete: function (callback) {
        MSH.getFields(function (fields) {
            let complete = true;
            for (let field in fields) {
                if (MSH.REQ_SHIPPING_FIELDS_KEYS.includes(field) && fields[field] === "") complete = false;
            }
            callback(complete)
        })
    },

    removeSupremeItem: function (id, callback) {
        chrome.storage.local.get("supremeitems", function (items) {
            const removed = removeArrayItem(id, items.supremeitems);
            chrome.storage.local.set({"supremeitems": removed}, function () {
                if (callback) callback(removed);
            })
        })
    },
};


/* PRIVATE METHODS*/

/**
 * @param {Object} set
 * @param {Array} subset
 * @returns {Object} as subset key : set value
 */
function getObjectSubset(set, subset) {
    let result = {};

    for (let i = 0; i < subset.length; i++) {
        const key = subset[i];
        // TODO if(!result[key])
        result[key] = set[key]
    }
    return result;
}

/**
 * @param {int} item_id
 * @param {Array} array
 * @returns {Array} if there is no item with given id in given it will return the unchanged array
 */
function removeArrayItem(item_id, array) {
    const i = getArrayItemIndex(item_id, array);
    if (i !== null) array.splice(i, 1);
    return array;
}

/**
 * @param {int} item_id
 * @param {Array} array
 * @returns {int | null} if id exist | not exist
 * gibt supreme_ID oder position aus array zurück?
 */
function getArrayItemIndex(item_id, array) {
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (item.id === item_id) {
            return i;
        }
    }
    return null;
}