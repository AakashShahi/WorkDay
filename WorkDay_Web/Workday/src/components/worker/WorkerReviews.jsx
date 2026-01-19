import React, { useState, useMemo } from "react";
import {
    FaTrash,
    FaStar,
    FaStarHalfAlt,
    FaRegStar,
    FaBriefcase,
    FaUser,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaComment,
} from "react-icons/fa";
import { useWorkerReviews, useDeleteWorkerReview } from "../../hooks/worker/useReview";
import { getBackendImageUrl } from "../../utils/backend_image";

export default function WorkerReviews() {
    const [page, setPage] = useState(1);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const limit = 10;

    const { reviews, isLoading, isError, pagination } = useWorkerReviews({ page, limit });
    const { mutate: deleteReview, isLoading: isDeleting } = useDeleteWorkerReview();

    const openModal = (reviewId) => {
        setSelectedReviewId(reviewId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedReviewId(null);
        setIsModalOpen(false);
    };

    const confirmDelete = () => {
        if (selectedReviewId) {
            deleteReview(selectedReviewId);
        }
        closeModal();
    };

    const handlePrev = () => {
        if (page > 1) setPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (page < pagination.totalPages) setPage((prev) => prev + 1);
    };

    // Calculate average rating
    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        return total / reviews.length;
    }, [reviews]);

    // Render star rating with spacing and improved visuals
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++)
            stars.push(<FaStar key={`full-${i}`} className="text-yellow-400 drop-shadow-sm" />);
        if (hasHalf)
            stars.push(<FaStarHalfAlt key="half" className="text-yellow-400 drop-shadow-sm" />);
        while (stars.length < 5)
            stars.push(<FaRegStar key={`empty-${stars.length}`} className="text-yellow-400 drop-shadow-sm" />);

        return <div className="flex gap-1">{stars}</div>;
    };

    // Loading skeleton animation for better UX
    if (isLoading)
        return (
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
                {[...Array(limit)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-gray-100 rounded-lg h-40 md:h-48"
                        aria-hidden="true"
                    />
                ))}
            </div>
        );

    if (isError)
        return (
            <div className="p-8 text-center text-red-600 font-semibold">
                Failed to load reviews. Please try again later.
            </div>
        );

    if (reviews.length === 0)
        return (
            <div className="p-8 text-center text-gray-600 font-semibold">
                No reviews found yet.
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Overall Average Rating */}
            <section className="flex flex-col items-center mb-10">
                <div className="flex items-center gap-3 text-4xl font-extrabold text-gray-900">
                    <span>{averageRating.toFixed(1)}</span>
                    <div>{renderStars(averageRating)}</div>
                </div>
                <p className="mt-2 text-gray-500 text-sm uppercase tracking-widest font-semibold">
                    Overall Rating
                </p>
            </section>

            {/* Reviews Grid */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-3">
                    My Reviews
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <article
                            key={review._id}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 relative flex flex-col p-6"
                            aria-label={`Review by ${review.customerId?.name} for job ${review.jobId?.description}`}
                        >
                            {/* Job Icon */}
                            {review.jobId?.icon && (
                                <div className="flex flex-col items-center mb-4">
                                    <img
                                        src={getBackendImageUrl(review.jobId.icon)}
                                        alt={`${review.jobId?.description} icon`}
                                        className="w-16 h-16 object-contain rounded-md"
                                        loading="lazy"
                                    />
                                    <h3 className="mt-2 text-center text-lg font-bold text-gray-800">
                                        {review.jobId?.description || "No Description"}
                                    </h3>
                                </div>
                            )}

                            {/* Review Text */}
                            <blockquote className="flex-1 text-gray-700 italic text-base leading-relaxed mb-4">
                                <FaComment className="inline-block mr-2 text-gray-400" />
                                “{review.comment}”
                            </blockquote>

                            {/* Job & Customer Info with icons */}
                            <dl className="text-sm text-gray-500 space-y-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    <dt className="font-semibold text-gray-700 inline">Customer:</dt>
                                    <dd>{review.customerId?.name || "N/A"}</dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-gray-400" />
                                    <dt className="font-semibold text-gray-700 inline">Location:</dt>
                                    <dd>{review.jobId?.location || "N/A"}</dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <dt className="font-semibold text-gray-700 inline">Date:</dt>
                                    <dd>{review.jobId?.date ? new Date(review.jobId.date).toLocaleDateString() : "N/A"}</dd>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="text-gray-400" />
                                    <dt className="font-semibold text-gray-700 inline">Time:</dt>
                                    <dd>{review.jobId?.time || "N/A"}</dd>
                                </div>
                            </dl>

                            {/* Rating Stars */}
                            {review.rating !== undefined && (
                                <div className="flex items-center gap-2">
                                    {renderStars(review.rating)}
                                    <span className="text-gray-600 font-medium">({review.rating})</span>
                                </div>
                            )}

                            {/* Delete Button */}
                            <button
                                aria-label="Delete review"
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                                onClick={() => openModal(review._id)}
                                disabled={isDeleting}
                                title="Delete review"
                            >
                                <FaTrash size={18} />
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            {/* Pagination Controls */}
            <nav
                className="flex justify-center items-center gap-6 mt-12"
                aria-label="Pagination Navigation"
            >
                <button
                    onClick={handlePrev}
                    disabled={page === 1}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-disabled={page === 1}
                >
                    Prev
                </button>
                <p className="text-gray-600 font-semibold">
                    Page {pagination.page} of {pagination.totalPages}
                </p>
                <button
                    onClick={handleNext}
                    disabled={page === pagination.totalPages}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-disabled={page === pagination.totalPages}
                >
                    Next
                </button>
            </nav>

            {/* Delete Confirmation Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                >
                    <div className="bg-white rounded-2xl p-8 w-80 max-w-full shadow-2xl text-center animate-fadeIn">
                        <h3
                            id="modal-title"
                            className="text-xl font-bold mb-4 text-gray-900"
                        >
                            Confirm Deletion
                        </h3>
                        <p id="modal-desc" className="text-gray-600 mb-8">
                            Are you sure you want to delete this review? This action cannot
                            be undone.
                        </p>
                        <div className="flex justify-center gap-6">
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-400"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition focus:outline-none focus:ring-4 focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>
                {`
          @keyframes fadeIn {
            from {opacity: 0; transform: translateY(10px);}
            to {opacity: 1; transform: translateY(0);}
          }
          .animate-fadeIn {
            animation: fadeIn 0.25s ease forwards;
          }
        `}
            </style>
        </div>
    );
}

// Worker reviews display component
