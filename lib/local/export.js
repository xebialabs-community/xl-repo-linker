var fs = require('fs');
var localApi = require('./api');
var path = require('path');
var Q = require('q');

var XlreSnapshot = require('../services/snapshot');

var LocalExport = function () {
};

LocalExport.prototype.execute = function (name, force) {
    var deferred = Q.defer();
    localApi.getSnapshotFolder(name).then(function (snapshotFolder) {
        var targetPath = snapshotFolder + path.sep + 'xld-snapshot.zip';

        fs.exists(targetPath, function (exists) {
            if (exists && force !== "true") {
                deferred.reject('XLD attachment ' + name + ' exists already');
            } else {
                XlreSnapshot.create(name, force, function (zipFilePath) {
                    var target = fs.createWriteStream(targetPath);

                    target.on("error", function (err) {
                        deferred.reject(err);
                    });
                    target.on("close", function () {
                        deferred.resolve('XLD attachment has been successfully exported to ' + targetPath);
                    });
                    fs.createReadStream(zipFilePath).pipe(target);
                }, function(err) {
                    deferred.reject(err);
                });
            }
        });
    });
    return deferred.promise;
};

module.exports = new LocalExport();