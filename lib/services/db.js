var XlreConfig = require('../common/config');

var nedb = require('nedb');
var path = require('path');
var Q = require('q');

var db = new nedb({filename: XlreConfig.getRepoHome() + path.sep + '.xlre-db', autoload: true});

var XlreDb = function () {
};

XlreDb.prototype.insert = function (doc) {
    var deferred = Q.defer();

    db.insert(doc, function (err, newDoc) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(newDoc);
        }
    });

    return deferred.promise;
};

XlreDb.prototype.find = function (selector) {
    var deferred = Q.defer();

    db.find(selector, function (err, docs) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(docs);
        }
    });

    return deferred.promise;
};

XlreDb.prototype.findOne = function (selector) {
    var deferred = Q.defer();

    db.findOne(selector, function (err, doc) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(doc);
        }
    });

    return deferred.promise;
};

XlreDb.prototype.remove = function (selector) {
    var deferred = Q.defer();

    db.remove(selector, {multi: true}, function (err, numRemoved) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(numRemoved);
        }
    });

    return deferred.promise;
};


module.exports = new XlreDb();