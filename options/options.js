"use strict";

document.addEventListener("DOMContentLoaded", function () {

    //const settings = ["stopautocheckout", "delay", "nowelcomepage", "showsoldout"];
    const boxes = {};
    
    for (let i = 0; i < settings.length; i++) {
        const setting = settings[i];
        boxes[setting] = document.getElementById("box" + setting);
    }

    function load() {
        chrome.storage.local.get(["fields", "settings"], function (items) {
            let fields = items.fields;
            let settings = items.settings;

            for (let key in fields) {
                document.getElementById(key).value = fields[key]
            }
            for (let key in settings) {
                document.getElementById(key).value = settings[key]
            }
            paypaltoggle();
            message("loaded");
        });
    }

    function save() {
        chrome.storage.local.get(["fields", "settings"], function (items) {
            let fields = items.fields;
            let settings = items.settings;

            for (let key in fields) {
                fields[key] = document.getElementById(key).value;
            }
            for (let key in settings) {
                settings[key] = document.getElementById(key).value;
            }
            chrome.storage.local.set({"fields": fields, "settings": settings}, function () {
                message("saved");
            });
        });
    }

    let timeout;
    function message(text) {
        let status = document.getElementById("status");
        status.textContent = "(" + text + ")";

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(function () {
            status.textContent = "";
        }, 3500)
    }


    /**
     * blendet nict benötigte felder aus, wenn paypal ausgewählt ist
     */
    let cardtype = document.getElementById('credit_card_type');
    let noppelements = document.getElementsByClassName("nopp");
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

    window.onkeydown = function (e) {
        if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            save();
        }
    };


    /**
     * prüft ob es zu allen erwartete attributen ein doc.element gibt
     * wenn nein, werden buttons erst gar nicht mit funktionen belegt
     */
    chrome.storage.local.get(["fields", "settings"], function (items) {
        for (let key in Object.assign({}, items.settings, items.fields)) {
            if (!document.getElementById(key)) {
                message("Fatal error: field " + key + " does not exist");
                return;
            }
        }
        load();
        document.getElementById('save').addEventListener('click', save);
        document.getElementById('cancel').addEventListener('click', load);
        cardtype.onchange = paypaltoggle;
    })

});


// TODO aus fields und settings locales array machen
// dann auch leichter zu validieren (delay ungültig -> auf 0