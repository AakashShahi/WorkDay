import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { requestUpdateOTPApi } from "../../../api/authApi";
import {
    useGetWorkerProfile,
    useUpdateWorkerProfile,
    useUpdateWorkerPassword,
} from "../../../hooks/worker/useWorkerProfile";
import { useWorkerProfession } from "../../../hooks/worker/useWorkerProfession";
import { getBackendImageUrl } from "../../../utils/backend_image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function WorkerProfileModals({
    showUpdateProfile,
    setShowUpdateProfile,
    showChangePassword,
    setShowChangePassword,
}) {
    const { data: profileData } = useGetWorkerProfile();
    const { professions } = useWorkerProfession();

    const updateProfileMutation = useUpdateWorkerProfile();
    const updatePasswordMutation = useUpdateWorkerPassword();

    const [previewPic, setPreviewPic] = useState("");
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        otp: "",
    });

    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [previewCertificate, setPreviewCertificate] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [profilePicSize, setProfilePicSize] = useState(null);
    const [certificateSize, setCertificateSize] = useState(null);

    useEffect(() => {
        if (profileData?.data?.profilePic) {
            setPreviewPic(getBackendImageUrl(profileData.data.profilePic));
        } else {
            setPreviewPic("");
        }

        setSkills(profileData?.data?.skills || []);

        if (profileData?.data?.certificateUrl) {
            setPreviewCertificate(getBackendImageUrl(profileData.data.certificateUrl));
        } else {
            setPreviewCertificate(null);
        }
    }, [profileData]);

    const validationSchema = Yup.object({
        name: Yup.string().required("Name is required"),
        phone: Yup.string().required("Phone is required"),
        location: Yup.string().required("Location is required"),
        professionId: Yup.string().required("Profession is required"),
        otp: Yup.string().required("Verification code is required").length(6, "Code must be 6 digits"),
    });

    const handleProfilePicChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setProfilePicSize((file.size / (1024 * 1024)).toFixed(2));
            setFieldValue("profilePic", file);
            setPreviewPic(URL.createObjectURL(file));
        }
    };

    const handleCertificateChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setCertificateSize((file.size / (1024 * 1024)).toFixed(2));
            setFieldValue("certificateUrl", file);
            setPreviewCertificate(URL.createObjectURL(file));
        }
    };

    const addSkill = (setFieldValue) => {
        const trimmed = skillInput.trim();
        if (trimmed && !skills.includes(trimmed)) {
            const updated = [...skills, trimmed];
            setSkills(updated);
            setFieldValue("skills", updated);
            setSkillInput("");
        }
    };

    const removeSkill = (index, setFieldValue) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
        setFieldValue("skills", updated);
    };

    const submitUpdateProfile = (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("phone", values.phone);
        formData.append("location", values.location);
        formData.append("profession", values.professionId);
        formData.append("otp", values.otp);
        if (skills.length > 0) {
            formData.append("skills", JSON.stringify(skills));
        }
        if (values.profilePic) {
            formData.append("profile_pic", values.profilePic);
        }
        if (values.certificateUrl) {
            formData.append("certificate", values.certificateUrl);
        }

        updateProfileMutation.mutate(formData, {
            onSuccess: () => {
                setShowUpdateProfile(false);
                setOtpSent(false);
            },
        });
    };

    const submitChangePassword = (e) => {
        e.preventDefault();
        updatePasswordMutation.mutate(passwordForm, {
            onSuccess: () => {
                setShowChangePassword(false);
                setPasswordForm({ currentPassword: "", newPassword: "", otp: "" });
                setOtpSent(false);
            },
        });
    };

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

    if (!showUpdateProfile && !showChangePassword) return null;

    return (
        <>
            {showUpdateProfile && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

                        <Formik
                            enableReinitialize
                            initialValues={{
                                name: profileData?.data?.name || "",
                                phone: profileData?.data?.phone || "",
                                location: profileData?.data?.location || "",
                                professionId: profileData?.data?.profession?._id || "",
                                profilePic: null,
                                certificateUrl: null,
                                skills: skills,
                                otp: "",
                            }}
                            validationSchema={validationSchema}
                            onSubmit={submitUpdateProfile}
                        >
                            {({ setFieldValue, isSubmitting }) => (
                                <Form encType="multipart/form-data" className="space-y-4">
                                    {/* Profile Picture */}
                                    <div className="flex flex-col items-center gap-2">
                                        {previewPic ? (
                                            <img
                                                src={previewPic}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl">
                                                ?
                                            </div>
                                        )}
                                        <div className="text-center">
                                            <label className="block text-xs text-gray-500 font-semibold mb-1">Max Size: 5MB</label>
                                            <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg"
                                                onChange={(e) => handleProfilePicChange(e, setFieldValue)}
                                                className="mt-1 text-xs text-center border p-1 rounded bg-gray-50 cursor-pointer"
                                            />
                                            {profilePicSize && (
                                                <p className={`text-[10px] mt-1 font-bold ${profilePicSize > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                    Selected: {profilePicSize} MB {profilePicSize > 5 && "(Too large!)"}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Name"
                                                className="w-full border rounded px-3 py-2"
                                            />
                                            <ErrorMessage name="name" component="div" className="text-red-600 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <Field
                                                type="text"
                                                name="phone"
                                                placeholder="Phone"
                                                className="w-full border rounded px-3 py-2"
                                            />
                                            <ErrorMessage name="phone" component="div" className="text-red-600 text-sm" />
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block mb-1 font-semibold text-sm">Skills</label>
                                        <div className="flex flex-wrap gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                                            {skills.map((skill, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 flex items-center gap-1 text-sm"
                                                >
                                                    <span>{skill}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSkill(idx, setFieldValue)}
                                                        className="font-bold"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <input
                                                type="text"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addSkill(setFieldValue);
                                                    }
                                                }}
                                                placeholder="Add a skill"
                                                className="min-w-[100px] flex-1 outline-none border-none text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addSkill(setFieldValue)}
                                                className="text-xl font-bold text-blue-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <Field
                                                type="text"
                                                name="location"
                                                placeholder="Location"
                                                className="w-full border rounded px-3 py-2"
                                            />
                                            <ErrorMessage name="location" component="div" className="text-red-600 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                                            <Field
                                                as="select"
                                                name="professionId"
                                                className="w-full border rounded px-3 py-2"
                                            >
                                                <option value="">Select Profession</option>
                                                {professions.map((p) => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="professionId" component="div" className="text-red-600 text-sm" />
                                        </div>
                                    </div>

                                    {/* Certificate */}
                                    <div>
                                        <label className="block mb-1 font-semibold text-sm">Certificate</label>
                                        <div className="flex items-start gap-4">
                                            {previewCertificate ? (
                                                <img
                                                    src={previewCertificate}
                                                    alt="Certificate"
                                                    className="w-32 h-20 object-cover border rounded"
                                                />
                                            ) : (
                                                <div className="w-32 h-20 bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center px-2">
                                                    No certificate uploaded
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <label className="block text-[10px] text-gray-500 font-semibold">Max 5MB</label>
                                                <input
                                                    type="file"
                                                    accept=".png,.jpg,.jpeg"
                                                    onChange={(e) => handleCertificateChange(e, setFieldValue)}
                                                    className="text-xs border p-1 rounded bg-gray-50 cursor-pointer"
                                                />
                                                {certificateSize && (
                                                    <p className={`text-[10px] mt-1 font-bold ${certificateSize > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                        Size: {certificateSize} MB {certificateSize > 5 && "(Limit exceeded)"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security - OTP */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                                        <label className="block mb-1 font-bold text-blue-800 text-sm text-center">Security Verification Required</label>
                                        <p className="text-[10px] text-blue-600 mb-3 text-center">Enter the 6-digit code sent to your email to save changes.</p>

                                        <div className="flex gap-2 max-w-xs mx-auto">
                                            <Field
                                                type="text"
                                                name="otp"
                                                placeholder="000000"
                                                maxLength="6"
                                                className="w-full border rounded px-3 py-2 text-center tracking-[0.5em] font-mono text-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSendOTP}
                                                disabled={isSendingOtp}
                                                className="whitespace-nowrap px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm"
                                            >
                                                {isSendingOtp ? "..." : otpSent ? "Resend" : "Send Code"}
                                            </button>
                                        </div>
                                        <ErrorMessage name="otp" component="div" className="text-red-600 text-center text-xs mt-1 font-semibold" />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpdateProfile(false)}
                                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            disabled={isSubmitting || updateProfileMutation.isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || updateProfileMutation.isLoading || !otpSent}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
                                        >
                                            {updateProfileMutation.isLoading ? "Updating..." : "Save Changes"}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Change Password</h2>

                        <form onSubmit={submitChangePassword} className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="currentPassword"
                                        placeholder="••••••••"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                currentPassword: e.target.value,
                                            }))
                                        }
                                        className="w-full border rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="••••••••"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                newPassword: e.target.value,
                                            }))
                                        }
                                        className="w-full border rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Cannot be same as your current or previous password.</p>
                            </div>

                            {/* Security - OTP */}
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-6">
                                <label className="block mb-1 font-bold text-orange-800 text-sm">Security Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        maxLength="6"
                                        value={passwordForm.otp || ""}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, otp: e.target.value }))}
                                        className="w-full border border-orange-200 rounded-lg px-3 py-2 text-center tracking-widest font-mono font-bold text-orange-900"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSendOTP}
                                        disabled={isSendingOtp}
                                        className="whitespace-nowrap px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 text-sm transition-colors"
                                    >
                                        {isSendingOtp ? "..." : otpSent ? "Resend" : "Send Code"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowChangePassword(false)}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatePasswordMutation.isLoading || !otpSent || !passwordForm.otp}
                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 shadow-lg"
                                >
                                    {updatePasswordMutation.isLoading ? "Changing..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
