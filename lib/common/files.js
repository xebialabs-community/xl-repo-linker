var fs = require('fs');
var path = require('path');
var Q = require('q');

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

Files.prototype.download = function(response, archivePath, unpackToPath, fileName) {
    var deferred = Q.defer();

    if (response.statusCode === 200) {
        var file = fs.createWriteStream(archivePath);
        response.pipe(file);
        file.on('finish', function () {
            deferred.resolve({
                snapshotPath: unpackToPath,
                archivePath: archivePath
            });
        });
        file.on('error', function (err) {
            deferred.reject("File " + fileName + " hasn't been downloaded. " + err);
        });
    } else {
        deferred.reject("Status code: " + response.statusCode + ". File " + fileName + " hasn't been downloaded.");
    }

    return deferred.promise;
};

module.exports = new Files();