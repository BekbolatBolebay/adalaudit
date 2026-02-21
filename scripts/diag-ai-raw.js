const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const { generateText } = require("ai");
const fs = require('fs');
const path = require('path');

// Read API key from .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("API Key not found in .env");
    process.exit(1);
}

const google = createGoogleGenerativeAI({
    apiKey: apiKey,
});

async function test() {
    try {
        console.log("Testing Gemini 2.0 Flash...");
        const { text } = await generateText({
            model: google("gemini-2.0-flash"),
            prompt: "Hello, reply with 'Gemini 2.0 is working'",
        });
        console.log("Response:", text);
    } catch (e) {
        console.error("Error with Gemini 2.0 Flash:", e.message);
        try {
            console.log("Testing Gemini 1.5 Flash as fallback...");
            const { text } = await generateText({
                model: google("gemini-1.5-flash"),
                prompt: "Hello, reply with 'Gemini 1.5 is working'",
            });
            console.log("Response:", text);
        } catch (e2) {
            console.error("Error with Gemini 1.5 Flash:", e2.message);
        }
    }
}
test();
