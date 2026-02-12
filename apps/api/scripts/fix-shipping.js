
const http = require('http');

console.log("Starting fix-shipping.js...");

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/fix-db-shipping',
    method: 'GET',
    timeout: 5000 // 5s timeout
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('Request timed out');
    req.destroy();
    process.exit(1);
});

req.end();
