var XlreCache = require('./cache');
var XlreConfig = require("./config");

var fs = require('fs');
var path = require('path');
var _ = require('lodash-node/compat');

var XlreXld = function () {
};

XlreXld.prototype.getHome = function () {
    var xldHome = XlreCache.fetch('xldHome');

    if (xldHome === null) {
        return XlreConfig.getKeyValue('xld.home');
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

XlreXld.prototype.checkXldFolder = function (deferred) {

    var xldHome = XlreXld.prototype.getHome();

    if (!fs.existsSync(xldHome)) {
        deferred.reject({configValidation: 'XL Deploy home doesn\'t exist [' + xldHome + ']', fields: ['xld.home']});
    }

    var foldersToCheck = _.values(XlreConfig.getSnapshotConfiguration());

    _(foldersToCheck).forEach(function (folderToCheck) {
        if (!fs.existsSync(xldHome + path.sep + _.first(_.keys(folderToCheck)))) {
            deferred.reject({configValidation: 'You pointed to a wrong folder for XLD', fields: ['xld.home']});
        }
    }).value();
};


module.exports = new XlreXld();