import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from '../../assets/logo/kaammaa_logo.png';
import { AuthContext } from "../../auth/AuthProvider";
import { useGetWorkerProfile } from "../../hooks/worker/useWorkerProfile";
import { getBackendImageUrl } from "../../utils/backend_image";
import { X } from 'lucide-react';

export default function Header() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            message: "Customer has requested a job request",
        },
        {
            id: 2,
            message: "Customer has accepted your job request",
        }
    ]);

    const profileRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

    const { logout, user } = useContext(AuthContext);
    const { data: profileData } = useGetWorkerProfile();
    const profile = profileData?.data;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setShowNotificationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const confirmLogout = () => {
        toast.success("Logout successful!");
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    const markAsRead = (id) => {
        setNotifications(prev => prev.filter(note => note.id !== id));
    };

    return (
        <>
            <header className="w-full bg-white shadow-sm flex items-center justify-between px-6 py-3 z-50 font-Inter">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Workday Logo" className="w-15 h-14 rounded-md object-contain" />
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-6 text-[15px] font-medium">
                    {[
                        { to: "/worker/dashboard", label: "Home", exact: true },
                        { to: "/worker/dashboard/jobs", label: "Jobs List" },
                        { to: "/worker/dashboard/myjobs", label: "My Jobs" },
                        { to: "/worker/dashboard/search", label: "Your Reviews" },
                    ].map(({ to, label, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `px-4 py-1.5 rounded-full transition font-semibold ${isActive
                                    ? "text-white bg-blue-600"
                                    : "text-gray-700 hover:text-blue-600"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right Side: Notification + Profile */}
                <div className="flex items-center gap-4 relative">
                    {/* Notification */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotificationDropdown(prev => !prev)}
                            className="relative text-gray-600 hover:text-blue-600 transition focus:outline-none"
                        >
                            <FaBell className="text-lg cursor-pointer" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500"></span>
                            )}
                        </button>

                        {showNotificationDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Notifications</h2>
                                    {notifications.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No new notifications</p>
                                    ) : (
                                        notifications.map((note) => (
                                            <div key={note.id} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-2 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm text-gray-700">{note.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => markAsRead(note.id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div ref={profileRef}>
                        <div
                            onClick={() => setShowDropdown(prev => !prev)}
                            className="flex items-center gap-3 cursor-pointer bg-blue-50 border border-blue-200 px-3 py-1 rounded-full hover:shadow transition"
                        >
                            <div className="w-7 h-7 rounded-full bg-gray-200 shadow-inner flex items-center justify-center">
                                <img
                                    alt="User Avatar"
                                    src={
                                        profile?.profilePic
                                            ? getBackendImageUrl(profile.profilePic)
                                            : "https://via.placeholder.com/150"
                                    }
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="text-sm font-medium text-gray-800">{user?.name || "User"}</span>
                                <span className="text-[11px] text-green-500 font-semibold">● Online</span>
                            </div>
                        </div>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/worker/dashboard/profile');
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Profile Settings
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        setShowLogoutModal(true);
                                    }}
                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-sm">
                        <h2 className="text-lg font-bold mb-4 text-gray-800">Confirm Logout</h2>
                        <p className="text-sm text-gray-600 mb-6">Are you sure you want to logout?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tailwind Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 200ms ease forwards;
                }
            `}</style>
        </>
    );
}
