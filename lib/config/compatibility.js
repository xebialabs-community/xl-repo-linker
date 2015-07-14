var compareVersion = require('compare-version');
var packageJson = require('../../package.json');
var Q = require('q');

var XlreCompatibility = function () {
};

XlreCompatibility.prototype.checkIt = function (chromeExtVersion) {
    var deferred = Q.defer();

    var runningXlRepoLinkerVersion = packageJson.version;

    var ceLink = '<a target="_blank" href="https://chrome.google.com/webstore/detail/xl-repo-linker/eijgifcjmgogkgcindlfkhebacniffod?hl=en">Download</a>';

    if (!chromeExtVersion) {
        deferred.reject('Please update your chrome extension downloading it by this link: ' + ceLink);
    } else if (compareVersion('0.2.4', runningXlRepoLinkerVersion) > 0) {
        deferred.reject('Please update your chrome extension downloading it by this link: ' + ceLink);
    } else {
        deferred.resolve();
    }


    return deferred.promise;
};

module.exports = new XlreCompatibility();