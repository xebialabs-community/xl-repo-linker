var Q = require('q');
var sshExec = require('ssh-exec');

sshExec('cd xl-repo-linker/smoke-tests && gulp test', {
    user: 'vagrant',
    host: '192.168.10.5',
    password: 'vagrant'
}).pipe(process.stdout);