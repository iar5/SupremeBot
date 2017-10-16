/**
 * @author Tom Wendland
 */

"use strict";

/**
 * own storage methods
 */


/* INITIALISATION */

const OPTION_S = ["delay", "nowelcomepage", "showsoldout"]; //"stopautocheckout"
const POPUP_S = ["gotocheckout", "autofill", "autocheckout", "manuelmode"];




/* ACCESS FUNCTIONS, GET AND SET */

function getSetting(name, callback) {
    chrome.storage.local.get("settings", function (items) {
        const settings = items.settings;
        let result;
        for (let key in settings) {
            if (key === name) result = settings[key]
        }
        callback(result);
    })
}

function getPopupSettings(callback) {
    chrome.storage.local.get("settings", function (items) {
        callback(getObjectSubset(items.settings, POPUP_S));
    })
}

function getOptionSettings(callback) {
    chrome.storage.local.get("settings", function (items) {
        callback(getObjectSubset(items.settings, OPTION_S));
    })
}

function getOptionSettingsAndFields(callback) {
    chrome.storage.local.get(["settings", "fields"], function (items) {
        const options = getObjectSubset(items.settings, OPTION_S);
        const fields = items.fields;
        callback(options, fields);
    })
}

function setFields(fields, callback) {
    chrome.storage.local.set({fields: fields}, function () {
        if (callback) callback()
    })
}

function setSetting(name, value, callback) {
    chrome.storage.local.get("settings", function (items) {
        const settings = items.settings;
        settings[name] = value;
        chrome.storage.local.set({settings: settings}, function () {
            if (callback) callback();
        })
    })
}

function setSettings(newSettings, callback) {
    chrome.storage.local.get("settings", function (items) {
        const settings = items.settings;
        for (let key in newSettings) {
            settings[key] = newSettings[key];
        }
        chrome.storage.local.set({settings: settings}, function () {
            if (callback) callback();
        })
    })
}

function setOptionSettingsAndFields(newSettings, newFields, callback) {
    setSettings(newSettings, function() {
        setFields(newFields, function () {
            if (callback) callback();
        })
    })
}

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
 * @returns {int} if id exist
 * @returns {null} if id does not exist
 */
function getArrayItemIndex(item_id, array) {
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        // do not change equivalencies. item_id may be string
        if (item.id == item_id) {
            return i;
        }
    }
    return null;
}



