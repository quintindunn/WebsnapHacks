// Listen for toggles
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.type === "blockrequests") {
            block_requests = message.value;
            set_block_requests();
            sendResponse({type: "200resp"});
            }
        else if (message.type === "query_hacks") {
            console.log("Query hacks");
            console.table(query_hacks_response());
            chrome.runtime.sendMessage({type: "query_resp_bg", hacks: query_hacks_response()});
        }
    }
);

// Query response
function query_hacks_response() {
    return {block_requests: block_requests};
}

// Boolean for block requests
let block_requests = false;

// Block requests
function set_block_requests() {
    if (block_requests) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            "enableRulesetIds": ["block_requests_hack"]
        });
    }
    else
    {
        chrome.declarativeNetRequest.updateEnabledRulesets({
            "disableRulesetIds": ["block_requests_hack"]
        });
    }
}