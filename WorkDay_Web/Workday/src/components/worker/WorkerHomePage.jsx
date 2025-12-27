import React, { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import {
    FaArrowRight,
    FaCheckCircle,
    FaClock,
    FaBriefcase,
    FaMapMarkerAlt,
    FaUserTie,
    FaPhoneAlt,
    FaClipboardList,
} from "react-icons/fa";
import { MdCalendarToday } from "react-icons/md";
import Lottie from "lottie-react";
import { getBackendImageUrl } from "../../utils/backend_image";
import { useNavigate } from "react-router-dom";

import {
    useWorkerInProgressJob,
    useWorkerPublicJob,
    useWorkerCompletedJob,
} from "../../hooks/worker/useWorkerJob";

import worker1 from "../../assets/lottie/worker1.json";
import worker2 from "../../assets/lottie/worker2.json";
import worker3 from "../../assets/lottie/worker3.json";

// Recharts imports
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

export default function WorkerHomePage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    const { inProgressJobs: jobList, isLoading, isError } = useWorkerInProgressJob();
    const { publicJobs = [], isLoading: isPublicLoading } = useWorkerPublicJob({ page: 1, limit: 1000 });
    const {
        completedJobs = [],
        isLoading: isCompletedLoading,
    } = useWorkerCompletedJob({ page: 1, limit: 1000 });

    const openJobCount = publicJobs.length;

    // Normalize date string to YYYY-MM-DD (timezone safe)
    const toISODate = (date) => {
        if (typeof date === "string") {
            const parts = date.split("-");
            const year = parts[0];
            const month = parts[1].padStart(2, "0");
            const day = parts[2].padStart(2, "0");
            return `${year}-${month}-${day}`;
        } else {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
    };

    // Dates with jobs for calendar highlights (unique dates)
    const workDatesSet = new Set(jobList.map((job) => toISODate(new Date(job.date))));
    const workDates = Array.from(workDatesSet);

    // Filter jobs for the selected date
    const filteredJobs = jobList.filter(
        (job) => toISODate(new Date(job.date)) === toISODate(selectedDate)
    );

    // Find the latest job date among all jobs
    const latestJobDate = jobList.length
        ? new Date(Math.max(...jobList.map((job) => new Date(job.date).getTime())))
        : null;

    const latestJobDateStr = latestJobDate
        ? latestJobDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
        : "No upcoming jobs";

    // Animations for hero section
    const animations = [worker1, worker2, worker3];
    const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAnimationIndex((prev) => (prev + 1) % animations.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Animation variants for framer-motion
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
    };

    // ----------- Analytics Data -----------

    // 1. Job Completion Trend (monthly grouping)
    const completionByMonth = completedJobs.reduce((acc, job) => {
        const date = new Date(job.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
    }, {});

    const completionTrendData = Object.entries(completionByMonth)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // 2. Job Category Distribution (from in-progress jobs)
    const categoryCount = jobList.reduce((acc, job) => {
        const categoryName = job.category?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
    }, {});

    const categoryDistributionData = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
    }));

    const COLORS = ["#FA5804", "#FFBB28", "#00C49F", "#0088FE", "#FF8042", "#A28FFF"];

    // --------------------------------------

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#fff8f0] to-[#fffefe] px-4 md:px-12 py-12 max-w-[1400px] mx-auto text-gray-800 select-none">
            {/* Hero Section */}
            <section
                aria-label="Hero Section"
                className="flex flex-col md:flex-row items-center justify-between gap-12 rounded-3xl bg-white shadow-xl p-10"
            >
                {/* Left Lottie Animation */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="md:w-1/3"
                >
                    <Lottie animationData={animations[currentAnimationIndex]} loop className="w-full h-72" />
                </motion.div>

                {/* Right Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className="flex flex-col items-center md:items-start md:flex-1"
                >
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        Work <span className="text-[#FA5804]">Your Way</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-lg text-gray-600">
                        Discover local job opportunities, manage your work schedule, and
                        track your progress — all from one place designed just for you.
                    </p>
                    <button
                        onClick={() => navigate("/worker/dashboard/myjobs")}
                        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FA5804] px-8 py-3 font-semibold text-white shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 transition"
                        aria-label="Navigate to My Jobs Dashboard"
                    >
                        Go to Jobs <FaArrowRight />
                    </button>
                </motion.div>
            </section>

            {/* Stats Dashboard */}
            <section
                aria-label="Job statistics overview"
                className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8"
            >
                {/* Open Jobs */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-md border-l-8 border-blue-600"
                    tabIndex={0}
                    aria-label="Open Jobs count"
                >
                    <FaBriefcase className="text-blue-600 text-5xl" />
                    <div>
                        <h3 className="text-4xl font-extrabold text-blue-600">
                            {isPublicLoading ? "..." : openJobCount}
                        </h3>
                        <p className="text-gray-600 font-medium">Open Jobs</p>
                    </div>
                </motion.div>

                {/* Jobs Completed */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-md border-l-8 border-green-600"
                    tabIndex={0}
                    aria-label="Jobs completed count"
                >
                    <FaCheckCircle className="text-green-600 text-5xl" />
                    <div>
                        <h3 className="text-4xl font-extrabold text-green-600">
                            {isCompletedLoading ? "..." : completedJobs.length}
                        </h3>
                        <p className="text-gray-600 font-medium">Jobs Completed</p>
                    </div>
                </motion.div>

                {/* Jobs Pending */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-5 rounded-2xl bg-white p-6 shadow-md border-l-8 border-yellow-500"
                    tabIndex={0}
                    aria-label="Jobs pending count"
                >
                    <FaClock className="text-yellow-500 text-5xl" />
                    <div>
                        <h3 className="text-4xl font-extrabold text-yellow-500">{jobList.length}</h3>
                        <p className="text-gray-600 font-medium">Jobs Pending</p>
                    </div>
                </motion.div>
            </section>

            {/* Analytics Section */}
            <section
                aria-label="Job analytics"
                className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10"
            >
                {/* Completion Trend Line Chart */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Job Completion Trend</h2>
                    {completionTrendData.length === 0 ? (
                        <p className="text-gray-500 italic">No completed jobs to show trend.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={completionTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="count" stroke="#FA5804" strokeWidth={3} />
                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                <XAxis dataKey="month" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Open Jobs Posted Per Day Line Chart */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Open Jobs Trend</h2>
                    {publicJobs.length === 0 ? (
                        <p className="text-gray-500 italic">No open jobs to show trend.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                                data={
                                    Object.entries(
                                        publicJobs.reduce((acc, job) => {
                                            const date = new Date(job.date);
                                            const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1)
                                                .toString()
                                                .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                                            acc[dateKey] = (acc[dateKey] || 0) + 1;
                                            return acc;
                                        }, {})
                                    )
                                        .map(([date, count]) => ({ date, count }))
                                        .sort((a, b) => a.date.localeCompare(b.date))
                                }
                                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                            >
                                <Line type="monotone" dataKey="count" stroke="#FA5804" strokeWidth={3} />
                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </section>

            {/* Calendar and Jobs List */}
            <section
                aria-label="Job calendar and list section"
                className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10"
            >
                {/* Calendar */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="bg-white rounded-3xl shadow-lg p-6"
                    tabIndex={0}
                    aria-label="Calendar with job highlights"
                >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-3">
                        <MdCalendarToday className="text-[#FA5804] text-3xl" />
                        Work Calendar
                    </h2>

                    <Calendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                        tileClassName={({ date }) =>
                            workDates.includes(toISODate(date)) ? "react-calendar__tile--highlight" : undefined
                        }
                        className="react-calendar custom-calendar rounded-xl"
                        locale="en-US"
                    />
                    <p className="mt-3 text-center text-gray-700 font-semibold">
                        {latestJobDate ? `Next job on ${latestJobDateStr}` : "No upcoming jobs"}
                    </p>
                </motion.div>

                {/* Jobs List */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-lg p-6 overflow-y-auto max-h-[600px]"
                    tabIndex={0}
                    aria-label={`Jobs scheduled on ${selectedDate.toDateString()}`}
                >
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                        <FaClipboardList className="text-[#FA5804] text-3xl" />
                        Jobs on {selectedDate.toDateString()}
                    </h2>

                    {isLoading && (
                        <p className="text-center text-gray-500 font-medium">Loading jobs...</p>
                    )}
                    {isError && (
                        <p className="text-center text-red-600 font-semibold">Failed to load jobs.</p>
                    )}

                    {filteredJobs.length === 0 && !isLoading && (
                        <p className="text-center italic text-gray-500">No jobs scheduled on this day.</p>
                    )}

                    <div className="space-y-5">
                        {filteredJobs.map((job) => (
                            <motion.article
                                key={job._id}
                                whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(250, 88, 4, 0.2)" }}
                                className="group cursor-pointer rounded-xl border border-gray-200 p-5 hover:border-[#FA5804] transition-shadow bg-gradient-to-tr from-white to-[#fff9f3]"
                                onClick={() => navigate("/worker/dashboard/myjobs")}
                                aria-label={`View details of job: ${job.description}`}
                            >
                                <header className="flex items-center gap-5 mb-3">
                                    {job.icon ? (
                                        <img
                                            src={getBackendImageUrl(job.icon)}
                                            alt={`${job.category?.name} icon`}
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
                                        <span>{job.time || "No Time"}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaUserTie className="text-[#FA5804]" />
                                        <span>{job.postedBy?.name || "Unknown Customer"}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FaPhoneAlt className="text-[#FA5804]" />
                                        <span>{job.postedBy?.phone || "No Contact"}</span>
                                    </li>
                                </ul>
                            </motion.article>
                        ))}
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
