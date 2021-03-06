var app = require('../app');
var XlreCache = require('../common/cache');
var XlreConfig = require('../common/config');
var XlreLogger = require('../common/logger');
var XlreDb = require('../services/db');
var XlreSharedApi = require('../shared/api');

var fs = require('fs');
var google = require('googleapis');
var open = require('open');
var path = require('path');
var Q = require('q');
var progress = require('request-progress');
var request = require('request');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

var XlreApi = function () {
};

var OAuth2 = google.auth.OAuth2;

var SCOPES = ['https://www.googleapis.com/auth/drive.file', 'email', 'profile'],
    ACCESS_TYPE = 'offline',
    MIME_TYPE = 'application/octet-stream';

var fileToUpload = {"title": "", "path": ""};

XlreApi.prototype.getOauth2 = function () {
    return new OAuth2(XlreConfig.getKeyValue('googleDrive.clientId'), XlreConfig.getKeyValue('googleDrive.clientSecret'), XlreConfig.getBaseUrl() + '/google-drive/oauth2callback');
};

XlreApi.prototype.getAuthUrl = function () {
    return XlreApi.prototype.getOauth2().generateAuthUrl({
        access_type: ACCESS_TYPE,
        scope: SCOPES.join(' '),
        approval_prompt: 'force'
    });
};

XlreApi.prototype.getTokenInfo = function () {
    var deferred = Q.defer();

    XlreDb.findOne({key: 'google_drive_oauth_token'}).then(function (document) {
        if (!document) {
            deferred.reject("Token not found");
        } else {
            deferred.resolve(convertToRefreshToken(document.value));
        }
    });

    return deferred.promise;
};

XlreApi.prototype.getNewToken = function (code) {
    var deferred = Q.defer();
    var auth = XlreApi.prototype.getOauth2();
    auth.getToken(code, function (err, tokens) {
        if (err) {
            deferred.reject('Error while trying to retrieve access token' + err);
            return;
        }

        XlreDb.remove({key: 'google_drive_oauth_token'}).
            then(XlreDb.insert({key: 'google_drive_oauth_token', value: tokens})).
            then(function () {
                deferred.resolve(convertToRefreshToken(tokens));
            }).catch(function (err) {
                deferred.reject(err);
            });
    });
    return deferred.promise;
};

XlreApi.prototype.getToken = function (code) {
    var deferred = Q.defer();

    XlreApi.prototype.getTokenInfo().then(function (token) {
        deferred.resolve(token);
    }).catch(function () {
        XlreApi.prototype.getNewToken(code).then(function(data) {
            deferred.resolve(data);
        }).catch(function (err) {
            deferred.reject(err);
        });
    });

    return deferred.promise;
};

function convertToRefreshToken(tokens) {
    return {
        "refresh_token": tokens.refresh_token,
        "grant_type": "refresh_token"
    };
}

XlreApi.prototype.authToGoogleDrive = function () {
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

                            XlreSharedApi.findSnapshotByName(fileName).then(function () {
                                return XlreSharedApi.updateSharedLink(foundFile.webContentLink, fileName, foundFile.fileSize, userInfo.name);
                            }).fail(function () {
                                return XlreSharedApi.saveSharedLink(foundFile.webContentLink, fileName, foundFile.fileSize, userInfo.name)
                            }).then(function (document) {
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

XlreApi.prototype.downloadFile = function () {
    var deferred = Q.defer();

    var fileToDownload = XlreCache.fetch('fileToDownload');
    var tempFolder = temp.mkdirSync();
    var archiveFilePath = tempFolder + path.sep + fileToDownload.title + '.zip';

    XlreSharedApi.findSnapshotByName(fileToDownload.title)
        .then(function (document) {
            progress(request({
                uri: document['share-link'],
                encoding: null
            }), {
                throttle: 100
            }).on('progress', function (state) {
                XlreLogger.info("Downloading " + (state.received / document.size * 100).toFixed(2) + " %");

            }).on('error', function (err) {
                deferred.reject(err);
            }).pipe(fs.createWriteStream(archiveFilePath))
                .on('error', function (err) {
                    deferred.reject(err);
                })
                .on('close', function () {
                    deferred.resolve(archiveFilePath);
                });
        }, function () {
            deferred.reject('Nothing to import. XLD attachment with name \'' + fileToDownload.title + '\' has not been found.');
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

    XlreSharedApi.findSnapshotByName(fileToUpload.title).
        then(function () {
            if (fileToUpload.force === "true") {
                XlreApi.prototype.findFile(fileToUpload.title, auth).then(function (foundFile) {
                    return XlreApi.prototype.deleteFile(foundFile.id, auth);
                }).fin(function () {
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