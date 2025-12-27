import React, { useState } from "react";
import {
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
    FaTrash,
    FaMapMarkerAlt,
    FaBriefcase,
    FaUser,
} from "react-icons/fa";
import { useGetAllReviews, useDeleteReview } from "../../hooks/admin/useAdminReview";

export default function AdminReviewManagement() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const limit = 5;

    const { reviews, pagination, isLoading } = useGetAllReviews({ page, limit, search });
    const deleteReview = useDeleteReview();

    const handleDeleteConfirm = () => {
        if (selectedReview) {
            deleteReview.mutate(selectedReview._id);
            setSelectedReview(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Manage All Reviews</h1>

            <input
                type="text"
                placeholder="Search by comment or worker name..."
                className="w-full max-w-sm px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                }}
            />

            {isLoading ? (
                <p className="text-gray-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews found.</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-800 font-medium text-sm">
                                        <FaUser className="inline text-blue-500 mr-1" />
                                        <span className="font-semibold">{review.customerId?.name}</span> reviewed{" "}
                                        <span className="text-gray-600">→</span>{" "}
                                        <span className="text-green-600 font-semibold">{review.workerId?.name}</span>
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                        <FaBriefcase className="text-gray-400" /> {review.jobId?.description}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                        <FaMapMarkerAlt className="text-red-400" /> {review.jobId?.location}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        Date: {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedReview(review)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Delete Review"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-1 mt-3">
                                {renderStars(review.rating)}
                            </div>

                            <p className="text-gray-700 mt-2">{review.comment}</p>

                            {review.jobId?.status && (
                                <span
                                    className={`inline-block mt-4 text-xs px-3 py-1 rounded-full font-semibold ${review.jobId.status === "done"
                                        ? "bg-green-100 text-green-700"
                                        : review.jobId.status === "failed"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {review.jobId.status.toUpperCase()}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
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
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Delete Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 animate-scaleFadeIn">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Deletion</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete this review by{" "}
                            <span className="font-semibold text-blue-600">{selectedReview.customerId?.name}</span>{" "}
                            for <span className="font-semibold text-green-600">{selectedReview.workerId?.name}</span>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes scaleFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scaleFadeIn {
                    animation: scaleFadeIn 200ms ease-out forwards;
                }
            `}</style>
        </div>
    );
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.25 && rating % 1 <= 0.75;
    const total = hasHalf ? full + 1 : full;
    const empty = 5 - total;

    return (
        <>
            {[...Array(full)].map((_, i) => (
                <FaStar key={`full-${i}`} className="text-yellow-500" />
            ))}
            {hasHalf && <FaStarHalfAlt className="text-yellow-500" />}
            {[...Array(empty)].map((_, i) => (
                <FaRegStar key={`empty-${i}`} className="text-gray-300" />
            ))}
        </>
    );
}
