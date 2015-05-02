var app = require('../app');

var readline = require('readline');
var google = require('googleapis');
var rp = require('request-promise');
var fs = require('fs');

var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = '219982597230-jt1mmsc4ajjmv583i4qkfqj6cql1hn5i.apps.googleusercontent.com',
    CLIENT_SECRET = 'oNOSlfJ1NZud3rB1Gi6GXxp4',
    REDIRECT_URL = 'http://localhost:3000/google-drive/oauth2callback',
    SCOPE = 'https://www.googleapis.com/auth/drive.file';

var fileToUpload = {"title": "", "path": ""};

app.get('/google-drive/uploadfile', function (req, res) {
    var auth = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    var url = auth.generateAuthUrl({scope: SCOPE});

    fileToUpload = req.query.fileToUpload;

    res.writeHead(302, {
        'Location': url
    });
    res.end();
});

app.get('/google-drive/oauth2callback', function (req, res) {
    var auth = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

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