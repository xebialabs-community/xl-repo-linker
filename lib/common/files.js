var XlreConfig = require('./config');
var XlreLogger = require('./logger');

var fs = require('fs');
var path = require('path');
var Q = require('q');

var temp = require('temp');
temp.track();

var Files = function () {
};

Files.prototype.deleteFiles = function (files) {
    var deferred = Q.defer();
    var i = files.length;
    files.forEach(function (filepath) {
        fs.unlink(filepath, function (err) {
            i--;
            if (err) {
                deferred.reject(err);
            } else if (i <= 0) {
                deferred.resolve();
            }
        });
    });
    return deferred.promise;
};

Files.prototype.getSize = function (filePath) {
    return (fs.statSync(filePath)["size"] / 1000000.0).toFixed(3);
};

Files.prototype.walk = function (dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(Files.prototype.walk(file));
        else results.push(file)
    });
    return results;
};

function registerDownloadCounter(response) {
    var len = parseInt(response.headers['content-length'], 10);
    var cur = 0;

    response.on("data", function (chunk) {
        cur += chunk.length;
        XlreLogger.info("Downloading " + (100.0 * cur / len).toFixed(2) + "%");
    });
}

Files.prototype.download = function (response, fileName) {
    var deferred = Q.defer();

    var tempFolder = temp.mkdirSync();
    var archivePath = tempFolder + path.sep + fileName;

    var progress = XlreConfig.getKeyValue('common.show_download_progress');
    if (progress && progress.toString() === "true") {
        registerDownloadCounter(response);
    }

    if (response.statusCode === 200) {
        var file = fs.createWriteStream(archivePath);
        response.pipe(file);
        file.on('finish', function () {
            deferred.resolve(archivePath);
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