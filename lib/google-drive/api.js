var XlreConfig = require('../common/config');

var api = require('./api');
var app = require('../app');
var cache = require('../common/cache');
var fs = require('fs');
var google = require('googleapis');
var open = require('open');
var Q = require('q');

app.get('/google-drive/enabled', function (req, res) {
    var googleDrive = XlreConfig.readXlreConfig().googleDrive;
    return googleDrive && googleDrive.enabled;
});

var XlreApi = function () {
};

var OAuth2 = google.auth.OAuth2;

var REDIRECT_URL = 'http://localhost:3000/google-drive/oauth2callback',
    SCOPE = 'https://www.googleapis.com/auth/drive.file',
    ACCESS_TYPE = 'offline',
    MIME_TYPE = 'application/octet-stream';

var fileToUpload = {"title": "", "path": ""};

XlreApi.prototype.getOauth2 = function () {
    var googleDrive = XlreConfig.readXlreConfig().googleDrive;
    return new OAuth2(googleDrive.clientId, googleDrive.clientSecret, REDIRECT_URL);
};

XlreApi.prototype.getAuthUrl = function () {
    return XlreApi.prototype.getOauth2().generateAuthUrl({
        access_type: ACCESS_TYPE, scope: SCOPE
    });
};

XlreApi.prototype.getToken = function(code) {
    var deferred = Q.defer();

    var auth = XlreApi.prototype.getOauth2();

    auth.getToken(code, function (err, tokens) {
        if (err) {
            deferred.reject('Error while trying to retrieve access token' + err);
            return;
        }
        deferred.resolve(tokens);
    });

    return deferred.promise;
};

XlreApi.prototype.authToUploadFile = function (fileToUpload) {
    cache.store('fileToUpload', fileToUpload);
    open(XlreApi.prototype.getAuthUrl());
};

XlreApi.prototype.uploadFile = function (auth) {
    var fileToUpload = cache.fetch('fileToUpload');
    var drive = google.drive('v2');

    drive.files.insert({
        resource: {
            title: fileToUpload.title,
            mimeType: MIME_TYPE
        },
        media: {
            mimeType: MIME_TYPE,
            body: fs.createReadStream(fileToUpload.path)
        },
        auth: auth
    }, function (data) {
        if (data == null) {
            console.log("XLD attachment [" + fileToUpload.title + "] has been successfully uploaded.");
        }

        if (cache.fetch('stopServer')) {
            process.exit(0);
        }
    });
};

module.exports = new XlreApi();