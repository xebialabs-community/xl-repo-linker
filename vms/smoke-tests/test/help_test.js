var XlreSmokeBase = require('../base');

describe('addition', function () {
    it('xl-repo-linker -h', function (done) {
        XlreSmokeBase.executeCommand('xl-repo-linker -h').then(function (data) {
            console.log('Data is = ', data);
            done();
        });
    });
});