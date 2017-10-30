/**
 * @author Tom Wendland
 * @description own methods which are accessible from every other script
 */

"use strict";

const OPTION_SETTINGS = ["addtocartdelay", "checkoutdelay", "refreshrate", "nowelcomepage", "showsoldout"]; //"stopautocheckout"
const POPUP_SETTINGS = ["gotocheckout", "autofill", "autocheckout", "manualmode"];



/* ACCESS FUNCTIONS */
/* GETTER */

/**
 * @callback callback function
 * callback returns {Object}
 */
function getFields(callback){
    chrome.storage.local.get("fields", function (items) {
        callback(items.fields);
    })
}

/**
 * @param {String} setting
 * @callback callback function
 * callback returns
 */
function getSetting(setting, callback) {
    chrome.storage.local.get("settings", function (items) {
        // TODO check if array part is used if not remove/move to getSettings
        if(Array.isArray(setting)){
            callback(getObjectSubset(items.settings, setting))
        }
        else {
            callback(items.settings[setting]);
            //callback(getObjectSubset(items.settings, [name]))
        }
    })
}

/**
 * @param {Array} settings
 * @callback callback function
 * callback returns {Object}
 */
function getSettings(settings, callback){
    chrome.storage.local.get("settings", function (items) {
        callback(getObjectSubset(items.settings, settings));
    })
}




/* SETTER */

function setSetting(name, value, callback) {
    chrome.storage.local.get("settings", function (items) {
        const settings = items.settings;
        settings[name] = value;
        chrome.storage.local.set({settings: settings}, function () {
            if (callback) callback();
        })
    })
}



/* TABLE METHODS */
/**
 * @param {int} id
 * @callback
 */
function removeSupremeItem(id, callback) {
    chrome.storage.local.get("supremeitems", function (items) {
        const removed = removeArrayItem(id, items.supremeitems);
        chrome.storage.local.set({"supremeitems": removed}, function () {
            if(callback) callback(removed);
        })
    })
}




/* ARRAY AND OBJECT METHODS */

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




