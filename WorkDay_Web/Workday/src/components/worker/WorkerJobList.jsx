import React, { useState } from "react";
import {
    useWorkerPublicJob,
    useRequestPublicJob,
} from "../../hooks/worker/useWorkerJob";
import { useWorkerProfession } from "../../hooks/worker/useWorkerProfession";
import {
    FaMapMarkerAlt,
    FaClock,
    FaBriefcase,
    FaSearch,
    FaPhone,
} from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { getBackendImageUrl } from "../../utils/backend_image";
import { motion } from "framer-motion";

export default function WorkerJobList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [queryParams, setQueryParams] = useState({});
    const [selectedJob, setSelectedJob] = useState(null);

    const { professions, isLoading: isLoadingProfessions } =
        useWorkerProfession();

    const { publicJobs, isLoading, isError, pagination } =
        useWorkerPublicJob({
            page,
            limit: 5,
            ...queryParams,
        });

    const {
        mutate: requestJob,
        isLoading: isRequesting,
    } = useRequestPublicJob();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setQueryParams({
            search: search.trim(),
            location: location.trim(),
            category: category.trim(),
        });
    };

    const confirmRequest = () => {
        if (selectedJob) {
            requestJob(selectedJob._id, {
                onSuccess: () => setSelectedJob(null),
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900">
                Available Jobs
            </h1>

            <div className="flex flex-col md:flex-row gap-10">
                {/* Filters Panel */}
                <aside className="md:w-1/3 sticky top-20 self-start bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-max max-h-[80vh] overflow-auto">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800">
                        Filter Jobs
                    </h2>
                    <form onSubmit={handleSearchSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="search"
                                className="block mb-1 font-medium text-gray-700"
                            >
                                Keyword
                            </label>
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by description..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="location"
                                className="block mb-1 font-medium text-gray-700"
                            >
                                Location
                            </label>
                            <input
                                id="location"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Nayapati"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="category"
                                className="block mb-1 font-medium text-gray-700"
                            >
                                Category
                            </label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">All Categories</option>
                                {isLoadingProfessions ? (
                                    <option disabled>Loading...</option>
                                ) : professions.length > 0 ? (
                                    professions.map((item) => (
                                        <option key={item._id} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No categories found</option>
                                )}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            <FaSearch size={18} />
                            Search
                        </button>
                    </form>
                </aside>

                {/* Jobs List */}
                <main className="md:w-2/3 flex flex-col gap-8 max-h-[80vh] overflow-auto">
                    {isLoading ? (
                        <p className="text-center text-gray-500 text-lg">Loading jobs...</p>
                    ) : isError ? (
                        <p className="text-center text-red-600 font-semibold">
                            Failed to load jobs.
                        </p>
                    ) : publicJobs.length === 0 ? (
                        <p className="text-center text-gray-400 text-lg">No jobs found.</p>
                    ) : (
                        publicJobs.map((job, index) => {
                            const customer = job.postedBy || {};

                            return (
                                <motion.article
                                    key={job._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-xl transition duration-300"
                                    aria-label={`Job: ${job.description}`}
                                >
                                    {/* Icon */}
                                    <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
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

                                    {/* Details */}
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            {job.description}
                                        </h3>
                                        <div className="flex flex-wrap gap-5 text-gray-600 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-blue-600" />
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
                                                        : job.createdAt
                                                            ? new Date(job.createdAt).toLocaleString()
                                                            : "N/A"}
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

                                    {/* Action */}
                                    <div className="self-center md:self-start">
                                        <button
                                            onClick={() => setSelectedJob(job)}
                                            disabled={isRequesting}
                                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                                            aria-label={`Request job: ${job.description}`}
                                        >
                                            {isRequesting && selectedJob?._id === job._id
                                                ? "Requesting..."
                                                : "Request Job"}
                                        </button>
                                    </div>
                                </motion.article>
                            );
                        })
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <nav
                            className="flex justify-center items-center gap-6 mt-8"
                            aria-label="Pagination Navigation"
                        >
                            <button
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                disabled={page === 1}
                                className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-disabled={page === 1}
                            >
                                Prev
                            </button>
                            <span className="font-semibold text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() =>
                                    setPage((p) => Math.min(p + 1, pagination.totalPages))
                                }
                                disabled={page === pagination.totalPages}
                                className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-disabled={page === pagination.totalPages}
                            >
                                Next
                            </button>
                        </nav>
                    )}
                </main>
            </div>

            {/* Beautiful Fullscreen Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                    onClick={(e) => {
                        // Close modal if clicking on backdrop only
                        if (e.target === e.currentTarget) setSelectedJob(null);
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative flex flex-col"
                    >
                        {/* Close Button */}
                        <button
                            aria-label="Close modal"
                            onClick={() => setSelectedJob(null)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Title */}
                        <h2
                            id="modal-title"
                            className="text-3xl font-extrabold mb-6 text-gray-900 text-center"
                        >
                            {selectedJob.description}
                        </h2>

                        {/* Job Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-lg">
                            <div className="flex items-center gap-3">
                                <FaBriefcase className="text-blue-600 text-2xl flex-shrink-0" />
                                <div>
                                    <dt className="font-semibold">Category</dt>
                                    <dd>{selectedJob.category?.category || "N/A"}</dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="text-blue-600 text-2xl flex-shrink-0" />
                                <div>
                                    <dt className="font-semibold">Location</dt>
                                    <dd>{selectedJob.location || "N/A"}</dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaClock className="text-blue-600 text-2xl flex-shrink-0" />
                                <div>
                                    <dt className="font-semibold">Date & Time</dt>
                                    <dd>
                                        {selectedJob.date && selectedJob.time
                                            ? `${selectedJob.date} ${selectedJob.time}`
                                            : selectedJob.createdAt
                                                ? new Date(selectedJob.createdAt).toLocaleString()
                                                : "N/A"}
                                    </dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaPerson className="text-blue-600 text-2xl flex-shrink-0" />
                                <div>
                                    <dt className="font-semibold">Customer</dt>
                                    <dd>{selectedJob.postedBy?.name || "Unknown"}</dd>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 col-span-full">
                                <FaPhone className="text-blue-600 text-2xl flex-shrink-0" />
                                <div>
                                    <dt className="font-semibold">Contact</dt>
                                    <dd>{selectedJob.postedBy?.phone || "N/A"}</dd>
                                </div>
                            </div>
                        </div>

                        {/* Optional Job Category Icon */}
                        {selectedJob.category?.icon && (
                            <div className="mt-8 flex justify-center">
                                <img
                                    src={getBackendImageUrl(selectedJob.category.icon)}
                                    alt={`${selectedJob.category.name} icon`}
                                    className="w-24 h-24 object-contain rounded-md border border-gray-200"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-10 flex justify-center gap-6">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="px-8 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRequest}
                                disabled={isRequesting}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                {isRequesting ? "Requesting..." : "Request Job"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

// Worker job list component
