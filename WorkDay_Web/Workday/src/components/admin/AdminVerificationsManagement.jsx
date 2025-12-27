import React, { useState } from "react";
import {
    useGetVerificationRequests,
    useAcceptVerification,
    useRejectVerification,
} from "../../hooks/admin/useAdminVerification";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaEnvelope,
    FaPhone,
    FaUser,
    FaTimes,
} from "react-icons/fa";
import { getBackendImageUrl } from "../../utils/backend_image";

export default function AdminVerificationsManagement() {
    const [page, setPage] = useState(1);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const limit = 5;

    const { verifications, isLoading, pagination } = useGetVerificationRequests({
        page,
        limit,
    });

    const acceptVerification = useAcceptVerification();
    const rejectVerification = useRejectVerification();

    const handleAccept = (workerId) => {
        acceptVerification.mutate(workerId);
    };

    const handleReject = (workerId) => {
        rejectVerification.mutate(workerId);
    };

    const openModal = (worker) => {
        setSelectedWorker(worker);
    };

    const closeModal = () => {
        setSelectedWorker(null);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Worker Verifications</h1>

            {isLoading ? (
                <p className="text-gray-500">Loading...</p>
            ) : verifications.length === 0 ? (
                <p className="text-gray-500 italic">No verification requests found.</p>
            ) : (
                <div className="space-y-6">
                    {verifications.map((worker) => {
                        const profilePic = getBackendImageUrl(worker.profilePic);
                        const certificatePic = getBackendImageUrl(worker.certificateUrl);

                        return (
                            <div
                                key={worker._id}
                                onClick={() => openModal(worker)}
                                className="cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
                            >
                                {/* Left: Profile & Info */}
                                <div className="flex items-center gap-4">
                                    <div>
                                        {profilePic ? (
                                            <img
                                                src={profilePic}
                                                alt={`${worker.name} Profile`}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-blue-500 text-3xl">
                                                <FaUser />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        <p className="font-semibold flex items-center gap-2">
                                            <FaUser className="text-blue-500" />
                                            {worker.name}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FaEnvelope /> {worker.email}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FaPhone /> {worker.phone}
                                        </p>
                                        <p>
                                            <span className="font-semibold">Role:</span> {worker.role}
                                        </p>
                                    </div>
                                </div>

                                {/* Middle: Certificate */}
                                <div className="mt-4 md:mt-0">
                                    {certificatePic ? (
                                        <img
                                            src={certificatePic}
                                            alt={`${worker.name} Certificate`}
                                            className="w-40 h-24 object-cover rounded border border-gray-300 shadow-sm"
                                        />
                                    ) : (
                                        <p className="italic text-gray-400 text-sm">
                                            No certificate uploaded.
                                        </p>
                                    )}
                                </div>

                                {/* Right: Buttons */}
                                <div className="flex gap-3 mt-4 md:mt-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAccept(worker._id);
                                        }}
                                        disabled={acceptVerification.isLoading}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
                                    >
                                        <FaCheckCircle /> Accept
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReject(worker._id);
                                        }}
                                        disabled={rejectVerification.isLoading}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
                                    >
                                        <FaTimesCircle /> Reject
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center gap-4 pt-6">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600 self-center">
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                    onClick={() =>
                        setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                    }
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Modal for selected worker */}
            {selectedWorker && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-full overflow-auto p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                            title="Close"
                        >
                            <FaTimes size={24} />
                        </button>

                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col items-center md:items-start gap-4">
                                {getBackendImageUrl(selectedWorker.profilePic) ? (
                                    <img
                                        src={getBackendImageUrl(selectedWorker.profilePic)}
                                        alt={`${selectedWorker.name} Profile`}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-400"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-blue-500 text-7xl">
                                        <FaUser />
                                    </div>
                                )}

                                <div className="space-y-1 text-gray-700 text-center md:text-left">
                                    <h2 className="text-3xl font-semibold">{selectedWorker.name}</h2>
                                    <p className="flex items-center gap-2">
                                        <FaEnvelope /> {selectedWorker.email}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <FaPhone /> {selectedWorker.phone}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Role:</span> {selectedWorker.role}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-3">Certificate</h3>
                                {getBackendImageUrl(selectedWorker.certificateUrl) ? (
                                    <img
                                        src={getBackendImageUrl(selectedWorker.certificateUrl)}
                                        alt={`${selectedWorker.name} Certificate`}
                                        className="w-full max-h-96 object-contain rounded border border-gray-300 shadow-sm"
                                    />
                                ) : (
                                    <p className="italic text-gray-400">No certificate uploaded.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
