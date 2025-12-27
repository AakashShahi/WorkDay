import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../auth/AuthProvider';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

const TwoFactorSetup = () => {
    const { user } = useContext(AuthContext);
    const [secret, setSecret] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [token, setToken] = useState("");
    const [step, setStep] = useState(1); // 1: Init, 2: Scan & Verify

    const handleSetup = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/setup-2fa`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                setSecret(res.data.secret);
                setQrCodeUrl(res.data.qrCode);
                setStep(2);
            }
        } catch (error) {
            toast.error("Failed to initialize 2FA setup");
        }
    };

    const handleVerify = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-2fa-setup`, { token }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.data.success) {
                toast.success("2FA Enabled Successfully!");
                setStep(3); // Done
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Two-Factor Authentication</h2>

            {step === 1 && (
                <div className="text-center">
                    <p className="text-gray-600 mb-6">Secure your account with 2FA.</p>
                    <button
                        onClick={handleSetup}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Enable 2FA
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 flex flex-col items-center">
                    <p className="text-sm text-gray-600 text-center">Scan this QR Code with Google Authenticator</p>
                    <QRCodeSVG value={secret ? `otpauth://totp/WorkDay:${user.username}?secret=${secret}&issuer=WorkDay` : ""} size={200} />
                    <p className="text-xs text-gray-400">Secret: {secret}</p>

                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleVerify}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Verify & Enable
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="text-center text-green-600">
                    <h3 className="text-xl font-bold">2FA is Enabled!</h3>
                    <p className="text-gray-500 text-sm mt-2">Your account is now more secure.</p>
                </div>
            )}
        </div>
    );
};

export default TwoFactorSetup;
