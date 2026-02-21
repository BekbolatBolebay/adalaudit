const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const { generateText } = require("ai");
const fs = require('fs');
const path = require('path');

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

async function testModel(modelId) {
    try {
        console.log(`Testing ${modelId}...`);
        const { text } = await generateText({
            model: google(modelId),
            prompt: "Hello",
        });
        console.log(`✅ ${modelId} is working:`, text.substring(0, 20) + "...");
        return true;
    } catch (e) {
        console.error(`❌ ${modelId} failed:`, e.message);
        return false;
    }
}

async function runTests() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-latest");
    await testModel("gemini-1.5-pro");
    await testModel("gemini-2.0-flash-exp");
}
runTests();
