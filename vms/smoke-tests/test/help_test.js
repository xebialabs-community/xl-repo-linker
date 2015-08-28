var XlreSmokeBase = require('../base');
var chai = require('chai');
chai.should();

var expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var assert = require('assert');

describe('Tests where XLD is not installed yet', function () {

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
    })
});