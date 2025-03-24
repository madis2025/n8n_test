import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuthCallback() {
    const [status, setStatus] = useState('Processing...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCode = async (code, email) => {
            try {
                console.log("backend backend");
                const instance = axios.create({
                    validateStatus: () => true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                });

                // Add error handling for the response
                const response = await instance.post('https://20.119.83.80:4001/api/exchange-code', {
                    code: code,
                    email: email
                }).catch(error => {
                    console.error('Request failed:', error.message);
                    throw error;
                });

                if (response && response.data && response.data.success) {
                    setStatus('Authorization successful! Redirecting...');
                    sessionStorage.setItem('userEmail', email);
                    setTimeout(() => {
                        navigate('/webhook-test');
                    }, 1500);
                } else {
                    const errorMessage = response?.data?.error || 'Unknown error occurred';
                    setStatus(`Failed to exchange code: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error exchanging code:', error);
                setStatus(`An error occurred: ${error.message}`);
            }
        };

        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');
        const state = queryParams.get('state');

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