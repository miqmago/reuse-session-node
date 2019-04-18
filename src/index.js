const { fork } = require('child_process');
let server = fork(`${__dirname}/server.js`);
const client = fork(`${__dirname}/client.js`);

setTimeout(() => {
    server.kill('SIGUSR2');
    setTimeout(() => {
        server = fork(`${__dirname}/server.js`);
        setTimeout(() => process.exit(), 3000);
    }, 1000);
}, 2000);

process.on('exit', () => {
    client.kill();
    server.kill();
});
