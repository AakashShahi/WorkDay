import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useResetPassword } from "../hooks/useLoginUserTan";
import { FiLock, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../assets/logo/kaammaa_logo.png";

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const resetPassword = useResetPassword();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await resetPassword.mutateAsync({ data: values, token });
                navigate("/login");
            } catch (error) {
                console.error("Error resetting password:", error);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-orange-100 to-white px-4">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Kaammaa Logo" className="h-12 w-auto" />
                </div>
                <h2 className="text-2xl font-bold text-center text-orange-600 mb-4">
                    Reset Your Password
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    Enter your new password below to reset your account.
                </p>
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div className="relative">
                        <label className="block text-sm text-gray-600 mb-1">New Password</label>
                        <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
                            <FiLock className="text-gray-400 mr-2" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                placeholder="Enter new password"
                                className="w-full outline-none bg-transparent"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 ml-2"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                        <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
                            <FiCheck className="text-gray-400 mr-2" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="Confirm password"
                                className="w-full outline-none bg-transparent"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 ml-2"
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-all duration-200"
                        disabled={resetPassword.isLoading}
                    >
                        {resetPassword.isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
