var app = require('../app');
var imp = require('./import');
var exp = require('./export');
var pick = require('./pick');

var XlreCache = require('../common/cache');
var XlreConfig = require('../common/config');
var XlreXld = require('../common/xld');
var XlreConfigValidate = require('../config/validate');

function sendResultToTheUser(res, promiseResult) {
    promiseResult.then(function (message) {
        res.send(message);
    }, function (err) {
        res.status(500).send(err);
    });
}

app.get('/jira/import/:issue', function (req, res) {
    XlreCache.store('mode', 'jira');
    sendResultToTheUser(res, imp.execute(req.params.issue, req.query.restartServerAfterImport));
});

app.get('/jira/export/:issue', function (req, res) {
    XlreCache.store('mode', 'jira');
    sendResultToTheUser(res, exp.execute(req.params.issue, req.query.overwriteAlreadyExported));
});

app.get('/jira/pick', function (req, res) {
    pick.execute(req.query.query, req.query.showSubTasks, req.query.showSubTaskParent).then(function (message) {
        res.send(JSON.parse(message).sections[0].issues);
    }, function (err) {
        res.send(err);
    });
});

app.get('/jira/host', function (req, res) {
    XlreConfigValidate.checkConfigWithPromise().then(function () {
        res.send(XlreConfig.getKeyValue('jira.host'));
    }, function (err) {
        res.status(500).send(err);
    });
});