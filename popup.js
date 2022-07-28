// Popup.js

let replaces = [];
let blobs_rendering = 0;

// Listen for blob urls to render
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "blob_render":
                console.log("blob_render");
                let base64 = render_blob_to_b64(message.blob);
                sendResponse({b64: base64});
            case "sv-logger_output":
                logger_output(message.value);
            break;
        }
    }
);

function render_blob_to_b64(blob_url) {
    // Request blob url and encode img into base 64
    blobs_rendering++;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', blob_url, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
        if (this.status == 200) {
            let blob = this.response;
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function() {
                console.log(reader.result);
                replaces.push([blob_url, reader.result]);
                blobs_rendering--;
            }
        }
    }
    xhr.send();
    console.log("loading " + blob_url);
}

function logger_output(data_parsed) {
    setTimeout(function(){
        for (let i = 0; i < replaces.length; i++) {
            let replace = replaces[i];
            let before = replace[0], after = replace[1];
            data_parsed = data_parsed.replace(before, after);
        }
    
        let output_div = document.getElementById("logger-output");
        output_div.innerHTML = data_parsed;
    }, 2000); // Let blob rendering finish


}


let save_button = document.getElementById("save-output");
save_button.addEventListener("click", function(){
    save_logger_output();
});


function save_logger_output() {
    console.log("saving logger output -- popup.js");
    let logger_output = document.getElementById("logger-output");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"logger-output-save", value: logger_output.innerHTML}, function(response){
        });
    });
}

// Get enabled hacks
function get_hacks(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"queryhacks"}, function(response){
            console.log(response);
        });
    });
}

// Toggle hacks
let persistence_elem = document.getElementById("persistence");
persistence_elem.addEventListener("click", persistence_hack);

let anti_screenshot = document.getElementById("chatlogger");
anti_screenshot.addEventListener("click", chat_logger_hack);

function persistence_hack() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"persistence", value: persistence_elem.checked}, function(response){
        });
    });
    document.getElementById("persistence-label").innerText = persistence_elem.checked ? "ON" : "OFF";
}

function chat_logger_hack() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"chatlogger", value: anti_screenshot.checked}, function(response){
        });
    });
}