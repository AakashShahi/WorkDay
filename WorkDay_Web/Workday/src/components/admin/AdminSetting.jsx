import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import {
    useAdminProfile,
    useUpdateAdminProfile,
    useChangeAdminPassword,
} from "../../hooks/admin/useAdminProfile";
import { getBackendImageUrl } from "../../utils/backend_image";
import { requestUpdateOTPApi } from "../../api/authApi";
import { toast } from "react-toastify";

export default function AdminSetting() {
    const { admin, isLoading } = useAdminProfile();
    const updateProfile = useUpdateAdminProfile();
    const changePassword = useChangeAdminPassword();

    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [fileSizeMB, setFileSizeMB] = useState(null);

    const handleSendOTP = async () => {
        setIsSendingOtp(true);
        try {
            await requestUpdateOTPApi();
            setOtpSent(true);
            toast.success("Verification code sent to your email!");
        } catch (error) {
            toast.error(error.message || "Failed to send verification code");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // ==== Formik for Profile Update ====
    const profileFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: admin?.name || "",
            profile_pic: null,
            otp: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            otp: Yup.string().required("Required").length(6, "Must be 6 digits"),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("otp", values.otp);
            if (values.profile_pic) {
                formData.append("profile_pic", values.profile_pic);
            }
            updateProfile.mutate(formData, {
                onSuccess: () => setOtpSent(false)
            });
        },
    });

    // ==== Formik for Password Change ====
    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
            otp: "",
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string().required("Required"),
            newPassword: Yup.string()
                .min(6, "Minimum 6 characters")
                .required("Required"),
            otp: Yup.string().required("Required").length(6, "Must be 6 digits"),
        }),
        onSubmit: (values, { resetForm }) => {
            changePassword.mutate(values, {
                onSuccess: () => {
                    resetForm();
                    setOtpSent(false);
                },
            });
        },
    });

    if (isLoading) {
        return (
            <div className="text-center text-gray-500 py-10">
                Loading admin settings...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-10">
            <h2 className="text-3xl font-bold text-gray-800">Admin Settings</h2>

            {/* Admin Info */}
            <div className="bg-white p-6 rounded-xl shadow border flex gap-6 items-center">
                <img
                    src={getBackendImageUrl(admin?.profilePic)}
                    alt="Admin"
                    className="w-24 h-24 rounded-full object-cover border"
                />
                <div>
                    <h3 className="text-xl font-semibold">{admin?.name}</h3>
                    <p className="text-sm text-gray-500">{admin?.email}</p>
                    <p className="text-sm text-gray-400">Role: {admin?.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Update Form */}
                <form
                    onSubmit={profileFormik.handleSubmit}
                    className="bg-white p-6 rounded-xl shadow space-y-5 border flex flex-col"
                >
                    <h3 className="text-lg font-semibold text-gray-700">Update Profile</h3>

                    <div className="flex-grow space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                name="name"
                                onChange={profileFormik.handleChange}
                                value={profileFormik.values.name}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Name"
                            />
                            {profileFormik.errors.name && (
                                <p className="text-sm text-red-500">{profileFormik.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium">Profile Picture</label>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Max 5MB</span>
                            </div>
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={(e) => {
                                    const file = e.currentTarget.files[0];
                                    if (file) {
                                        setFileSizeMB((file.size / (1024 * 1024)).toFixed(2));
                                        profileFormik.setFieldValue("profile_pic", file);
                                    }
                                }}
                                className="w-full text-xs text-gray-600 border p-2 rounded-lg bg-gray-50 cursor-pointer"
                            />
                            {fileSizeMB && (
                                <p className={`text-[10px] mt-1 font-bold ${fileSizeMB > 5 ? 'text-red-600' : 'text-blue-600'}`}>
                                    Size: {fileSizeMB} MB {fileSizeMB > 5 ? '(Too Large)' : '(Valid size)'}
                                </p>
                            )}
                        </div>

                        {/* OTP for Profile */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-xs font-bold text-blue-800 mb-2">Verification Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="otp"
                                    maxLength="6"
                                    onChange={profileFormik.handleChange}
                                    value={profileFormik.values.otp}
                                    className="w-full px-3 py-2 border rounded-lg font-mono text-center tracking-widest"
                                    placeholder="000000"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={isSendingOtp}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                                >
                                    {isSendingOtp ? "..." : otpSent ? "Resend" : "Send"}
                                </button>
                            </div>
                            {profileFormik.errors.otp && (
                                <p className="text-[10px] text-red-500 mt-1">{profileFormik.errors.otp}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={updateProfile.isLoading || !otpSent}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-lg"
                    >
                        {updateProfile.isLoading ? "Updating..." : "Save Profile"}
                    </button>
                </form>

                {/* Password Change Form */}
                <form
                    onSubmit={passwordFormik.handleSubmit}
                    className="bg-white p-6 rounded-xl shadow space-y-5 border flex flex-col"
                >
                    <h3 className="text-lg font-semibold text-gray-700">Change Password</h3>

                    <div className="flex-grow space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={passwordFormik.values.currentPassword}
                                    onChange={passwordFormik.handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Current Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {passwordFormik.errors.currentPassword && (
                                <p className="text-sm text-red-500">{passwordFormik.errors.currentPassword}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">New Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordFormik.values.newPassword}
                                onChange={passwordFormik.handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="New Password"
                            />
                            {passwordFormik.errors.newPassword && (
                                <p className="text-sm text-red-500">{passwordFormik.errors.newPassword}</p>
                            )}
                        </div>

                        {/* OTP for Password */}
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <label className="block text-xs font-bold text-orange-800 mb-2">Verification Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="otp"
                                    maxLength="6"
                                    onChange={passwordFormik.handleChange}
                                    value={passwordFormik.values.otp}
                                    className="w-full px-3 py-2 border rounded-lg font-mono text-center tracking-widest"
                                    placeholder="000000"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={isSendingOtp}
                                    className="px-3 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                                >
                                    {isSendingOtp ? "..." : otpSent ? "Resend" : "Send"}
                                </button>
                            </div>
                            {passwordFormik.errors.otp && (
                                <p className="text-[10px] text-red-500 mt-1">{passwordFormik.errors.otp}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={changePassword.isLoading || !otpSent}
                        className="w-full bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-lg"
                    >
                        {changePassword.isLoading ? "Changing..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}


