var XlreString = function () {
};

XlreString.prototype.startsWith = function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
};

module.exports = new XlreString();