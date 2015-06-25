var mkdirp = require('mkdirp');
var path = require('path');
var Q = require('q');

var XlreConfig = require('../common/config');

var LocalApi = function () {
};

LocalApi.prototype.getRepoHome = function() {
    return XlreConfig.getUserHome() + path.sep + '.xld-repo';
};

LocalApi.prototype.getSnapshotFolder = function(name) {
    var deferred = Q.defer();
    var snapshotFolder = LocalApi.prototype.getRepoHome() + path.sep + name;
    mkdirp(snapshotFolder, function(err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(snapshotFolder);
        }
    });

    return deferred.promise;
};

module.exports = new LocalApi();