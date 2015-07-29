var events = require('events');
var eventEmitter = new events.EventEmitter();

var XlreEmitter = function () {
};

XlreEmitter.prototype.getInstance = function () {
    return eventEmitter;
};

module.exports = new XlreEmitter();