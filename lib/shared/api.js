var XlreConfig = require('../common/config');
var XlreMongo = require('../services/mongo');

var Q = require('q');

var XlreShared = function () {
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

module.exports = new XlreShared();