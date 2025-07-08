const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import the cors middleware
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import Google Generative AI

// Import new routes - paths updated assuming they are now in the root wdc-backend folder
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Import error handling middleware - path updated
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable CORS for all origins during development.
// In production, you should restrict this to your frontend's specific origin(s).
app.use(cors());

// Stripe webhook needs the raw body, so this must come before express.json()
// for the /api/webhooks route specifically.
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// Middleware to parse JSON bodies for all other routes
app.use(express.json());

// Initialize Google Generative AI
// IMPORTANT: Ensure GEMINI_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define API routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/webhooks', webhookRoutes);

// NEW: API route for AI-powered search
app.post('/api/ai-search', async (req, res, next) => {
    try {
        const { query } = req.body;
        console.log('AI Search - Received query:', query); // <--- ADDED LOG

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(query);
        console.log('AI Search - Raw Gemini result:', JSON.stringify(result, null, 2)); // <--- ADDED LOG

        const response = await result.response;
        console.log('AI Search - Gemini response object:', JSON.stringify(response, null, 2)); // <--- ADDED LOG
        
        // Ensure response.text() is called on a valid object
        let text = '';
        if (response && typeof response.text === 'function') {
            text = response.text();
            console.log('AI Search - Extracted text:', text); // <--- ADDED LOG
        } else {
            console.warn('AI Search - response.text() method not found or response is invalid.');
            text = 'No text content found in AI response.';
        }

        res.json({ result: text });
    } catch (error) {
        console.error('Error during AI search:', error);
        // Pass the error to the Express error handling middleware
        next(error);
    }
});


// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Set the port for the server to listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));