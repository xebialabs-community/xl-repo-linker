var XlreConfig = require('../common/config');
var XlreMongo = require('../services/mongo');

var Q = require('q');
var _ = require('lodash-node/compat');

var XlreShared = function(){};

XlreShared.prototype.saveSharedLink = function(link) {
    var deferred = Q.defer();

    XlreMongo.getMongoDb().insert(XlreConfig.getMode(), link, function(error, object) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(object);
        }
    });
    return deferred.promise;
};

module.exports = new XlreShared();