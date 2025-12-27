import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaClock, FaBriefcase, FaPhone } from "react-icons/fa";
import { useRequestedJob, useCancelRequestedJob } from "../../../hooks/worker/useWorkerJob";
import { getBackendImageUrl } from "../../../utils/backend_image";
import { FaPerson } from "react-icons/fa6";

export default function WorkerRequestedJobs() {
    const { requestedJobs, isLoading, isError } = useRequestedJob();
    const { mutate: cancelRequest, isLoading: isCancelling } = useCancelRequestedJob();
    const [selectedJob, setSelectedJob] = useState(null); // For modal

    if (isLoading) return <div className="text-center text-gray-500">Loading requested jobs...</div>;
    if (isError) return <div className="text-center text-red-500">Failed to load requested jobs.</div>;
    if (requestedJobs.length === 0) return <div className="text-center text-gray-400">No requested jobs found.</div>;

    const handleConfirmCancel = () => {
        if (selectedJob) {
            cancelRequest(selectedJob._id, {
                onSuccess: () => setSelectedJob(null),
            });
        }
    };

    return (
        <div className="space-y-6">
            {requestedJobs.map((job, index) => {
                const customer = job.postedBy || {};

                return (
                    <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white shadow-md rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition duration-300 border-l-4 border-yellow-500"
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
                        </div>

                        {/* Cancel Button */}
                        <div className="self-center md:self-start">
                            <button
                                onClick={() => setSelectedJob(job)}
                                disabled={isCancelling}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50"
                            >
                                Cancel Request
                            </button>
                        </div>
                    </motion.div>
                );
            })}

            {/* Cancel Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Cancel Job Request</h2>
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to cancel this job request?
                        </p>
                        <ul className="text-gray-600 mb-4 text-sm space-y-1">
                            <li><strong>Category:</strong> {selectedJob.category?.name || "N/A"}</li>
                            <li><strong>Location:</strong> {selectedJob.location}</li>
                            <li><strong>Description:</strong> {selectedJob.description}</li>
                        </ul>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                            >
                                No
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
