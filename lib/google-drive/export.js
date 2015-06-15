var jira = require('./api');
var Logging = require('../common/logging');
var XlreConfig = require('../common/config');
var XlreSnapshot = require('../services/snapshot');

var fs = require('fs');
var path = require('path');
var rp = require('request-promise');
var Q = require('q');
var _ = require('lodash-node/compat');

var temp = require('temp');
temp.track();

var XlreExport = function () {
};

XlreExport.prototype.execute = function (fileTitle, force) {
    var deferred = Q.defer();

    XlreSnapshot.create(fileTitle, force, function (zipFilePath) {
        var rpOptions = {
            url: '/google-drive/uploadfile?fileToUploadTitle=' + fileTitle + '&fileToUploadPath=' + zipFilePath,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        rp(rpOptions).then(function () {
            deferred.resolve('Attachment ' + fileTitle + ' has been successfully uploaded to Google Drive');
        }, function (err) {
            deferred.reject(err.message);
        });
    });

    return deferred.promise;
};

module.exports = new XlreExport();