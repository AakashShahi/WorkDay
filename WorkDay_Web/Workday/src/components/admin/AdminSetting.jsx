import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import {
    useAdminProfile,
    useUpdateAdminProfile,
    useChangeAdminPassword,
} from "../../hooks/admin/useAdminProfile";
import { getBackendImageUrl } from "../../utils/backend_image";

export default function AdminSetting() {
    const { admin, isLoading } = useAdminProfile();
    const updateProfile = useUpdateAdminProfile();
    const changePassword = useChangeAdminPassword();

    const [showPassword, setShowPassword] = useState(false);

    // ==== Formik for Profile Update ====
    const profileFormik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: admin?.name || "",
            profile_pic: null,
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
        }),
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.profile_pic) {
                formData.append("profile_pic", values.profile_pic);
            }
            updateProfile.mutate(formData);
        },
    });

    // ==== Formik for Password Change ====
    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: "",
            newPassword: "",
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string().required("Required"),
            newPassword: Yup.string()
                .min(6, "Minimum 6 characters")
                .required("Required"),
        }),
        onSubmit: (values, { resetForm }) => {
            changePassword.mutate(values, {
                onSuccess: () => resetForm(),
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

            {/* Profile Update Form */}
            <form
                onSubmit={profileFormik.handleSubmit}
                className="bg-white p-6 rounded-xl shadow space-y-5 border"
            >
                <h3 className="text-lg font-semibold text-gray-700">Update Profile</h3>

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
                    <label className="block text-sm font-medium">Change Profile Picture</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            profileFormik.setFieldValue("profile_pic", e.currentTarget.files[0])
                        }
                        className="w-full text-sm text-gray-600"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                    Update Profile
                </button>
            </form>

            {/* Password Change Form */}
            <form
                onSubmit={passwordFormik.handleSubmit}
                className="bg-white p-6 rounded-xl shadow space-y-5 border"
            >
                <h3 className="text-lg font-semibold text-gray-700">Change Password</h3>

                <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <div className="flex items-center gap-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="currentPassword"
                                value={passwordFormik.values.currentPassword}
                                onChange={passwordFormik.handleChange}
                                className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Current Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="text-gray-500 p-2"
                                title={showPassword ? "Hide passwords" : "Show passwords"}
                                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordFormik.errors.currentPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {passwordFormik.errors.currentPassword}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordFormik.values.newPassword}
                            onChange={passwordFormik.handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="New Password"
                        />
                        {passwordFormik.errors.newPassword && (
                            <p className="text-sm text-red-500 mt-1">{passwordFormik.errors.newPassword}</p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                    Change Password
                </button>
            </form>
        </div>
    );
}


