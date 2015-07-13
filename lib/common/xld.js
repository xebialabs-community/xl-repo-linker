var XlreCache = require('./cache');
var XlreConfig = require("./config");

var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('lodash-node/compat');

var XlreXld = function () {
};

XlreXld.prototype.getHome = function () {
    var xldHome = XlreCache.fetch('xldHome');

    if (xldHome === null) {
        return XlreConfig.readXlreConfig().xld.home;
    }

    return xldHome;
};

XlreXld.prototype.getPluginsFolder = function () {
    var xldHome = XlreXld.prototype.getHome();
    return xldHome + path.sep + "plugins";
};

XlreXld.prototype.getConfFolder = function () {
    var xldHome = XlreXld.prototype.getHome();
    return xldHome + path.sep + "conf";
};

XlreXld.prototype.getLicensePath = function () {
    return XlreXld.prototype.getConfFolder() + path.sep + "deployit-license.lic";
};

XlreXld.prototype.checkXldFolder = function () {
    var deferred = Q.defer();

    var xldHome = XlreXld.prototype.getHome();

    if (!fs.existsSync(xldHome)) {
        deferred.reject('XL Deploy home doesn\'t exist [' + xldHome + ']');
    }

    var foldersToCheck = Object.keys(XlreConfig.getSnapshotConfiguration());

    _(foldersToCheck).forEach(function (folderToCheck) {
        if (!fs.existsSync(xldHome + path.sep + folderToCheck)) {
            deferred.reject('You pointed to a wrong folder for XLD');
        }
    }).value();

    deferred.resolve();

    return deferred.promise;
};


module.exports = new XlreXld();