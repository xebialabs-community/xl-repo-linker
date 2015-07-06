var chai = require('chai');
var expect = chai.expect;
var Encoding = require('../../../lib/common/encoding.js');

describe("Common encoding", function () {
    it("should encode to base64", function () {
        expect(Encoding.encode('name')).to.equal('bmFtZQ==');
    });

    it("should decode from base64 to the plain text", function () {
        expect(Encoding.decode('bmFtZQ==')).to.equal('name');
    });
});
