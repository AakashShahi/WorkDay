import React, { useEffect, useState } from "react";
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
    });

    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [previewCertificate, setPreviewCertificate] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

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
    });

    const handleProfilePicChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFieldValue("profilePic", file);
            setPreviewPic(URL.createObjectURL(file));
        }
    };

    const handleCertificateChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
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
            onSuccess: () => setShowUpdateProfile(false),
        });
    };

    const submitChangePassword = (e) => {
        e.preventDefault();
        updatePasswordMutation.mutate(passwordForm, {
            onSuccess: () => {
                setShowChangePassword(false);
                setPasswordForm({ currentPassword: "", newPassword: "" });
            },
        });
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
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleProfilePicChange(e, setFieldValue)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    <ErrorMessage name="name" component="div" className="text-red-600 text-sm" />

                                    {/* Skills */}
                                    <div>
                                        <label className="block mb-1 font-semibold">Skills</label>
                                        <div className="flex flex-wrap gap-2 border border-gray-300 rounded px-3 py-2 bg-white">
                                            {skills.map((skill, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 flex items-center gap-1"
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
                                                className="min-w-[100px] flex-1 outline-none border-none"
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

                                    <Field
                                        type="text"
                                        name="location"
                                        placeholder="Location"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    <ErrorMessage name="location" component="div" className="text-red-600 text-sm" />

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

                                    {/* Certificate */}
                                    <div className="flex flex-col items-center gap-2">
                                        <label className="block mb-1 font-semibold">Certificate</label>
                                        {previewCertificate ? (
                                            <img
                                                src={previewCertificate}
                                                alt="Certificate"
                                                className="w-full max-w-xs h-auto border rounded"
                                            />
                                        ) : (
                                            <div className="w-full max-w-xs h-32 bg-gray-200 flex items-center justify-center text-gray-400">
                                                No certificate uploaded
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleCertificateChange(e, setFieldValue)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpdateProfile(false)}
                                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                            disabled={isSubmitting || updateProfileMutation.isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || updateProfileMutation.isLoading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {updateProfileMutation.isLoading ? "Updating..." : "Update"}
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
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

                        <form onSubmit={submitChangePassword} className="space-y-4">
                            {/* Current Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="currentPassword"
                                    placeholder="Current Password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                        setPasswordForm((prev) => ({
                                            ...prev,
                                            currentPassword: e.target.value,
                                        }))
                                    }
                                    className="w-full border rounded px-3 py-2 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    placeholder="New Password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                        setPasswordForm((prev) => ({
                                            ...prev,
                                            newPassword: e.target.value,
                                        }))
                                    }
                                    className="w-full border rounded px-3 py-2 pr-10"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowChangePassword(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updatePasswordMutation.isLoading}
                                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black"
                                >
                                    {updatePasswordMutation.isLoading ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
