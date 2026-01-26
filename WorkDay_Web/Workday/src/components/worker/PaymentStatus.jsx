import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useVerifyPayment, useGetWorkerProfile } from "../../hooks/worker/useWorkerProfile";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

export default function PaymentStatus() {
    const [searchParams] = useSearchParams();
    const pidx = searchParams.get("pidx");
    const status = searchParams.get("status");
    const navigate = useNavigate();
    const verifyPaymentMutation = useVerifyPayment();
    const { refetch: refetchProfile } = useGetWorkerProfile();
    const [verificationDone, setVerificationDone] = useState(false);

    useEffect(() => {
        if (pidx && !verificationDone) {
            verifyPaymentMutation.mutate(pidx, {
                onSuccess: () => {
                    setVerificationDone(true);
                    refetchProfile();
                },
                onError: () => {
                    setVerificationDone(true);
                }
            });
        }
    }, [pidx, verificationDone, refetchProfile]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {verifyPaymentMutation.isLoading ? (
                    <div className="space-y-4">
                        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-800">Verifying Payment...</h2>
                        <p className="text-gray-600">Please wait while we confirm your transaction with Khalti.</p>
                    </div>
                ) : verifyPaymentMutation.isSuccess && verifyPaymentMutation.data?.data?.status === "Completed" ? (
                    <div className="space-y-6">
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
                            <p className="text-gray-600">Your verification request has been submitted successfully.</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                            <p className="text-sm text-gray-500"><strong>Transaction ID:</strong> {verifyPaymentMutation.data.data.transaction_id}</p>
                            <p className="text-sm text-gray-500"><strong>Amount:</strong> Rs. {verifyPaymentMutation.data.data.total_amount / 100}</p>
                        </div>
                        <Link
                            to="/worker/dashboard/profile"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            Go to Profile
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <FaTimesCircle className="text-6xl text-red-500 mx-auto" />
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
                            <p className="text-gray-600">Something went wrong or the payment was cancelled.</p>
                            {verifyPaymentMutation.error && (
                                <p className="text-sm text-red-500">{verifyPaymentMutation.error.message}</p>
                            )}
                        </div>
                        <Link
                            to="/worker/dashboard/profile"
                            className="block w-full bg-gray-800 hover:bg-black text-white font-semibold py-3 rounded-lg transition"
                        >
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
