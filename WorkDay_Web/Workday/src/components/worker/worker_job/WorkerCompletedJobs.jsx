import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaClock, FaBriefcase, FaSearch, FaStar, FaPhone } from "react-icons/fa";
import { useWorkerCompletedJob } from "../../../hooks/worker/useWorkerJob";
import { getBackendImageUrl } from "../../../utils/backend_image";
import { FaPerson } from "react-icons/fa6";

export default function WorkerCompletedJobs() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [queryParams, setQueryParams] = useState({});

    const {
        completedJobs,
        pagination,
        isLoading,
        isError
    } = useWorkerCompletedJob({ page, limit: 10, ...queryParams });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setQueryParams({ search: search.trim() });
    };

    const renderStars = (rating) => {
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<FaStar key={i} className="text-yellow-500" />);
            } else if (rating >= i - 0.5) {
                stars.push(
                    <span key={i} className="relative inline-block text-yellow-500 w-4 h-4">
                        <FaStar className="absolute top-0 left-0 text-gray-300" />
                        <FaStar
                            className="absolute top-0 left-0 text-yellow-500"
                            style={{ clipPath: "inset(0 50% 0 0)" }}
                        />
                    </span>
                );
            } else {
                stars.push(<FaStar key={i} className="text-gray-300" />);
            }
        }

        return stars;
    };

    return (
        <div className="space-y-6">
            {/* 🔍 Search Bar */}
            <form
                onSubmit={handleSearchSubmit}
                className="flex flex-wrap gap-4 items-end bg-white p-6 rounded-xl shadow-md mb-6"
            >
                <div className="flex-1 min-w-[250px]">
                    <label className="block text-sm font-medium text-gray-700">Search</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                >
                    <FaSearch /> Search
                </button>
            </form>

            {/* 📦 Job List */}
            {isLoading && <div className="text-center text-gray-500">Loading completed jobs...</div>}
            {isError && <div className="text-center text-red-500">Failed to load completed jobs.</div>}
            {!isLoading && !isError && completedJobs.length === 0 && (
                <div className="text-center text-gray-400">No completed jobs found.</div>
            )}

            {!isLoading && !isError && completedJobs.map((job, index) => {
                const customer = job.postedBy || {};
                const review = job.review || {};

                return (
                    <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white shadow-md rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition duration-300 border-l-4 border-green-600"
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
                                        : job.completedAt
                                            ? new Date(job.completedAt).toLocaleString()
                                            : job.createdAt
                                                ? new Date(job.createdAt).toLocaleString()
                                                : "N/A"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaPerson className="text-purple-500" />
                                    <span className="font-medium">Customer:</span> {customer.name || "Unknown"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaPhone className="text-gray-500" />
                                    <span className="font-medium">Contact:</span> {customer.phone || "N/A"}
                                </div>
                            </div>

                            {/* ⭐ Review Section */}
                            <div className="mt-3">
                                <div className="flex items-center gap-1 text-yellow-500">
                                    {renderStars(review.rating)}
                                    <span className="text-sm text-gray-600 ml-2">({review.rating || 0}/5)</span>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-gray-700 mt-1 italic border-l-4 border-blue-400 pl-4">
                                        "{review.comment}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Pagination */}
            {!isLoading && !isError && pagination?.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="font-semibold text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
