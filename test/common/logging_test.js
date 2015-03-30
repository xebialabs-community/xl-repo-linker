var chai = require('chai');
var expect = chai.expect;
var rewire = require("rewire");

var Logging = rewire('../../lib/common/logging.js');

describe("Common logging", function () {
    it("should log an error in console when the message is not undefined", function () {

        var initValue = '';

        var Console = {};
        Console.log = function(msg) {
            initValue = msg;
        };

        Logging.__set__({
            console: Console
        });

        Logging.logError(undefined);
        expect(initValue).to.equal('');

        var errorMessage = 'Error!';
        Logging.logError(errorMessage);

        expect(initValue).to.equal(errorMessage);
    });

});
