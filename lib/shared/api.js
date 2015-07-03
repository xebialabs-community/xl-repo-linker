var XlreConfig = require('../common/config');
var XlreMongo = require('../services/mongo');

var Q = require('q');
var _ = require('lodash-node/compat');

var XlreShared = function () {
};

XlreShared.prototype.updateSharedLink = function (link, name, user) {
    var deferred = Q.defer();

    XlreMongo.getMongoDb().update(XlreConfig.getMode(), {"name": name, "share-link": link, "user": user}, {"name": name}, function (error, object) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(object);
        }
    });

    return deferred.promise;
};

XlreShared.prototype.saveSharedLink = function (link, name, user) {
    var deferred = Q.defer();

    XlreMongo.getMongoDb().insert(XlreConfig.getMode(), {"name": name, "share-link": link, "user": user}, function (error, object) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(object);
        }
    });

    return deferred.promise;
};

XlreShared.prototype.findSnapshotByName = function (snapshotName) {
    var deferred = Q.defer();

    var params = {where: {name: snapshotName}};

    XlreMongo.getMongoDb().documents(XlreConfig.getMode(), params, function (error, data) {
        if (error || _.isEmpty(data)) {
            deferred.reject();
        } else {
            deferred.resolve(_.first(data));
        }
    });

    return deferred.promise;
};

module.exports = new XlreShared();