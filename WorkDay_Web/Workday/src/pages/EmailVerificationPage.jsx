import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo/kaammaa_logo.png';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function EmailVerificationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('Verifying your email...');
    const hasCalled = React.useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            if (hasCalled.current) return;
            hasCalled.current = true;
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token provided.');
                return;
            }

            const cleanedToken = token.trim().replace(/[^a-f0-9]/gi, '');

            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/verify-email?token=${cleanedToken}`
                );
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <img src={logo} alt="WorkDay Logo" className="h-12 mx-auto mb-6" />

                {status === 'verifying' && (
                    <>
                        <FaSpinner className="animate-spin text-blue-600 text-5xl mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/"
                            className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/register"
                            className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Register Again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
