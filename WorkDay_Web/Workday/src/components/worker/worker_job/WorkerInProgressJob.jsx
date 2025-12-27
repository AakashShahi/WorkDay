import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaClock, FaBriefcase, FaPhone } from "react-icons/fa";
import { useWorkerInProgressJob } from "../../../hooks/worker/useWorkerJob";
import { getBackendImageUrl } from "../../../utils/backend_image";
import { FaUserTie } from "react-icons/fa6";
import JobDetailModal from "../modals/JobDetailModals";

export default function WorkerInProgressJob() {
    const { inProgressJobs, isLoading, isError } = useWorkerInProgressJob();
    const [selectedJob, setSelectedJob] = useState(null);

    // Replace this with your logged-in worker userId (auth context/store)
    const userId = "your-worker-user-id";

    if (isLoading) return <div className="text-center text-gray-500">Loading in-progress jobs...</div>;
    if (isError) return <div className="text-center text-red-500">Failed to load in-progress jobs.</div>;
    if (inProgressJobs.length === 0) return <div className="text-center text-gray-400">No in-progress jobs found.</div>;

    return (
        <div className="space-y-6 relative">
            {inProgressJobs.map((job) => (
                <motion.div
                    key={job._id}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(250, 88, 4, 0.2)" }}
                    transition={{ duration: 0.2 }}
                    className="cursor-pointer rounded-xl border border-gray-200 p-5 hover:border-[#FA5804] transition-shadow bg-gradient-to-tr from-white to-[#fff9f3]"
                    onClick={() => setSelectedJob(job)}
                >
                    <header className="flex items-center gap-5 mb-3">
                        {job.category?.icon ? (
                            <img
                                src={getBackendImageUrl(job.category.icon)}
                                alt={`${job.category?.category} icon`}
                                className="w-16 h-16 rounded-lg border border-[#FA5804]"
                            />
                        ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-[#FA5804] rounded-lg text-white text-2xl font-bold">
                                {job.category?.name?.charAt(0) || "J"}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-[#FA5804]">{job.category?.name || "No Category"}</h3>
                            <p className="text-gray-600">{job.description}</p>
                        </div>
                    </header>

                    <ul className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#FA5804]" />
                            <span>{job.location || "No Location"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FaClock className="text-[#FA5804]" />
                            <span>{job.date} {job.time}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FaUserTie className="text-[#FA5804]" />
                            <span>{job.postedBy?.name || "Unknown"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <FaPhone className="text-[#FA5804]" />
                            <span>{job.postedBy?.phone || "N/A"}</span>
                        </li>
                    </ul>

                    <p className="mt-4 text-sm text-red-600 font-medium">
                        ⚠️ Please contact the customer to review this job once completed. If not reviewed, it may be marked as <span className="font-bold">failed</span>.
                    </p>
                </motion.div>
            ))}

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    userId={userId}
                />
            )}
        </div>
    );
}
