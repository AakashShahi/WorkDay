import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaMapMarkerAlt,
    FaClock,
    FaBriefcase,
    FaTrash,
    FaTimesCircle,
} from "react-icons/fa";
import { FaPerson, FaPhone } from "react-icons/fa6";
import {
    useAdminJob,
    useDeleteJob,
    useDeleteAllJobs,
} from "../../hooks/admin/useAdminJob";
import { getBackendImageUrl } from "../../utils/backend_image";

const statusColors = {
    open: {
        badge: "bg-green-100 text-green-700 border-green-300",
        card: "bg-green-50",
    },
    assigned: {
        badge: "bg-blue-100 text-blue-700 border-blue-300",
        card: "bg-blue-50",
    },
    requested: {
        badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
        card: "bg-yellow-50",
    },
    "in-progress": {
        badge: "bg-orange-100 text-orange-700 border-orange-300",
        card: "bg-orange-50",
    },
    done: {
        badge: "bg-gray-100 text-gray-700 border-gray-300",
        card: "bg-gray-50",
    },
    failed: {
        badge: "bg-red-100 text-red-700 border-red-300",
        card: "bg-red-50",
    },
};

export default function AdminJobManagement() {
    const { jobs, isLoading, isError } = useAdminJob();
    const { mutate: deleteJob, isLoading: isDeleting } = useDeleteJob();
    const { mutate: deleteAllJobs, isLoading: isDeletingAll } = useDeleteAllJobs();

    const [selectedJob, setSelectedJob] = useState(null);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const handleConfirmDelete = () => {
        if (selectedJob) {
            deleteJob(selectedJob._id, {
                onSuccess: () => setSelectedJob(null),
            });
        }
    };

    const handleConfirmDeleteAll = () => {
        deleteAllJobs(undefined, {
            onSuccess: () => setConfirmDeleteAll(false),
        });
    };

    const filteredJobs =
        statusFilter === "all"
            ? jobs
            : jobs.filter((job) => job.status === statusFilter);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    Manage Jobs ({filteredJobs.length})
                </h1>
                <div className="flex flex-wrap items-center gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring focus:border-blue-300"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="requested">Requested</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button
                        onClick={() => setConfirmDeleteAll(true)}
                        disabled={isDeletingAll || jobs.length === 0}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50"
                    >
                        {isDeletingAll ? "Deleting All..." : "Delete All Jobs"}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p className="text-center text-gray-500 text-lg">Loading jobs...</p>
            ) : isError ? (
                <p className="text-center text-red-600 font-semibold">Failed to load jobs.</p>
            ) : filteredJobs.length === 0 ? (
                <p className="text-center text-gray-400 text-lg">No jobs found for selected status.</p>
            ) : (
                <div className="flex flex-col gap-8">
                    {filteredJobs.map((job, index) => {
                        const customer = job.postedBy || {};
                        const statusTheme = statusColors[job.status] || {
                            badge: "bg-gray-100 text-gray-600",
                            card: "bg-white",
                        };

                        return (
                            <motion.article
                                key={job._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition duration-300 ${statusTheme.card}`}
                            >
                                <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                                    {job.category?.icon ? (
                                        <img
                                            src={getBackendImageUrl(job.category.icon)}
                                            alt="job category icon"
                                            className="w-14 h-14 object-contain"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs">No Icon</span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            {job.description}
                                        </h3>
                                        <span
                                            className={`text-sm px-3 py-1 rounded-full border ${statusTheme.badge}`}
                                        >
                                            {job.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-5 text-gray-600 text-sm">
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-[#FA5804]" />
                                            <span>{job.location || "N/A"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaBriefcase className="text-blue-600" />
                                            <span>{job.category?.category || "General"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-green-600" />
                                            <span>
                                                {job.date && job.time
                                                    ? `${job.date} ${job.time}`
                                                    : new Date(job.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPerson className="text-purple-600" />
                                            <span>
                                                <strong>Customer:</strong> {customer.name || "Unknown"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaPhone className="text-gray-600" />
                                            <span>
                                                <strong>Contact:</strong> {customer.phone || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="self-center md:self-start">
                                    <button
                                        onClick={() => setSelectedJob(job)}
                                        disabled={isDeleting}
                                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <FaTrash />
                                        Delete
                                    </button>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {selectedJob && (
                    <Modal
                        onClose={() => setSelectedJob(null)}
                        onConfirm={handleConfirmDelete}
                        isDeleting={isDeleting}
                        title="Confirm Delete"
                        description={`Are you sure you want to delete the job: "${selectedJob.description}"?`}
                        jobDetails={{
                            date: selectedJob.date,
                            time: selectedJob.time,
                            customer: selectedJob.postedBy?.name,
                            phone: selectedJob.postedBy?.phone,
                            status: selectedJob.status,
                        }}
                    />
                )}

                {confirmDeleteAll && (
                    <Modal
                        onClose={() => setConfirmDeleteAll(false)}
                        onConfirm={handleConfirmDeleteAll}
                        isDeleting={isDeletingAll}
                        title="Delete All Jobs"
                        description={`Are you sure you want to delete all jobs? This action cannot be undone.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function Modal({ onClose, onConfirm, isDeleting, title, description, jobDetails }) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white max-w-lg w-full rounded-lg shadow-xl p-8 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                >
                    <FaTimesCircle size={24} />
                </button>

                <h2 className="text-xl font-bold text-red-600 mb-4 text-center">{title}</h2>

                <div className="space-y-2 text-gray-700 text-sm">
                    <p>{description}</p>
                    {jobDetails && (
                        <>
                            <p>
                                <strong>Date:</strong> {jobDetails.date}{" "}
                                <strong>Time:</strong> {jobDetails.time}
                            </p>
                            <p>
                                <strong>Customer:</strong> {jobDetails.customer} ({jobDetails.phone})
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span className="uppercase">{jobDetails.status}</span>
                            </p>
                        </>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
