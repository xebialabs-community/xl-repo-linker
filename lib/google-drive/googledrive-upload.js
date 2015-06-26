var api = require('./api');
var app = require('../app');

app.get('/google-drive/uploadfile', function (req, res) {
    var fileToUpload = {title: req.query.fileToUploadTitle, path: req.query.fileToUploadPath};
    api.authToUploadFile(fileToUpload);
});

app.get('/google-drive/oauth2callback', function (req, res) {

    api.getToken(req.query.code).then(function(tokens){
        var auth = api.getOauth2();
        auth.credentials = tokens;
        api.uploadFile(auth);
    });

});