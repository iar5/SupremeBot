/**
 * @author Tom Wendland
 * @function initialises variables at installation
 */


/**
 * @description initializes storage
 * on Installation: sets basic settings
 * on version Update: adds new settings to current settings
 */
chrome.runtime.onInstalled.addListener(function (OnInstalledReason) {

    let settings = MSH.SETTINGS_DEFAULT;
    let fields = MSH.FIELDS_DEFAULT;

    if (OnInstalledReason.reason === "update") {
        MSH.getSettingsAndFields(null, function (items) {
            const currentSettings = items.settings;
            const currentFields = items.fields;

            for (let s in settings) {
                if (currentSettings[s]) settings[s] = currentSettings[s];
            }
            for (let f in fields) {
                if (currentFields[f]) fields[f] = currentFields[f];
            }
            setup(settings,fields);
        })
    }
    else{
        setup(settings, fields)
    }

    function setup(settings, fields){
        chrome.storage.local.set({
            "lastId": 0,
            "supremeitems": [],
        }, function () {
            MSH.setSettingsAndField(settings, fields, function () {
                console.log("Initialised");
            })
        })
    }
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

