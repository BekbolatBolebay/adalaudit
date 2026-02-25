const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    } catch (e) {
        console.warn("Could not read .env file");
    }
}

loadEnv();

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`✅ ${modelName}: Available`);
        } else {
            console.log(`❌ ${modelName}: ${data.error?.message || response.statusText}`);
        }
    } catch (e) {
        console.log(`❌ ${modelName}: ${e.message}`);
    }
}

async function run() {
    if (!API_KEY) {
        console.error("API_KEY not found in .env");
        return;
    }

    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp"
    ];

    console.log("Testing model availability via fetch...");
    for (const model of models) {
        await testModel(model);
    }
}

run();
