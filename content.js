// Content.js

// Listen for toggles
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.type === "persistence") {
            persistence = message.value;
            console.log("Persistence: " + persistence);
        }
        if (message.type === "chatlogger") {
            chat_logger_hack();
        }
        if (message.type === "logger-output-save") {
            logger_output_save(message.value);
        }
    }
);

// Query hacks
function query_hacks_response() {
    return "persistence";
}

function save_logger_output_data(content) {
    var htmlContent = [content];
    var bl = new Blob(htmlContent, {type: "text/html"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(bl);
    a.download = "logger-output.html";
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = "save logger";
    a.click();
  }

// Save logger output
function logger_output_save(data) {
    console.log("Saving logger output -- content.js");
    save_logger_output_data(data);
}


// Define hack booleans
let persistence = false;

/* Hacks */

// Persistence hack
function persistence_hack() {
    let presence = document.querySelector("#root > div.Fpg8t > div.Vbjsg.WJjwl > div > div > div > div.NvRM8.vhccd > div.IBqK8 > div > div > h3");
    if (presence != null) {
        let root_barrier = presence.parentNode.parentNode;
        if (root_barrier != null) {
            if (persistence) {
                if (root_barrier.style.display != "none")
                    root_barrier.style.display = "none";
            }
            else {
                if (root_barrier.style.display == "none")
                root_barrier.style.display = "";
            }
        }
    }
}

function chat_logger_hack() {
    let output = 
    `<style>
    div {
        margin-top: 1vh;
        margin-left: 1vw;
        margin-right: 1vw;
    }
    
    .self {
        border: 1px solid red;
    }    
    .them {
        border: 1px solid blue;
    }
    </style>`; // Styling for output


    let chat_block = document.querySelector("#cv-a1415adc-c422-5fc2-8c7d-41364ecdf7b4"); // Block containing all chat messages
    if (chat_block == null) return; // If chat block is not found, return

    let children = chat_block.children;  // Individual chat message blocks
    for (let i = 0; i < children.length; i++) {
        let child = children[i];

        let child_header = child.querySelector("header");  // Header of chat message block containing sender and time stamp
        let child_msgs = child.querySelector("ul");  // Message list of chat message block

        if (child_header != null) {
            let sender = child_header.querySelector("span");  // Sender of chat message block
            let date_sent = child_header.querySelector(":nth-child(2)").querySelector("div").querySelector("time").dateTime;  // Time stamp of chat message block
            let self_send = child_header.style.color === "rgb(242, 60, 87)";  // True if message was sent by the user (self)

            for (let j = 0; j < child_msgs.children.length; j++) {
                let msg = child_msgs.children[j];
                let msg_div = msg.querySelector("div");

                if (!check_if_snap_status(msg)) { // If message is not a snap status
                    if (logger_check_img(msg)) {  // If message is an image
                        let img = msg.querySelector("div > button > div > div > div > img");

                        chrome.runtime.sendMessage({type:"blob_render", blob: img.src}, function(response){});
                        output += `<div class="` + (self_send ? "self" : "them") + `">` + `<img style="width:10%" src="` + img.src + `">` + `</div>\n`;
                    }
                        
                    else if (logger_check_audio(msg)) // If message is an audio
                        continue; // console.log("\tAudio");
                    else if (logger_check_datedivider(msg)) // If message is a date divider
                        continue;
                    else {
                        let text = msg_div.innerText;
                        // replace < with &lt; and > with &gt;
                        text = text.replace(/</g, "&lt;");
                        text = text.replace(/>/g, "&gt;");
                        output += `<div class="` + (self_send ? "self" : "them") + `">` + text + `</div>\n`;
                    }
                }

            }
        }
        // Else not a chat message
    }
    chrome.runtime.sendMessage({type:"sv-logger_output", value: output}, function(response){}); // Send output to popup output
}

function check_if_snap_status(msg) {
    return msg.querySelector("div > span") != null
}


function logger_check_img(div){
    let img_check = div.querySelector("div > button > div > div > div > img");
    let svg_check = div.querySelector("div > button > div > div > div > svg");
    return img_check != null || svg_check != null;
}


function logger_check_audio(div) {
    let audio_check = div.querySelector("div > button > audio");
    return audio_check != null;
}


function logger_check_datedivider(div) {
    let date_check = div.querySelector("time");
    return date_check != null;
}



/* Hack loop */
setInterval(function() {
    // Persistence hack
    persistence_hack();
}, 100);