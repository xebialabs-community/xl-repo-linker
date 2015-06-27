var XlreSnapshot = require('../services/snapshot');

var api = require('./api');
var app = require('../app');
var cache = require('../common/cache');

var temp = require('temp');
temp.track();

app.get('/google-drive/uploadfile', function (req, res) {
    var fileToUpload = {title: req.query.fileToUploadTitle, path: req.query.fileToUploadPath};
    api.authToUploadFile(fileToUpload);
});

app.get('/google-drive/oauth2callback', function (req, res) {

    api.getToken(req.query.code).then(function (tokens) {
        var auth = api.getOauth2();
        auth.credentials = tokens;

        if (cache.fetch('fileToUpload')) {
            api.uploadFile(auth);
        } else if (cache.fetch('fileToDownload')) {
            api.downloadFile(auth).then(function (archivedFilePath) {
                var fileToDownload = cache.fetch('fileToDownload');
                var snapshotPath = temp.mkdirSync();

                XlreSnapshot.copyToXld(fileToDownload.title, snapshotPath, archivedFilePath, fileToDownload.restart)
                    .then(function (res) {
                        console.log(res);
                        process.exit(0);
                    }).catch(function (error) {
                        console.error(error);
                    });
            });
        }
    });

});