var app = require('../app');
var XlreCache = require('../common/cache');
var XlreConfig = require('../common/config');
var XlreDb = require('../services/db');
var XlreServer = require('../services/server');
var XlreSharedApi = require('../shared/api');

var fs = require('fs');
var google = require('googleapis');
var open = require('open');
var path = require('path');
var Q = require('q');
var request = require('request');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

app.get('/google-drive/enabled', function () {
    var googleDrive = XlreConfig.readXlreConfig().googleDrive;
    return googleDrive && googleDrive.enabled;
});

var XlreApi = function () {
};

var OAuth2 = google.auth.OAuth2;

var REDIRECT_URL = 'http://localhost:' + XlreServer.getServerPort() + '/google-drive/oauth2callback',
    SCOPES = ['https://www.googleapis.com/auth/drive.file', 'email', 'profile'],
    ACCESS_TYPE = 'offline',
    MIME_TYPE = 'application/octet-stream';

var fileToUpload = {"title": "", "path": ""};

XlreApi.prototype.getOauth2 = function () {
    var googleDrive = XlreConfig.readXlreConfig().googleDrive;
    return new OAuth2(googleDrive.clientId, googleDrive.clientSecret, REDIRECT_URL);
};

XlreApi.prototype.getAuthUrl = function () {
    return XlreApi.prototype.getOauth2().generateAuthUrl({
        access_type: ACCESS_TYPE, scope: SCOPES.join(' ')
    });
};

XlreApi.prototype.getTokenInfo = function () {
    var deferred = Q.defer();

    XlreDb.findOne({key: 'google_drive_oauth_token'}).then(function (document) {
        if (!document) {
            deferred.reject("Token not found");
        } else {
            google.oauth2('v2').tokeninfo({access_token: document.value.access_token}, function (err, res, body) {
                if (err) {
                    deferred.reject(err);
                } else if (res.error_description) {
                    deferred.reject(res.error_description);
                } else {
                    deferred.resolve(document.value);
                }
            });
        }
    });

    return deferred.promise;
};

XlreApi.prototype.getToken = function (code) {
    var deferred = Q.defer();

    var auth = XlreApi.prototype.getOauth2();

    XlreApi.prototype.getTokenInfo().then(function (token) {
        deferred.resolve(token);
    }).catch(function () {
        auth.getToken(code, function (err, tokens) {
            if (err) {
                deferred.reject('Error while trying to retrieve access token' + err);
                return;
            }

            XlreDb.remove({key: 'google_drive_oauth_token'}).
                then(XlreDb.insert({key: 'google_drive_oauth_token', value: tokens})).
                then(function () {
                    deferred.resolve(tokens);
                }).catch(function (err) {
                    deferred.reject(err);
                });
        });
    });

    return deferred.promise;
};

XlreApi.prototype.authToDownloadFile = function () {
    open(XlreApi.prototype.getAuthUrl());
};

XlreApi.prototype.authToUploadFile = function () {
    open(XlreApi.prototype.getAuthUrl());
};

XlreApi.prototype.shareFile = function (fileName, auth) {
    var deferred = Q.defer();

    XlreApi.prototype.getUserInfo(auth).then(function (userInfo) {

        XlreApi.prototype.findFile(fileName, auth).then(function (foundFile) {

            var drive = google.drive('v2');
            drive.permissions.list({fileId: foundFile.id, auth: auth}, function (err, res) {

                if (_.isEmpty(_.find(res.items, 'role', 'reader'))) {
                    var body = {
                        'value': 'default',
                        'type': 'anyone',
                        'role': 'reader'
                    };

                    drive.permissions.insert({
                        fileId: foundFile.id,
                        resource: body,
                        auth: auth
                    }, function (err, res, body) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            var sharedLinkPromise;

                            if (fileToUpload.force === "true") {
                                sharedLinkPromise = XlreSharedApi.updateSharedLink(foundFile.webContentLink, fileName, userInfo.name);
                            } else {
                                sharedLinkPromise = XlreSharedApi.saveSharedLink(foundFile.webContentLink, fileName, userInfo.name)
                            }

                            sharedLinkPromise.then(function (document) {
                                deferred.resolve(document);
                            }).catch(function (err) {
                                deferred.reject(err);
                            });
                        }
                    });
                }
            });
        });
    });

    return deferred.promise;
};

XlreApi.prototype.getUserInfo = function (auth) {
    var deferred = Q.defer();
    google.oauth2('v2').userinfo.get({auth: auth}, function (err, res, body) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

XlreApi.prototype.findFile = function (fileName, auth) {
    var deferred = Q.defer();
    var drive = google.drive('v2');

    drive.files.list({auth: auth}, function (err, res) {
        if (err) {
            deferred.reject(err);
            return;
        }

        var foundFile = _.first(_.filter(res.items, {title: fileName, "explicitlyTrashed": false}));

        if (!foundFile) {
            deferred.reject('File ' + fileName + ' has not been found.');
            return;
        }

        deferred.resolve(foundFile);
    });

    return deferred.promise;
};

XlreApi.prototype.downloadFile = function (auth) {
    var deferred = Q.defer();

    var fileToDownload = XlreCache.fetch('fileToDownload');
    XlreSharedApi.findSnapshotByName(fileToDownload.title)
        .then(function (document) {
            console.log('shared link is', document['share-link']);
            request({
                uri: document['share-link'],
                encoding: null
            }, function done(err, res, body) {

                if (res.statusCode !== 200) {
                    deferred.reject(res.statusMessage);
                } else {
                    var tempFolder = temp.mkdirSync();
                    var archiveFilePath = tempFolder + path.sep + fileToDownload.title + '.zip';

                    fs.writeFile(archiveFilePath, body, function (err) {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(archiveFilePath);
                        }
                    });
                }
            });
        }, function () {
            deferred.reject('Nothing to import. XLD attachment with name ' + fileToDownload.title + ' has not been found.');
        });

    return deferred.promise;
};

XlreApi.prototype.deleteFile = function (fileId, auth) {
    var deferred = Q.defer();

    var drive = google.drive('v2');
    drive.files.delete({
        fileId: fileId, auth: auth
    }, function done(err, res, body) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
};

XlreApi.prototype.uploadFile = function (auth) {
    var deferred = Q.defer();

    var drive = google.drive('v2');
    var fileToUpload = XlreCache.fetch('fileToUpload');

    function addFile() {
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
                XlreApi.prototype.shareFile(fileToUpload.title, auth).then(function () {
                    deferred.resolve("XLD attachment [" + fileToUpload.title + "] has been successfully uploaded.");
                }).catch(function (err) {
                    deferred.reject(err);
                });
            } else {
                deferred.reject(data);
            }
        });
    }

    XlreApi.prototype.findFile(fileToUpload.title, auth).
        then(function (foundFile) {
            if (fileToUpload.force === "true") {
                XlreApi.prototype.deleteFile(foundFile.id, auth).
                    then(function () {
                        return XlreSharedApi.updateSharedLink();
                    }).
                    then(function () {
                        addFile();
                    });
            } else {
                deferred.reject('Attachment with name ' + fileToUpload.title + ' has been uploaded already');
            }
        }, function () {
            addFile();
        });

    return deferred.promise;
};

module.exports = new XlreApi();