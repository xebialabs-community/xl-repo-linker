chrome.extension.onRequest.addListener(function(request, sender) {
    chrome.tabs.create({url: request.redirect});
});