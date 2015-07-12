var api = require('./api');
var app = require('../app');
var cache = require('../common/cache');
var exp = require('./export');
var imp = require('./import');

app.get('/google-drive/uploadfile', function (req, res) {
    cache.store('exportResult', undefined);
    exp.execute(req.query.fileToUploadTitle, req.query.force, false);
    var interval = setInterval(function() {
        var exportResult = cache.fetch('exportResult');
        if (exportResult) {
            res.send(200, exportResult);
            clearInterval(interval);
        }
    }, 200);

});

//app.get('/google-drive/downloadfile', function (req) {
//    imp.execute(req.query.fileToDownloadTile, req.query.restart);
//});

app.get('/google-drive/auth-to-gd', function () {
    api.authToGoogleDrive();
});

app.get('/google-drive/getTokenInfo', function (req, res) {
    api.getTokenInfo().then(function (data) {
        res.send(data);
    }).catch(function (err) {
        res.send(500, err);
    });
});

app.get('/google-drive/oauth2callback', function (req) {

    api.getToken(req.query.code).then(function (tokens) {
        if (cache.fetch('fileToUpload')) {
            exp.start(tokens);
        } else if (cache.fetch('fileToDownload')) {
            imp.start(tokens);
        }
    }).catch(function (err) {
        console.error(err);
    });
});