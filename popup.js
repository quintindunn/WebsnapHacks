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
        if (message.type === "query_resp_bg") handle_query_hacks_bg_response(message);
        if (message.type === "query_resp_ct") handle_query_hacks_ct_response(message);
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
    chrome.runtime.sendMessage({type:"query_hacks"}, function(response){});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {chrome.tabs.sendMessage(tabs[0].id, {type:"query_hacks"}, function(response){});});
}

function handle_query_hacks_bg_response(response) {
    background_hacks = response.hacks;
        
    // Block requests
    block_requests.checked = background_hacks.block_requests;
    document.getElementById("blockrequests-label").innerText = block_requests.checked ? "ON": "OFF";
}

function handle_query_hacks_ct_response(response) {
    content_hacks = response.hacks;
    
    // Persistence
    persistence_elem.checked = content_hacks.persistence;
    document.getElementById("persistence-label").innerText = persistence_elem.checked ? "ON" : "OFF";
}


// Toggle hacks
let persistence_elem = document.getElementById("persistence");
persistence_elem.addEventListener("click", persistence_hack);

let screenlog = document.getElementById("chatlogger");
screenlog.addEventListener("click", chat_logger_hack);

let block_requests = document.getElementById("blockrequests");
block_requests.addEventListener("click", block_requests_hack);

function persistence_hack() {
    console.log("Persist");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"persistence", value: persistence_elem.checked}, function(response){
        });
    });
    document.getElementById("persistence-label").innerText = persistence_elem.checked ? "ON" : "OFF";
}

function block_requests_hack() {
    console.log("Block Requests -- popup.js");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"blockrequests", value: block_requests.checked}, function(response){
        });
    });
    chrome.runtime.sendMessage({type:"blockrequests", value: block_requests.checked}, function(response){
    });
    document.getElementById("blockrequests-label").innerText = block_requests.checked ? "ON" : "OFF";
}

function chat_logger_hack() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"chatlogger", value: screenlog.checked}, function(response){
        });
    });
}


// On DOMContentLoaded event (when page is loaded) get enabled hacks
document.addEventListener("DOMContentLoaded", function() {
    get_hacks();
});