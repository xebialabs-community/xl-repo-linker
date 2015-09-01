var exec = require('child_process').exec;
var Q = require('q');
var sshExec = require('ssh-exec');

var callWhenVagrantUp = function (error, stdout, stderr) {
    if (!error && !stderr && stdout) {
        sshExec('gulp test', '192.168.10.5')
    }
};

exec('cd vms && vagrant up', callWhenVagrantUp);

//sshExec('cd vms && vagrant up', 'ubuntu@my-remote.com').pipe(process.stdout);