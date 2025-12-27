import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useRequestResetPassword } from "../hooks/useLoginUserTan";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo/kaammaa_logo.png";

export default function RequestResetPasswordPage() {
    const navigate = useNavigate();
    const requestResetPassword = useRequestResetPassword();

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
    });

    const formik = useFormik({
        initialValues: { email: "" },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await requestResetPassword.mutateAsync(values);
                navigate("/login");
            } catch (error) {
                console.error("Error requesting reset password:", error);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="Workday Logo"
                        className="h-16"
                    />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Forgot Your Password?
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Enter your email to receive a password reset link.
                </p>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>
                        <div className="mt-1 relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                        </div>
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-sm text-red-600 mt-1">{formik.errors.email}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition duration-300"
                    >
                        Request Password Reset
                    </button>
                </form>
                <div className="mt-4 text-sm text-center text-gray-500">
                    <span>Remember your password?</span>{" "}
                    <a
                        href="/login"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Log In
                    </a>
                </div>
            </div>
        </div>
    );
}