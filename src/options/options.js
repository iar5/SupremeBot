"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const cardtype = document.getElementById('credit_card_type');
    const noppelements = document.getElementsByClassName("nopp");
    const status = document.getElementById("message");

    function load() {
        MSH.getSettingsAndFields(MSH.OPTION_SETTINGS, function(items){
            const settingAndFields = Object.assign({}, items.settings, items.fields);
            for (let key in settingAndFields) {
                const element = document.getElementById(key);
                if (element) {
                    document.getElementById(key).value = settingAndFields[key];
                }
                else {
                    message("Error occurred while loading: field " + key + " does not exist");
                    console.log("Error occurred while loading: field " + key + " does not exist");
                    return
                }
            }
            message("loaded");
            paypaltoggle();
        });
    }

    function save() {
        MSH.getSettingsAndFields(null, function(items){
            let settings = items.settings;
            let fields = items.fields;

            for (let key in fields) {
                const element = document.getElementById(key);
                if (!element.checkValidity()) return;
                fields[key] = element.value.trim();
            }
            for (let key of MSH.OPTION_SETTINGS) {
                const element = document.getElementById(key);
                if (!element.checkValidity()) return;
                settings[key] = parseInt(element.value);
            }
            MSH.setSettingsAndField(settings, fields, function(){
                message("saved")
            })
        })

    }

    let timeout;
    function message(text) {
        status.textContent = "(" + text + ")";
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
            status.textContent = "";
        }, 3500)
    }

    function paypaltoggle() {
        if (cardtype.value === "paypal") {
            for (let i = 0; i < noppelements.length; i++)
                noppelements[i].style.display = "none";
        }
        else {
            for (let i = 0; i < noppelements.length; i++)
                noppelements[i].style.display = "block";
        }
    }

    window.addEventListener("keydown", function (e) {
        //cmd+s bzw. strg+s
        if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            save();
        }
        // enter
        if (e.keyCode === 13) {
            save();
        }
    });



    /* INITIALISATION */

    load();
    document.getElementById('save').addEventListener('click', save);
    document.getElementById('cancel').addEventListener('click', load);
    cardtype.onchange = paypaltoggle;
});













