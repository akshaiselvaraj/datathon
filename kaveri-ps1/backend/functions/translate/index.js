const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async (context, basicIO) => {
    try {
        const req = basicIO.getReferrerReq();
        const res = basicIO.getReferrerRes();
        
        // Handle CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            context.close();
            return;
        }

        let body = {};
        if (req.method === 'POST') {
            body = req.body || {};
        } else {
            body = req.query || {};
        }

        const { text } = body;
        
        if (!text) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing text parameter' }));
            context.close();
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Mock translation if API key is not configured
            console.log("GEMINI_API_KEY is not configured. Returning mock translation.");
            let translated = text;
            if (text.includes("ಕಳ್ಳತನ")) {
                translated = "Is theft increasing in Bengaluru?";
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ translatedText: translated, isMock: true }));
            context.close();
            return;
        }

        // Call Gemini 1.5 Flash API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Translate the following Kannada crime intelligence query to English. Return ONLY the English translation, with no explanation, introduction, or markdown formatting.\n\nQuery: ${text}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API error: ${response.statusText} - ${errText}`);
        }

        const data = await response.json();
        const translatedText = data.candidates[0].content.parts[0].text.trim();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ translatedText, isMock: false }));
    } catch (error) {
        console.error("Translation function error:", error);
        const res = basicIO.getReferrerRes();
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    } finally {
        context.close();
    }
};
