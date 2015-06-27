var XlreConfig = require('../common/config');

var api = require('./api');
var app = require('../app');
var cache = require('../common/cache');
var Decompress = require('decompress');
var fs = require('fs');
var google = require('googleapis');
var open = require('open');
var path = require('path');
var Q = require('q');
var request = require('request');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();


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

XlreApi.prototype.getToken = function (code) {
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

XlreApi.prototype.authToDownloadFile = function (fileToDownload) {
    cache.store('fileToDownload', fileToDownload);
    open(XlreApi.prototype.getAuthUrl());
};

XlreApi.prototype.authToUploadFile = function (fileToUpload) {
    cache.store('fileToUpload', fileToUpload);
    open(XlreApi.prototype.getAuthUrl());
};

XlreApi.prototype.findFile = function (fileName, auth) {
    var deferred = Q.defer();
    var drive = google.drive({version: 'v2', auth: auth});

    drive.files.list({auth: auth}, function (err, res) {
        var foundFile = _.first(_.filter(res.items, {title: fileName, "explicitlyTrashed": false}));

        if (!foundFile) {
            deferred.reject('Nothing to import. XLD attachment with name ' + fileName + ' has not been found.');
            return;
        }

        deferred.resolve(foundFile);
    });

    return deferred.promise;
};

XlreApi.prototype.downloadFile = function (auth) {
    var deferred = Q.defer();

    var fileToDownload = cache.fetch('fileToDownload');
    XlreApi.prototype.findFile(fileToDownload.title, auth)
        .then(function (foundFile) {
            request({
                uri: foundFile.downloadUrl,
                encoding: null,
                headers: {
                    authorization: 'Bearer ' + auth.credentials.access_token
                }
            }, function done(err, res, body) {
                var tempFolder = temp.mkdirSync();
                var archiveFilePath = tempFolder + path.sep + fileToDownload.title + '.zip';

                fs.writeFile(archiveFilePath, body, function (err) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(archiveFilePath);
                    }
                });
            });
        }, function () {
            deferred.reject('Nothing to import. XLD attachment with name ' + fileToDownload.title + ' has not been found.');
        });

    return deferred.promise;
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