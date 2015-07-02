var api = require('./api');
var app = require('../app');
var cache = require('../common/cache');
var exp = require('./export');
var imp = require('./import');

app.get('/google-drive/uploadfile', function (req) {
    var fileToUpload = {title: req.query.fileToUploadTitle, path: req.query.fileToUploadPath};
    api.authToUploadFile(fileToUpload);
});

app.get('/google-drive/oauth2callback', function (req) {

    api.getToken(req.query.code).then(function (tokens) {
        if (cache.fetch('fileToUpload')) {
            exp.start(tokens);
        } else if (cache.fetch('fileToDownload')) {
            imp.start(tokens);
        }
    });

});