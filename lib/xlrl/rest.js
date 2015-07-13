var app = require('../app');
var packageJson = require('../../package.json');
var Q = require('q');

var XlreConfig = require('../common/config');
var XlreConfigValidate = require('../config/validate');

app.get('/xlrl/version', function (req, res) {
    res.send(200, packageJson.version);
});

app.get('/xlrl/checkConfig', function (req, res) {
    var deferred = Q.defer();

    XlreConfigValidate.checkXld({}, deferred);
    XlreConfigValidate.checkXldLicense(deferred);

    if (XlreConfig.getMode() === 'jira') {
        XlreConfigValidate.checkJira(deferred);
    } else if (XlreConfig.getMode() === 'google-drive') {
        XlreConfigValidate.checkGoogleDrive(deferred);
        XlreConfigValidate.checkMongo(deferred);
    }

    deferred.promise.then(function () {
        res.send(200, '');
    }).catch(function (err) {
        res.send(500, err);
    });


});