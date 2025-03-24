const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Update CORS configuration
app.use(cors({
    origin: 'https://20.119.83.80:3000',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Temporary token storage (replace with a database in production)
const tokenStore = new Map();

app.post('/api/exchange-code', async (req, res) => {
    const { code, email } = req.body;
    console.log("Exchanging code for email:", email);
    try {
        // Log the values we're using
        console.log("Using environment variables:");
        console.log("CLIENT_ID:", process.env.MICROSOFT_CLIENT_ID);
        console.log("REDIRECT_URI:", process.env.REDIRECT_URI);
        // Don't log the client secret for security reasons

        // Exchange code for tokens
        const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token',
            new URLSearchParams({
                client_id: process.env.MICROSOFT_CLIENT_ID,
                client_secret: process.env.MICROSOFT_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokens = tokenResponse.data;

        // Add expiration time (expires_in is in seconds)
        tokens.expires_at = Date.now() + (tokens.expires_in * 1000);

        // Store tokens
        tokenStore.set(email, tokens);

        res.json({ success: true });
    } catch (error) {
        // Improved error logging
        console.error('Token exchange error details:');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }

        res.status(500).json({
            success: false,
            error: error.response?.data?.error_description || error.message
        });
    }
});

// Update the tokens endpoint to return all tokens
app.get('/api/tokens', (req, res) => {
    // Convert Map to a regular object
    const tokensObject = Object.fromEntries(tokenStore);
    res.json(tokensObject);
});

// Keep the existing endpoint for backward compatibility
app.get('/api/tokens/:email', (req, res) => {
    const tokens = tokenStore.get(req.params.email);
    if (!tokens) {
        return res.status(404).json({ error: 'Tokens not found' });
    }
    res.json(tokens);
});

// Add this new endpoint
app.post('/api/trigger-webhook', async (req, res) => {
    const { email } = req.body;

    console.log("sending request to : ", process.env.N8N_WEBHOOK_URL);
    try {
        await axios.post(process.env.N8N_WEBHOOK_URL, {
            user_id: email
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });

        res.json({ success: true });
    } catch (error) {
        // Improve error logging
        if (error.response) {
            console.error('Webhook response error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else {
            console.error('Webhook error:', error.message);
        }

        res.status(500).json({
            success: false,
            error: error.response?.data?.message || error.message
        });
    }
});

const PORT = process.env.PORT || 4001;

// SSL certificate configuration
const options = {
    key: fs.readFileSync('./certificates/key.pem'),
    cert: fs.readFileSync('./certificates/cert.pem')
};

// Create HTTPS server
const server = https.createServer(options, app);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server running on port ${PORT}`);
}); 