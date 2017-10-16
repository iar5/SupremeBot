/* RUN THE BOT */

var table = document.getElementById("supremeItemsTableBody");
var message = document.getElementById("message");

var box0 = document.getElementById("checkbox-0");
var box1 = document.getElementById("checkbox-1");
var box2 = document.getElementById("checkbox-2");
var box2div = document.getElementById("checkbox-2-div");

refreshItemTable();
loadBoxStatus();

document.getElementById("options").onclick = function () {chrome.tabs.create({'url': "/options.html"})}
document.getElementById("startbutton").onclick = function () {chrome.runtime.sendMessage({startBot: "start"})}

document.getElementById("addbutton").onclick = addItem;

document.getElementById("checkbox-0").onchange = setBoxStatus(box0, "gotobasket");
document.getElementById("checkbox-1").onchange = setBoxStatus(box1, "autofill");
document.getElementById("checkbox-2").onchange = setBoxStatus(box2, "checkout");




/* SET UP TABLE */
test = [
    { "name": "tagless tee", "color": "white",  "categorie": "accessories", "size": "Large", "id":1},
    { "name": "crew socks", "color": "white",  "categorie": "accessories", "size": "", "id":2},
    { "name": "glasses", "color": "clear",  "categorie": "accessories", "size": "", "id":3},
    { "name": "truck", "color": "silver",  "categorie": "skate", "size": "129", "id":4},
]

chrome.storage.local.set({"supremeitems": supremeitems, "lastId": id});


function addItem() {
    var name = document.getElementById("name").value;
    var color = document.getElementById("color").value;
    var categorie = document.getElementById("categorie").value;
    var size = document.getElementById("size").value;

    if (name.trim().length > 0 && color.trim().length > 0) {
        document.getElementById("name").value = "";
        document.getElementById("color").value = "";

        chrome.storage.local.get(["supremeitems", "lastId"], function (items) {
            var id = items.lastId+1;
            var supremeitems = items.supremeitems;
            var supremeitem = {
                "name": name,
                "color": color,
                "categorie": categorie,
                "size": size,
                "id": id,
            }
            supremeitems.push(supremeitem);
            chrome.storage.local.set({"supremeitems": test, "lastId": id});
            refreshItemTable();
        })
    }
}




/* AUTOFILL AND CHECKOUT */

function refreshItemTable() {
    chrome.storage.local.get("supremeitems", function (items) {
            var supremeitems = items.supremeitems;
            table.innerHTML = "";
            for (var i = 0; i < supremeitems.length; i++) {
                var x = supremeitems[i];
                table.innerHTML += "<tr> <td>" + x.name + "</td><td>" + x.color + "</td><td>" + x.categorie + "</td><td>" + x.size + "</td>" +
                    "<td><input type=button id=rm" + x.id + " class=rmbutton value=rm title=removeItem></td>  </tr>";
            }

            var buttons = document.getElementsByClassName("rmbutton");
            for (var i = 0; i < buttons.length; i++) {
                button = buttons[i];
                button.onclick = closure(button.getAttribute('id').replace("rm", ""));

                function closure(id) {
                    return function () {
                        chrome.runtime.sendMessage({removeSuprItem: id}, function (response) {
                            refreshItemTable();
                        })
                    }
                }
            }
        }
    )
}


/* SWITCH BUTTONS */

function loadBoxStatus() {
    chrome.storage.local.get(["gotobasket", "autofill", "checkout"], function (items) {
        var gotobasket = items.gotobasket;
        var autofill = items.autofill;
        var checkout = items.checkout;

        if (gotobasket == 1) box0.checked = true;
        else box0.checked = false;
        if (autofill == 1) box1.checked = true;
        else box1.checked = false;
        if (checkout == 1) box2.checked = true;
        else box2.checked = false;
        update();
    })
}

function setBoxStatus(box, parameter) {
    return function () {
        var obj = {};
        if (box.checked) {
            obj[parameter] = 1;
            chrome.storage.local.set(obj);
        }
        else {
            obj[parameter] = 0;
            chrome.storage.local.set(obj);
        }
        update();
    }
}

function update() {
    if (box1.checked) {
        box2div.style.opacity = "1";
    } else {
        box2.checked = false;
        box2div.style.opacity = "0.2";
        chrome.storage.local.set({"checkout": 0});
    }

    if (box0.checked == true && box1.checked == true && box2.checked == true)
        message.textContent = "CARE! your wont be able to make any changes on your card.";
    else message.textContent = "";
}

