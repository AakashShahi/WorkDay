import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaClock, FaBriefcase, FaTrash, FaPhone } from "react-icons/fa";
import { useWorkerFailedJob, deleteFailedJob } from "../../../hooks/worker/useWorkerJob";
import { getBackendImageUrl } from "../../../utils/backend_image";
import { FaPerson } from "react-icons/fa6";

export default function WorkerFailedJobs() {
    const { failedJobs, isLoading, isError } = useWorkerFailedJob();
    const deleteMutation = deleteFailedJob();
    const [showModal, setShowModal] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);

    const openModal = (jobId) => {
        setJobToDelete(jobId);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setJobToDelete(null);
    };

    const handleDelete = () => {
        if (jobToDelete) {
            deleteMutation.mutate(jobToDelete);
            closeModal();
        }
    };

    return (
        <div className="space-y-6">
            {/* 🔃 Loading */}
            {isLoading && <div className="text-center text-gray-500">Loading failed jobs...</div>}

            {/* ❌ Error */}
            {isError && <div className="text-center text-red-500">Failed to load jobs.</div>}

            {/* ⚠️ No Jobs */}
            {!isLoading && !isError && failedJobs.length === 0 && (
                <div className="text-center text-gray-400">No failed jobs found.</div>
            )}

            {/* 📄 Job Cards */}
            {!isLoading && !isError &&
                failedJobs.map((job, index) => {
                    const customer = job.postedBy || {};

                    return (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white shadow-md rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition duration-300 border-l-4 border-red-500"
                        >
                            {/* Icon */}
                            <div className="w-24 h-24 flex-shrink-0">
                                {job.category?.icon ? (
                                    <img
                                        src={getBackendImageUrl(job.category.icon)}
                                        alt="icon"
                                        className="w-full h-full object-contain rounded"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded text-sm text-gray-500">
                                        No Icon
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-semibold text-gray-800">{job.description}</h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-blue-600" />
                                        {job.location || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaBriefcase className="text-blue-500" />
                                        {job.category?.category || "General"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaClock className="text-green-500" />
                                        {job.date && job.time
                                            ? `${job.date} ${job.time}`
                                            : job.createdAt
                                                ? new Date(job.createdAt).toLocaleString()
                                                : "N/A"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaPerson className="text-purple-500" />
                                        <span className="font-medium">Customer:</span>{" "}
                                        {customer.name || "Unknown"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaPhone className="text-gray-500" />
                                        <span className="font-medium">Contact:</span>{" "}
                                        {customer.phone || "N/A"}
                                    </div>
                                </div>

                                {/* Failed Note */}
                                <div className="mt-3 text-sm text-red-700 font-medium border-l-4 border-red-600 pl-4 bg-red-50 rounded">
                                    ❌ This job was marked as <strong>failed</strong> due to missed rating or deadline.
                                </div>
                            </div>

                            {/* Delete Action */}
                            <div className="self-center md:self-start">
                                <button
                                    onClick={() => openModal(job._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center gap-2"
                                    disabled={deleteMutation.isLoading}
                                >
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
                        <h2 className="text-lg font-bold text-red-600">Confirm Deletion</h2>
                        <p className="text-gray-700">Are you sure you want to delete this failed job?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                                {deleteMutation.isLoading ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
