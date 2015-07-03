var fs = require('fs');
var localApi = require('./api');
var path = require('path');
var Q = require('q');

var XlreSnapshot = require('../services/snapshot');

var LocalImport = function () {
};

LocalImport.prototype.execute = function(name, restart) {
    var deferred = Q.defer();

    localApi.getSnapshotFolder(name).then(function (snapshotFolder) {
        var targetPath = snapshotFolder + path.sep + 'xld-snapshot.zip';

        fs.exists(targetPath, function (exists) {
            if (!exists) {
                deferred.reject('XLD attachment ' + name + ' does\'t exist');
            } else {
                XlreSnapshot.copyToXld(name, targetPath, restart).then(function(data) {
                    deferred.resolve(data);
                }).catch(function(err) {
                    deferred.reject(err);
                });
            }
        });
    }).catch(function (err) {
        console.error(err);
    });

    return deferred.promise;
};

module.exports = new LocalImport();