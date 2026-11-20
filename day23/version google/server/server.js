// --- THIS IS SERVER-SIDE CODE (e.g., server.js) ---
require('dotenv').config(); // Load API key from .env file
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 3000;

// Access your API key as an environment variable (securely)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.use(express.json());
// Serve your static P5.js files (assuming they are in a 'public' folder)
app.use(express.static('public'));

// The API endpoint your P5 sketch will call
app.post('/api/generate-phrase', async (req, res) => {
  try {
    // Choose the Gemini model (e.g., gemini-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Construct the prompt
    const prompt = `Generate a single, short, poetic or philosophical phrase (under 20 words) inspired by brutalism architecture, in a charles bukowsky style . No quotation marks.`;

    console.log("Received request, calling Gemini...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response:", text);
    res.json({ phrase: text.trim() }); // Send the generated phrase back to P5.js

  } catch (error) {
    console.error("Error calling Google AI:", error);
    // Extract more specific error info if available from Google's SDK error structure
    let errorMessage = "Failed to generate phrase";
    if (error.message) {
         errorMessage += `: ${error.message}`;
    }
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log(`Serving P5 sketch from 'public' directory.`);
  console.log(`API endpoint available at POST /api/generate-phrase`);
});