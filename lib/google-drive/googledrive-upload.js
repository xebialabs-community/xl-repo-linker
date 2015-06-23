var app = require('../app');
var XlreConfig = require('../common/config');

var readline = require('readline');
var google = require('googleapis');
var rp = require('request-promise');
var fs = require('fs');

var OAuth2 = google.auth.OAuth2;

var REDIRECT_URL = 'http://localhost:3000/google-drive/oauth2callback',
    SCOPE = 'https://www.googleapis.com/auth/drive.file';

var fileToUpload = {"title": "", "path": ""};

function getOauth2() {
    var googleDrive = XlreConfig.readXlreConfig().googleDrive;
    return new OAuth2(googleDrive.clientId, googleDrive.clientSecret, REDIRECT_URL);
}

app.get('/google-drive/uploadfile', function (req, res) {
    var auth = getOauth2();
    var url = auth.generateAuthUrl({
        access_type: 'offline', scope: SCOPE
    });

    fileToUpload = {title: req.query.fileToUploadTitle, path: req.query.fileToUploadPath};

    res.send(url);
});

app.get('/google-drive/oauth2callback', function (req, res) {
    var auth = getOauth2();

    auth.getToken(req.query.code, function (err, tokens) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        auth.credentials = tokens;
        upload();
    });

    var upload = function () {
        var drive = google.drive({version: 'v2', auth: auth});
        drive.files.insert({
            resource: {
                title: fileToUpload.title,
                mimeType: 'application/octet-stream'
            },
            media: {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(fileToUpload.path)
            }
        }, console.log);
    };
});