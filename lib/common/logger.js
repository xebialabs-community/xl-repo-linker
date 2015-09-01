var XlreEmitter = require('./emitter');

var colors = require('colors');
var _ = require('lodash-node/compat');

var channelName = 'xlre-log';

var LEVEL = {
    ERROR: {value: 0, name: "ERROR"},
    WARN: {value: 1, name: "WARN"},
    INFO: {value: 2, name: "INFO"},
    DEBUG: {value: 3, name: "DEBUG"},
    TRACE: {value: 4, name: "TRACE"}
};

var XlreLogging = function () {
};

function send(messageObject) {
    XlreEmitter.getInstance().emit(channelName, messageObject);
}

XlreLogging.prototype.trace = function (msg) {
    send({level: LEVEL.TRACE, msg: msg});
};

XlreLogging.prototype.debug = function (msg) {
    send({level: LEVEL.DEBUG, msg: msg});
};

XlreLogging.prototype.info = function (msg) {
    send({level: LEVEL.INFO, msg: msg});
};

XlreLogging.prototype.warn = function (msg) {
    send({level: LEVEL.WARN, msg: msg});
};

XlreLogging.prototype.error = function (msg) {
    send({level: LEVEL.ERROR, msg: msg});
};

XlreLogging.prototype.listen = function (level, callback) {
    XlreEmitter.getInstance().on(channelName, function (messageObject) {

        if (messageObject.level.value <= findLevel(level).value) {
            callback(messageObject);
        }
    });
};

XlreLogging.prototype.logToConsole = function (messageObject) {
    switch(messageObject.level.name) {
        case 'ERROR':
            console.error(messageObject.msg.red);
            break;
        case 'WARN':
            console.log(messageObject.msg.yellow);
            break;
        case 'INFO':
            console.log(messageObject.msg.green);
            break;
        case 'DEBUG':
            console.log(messageObject.msg.gray);
            break;
        case 'TRACE':
            console.log(messageObject.msg.white);
            break;
    }
};

function findLevel(levelName) {
    return _.find(_.map(LEVEL, function (value) {
        return value;
    }), function(item) {
        return item.name === levelName;
    });
}

module.exports = new XlreLogging();

