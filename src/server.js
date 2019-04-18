/* eslint-disable no-console */
const { readFileSync } = require('fs');
const tls = require('tls');

const color = '\x1b[32m';
const reset = '\x1b[0m';
function log(...msg) {
    console.log(`${color}server${reset}:`, ...msg);
}

const port = 8883;
let server;

function startServer() {
    server = tls.createServer({
        key: readFileSync(`${__dirname}/certs/server/server.key`),
        cert: readFileSync(`${__dirname}/certs/server/server.crt`),
        requestCert: true,
        ca: [readFileSync(`${__dirname}/certs/ca/ca.crt`)],
        sessionTimeout: 3600,
        sessionIdContext: 'keyBoard Cat!',
    });
    
    server.on('secureConnection', (tlsSocket) => {
        log(`secureConnectListener (${tlsSocket.getProtocol()}), session reused: ${tlsSocket.isSessionReused()}, sessionId: ${tlsSocket.getSession().toString('hex').substr(0, 50)}...`);
    });
    
    server.on('close', () => {
        log('server is closing, send disconnect to all clients!');
    });
    
    server.on('tlsClientError', (err) => {
        log('server error, send disconnect to all clients!', err.toString());
    });
    
    server.on('listening', () => {
        log(`TLS server is listening on port ${port}`);
    });
    
    server.listen(port);
}

process.once('SIGUSR2', () => {
    log('Simulating server restart...');
    server.close();
    process.exit();
});

startServer();
