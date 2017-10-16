document.addEventListener('DOMContentLoaded', load);
document.getElementById('save').addEventListener('click', save);
document.getElementById('cancel').addEventListener('click', load);


function load() {
    chrome.storage.local.get("fields", function(items) {
        var fields = items.fields;
        for(var key in fields){
            document.getElementById(key).value = fields[key]
        }
        paypaltoggle();
        message("loaded");
    });
}

function save() {
    chrome.storage.local.get("fields", function(items) {
        var fields = items.fields;
        for(var key in fields){
            var value = document.getElementById(key).value;
            fields[key] = value;
        }
        chrome.storage.local.set({"fields":fields});
        message("saved");
    });
}

function message (text) {
    var status = document.getElementById("status");
    status.textContent = "("+text+")";
    setTimeout(function() {status.textContent = "";}, 3000);
}


var div = document.getElementById("nopaypaldisplay");
var cardtype = document.getElementById('credit_card_type');
cardtype.onchange = paypaltoggle;

function paypaltoggle(){
    if(cardtype.value == "paypal") div.style.display = "none";
    else div.style.display = "block";
}

