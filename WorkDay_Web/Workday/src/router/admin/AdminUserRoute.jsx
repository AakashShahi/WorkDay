import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../auth/AuthProvider";
import { useContext } from "react";
import React from "react";

export default function AdminUserRoute() {
    const { user, loading } = useContext(AuthContext)

    if (loading) return <>Loading</>

    if (!user) return <Navigate to="/" />

    if (user.role !== "admin") return <Navigate to="/dashboard" />

    return <Outlet />
}