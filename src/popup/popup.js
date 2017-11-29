"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* << VARIABLES >> */

    const table = document.getElementById("supremeItemsTableBody");

    const boxautofill = document.getElementById("autofill-box");
    const boxautocheckout = document.getElementById("autocheckout-box");
    const boxautocheckoutdiv = document.getElementById("autocheckout-box-div");

    const boxmanualmode = document.getElementById("manualmode-box");
    const autocheckoutinfo = document.getElementById("autocheckout-info");

    if(false) {
        const data = [
            {"name": "tagless tee", "color": "white", "categorie": "accessories", "size": "XLarge", "id": 101},
            {"name": "crew socks", "color": "black", "categorie": "accessories", "size": "", "id": 102},
            {"name": "classic wheels", "color": "gold", "categorie": "skate", "size": "anysize_r", "id": 103},
            {"name": "truck", "color": "silver", "categorie": "skate", "size": "129", "id": 104},
            {"name": "corduroy", "color": "peach", "categorie": "pants", "size": "32", "id": 105}
        ];

        document.getElementsByTagName("img")[0].onclick = function () {
            chrome.storage.local.get("supremeitems", function (items) {
                chrome.storage.local.set({"supremeitems": items.supremeitems.concat(data)});
                refreshItemTable();
            })
        };
    }


    /* << STYLE >> */

    /**
     * box style updates
     */
    function updateBoxValueAndCss() {
        if (boxautofill.checked) {
            boxautocheckoutdiv.style.opacity = "1";
        }
        else {
            boxautocheckoutdiv.style.opacity = ".3";
            boxautocheckout.checked = false;
            MSH.setSetting("autocheckout", 0)
        }

        if (boxautocheckout.checked && boxmanualmode.checked){
            autocheckoutinfo.classList.add("uwaga");
        }
        else{
            autocheckoutinfo.classList.remove("uwaga");
        }

        //TODO uwaga für settings
    }






    /* << FUNCTIONALITY >> */

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
                    "<td><input type=button id=rm" + x.id + " class='button rmbutton' value=rm title='Remove item'></td> </tr>";
            }

            const buttons = document.getElementsByClassName("rmbutton");
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                button.onclick = closure(parseInt(button.getAttribute("id").replace("rm", "")));
            }

            function closure(id) {
                return function () {
                    MSH.removeSupremeItem(id, function(){
                        refreshItemTable();
                    });
                }
            }
        })
    }

    document.getElementById("options").onclick = function () {
        chrome.tabs.create({'url': "/src/options/options.html"})
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
                chrome.storage.local.set({"supremeitems": supremeitems, "lastId": id}, function(){
                    refreshItemTable();
                });
            })
        }
    };

    function clock(){
        const date = new Date();
        document.getElementById("time").innerHTML = date.toTimeString();
    }

    function loadBoxValues() {
        MSH.getSettings(MSH.POPUP_SETTING_KEYS, function (settings) {
            for (let key in settings) {
                const box = document.getElementById(key+"-box");
                box.checked = settings[key];
                box.onchange = updateBoxValue(box, key)
            }
            updateBoxValueAndCss();
        });
    }

    function updateBoxValue(box, key){
        return function () {
            MSH.setSetting(key, +box.checked, function(){
                updateBoxValueAndCss();
            });
        };
    }


    /* << INITIALISATION >> */

    refreshItemTable();
    clock();
    setInterval(clock, 250);
    loadBoxValues();

});
