var fs = require('fs');

var Files = function(){};

Files.prototype.walk = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(Files.prototype.walk(file));
        else results.push(file)
    });
    return results
};

module.exports = new Files();