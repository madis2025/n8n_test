import React, { useState } from "react";
import { Link } from "react-router-dom";

const CLIENT_ID = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const SCOPES = [
    "https://graph.microsoft.com/Mail.Read",
    "offline_access"
];

export default function MicrosoftLoginApp() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleLogin = () => {
        if (!CLIENT_ID || !REDIRECT_URI) {
            setError("Environment variables are not properly configured");
            return;
        }

        const authUrl =
            `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${encodeURIComponent(CLIENT_ID)}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&response_mode=query` +
            `&scope=${encodeURIComponent(SCOPES.join(" "))}` +
            `&state=${encodeURIComponent(email)}`;

        window.location.href = authUrl;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Connect your Microsoft Account</h1>
            {error && (
                <div className="text-red-600 mb-4">
                    {error}
                </div>
            )}
            <input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-2 border rounded w-full max-w-md mb-4"
            />
            <button
                onClick={handleLogin}
                disabled={!email}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
            >
                Sign in with Microsoft
            </button>
            <Link
                to="/webhook-test"
                className="text-blue-600 hover:text-blue-800 underline"
            >
                Test Webhook
            </Link>
        </div>
    );
} 