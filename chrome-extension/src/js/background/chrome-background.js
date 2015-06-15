chrome.extension.onRequest.addListener(function(request, sender) {
    console.log('background listener is hit');
    //chrome.tabs.update(sender.id, {url: request.redirect});
    chrome.tabs.create({url: request.redirect});
});