var app = require('../app');
var exp = require('./export');
var imp = require('./import');

app.get('/local/uploadfile', function (req, res) {
    exp.execute(req.query.fileToUploadTitle, req.query.force, false).then(function (data) {
        res.send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });
});

app.get('/local/downloadfile', function (req, res) {
    imp.execute(req.query.fileToDownloadTitle, req.query.restart, false).then(function (data) {
        res.send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });
});
