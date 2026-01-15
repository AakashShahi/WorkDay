import React, { useState } from "react";
import { useAuditLogs } from "../../hooks/admin/useAuditLogs";
import { format } from "date-fns";
import {
    ClipboardList, Search, Filter, Calendar,
    ChevronLeft, ChevronRight, User, ShieldAlert,
    CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";

const statusIcons = {
    SUCCESS: <CheckCircle2 size={16} className="text-green-500" />,
    FAILURE: <XCircle size={16} className="text-red-500" />,
    WARNING: <AlertTriangle size={16} className="text-amber-500" />
};

const actionLabels = {
    LOGIN_SUCCESS: "Login Success",
    LOGIN_FAILURE: "Login Failed",
    LOGOUT: "Logout",
    ACCOUNT_LOCKOUT: "Account Locked",
    PASSWORD_CHANGE: "Password Changed",
    PROFILE_UPDATE: "Profile Updated",
    REGISTRATION: "User Registered",
    ADMIN_ACTION: "Admin Action",
    SENSITIVE_UPDATE_OTP_REQUEST: "OTP Requested"
};

export default function AdminAuditLogs() {
    const [params, setParams] = useState({
        page: 1,
        limit: 15,
        search: "",
        action: "",
        status: ""
    });

    const { data, isLoading } = useAuditLogs(params);

    const handlePageChange = (newPage) => {
        setParams(prev => ({ ...prev, page: newPage }));
    };

    const handleSearchChange = (e) => {
        setParams(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleFilterChange = (e) => {
        setParams(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="text-blue-600" /> System Activity Logs
                    </h2>
                    <p className="text-sm text-gray-500">Track user actions and system events for auditing.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search username or details..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={params.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <select
                    name="action"
                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={params.action}
                    onChange={handleFilterChange}
                >
                    <option value="">All Actions</option>
                    {Object.entries(actionLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>

                <select
                    name="status"
                    className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={params.status}
                    onChange={handleFilterChange}
                >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILURE">Failure</option>
                    <option value="WARNING">Warning</option>
                </select>

                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <input
                        type="date"
                        name="startDate"
                        className="border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none w-full"
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : data?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No logs found for the given criteria.</td>
                                </tr>
                            ) : (
                                data?.data?.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                            {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                {log.username || "Guest"}
                                                {log.user?.role && (
                                                    <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500 uppercase">{log.user.role}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                                            {actionLabels[log.action] || log.action}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                {statusIcons[log.status]}
                                                <span className={
                                                    log.status === "SUCCESS" ? "text-green-600" :
                                                        log.status === "FAILURE" ? "text-red-600" : "text-amber-600"
                                                }>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing page {data.pagination.currentPage} of {data.pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={data.pagination.currentPage === 1}
                                onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                                className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                disabled={data.pagination.currentPage === data.pagination.totalPages}
                                onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                                className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
