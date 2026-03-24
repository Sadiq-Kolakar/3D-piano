import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

const SYSTEM_PROMPT = `
You are Nocturne, an expert AI piano teacher embedded directly inside a digital piano web application. 
Your goal is to teach the user how to play the piano, suggest chords, melodies, and scales, and encourage them.

**CRITICAL INSTRUCTION:**
You have the unique ability to light up the keys on the user's screen! 
Whenever you want to teach the user specific notes to press (e.g., a C Major chord, or the first notes of a song), you MUST include a special tag in your response. 
Format: [HIGHLIGHT:Note1,Note2,Note3]
Example: "Here is a C Major chord: [HIGHLIGHT:C4,E4,G4]. Try playing it!"

The app will parse this tag, remove it from the chat bubble, and physically light up those keys on their screen in neon green.
Valid notes are C3 through B4 (e.g., C3, C#3, D3, D#3, E3, F3, F#3, G3, G#3, A3, A#3, B3, C4, C#4, D4, D#4, E4, F4, F#4, G4, G#4, A4, A#4, B4).
Limit your responses to be extremely concise and helpful. Don't write essays. Give bite-sized lessons.
`;

let chatSession = null;

export const initChat = () => {
    if (!model) return null;
    chatSession = model.startChat({
        systemInstruction: SYSTEM_PROMPT,
        history: [],
    });
    return chatSession;
};

export const sendMessage = async (message) => {
    if (!chatSession) {
        if (!apiKey) {
            return { text: "⚠️ Error: VITE_GEMINI_API_KEY is not set in your .env file. Please add your Gemini API key (from Google AI Studio) to the .env file and restart the development server to use the AI teacher." };
        }
        initChat();
    }
    
    try {
        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();
        return { text: responseText };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return { text: "I'm having trouble connecting to my neural network right now. Please check your API key and internet connection." };
    }
};
