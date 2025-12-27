import React from "react";
import {
    Users, Briefcase, MessageSquare, FileClock, UserCheck
} from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

import { motion } from "framer-motion";
import { useAdminUsers } from "../../hooks/admin/useAdminUser";
import { useAdminProfession } from "../../hooks/admin/useAdminProfession";
import { useGetVerificationRequests } from "../../hooks/admin/useAdminVerification";
import { useGetAllReviews } from "../../hooks/admin/useAdminReview";
import { useAdminJob } from "../../hooks/admin/useAdminJob";

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function getMonthlyUserData(users) {
    const currentYear = new Date().getFullYear();
    const monthCount = new Array(12).fill(0);
    users.forEach(user => {
        const created = new Date(user.createdAt);
        if (created.getFullYear() === currentYear) {
            const monthIndex = created.getMonth();
            monthCount[monthIndex]++;
        }
    });
    return months.map((month, index) => ({
        month,
        users: monthCount[index],
    }));
}

function getMonthlyJobData(jobs) {
    const currentYear = new Date().getFullYear();
    const monthCount = new Array(12).fill(0);
    jobs.forEach(job => {
        const created = new Date(job.createdAt);
        if (created.getFullYear() === currentYear) {
            const monthIndex = created.getMonth();
            monthCount[monthIndex]++;
        }
    });
    return months.map((month, index) => ({
        month,
        jobs: monthCount[index],
    }));
}

export default function AdminDashboard() {
    const {
        users = [],
        isLoading: usersLoading,
        isError: usersError,
    } = useAdminUsers();

    const {
        professions = [],
        isLoading: professionsLoading,
        isError: professionsError,
    } = useAdminProfession();

    const {
        reviews,
        isLoading: reviewLoading,
        isError: reviewError,
        pagination,
    } = useGetAllReviews({ page: 1, limit: 1, search: "" });

    const {
        verifications = [],
        isLoading: verificationLoading,
        isError: verificationError,
    } = useGetVerificationRequests({ page: 1, limit: 1000 });

    const {
        jobs = [],
        isLoading: jobsLoading,
        isError: jobsError,
    } = useAdminJob();

    const totalReviews = pagination.total || 0;
    const totalCustomers = users.filter((u) => u.role === "customer").length;
    const totalWorkers = users.filter((u) => u.role === "worker").length;
    const totalProfessions = professions.length;
    const pendingVerifications = verifications.length;
    const totalJobs = jobs.length;

    const stats = [
        {
            label: "Total Customers",
            value: totalCustomers,
            icon: <Users className="text-blue-600" size={28} />,
            color: "bg-blue-100",
        },
        {
            label: "Total Workers",
            value: totalWorkers,
            icon: <UserCheck className="text-green-600" size={28} />,
            color: "bg-green-100",
        },
        {
            label: "Total Reviews",
            value: reviewLoading ? "..." : totalReviews,
            icon: <MessageSquare className="text-purple-600" size={28} />,
            color: "bg-purple-100",
        },
        {
            label: "Pending Verifications",
            value: verificationLoading ? "..." : pendingVerifications,
            icon: <FileClock className="text-yellow-600" size={28} />,
            color: "bg-yellow-100",
        },
        {
            label: "Total Professions",
            value: totalProfessions,
            icon: <Briefcase className="text-amber-500" size={28} />,
            color: "bg-amber-100",
        },
        {
            label: "Total Jobs",
            value: jobsLoading ? "..." : totalJobs,
            icon: <Briefcase className="text-pink-600" size={28} />,
            color: "bg-pink-100",
        },
    ];

    const monthlyUserData = getMonthlyUserData(users);
    const monthlyJobData = getMonthlyJobData(jobs);

    if (usersLoading || professionsLoading || jobsLoading) {
        return (
            <section className="flex justify-center items-center h-48">
                <p className="text-gray-500 text-lg font-medium animate-pulse">Loading dashboard stats...</p>
            </section>
        );
    }

    if (usersError || professionsError || verificationError || jobsError) {
        return (
            <section className="flex justify-center items-center h-48">
                <p className="text-red-500 text-lg font-semibold">Failed to load dashboard data.</p>
            </section>
        );
    }

    return (
        <section className="p-6 space-y-10 bg-gray-50 min-h-screen">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
            >
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600 mt-1">
                    Live overview of user activity and service data
                </p>
            </motion.header>

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.15,
                        }
                    }
                }}
            >
                {stats.map(({ icon, label, value, color }, index) => (
                    <motion.div
                        key={index}
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 }
                        }}
                    >
                        <StatCard icon={icon} label={label} value={value} color={color} />
                    </motion.div>
                ))}
            </motion.div>

            {/* User Bar Chart */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Monthly New User Registrations ({new Date().getFullYear()})
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyUserData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="users" fill="#2563EB" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.section>

            {/* Job Line Chart */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Monthly Job Posts ({new Date().getFullYear()})
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={monthlyJobData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="jobs" stroke="#14B8A6" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.section>
        </section>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className={`flex items-center gap-5 p-6 rounded-2xl shadow-sm border border-gray-200 bg-white hover:shadow-md hover:scale-[1.01] transition-transform duration-300 ease-in-out min-h-[120px]`}>
            <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
            <div>
                <p className="text-gray-600 text-sm font-medium">{label}</p>
                <p className="text-3xl font-extrabold text-gray-900">{value?.toLocaleString?.() ?? value}</p>
            </div>
        </div>
    );
}
