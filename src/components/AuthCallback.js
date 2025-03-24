import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AuthCallback() {
    const [status, setStatus] = useState('Processing...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCode = async (code, email) => {
            try {
                const response = await fetch('http://localhost:301/api/exchange-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, email })
                });

                const data = await response.json();
                if (data.success) {
                    setStatus('Authorization successful! Redirecting...');
                    // Store the email in sessionStorage for the webhook page
                    sessionStorage.setItem('userEmail', email);
                    // Redirect to webhook test page after a short delay
                    setTimeout(() => {
                        navigate('/webhook-test');
                    }, 1500);
                } else {
                    setStatus('Failed to exchange code. Please try again.');
                }
            } catch (error) {
                console.error('Error exchanging code:', error);
                setStatus('An error occurred. Please try again.');
            }
        };

        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const state = queryParams.get('state'); // state contains the email

        if (code && state) {
            exchangeCode(code, state);
        } else {
            setStatus('Authorization failed. Please try again.');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-bold mb-4">{status}</h2>
            </div>
        </div>
    );
} 