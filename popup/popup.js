"use strict";

document.addEventListener("DOMContentLoaded", function () {


    /* << INITIALISATION >> */

    const test = [
        {"name": "tagless tee", "color": "white", "categorie": "accessories", "size": "Large", "id": 101},
        {"name": "crew socks", "color": "black", "categorie": "accessories", "size": "", "id": 102},
        {"name": "glasses", "color": "clear", "categorie": "accessories", "size": "", "id": 103},
        {"name": "truck", "color": "silver", "categorie": "skate", "size": "129", "id": 104},
        {"name": "keychain", "color": "clear", "categorie": "accessories", "size": "", "id": 105}
    ];

    /**
     * @param settings contains names of settings having inputs in the doc
     * @param boxes reveals input elements representing an setting, initialised by following for-loop
     */
    const settings = ["gotocheckout", "autofill", "autocheckout", "manuelmode"];
    const boxes = {};

    //TODO settings und boxes zusammen packen?
    //TODO klappt chrome.storage get auch auf settings array (denke nein) bzw dann auf boxes mit gefüllten werten?

    /**
     * initialises @param boxes
     */
    for (let i = 0; i < settings.length; i++) {
        const setting = settings[i];
        boxes[setting] = document.getElementById("box" + setting);
        boxes[setting].onchange = setBoxValue(boxes[setting], setting);
    }


    /* << METHODS >> */

    /**
     * creates a new table from current storage data
     */
    const table = document.getElementById("supremeItemsTableBody");

    function refreshItemTable() {
        chrome.storage.local.get("supremeitems", function (items) {
            const supremeitems = items.supremeitems;
            table.innerHTML = "";
            for (let i = 0; i < supremeitems.length; i++) {
                const x = supremeitems[i];
                table.innerHTML += "<tr> <td>" + x.name + "</td><td>" + x.color + "</td><td>" + x.categorie + "</td><td>" + x.size + "</td>" +
                    "<td><input type=button id=rm" + x.id + " class=rmbutton value=rm title='Remove item'></td>  </tr>";
            }

            const buttons = document.getElementsByClassName("rmbutton");
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                button.onclick = closure(button.getAttribute('id').replace("rm", ""));
            }

            function closure(id) {
                return function () {
                    chrome.runtime.sendMessage({removeItem: id}, function (res) {
                        refreshItemTable();
                    })
                }
            }
        })
    }

    /**
     * set for every element the value from storage
     */
    function loadBoxValues() {
        chrome.storage.local.get(settings, function (items) {
            for (let i = 0; i < settings.length; i++) {
                const key = settings[i];
                boxes[key].checked = items[key];
            }
            updateBoxCss();
        });
    }

    /**
     * sets value from field to storage
     */
    function setBoxValue(box, parameter) {
        return function () {
            const obj = {};
            obj[parameter] = +box.checked; // + maps true -> 1
            chrome.storage.local.set(obj);
            updateBoxCss();
        };
    }

    /**
     * style updates
     */
    function updateBoxCss() {
        const div = document.getElementById("boxautocheckout-div");
        if (boxes.autofill.checked) {
            div.style.opacity = "1";
        } else {
            div.style.opacity = ".3";
            boxes.autocheckout.checked = false;
            chrome.storage.local.set({autocheckout: 0});
        }
    }



    /* SET FUNCTIONALITY */

    document.getElementById("options").onclick = function () {
        chrome.tabs.create({'url': "/options/options.html"})
    };

    document.getElementById("tableinfo").onclick = function () {
        chrome.storage.local.get("supremeitems", function (items) {
            chrome.storage.local.set({"supremeitems": items.supremeitems.concat(test)});
            refreshItemTable();
        })
    };

    document.getElementById("addbutton").onclick = function () {
        const name = document.getElementById("name").value;
        const color = document.getElementById("color").value;
        const categorie = document.getElementById("categorie").value;
        const size = document.getElementById("size").value;

        if (name.trim().length > 0 && color.trim().length > 0) {
            document.getElementById("name").value = "";
            document.getElementById("color").value = "";

            chrome.storage.local.get(["supremeitems", "lastId"], function (items) {
                const id = items.lastId + 1;
                const supremeitems = items.supremeitems;
                const supremeitem = {
                    "name": name,
                    "color": color,
                    "categorie": categorie,
                    "size": size,
                    "id": id,
                };
                supremeitems.push(supremeitem);
                chrome.storage.local.set({"supremeitems": supremeitems, "lastId": id});
                refreshItemTable();
            })
        }
    };

    document.getElementById("startbutton").onclick = function () {
        chrome.runtime.sendMessage({startBot: "start"})

    };
    /*
    document.getElementById("boxmanuelmode-div").addEventListener("mouseover", function () {
        const style = "0px 0px 6px rgb(140, 240, 255), 0px 0px 6px rgb(150, 250, 255)";
        document.getElementById("boxautofill-div").style.boxShadow = style;
        document.getElementById("boxautocheckout-div").style.boxShadow = style;
    });

    document.getElementById("boxmanuelmode-div").addEventListener("mouseout", function () {
        document.getElementById("boxautofill-div").style.boxShadow = "";
        document.getElementById("boxautocheckout-div").style.boxShadow = "";
    });
    */


    refreshItemTable();
    loadBoxValues();
});
