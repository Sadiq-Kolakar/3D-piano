import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const match = env.match(/VITE_GEMINI_API_KEY="?([^"\n\r]+)"?/);
if (!match) {
  console.log("No key found in .env.local");
  process.exit(1);
}
const key = match[1];

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("AVAILABLE MODELS FOR GENERATECONTENT:");
      data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")).forEach(m => console.log(m.name));
    } else {
      console.log("Error from API:", data);
    }
  }).catch(err => console.error("Fetch error:", err));
