import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useCreateProfession } from "../../../hooks/admin/useAdminProfession";

const professionSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    category: Yup.string().required("Category is required"),
    description: Yup.string(),
    icon: Yup.mixed()
        .required("Icon image is required")
        .test("fileType", "Only image files are allowed", (value) => {
            return value && value.type && value.type.startsWith("image/");
        })
});

export default function CreateProfessionModal({ isOpen, onClose }) {
    const { mutate, isPending } = useCreateProfession();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-md rounded-md shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Add Profession</h2>

                <Formik
                    initialValues={{ name: "", category: "", description: "", icon: null }}
                    validationSchema={professionSchema}
                    onSubmit={(values, { resetForm }) => {
                        const formData = new FormData();
                        formData.append("name", values.name);
                        formData.append("category", values.category);
                        formData.append("description", values.description);
                        if (values.icon) {
                            formData.append("icon", values.icon);
                        }

                        mutate(formData, {
                            onSuccess: () => {
                                toast.success("Profession created");
                                resetForm();
                                onClose();
                            },
                            onError: (error) => {
                                toast.error(error?.response?.data?.message || "Failed to create profession");
                            }
                        });
                    }}
                >
                    {({ setFieldValue }) => (
                        <Form className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <Field
                                    name="name"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter profession name"
                                />
                                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Category Field */}
                            <div>
                                <label className="text-sm font-medium">Category</label>
                                <Field
                                    name="category"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter category"
                                />
                                <ErrorMessage name="category" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Description Field */}
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    className="w-full border px-3 py-2 rounded"
                                    placeholder="Enter description"
                                />
                                <ErrorMessage name="description" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Icon Upload Field */}
                            <div>
                                <label className="text-sm font-medium">Icon Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full"
                                    onChange={(event) => setFieldValue("icon", event.currentTarget.files[0])}
                                />
                                <ErrorMessage name="icon" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-orange-600"
                                >
                                    {isPending ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
