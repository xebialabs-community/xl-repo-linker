var api = require('./api');
var app = require('../app');
var exp = require('./export');
var imp = require('./import');

var XlreCache = require('../common/cache');

var interval_time = 200;

app.get('/google-drive/uploadfile', function (req, res) {
    XlreCache.store('mode', 'google-drive');
    XlreCache.store('exportResult', undefined);
    exp.execute(req.query.fileToUploadTitle, req.query.force, false);
    var interval = setInterval(function() {
        var exportResult = XlreCache.fetch('exportResult');
        if (exportResult) {
            var er = exportResult.split(",");
            res.send(parseInt(er[0]), er[1]);
            clearInterval(interval);
        }
    }, interval_time);
});

app.get('/google-drive/downloadfile', function (req, res) {
    XlreCache.store('mode', 'google-drive');
    XlreCache.store('importResult', undefined);
    imp.execute(req.query.fileToDownloadTitle, req.query.restart, false);
    var interval = setInterval(function() {
        var importResult = XlreCache.fetch('importResult');
        if (importResult) {
            var ir = importResult.split(",");
            res.send(parseInt(ir[0]), ir[1]);
            clearInterval(interval);
        }
    }, interval_time);

});

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
        if (XlreCache.fetch('fileToUpload')) {
            exp.start(tokens);
        } else if (XlreCache.fetch('fileToDownload')) {
            imp.start(tokens);
        }
    }).catch(function (err) {
        console.error(err);
    });
});