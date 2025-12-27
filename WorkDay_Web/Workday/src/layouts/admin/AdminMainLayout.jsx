import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { Outlet } from "react-router-dom";

export default function AdminMainLayout() {
    return (
        <div className="flex font-Inter">
            <Sidebar />
            <div className="flex flex-col flex-1 min-h-screen pl-64">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-8">
                    <Outlet />
                </main>
                <AdminFooter />
            </div>
        </div>
    );
}
