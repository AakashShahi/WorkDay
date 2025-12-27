import React from 'react'
import { Navigate, Outlet } from "react-router-dom"
import { AuthContext } from "../../auth/AuthProvider";
import { useContext } from "react"

export default function WorkerUserRoute() {

    const { user, loading } = useContext(AuthContext)

    if (loading) return <>Loading</>

    if (!user) return <Navigate to="/" />

    if (user.role !== "worker") return <Navigate to="/dashboard" />

    return <Outlet />
}
