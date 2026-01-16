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

        const prompt = `You are an expert AI food recommender for a canteen.
Your task is to analyze the user's query and the provided menu to suggest the best matching items.

User query: "${query}"

Menu Data (JSON):
${menuJson}

Rules:
1. DIETARY MATCHING: 
   - If user asks for "veg", ONLY return items that have the "veg" tag.
   - If user asks for "non-veg" or specific meats like "chicken", prioritize items with "non-veg", "chicken", etc.
2. PRICE SENSITIVITY:
   - If "cheap", "budget", or "under X" is mentioned, prioritize lower-priced items that fit the requirement.
3. SEMANTIC MATCHING:
   - Match descriptive words like "spicy", "sweet", "filling", "snack", "meal" against item names and tags.
4. RESPONSE FORMAT:
   - Return ONLY a valid JSON array of item IDs (e.g., ["id1", "id2"]).
   - Return a maximum of 5 most relevant items.
   - Rank them by relevance (best match first).
   - DO NOT include any markdown formatting, explanations, or extra text.`;

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
