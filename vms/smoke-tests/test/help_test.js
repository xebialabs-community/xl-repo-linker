var XlreSmokeBase = require('../base');
var chai = require('chai');
chai.should();

var expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var assert = require('assert');
var _ = require('lodash-node/compat');

describe('Simple tests', function () {
    var $this = this;

    $this.timeout(10000);

    it('xl-repo-linker -h', function (done) {
        XlreSmokeBase.checkCommand('xl-repo-linker -h', function (data) {
            expect(data).to.contain('Usage: xl-repo-linker');
            done();
        });
    });

    it('xl-repo-linker --show-size', function (done) {
        XlreSmokeBase.checkCommand('xl-repo-linker --show-size', function (data) {
            expect(data).to.contain('XLD snapshot size is:');
            done();
        });
    });

    it.only('xl-repo-linker --xld-home=IncorrectPath', function (done) {
        XlreSmokeBase.runAndCheckCurl('xl-repo-linker --xld-home=IncorrectPath', 4, function (data) {
            console.log('data.fields = ', data);
            expect(data.configValidation).to.equal('Please check your mode value, valid values are [local, jira, google-drive]');
            expect(data.fields.length).to.equal(1);
            assert.ok(_.isEqual(['common.mode'], data.fields));
            done();
        });
    });

});