import { Bell, User, LogOut, Users, X } from "lucide-react";
import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthProvider";
import { useAdminUsers } from "../../hooks/admin/useAdminUser";
import { useGetVerificationRequests } from "../../hooks/admin/useAdminVerification";

export default function AdminHeader() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: "New User Registered",
            message: "A user named Aakash has signed up.",
            time: "2 mins ago",
        },
        {
            id: 2,
            title: "New User Registered",
            message: "A user named Customer has signed up.",
            time: "2 mins ago",
        },
    ]);

    const profileRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

    const { logout, user } = useContext(AuthContext);
    const { users } = useAdminUsers();
    const { verifications: pendingVerifications = [], isLoading: isVerificationLoading } =
        useGetVerificationRequests({ page: 1, limit: 1 });

    const pendingCount = pendingVerifications.length;
    const activeUsersCount = users.length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotificationDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const markAsRead = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 font-Inter shadow-sm">
                {/* Stats */}
                <div className="hidden md:flex items-center space-x-12 text-sm text-gray-600 select-none">
                    <div className="flex flex-col items-center">
                        <p className="font-semibold text-gray-400 uppercase tracking-wide">
                            Pending Verifications
                        </p>
                        {isVerificationLoading ? (
                            <p className="text-xs text-gray-400 animate-pulse">Loading...</p>
                        ) : (
                            <p className="text-orange-500 font-extrabold text-xl">{pendingCount}</p>
                        )}
                    </div>

                    <div className="flex flex-col items-center">
                        <p className="font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <Users size={18} className="text-green-500" />
                            Active Users
                        </p>
                        <p className="text-green-600 font-extrabold text-xl">
                            {activeUsersCount.toLocaleString()}
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <p className="font-semibold text-gray-400 uppercase tracking-wide">Today</p>
                        <p className="text-gray-900 font-medium tracking-tight">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                {/* Right: Notification & Profile */}
                <div className="flex items-center gap-6 relative">
                    {/* Notification dropdown */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotificationDropdown((prev) => !prev)}
                            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <Bell size={24} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex animate-pulse items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full shadow-lg">
                                    {notifications.length}
                                </span>
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
                                            <div key={note.id} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-md mb-2 shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800 text-sm">{note.title}</h3>
                                                        <p className="text-gray-600 text-sm">{note.message}</p>
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

                    {/* Profile dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileMenu((prev) => !prev)}
                            className="flex items-center gap-3 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                            aria-label="User menu"
                            title="User menu"
                        >
                            <div className="w-10 h-10 bg-gradient-to-tr from-[#FA5804] to-orange-400 shadow-md rounded-full flex items-center justify-center text-white font-bold select-none text-lg">
                                {user?.username?.slice(0, 2)?.toUpperCase() || "AD"}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-sm font-semibold text-gray-900 leading-tight">
                                    {user?.name || "Admin User"}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {user?.email || "admin@kaammaa.com"}
                                </span>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn origin-top-right">
                                <button className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-t-xl transition">
                                    <User size={20} />
                                    Profile Settings
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutModal(true);
                                        setShowProfileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-5 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-b-xl transition"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-[9999]">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-[90%] p-7 animate-scaleFadeIn">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Confirm Logout</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
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
                @keyframes scaleFadeIn {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                  animation: fadeIn 200ms ease forwards;
                }
                .animate-scaleFadeIn {
                  animation: scaleFadeIn 250ms ease forwards;
                }
            `}</style>
        </>
    );
}
