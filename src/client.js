/* eslint-disable no-console */

const { readFileSync } = require('fs');
const tls = require('tls');

const port = 8883;
let session = Buffer.from('');
let tlsSocket;

const color = '\x1b[33m';
const reset = '\x1b[0m';
function log(...msg) {
    console.log(`${color}client${reset}:`, ...msg);
}

function connect() {
    console.log();
    log(`Connecting to server, using session option parameter: ${session.length ? session.toString('hex').substr(0, 50) : 'new session'}...`);
    tlsSocket = tls.connect(port, {
        key: readFileSync(`${__dirname}/certs/client/client.key`),
        cert: readFileSync(`${__dirname}/certs/client/client.crt`),
        ca: [readFileSync(`${__dirname}/certs/ca/ca.crt`)],
        session,
    }, 'localhost');

    tlsSocket.on('secureConnect', () => {
        const tlsProtocol = tlsSocket.getProtocol();
        switch (tlsProtocol) {
            case 'TLSv1.1':
                // TODO: in Node >= v11.10.0 getSession() works only for TLS1.2 and below.
                // Future-proof applications should use the 'session' event.
                session = tlsSocket.getSession();
                break;
            case 'TLSv1.2':
            case 'TLSv1.3':
            default:
                session = tlsSocket.getSession();
                // session = tlsSocket.getTLSTicket();
                break;
        }
        tlsSocket.on('close', () => {
            log('closed conection, client reconnecting in 2500ms...');
            setTimeout(() => process.nextTick(() => connect()), 2500);
        });
        log(`secureConnectListener (${tlsSocket.getProtocol()}), session reused: ${tlsSocket.isSessionReused()}, sessionId: ${session.toString('hex').substr(0, 50)}...`);
    });

    // Only node 11.10.0
    tlsSocket.once('session', (sess) => {
        log('client session available', sess);
        session = sess;
    });

}

log(`Starting client, waiting 100ms for server to be online...`);
setTimeout(() => connect(), 100);
setTimeout(() => {
    console.log();
    log('Simulating client disconnect and reconnect');
    tlsSocket.destroy();
}, 5000);
