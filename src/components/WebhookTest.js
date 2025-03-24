import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function WebhookTest() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Get email from sessionStorage if available
        const savedEmail = sessionStorage.getItem('userEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            // Clear it after retrieving
            sessionStorage.removeItem('userEmail');
        }
    }, []);

    const handleWebhookTest = async () => {
        if (!email) {
            setStatus('Please enter an email address');
            return;
        }

        setLoading(true);
        setStatus('Sending webhook...');

        try {
            const response = await fetch('http://20.119.83.80:4001/api/trigger-webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (data.success) {
                setStatus('Webhook sent successfully!');
            } else {
                setStatus('Failed to send webhook: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending webhook:', error);
            setStatus('Error sending webhook. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-6">Test n8n Webhook</h1>
            <div className="w-full max-w-md">
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border rounded w-full mb-4"
                />
                <button
                    onClick={handleWebhookTest}
                    disabled={loading || !email}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
                >
                    {loading ? 'Sending...' : 'Send Webhook'}
                </button>
                {status && (
                    <div className={`mt-4 p-3 rounded ${status.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {status}
                    </div>
                )}
                <Link
                    to="/"
                    className="block text-center text-blue-600 hover:text-blue-800 underline mt-4"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
} 