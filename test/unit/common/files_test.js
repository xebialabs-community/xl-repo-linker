var chai = require('chai');
var rewire = require("rewire");
var expect = chai.expect;
var FS = require('fs-mock');

var Files = rewire('../../../lib/common/files.js');

describe("Common files", function () {
    it("should walk the directory", function () {

        var fs = new FS({
            'home': {
                'david': {
                    'name.txt': 'david'
                },
                'john': {
                    'password.txt': 'my super password'
                }
            }
        });

        Files.__set__("fs", fs);

        expect(Files.walk('/home')).to.have.members(['/home/david/name.txt', '/home/john/password.txt']);
    });

});
