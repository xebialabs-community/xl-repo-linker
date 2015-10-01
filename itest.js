var Q = require('q');
var sshExec = require('ssh-exec');

sshExec('cd xl-repo-linker/smoke-tests && npm install && gulp test', {
    host: '192.168.10.5',
    password: 'vagrant',
    user: 'vagrant'
}).pipe(process.stdout);