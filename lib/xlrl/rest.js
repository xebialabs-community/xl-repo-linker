var app = require('../app');
var Q = require('q');

var XlreCompatibility = require('../config/compatibility');
var XlreConfig = require('../common/config');
var XlreConfigValidate = require('../config/validate');

app.get('/xlrl/checkCompatibilityVersion', function (req, res) {
    XlreCompatibility.checkIt(req.query.version).then(function() {
        res.send(200);
    }).catch(function(err) {
        res.send(500, err);
    });
});

app.get('/xlrl/checkConfig', function (req, res) {
    var deferred = Q.defer();

    XlreConfigValidate.checkXld({checkXldCredentials: true}, deferred);
    XlreConfigValidate.checkXldLicense(deferred);

    var mode = req.query.mode;

    XlreConfigValidate.checkJira(mode, deferred);
    XlreConfigValidate.checkGoogleDrive(mode, deferred);
    XlreConfigValidate.checkMongo(mode, deferred);

    deferred.promise.then(function () {
        console.log('deferred.promise');
        res.send(200, '');
    }).catch(function (err) {
        console.log('deferred.promise error ', err);
        res.send(500, err);
    });
});