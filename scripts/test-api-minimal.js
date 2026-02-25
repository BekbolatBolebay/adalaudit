const https = require('https');
const apiKey = 'AIzaSyAGD_xIKcpbgejYGBWA6WdW5tqdLZoJjrA';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [{ parts: [{ text: "Hi" }] }]
});

const req = https.request(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();
