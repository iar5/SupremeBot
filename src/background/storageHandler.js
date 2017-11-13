/**
 * @author Tom Wendland
 * @description own methods which are accessible from every other script
 * works as a background script or as injected script in popup.html and options.html for easier storage access
 * BUT did not run beside content scripts. Even inject this file in content page use messagePassing
 */

"use strict";

const MSH = {
    OPTION_SETTINGS: ["addtocartdelay", "checkoutdelay", "refreshrate", "nowelcomepage", "showsoldout"], //"stopautocheckout"
    POPUP_SETTINGS: ["gotocheckout", "autofill", "autocheckout", "manualmode"],

    /* ACCESS FUNCTIONS */
    /* GETTER */
    /**
     * @param {String} setting
     * @param {function{}} callback function
     */
    getSetting: function (setting, callback) {
        chrome.storage.local.get("settings", function (items) {
            // TODO check if array part is used if not remove/move to getSettings
            if (Array.isArray(setting)) {
                callback(getObjectSubset(items.settings, setting))
            }
            else {
                callback(items.settings[setting]);
                //callback(getObjectSubset(items.settings, [name]))
            }
        })
    },

    /**
     * @param {Array || null} settings
     * @param {function{}} callback function returns {Object}
     */
    getSettings: function(settings, callback) {
        chrome.storage.local.get("settings", function (items) {
            if (settings === null) callback(items.settings);
            else callback(getObjectSubset(items.settings, settings));
        })
    },

    /**
     * @param {function{}} callback function returns {Object}
     */
    getFields: function(callback) {
        chrome.storage.local.get("fields", function (items) {
            const decrypt = JSON.parse(sjcl.decrypt("fields", items.fields));
            callback(decrypt);
        })
    },

    /**
     * @param {Array || null} settings
     * @param {function{}} callback function returns {Object}
     */
    getSettingsAndFields: function(settings, callback){
        MSH.getSettings(settings, function(settingItems){
            MSH.getFields(function(fieldItems){
                if(callback) callback({settings: settingItems, fields: fieldItems});
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

    setSettingsAndField: function(settings, fields, callback){
        MSH.setSettings(settings, function(){
            MSH.setFields(fields, function(){
                if(callback) callback();
            })
        })
    },

    isStorageEmpty: function (callback) {
        chrome.storage.local.get(null, function (items) {
            callback(Object.keys(items).length === 0);
        })
    },

    removeSupremeItem: function(id, callback) {
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