var cu = require('cli-unit').commands;

describe('Simple tests', function () {
    var $this = this;

    $this.timeout(10000);

    it('xl-repo-linker -h', function (done) {
        return cu.checkCommand('xl-repo-linker -h', function (data) {
            cu.expect(data).contains('Usage: xl-repo-linker');
        }, done, 2000);
    });

    it('xl-repo-linker --show-size', function (done) {
        cu.checkCommand('xl-repo-linker --show-size', function (data) {
            cu.expect(data).contains('XLD snapshot size is:');
        }, done, 8000);
    });

    it('xl-repo-linker --mode bla', function (done) {
        cu.checkCommand('xl-repo-linker --mode bla', function (data) {
            cu.expect(data).contains('Please check your mode value, valid values are [local, jira, google-drive]\n');
        }, done, 3000);
    });

    it('xl-repo-linker --xld-home=IncorrectPath', function (done) {
        cu.runAndCheckCurl('xl-repo-linker --xld-home=IncorrectPath', 'curl http://0.0.0.0:3000/xlrl/checkConfig', function (data) {
            cu.expect(data.configValidation).equals('XL Deploy home doesn\'t exist [IncorrectPath]');
            cu.expect(data.fields.length).equals(1);
            cu.expect(data.fields).deepEquals(['xld.home']);
        }, done);
    });

});