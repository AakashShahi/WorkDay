import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Briefcase,
    FileCheck,
    Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo/kaammaa_logo.png";

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-[#F9FAFB] border-r border-gray-200 font-Inter fixed left-0 top-0 z-40">
            <div className="flex flex-col h-full p-6">
                {/* Logo and Title */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                        <img src={logo} alt="Workday Logo" className="w-10 h-8 object-contain" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Workday</h2>
                        <p className="text-sm text-gray-500">Admin Portal</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <p className="text-xs text-gray-500 uppercase mb-4">Navigation</p>
                    <ul className="space-y-2 text-sm">
                        <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                        <SidebarItem to="/admin/dashboard/users" icon={<Users size={18} />} label="User Management" />
                        <SidebarItem to="/admin/dashboard/jobs" icon={<Briefcase size={18} />} label="Job Management" />
                        <SidebarItem to="/admin/dashboard/reviews" icon={<MessageSquare size={18} />} label="Review Management" />
                        <SidebarItem to="/admin/dashboard/professions" icon={<Briefcase size={18} />} label="Profession Management" />
                        <SidebarItem to="/admin/dashboard/verifications" icon={<FileCheck size={18} />} label="Verification Requests" />
                        <SidebarItem to="/admin/dashboard/settings" icon={<Settings size={18} />} label="Settings" />
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

function SidebarItem({ icon, label, to }) {
    return (
        <li>
            <NavLink
                to={to}
                end
                className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-200 ${isActive
                        ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                }
            >
                {icon}
                <span>{label}</span>
            </NavLink>
        </li>
    );
}
