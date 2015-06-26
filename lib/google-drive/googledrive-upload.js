var api = require('./api');
var app = require('../app');
var cache = require('../common/cache');

app.get('/google-drive/uploadfile', function (req, res) {
    var fileToUpload = {title: req.query.fileToUploadTitle, path: req.query.fileToUploadPath};
    api.authToUploadFile(fileToUpload);
});

app.get('/google-drive/oauth2callback', function (req, res) {

    api.getToken(req.query.code).then(function(tokens){
        var auth = api.getOauth2();
        auth.credentials = tokens;

        if (cache.fetch('fileToUpload')) {
            api.uploadFile(auth);
        } else if (cache.fetch('fileToDownload')) {
            api.downloadFile(auth);
        }
    });

});