var XlreConfig = require('../common/config');

var app = require('../app');

app.get('/google-drive/enabled', function (req, res) {
    var googleDrive = XlreConfig.readXlreConfig().googleDrive;
    return googleDrive && googleDrive.enabled;
});