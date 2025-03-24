const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Temporary token storage (replace with a database in production)
const tokenStore = new Map();

app.post('/api/exchange-code', async (req, res) => {
    const { code, email } = req.body;

    try {
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
        }
        );

        const tokens = tokenResponse.data;

        // Add expiration time (expires_in is in seconds)
        tokens.expires_at = Date.now() + (tokens.expires_in * 1000);

        // Store tokens (use a proper database in production)
        tokenStore.set(email, tokens);

        res.json({ success: true });
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to exchange code for tokens'
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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 