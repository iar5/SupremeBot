"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const cardtype = document.getElementById('credit_card_type');
    const noppelements = document.getElementsByClassName("nopp");
    const status = document.getElementById("status");

    function load() {
        getOptionSettingsAndFields(function (settings, fields) {
            const items = Object.assign({}, settings, fields);

            for (let key in items) {
                document.getElementById(key).value = items[key]
            }
            paypaltoggle();
            message("loaded");
        });
    }

    function save() {
        getOptionSettingsAndFields(function (settings, fields) {
            for (let key in fields) {
                const element = document.getElementById(key);
                if (!element.checkValidity()) return;
                fields[key] = element.value.trim();
            }
            for (let key in settings) {
                const element = document.getElementById(key);
                if (!element.checkValidity()) return;
                settings[key] = element.value.trim();
            }
            setOptionSettingsAndFields(settings, fields, function () {
                message("saved")
            });

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

    window.onkeydown = function (e) {
        //cmd+s bzw. strg+s
        if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            save();
        }
        // enter
        if (e.keyCode === 13) {
            save();
        }
    };

    /**
     * prüft ob es zu allen erwartete attributen ein doc.element gibt
     * wenn nein, werden buttons erst gar nicht mit funktionen belegt
     */
    getOptionSettingsAndFields(function (items) {
        for (let key in items) {
            if (!document.getElementById(key)) {
                message("Fatal error: field " + key + " does not exist");
                return;
            }
        }
        load();
        document.getElementById('save').addEventListener('click', save);
        document.getElementById('cancel').addEventListener('click', load);
        cardtype.onchange = paypaltoggle;
    });
});













