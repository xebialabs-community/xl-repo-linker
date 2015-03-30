var Logging = function () {
};

Logging.prototype.logError = function (err) {
    if (err) {
        console.log(err);
    }
};

module.exports = new Logging();