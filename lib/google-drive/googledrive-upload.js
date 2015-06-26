var api = require('./api');
var app = require('../app');
var XlreConfig = require('../common/config');

var fs = require('fs');
var open = require('open');
var readline = require('readline');
var rp = require('request-promise');

var fileToUpload;

app.get('/google-drive/uploadfile', function (req, res) {
    fileToUpload = {title: req.query.fileToUploadTitle, path: req.query.fileToUploadPath};
    api.authToUploadFile(fileToUpload);
});

app.get('/google-drive/oauth2callback', function (req, res) {
    var auth = api.getOauth2();

    auth.getToken(req.query.code, function (err, tokens) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        auth.credentials = tokens;
        api.uploadFile(auth);
    });

});