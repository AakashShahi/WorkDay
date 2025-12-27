import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    FaEye, FaEyeSlash, FaUser, FaCheckCircle,
    FaTimesCircle, FaFacebook
} from 'react-icons/fa';
import { RiLockPasswordFill } from 'react-icons/ri';
import { FcGoogle } from 'react-icons/fc';

import logo from '../../assets/logo/kaammaa_logo.png';
import workerImg from '../../assets/logo/login_worker.png';
import { useLoginUserTan } from '../../hooks/useLoginUserTan';
import { AuthContext } from '../../auth/AuthProvider';
import { motion } from "framer-motion";

export default function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword(prev => !prev);
    const { mutate, isPending } = useLoginUserTan();
    const { user, logout } = useContext(AuthContext);

    const passwordChecklist = (password) => [
        { label: "Minimum 8 characters", valid: password.length >= 8 },
        { label: "At least 1 uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "At least 1 number", valid: /\d/.test(password) },
        { label: "At least 1 special character", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const getPasswordStrength = (password) => {
        const rules = passwordChecklist(password);
        const validCount = rules.filter(r => r.valid).length;

        if (validCount === 0) return { width: '0%', color: '#e5e7eb', label: 'Very Weak' };
        if (validCount === 1) return { width: '25%', color: '#dc2626', label: 'Weak' };
        if (validCount === 2) return { width: '50%', color: '#f59e0b', label: 'Medium' };
        if (validCount === 3) return { width: '75%', color: '#84cc16', label: 'Good' };
        return { width: '100%', color: '#16a34a', label: 'Strong' };
    };

    const validationSchema = Yup.object({
        identifier: Yup.string()
            .required("Email or Username is required")
            .test('email-or-username', 'Invalid email or username', function (value) {
                if (!value) return false;
                if (value.includes('@')) {
                    return Yup.string().email().isValidSync(value);
                } else {
                    return /^[a-zA-Z0-9_]{3,20}$/.test(value);
                }
            }),
        password: Yup.string()
            .min(8, "Minimum 8 characters required")
            .required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            identifier: '',
            password: '',
        },
        validationSchema,
        onSubmit: (values) => {
            const payload = values.identifier.includes('@')
                ? { email: values.identifier, password: values.password }
                : { username: values.identifier, password: values.password };

            mutate(payload, {
                onSuccess: (data) => {
                    const role = data?.data?.role || data?.data?.user?.role;
                    if (role === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (role === 'worker') {
                        navigate('/worker/dashboard');
                    } else {
                        navigate('/login');
                        toast.error("Unknown role, please contact support");
                    }
                }
            });
        },
    });

    const isValid = (field) => formik.touched[field] && !formik.errors[field];
    const isInvalid = (field) => formik.touched[field] && formik.errors[field];
    const renderValidationIcon = (field) => {
        if (!formik.touched[field]) return null;
        return isValid(field)
            ? <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
            : <FaTimesCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />;
    };

    return (
        <div className="w-screen h-screen flex bg-white font-inter">
            {!user ? (
                <>
                    {/* Left side */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative px-6 py-10">
                        <img src={logo} alt="Workday Logo" className="absolute top-6 left-6 h-10 md:h-12" />
                        <img src={workerImg} alt="Worker" className="w-3/4 max-h-[70vh] object-contain" />
                        <h1 className="text-black text-3xl md:text-4xl font-extrabold mt-4 tracking-wide text-center">
                            Connect with Opportunities
                        </h1>
                    </div>

                    {/* Right side form */}
                    <div className="w-full md:w-1/2 flex justify-center items-center px-6 py-10">
                        <div className="bg-white rounded-2xl shadow-2xl px-6 sm:px-8 py-8 w-full max-w-md">
                            <div className="text-center mb-8">
                                <img src={logo} alt="Workday Logo" className="h-10 mx-auto mb-2" />
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Sign in to your Account</h2>
                                <p className="text-sm text-gray-500">Welcome back!</p>
                            </div>

                            <form onSubmit={formik.handleSubmit} className="space-y-5">
                                {/* Identifier */}
                                <div className="relative">
                                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                        Email or Username
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                            <FaUser />
                                        </span>
                                        <input
                                            id="identifier"
                                            name="identifier"
                                            type="text"
                                            placeholder="Enter your email or username"
                                            className="w-full pl-10 pr-10 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                            value={formik.values.identifier}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {renderValidationIcon("identifier")}
                                    </div>
                                    {isInvalid("identifier") && (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.identifier}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                            <RiLockPasswordFill />
                                        </span>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="********"
                                            className="w-full pl-10 pr-10 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <span
                                            className="absolute top-1/2 right-10 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                            onClick={togglePassword}
                                        >
                                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                                        </span>
                                        {renderValidationIcon("password")}
                                    </div>
                                    {isInvalid("password") && (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
                                    )}

                                    {/* Password Strength UI */}
                                    {formik.values.password && (
                                        <div className="mt-3 space-y-2">
                                            <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
                                                <div
                                                    className="h-full rounded transition-all duration-300"
                                                    style={{
                                                        width: getPasswordStrength(formik.values.password).width,
                                                        backgroundColor: getPasswordStrength(formik.values.password).color,
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm font-medium"
                                                style={{ color: getPasswordStrength(formik.values.password).color }}>
                                                {getPasswordStrength(formik.values.password).label}
                                            </p>
                                            <ul className="text-sm space-y-1">
                                                {passwordChecklist(formik.values.password).map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        {item.valid
                                                            ? <FaCheckCircle className="text-green-500" />
                                                            : <FaTimesCircle className="text-gray-400" />}
                                                        <span className={item.valid ? "text-green-600" : "text-gray-600"}>
                                                            {item.label}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <Link to="/request-reset-password" className="text-sm text-blue-600 hover:underline font-semibold">
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-black transition-colors duration-300 disabled:opacity-60"
                                >
                                    {isPending ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            <div className="flex items-center my-6">
                                <div className="flex-grow border-t border-gray-300" />
                                <span className="mx-4 text-gray-500 text-sm">or sign in with</span>
                                <div className="flex-grow border-t border-gray-300" />
                            </div>

                            <div className="flex justify-center gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => alert("Google Sign In")}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition"
                                >
                                    <FcGoogle size={20} />
                                    <span className="text-sm font-medium text-gray-700">Google</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => alert("Facebook Sign In")}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition"
                                >
                                    <FaFacebook size={20} className="text-[#1877F2]" />
                                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                                </button>
                            </div>

                            <p className="mt-2 text-sm text-center text-gray-600">
                                New to <span className="font-bold italic">Work</span><span className="font-bold italic text-blue-600">Day</span>?{" "}
                                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="w-full h-screen bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg"
                    >
                        Welcome back, <span className="underline decoration-white/70">{user.username}</span>!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="mt-6 text-xl md:text-2xl text-white/90 max-w-xl"
                    >
                        You are already logged in. Please logout to access the login page.
                    </motion.p>

                    <motion.button
                        onClick={logout}
                        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255, 255, 255, 0.8)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="mt-12 px-10 py-4 bg-white rounded-full text-blue-600 font-bold text-xl shadow-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/70"
                    >
                        Logout
                    </motion.button>
                </div>

            )}
        </div>
    );
}
