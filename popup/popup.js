"use strict";

document.addEventListener("DOMContentLoaded", function () {


    /* << VARIABLES >> */

    const test = [
        {"name": "tagless tee", "color": "white", "categorie": "accessories", "size": "Large", "id": 101},
        {"name": "crew socks", "color": "black", "categorie": "accessories", "size": "", "id": 102},
        {"name": "glasses", "color": "clear", "categorie": "accessories", "size": "", "id": 103},
        {"name": "truck", "color": "silver", "categorie": "skate", "size": "129", "id": 104},
        {"name": "keychain", "color": "clear", "categorie": "accessories", "size": "", "id": 105}
    ];
    const table = document.getElementById("supremeItemsTableBody");

    const boxautofill = document.getElementById("boxautofill");
    const boxautocheckout = document.getElementById("boxautocheckout");
    const boxautocheckoutdiv = document.getElementById("boxautocheckout-div");




    /* << METHODS >> */

    /**
     * creates a new table based on current storage data
     */
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
                button.onclick = closure(button.getAttribute("id").replace("rm", ""));
            }

            function closure(id) {
                return function () {
                    removeSupremeItem(id, function(){
                        refreshItemTable();
                    });
                }
            }
        })
    }

    /**
     * box style updates
     */
    function updateBoxValueAndCss() {
        if (boxautofill.checked) {
            boxautocheckoutdiv.style.opacity = "1";
        } else {
            boxautocheckoutdiv.style.opacity = ".3";
            boxautocheckout.checked = false;
            setSetting("autocheckout", 0)
        }
    }


    /* FUNCTIONALITY */

    document.getElementById("options").onclick = function () {
        chrome.tabs.create({'url': "/options/options.html"})
    };

    document.getElementById("tableinfo").onclick = function () {
        chrome.storage.local.get("supremeitems", function (items) {
            chrome.storage.local.set({"supremeitems": items.supremeitems.concat(test)});
            refreshItemTable();
        })
    };

    document.getElementById("startbutton").onclick = function () {
        chrome.runtime.sendMessage({bot: "start"})

    };

    document.getElementById("addbutton").onclick = function () {
        const name = document.getElementById("name").value;
        const color = document.getElementById("color").value;
        const categories = document.getElementById("categories").value;
        const size = document.getElementById("size").value;

        if (name.trim().length > 0 && color.trim().length > 0) {
            document.getElementById("name").value = "";
            document.getElementById("color").value = "";

            chrome.storage.local.get(["supremeitems", "lastId"], function (items) {
                console.log(items);
                const id = items.lastId + 1;
                const supremeitems = items.supremeitems;
                const supremeitem = {
                    "name": name,
                    "color": color,
                    "categorie": categories,
                    "size": size,
                    "id": id,
                };
                supremeitems.push(supremeitem);
                chrome.storage.local.set({"supremeitems": supremeitems}, function(){
                    refreshItemTable();
                });
            })
        }
    };




    /* INITIALISATION */

    refreshItemTable();

    getPopupSettings(function (settings) {
        for (let key in settings) {
            const box = document.getElementById("box"+key)
            box.checked = settings[key];
            box.onchange = checkBoxValue(box, key)
        }
        updateBoxValueAndCss();
    });

    function checkBoxValue(box, key){
        return function () {
            setSetting(key, +box.checked, function(){
                updateBoxValueAndCss();
            });
        };
    }
});
