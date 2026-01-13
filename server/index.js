require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

app.post('/smart-search', async (req, res) => {
    try {
        const { query, menu } = req.body;

        // 1. Validation
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Invalid query' });
        }
        if (query.length > 100) {
            return res.status(400).json({ error: 'Query too long (max 100 chars)' });
        }
        if (!menu || !Array.isArray(menu)) {
            return res.status(400).json({ error: 'Invalid menu data' });
        }

        // 2. Filter available items only (safety check, though frontend might already send them)
        const availableItems = menu.filter(item => item.available !== false); // Assuming default is true if undefined, or strictly check true

        // 3. Construct Prompt
        const menuJson = JSON.stringify(availableItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            tags: item.tags || []
        })));

        const prompt = `You are a smart food menu search engine.

User query: ${query}

Menu items are provided as JSON.
Each item has:
- id
- name
- price
- tags (array of strings)

Tags can include:
- veg, non-veg
- snacks, meal
- chicken, paneer
- spicy, sweet, filling

Rules:
- Recommend a maximum of 5 items
- Prefer lower price items if query mentions cheap or under a price
- Match veg / non-veg using tags
- Match snacks or meals using tags
- Sort items by best match first
- Return ONLY a JSON array of item ids
- Do NOT add explanations or extra text

${menuJson}`;

        // 4. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const responseCallback = await result.response;
        const text = responseCallback.text();

        // 5. Parse Response
        let recommendedIds = [];
        try {
            // Clean up potentially messy JSON (sometimes models add markdown code blocks)
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            recommendedIds = JSON.parse(cleanText);
        } catch (parseError) {
            console.error("Gemini JSON parse failed:", parseError);
            console.log("Raw response:", text);
            // Fallback to empty -> client will handle "No match"
            return res.json([]);
        }

        if (!Array.isArray(recommendedIds)) {
            return res.json([]);
        }

        // 6. Map back to items
        // We return the full item objects for easier frontend display
        // Preserving the order returned by AI
        const results = recommendedIds
            .map(id => availableItems.find(item => item.id === id))
            .filter(item => item !== undefined);

        return res.json(results);

    } catch (error) {
        console.error("Smart search error:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
