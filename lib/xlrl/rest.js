var app = require('../app');
var Q = require('q');
var _ = require('lodash-node/compat');

var XlreCompatibility = require('../config/compatibility');
var XlreConfig = require('../common/config');
var XlreConfigValidate = require('../config/validate');
var XlreEmitter = require('../common/emitter');

app.get('/xlrl/checkCompatibilityVersion', function (req, res) {
    XlreCompatibility.checkIt(req.query.version).then(function () {
        res.send(200);
    }).catch(function (err) {
        res.send(500, err);
    });
});

app.get('/xlrl/readConfig', function (req, res) {
    res.send(200, XlreConfig.getXlreConfig());
});

app.post('/xlrl/updateConfig', function (req, res) {
    XlreEmitter.getInstance().emit('db-conf-updated', req.body.data);
    res.send(200, {result: 'OK'});
});

app.get('/xlrl/checkConfig', function (req, res) {
    var deferred = Q.defer();

    var mode = req.query.mode;
    XlreConfigValidate.checkConfig({checkXldCredentials: true}, mode, deferred);

    deferred.promise.then(function() {
        res.send(200, '');
    }).catch(function(err) {
        res.send(500, err);
    });

});