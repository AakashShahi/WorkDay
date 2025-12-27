
import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function AdminAddUserModal({ isOpen, onClose, onSubmit, professions, isLoading }) {
    if (!isOpen) return null;

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('Required'),
        name: Yup.string(),
        email: Yup.string().email('Invalid email').required('Required'),
        phone: Yup.string(),
        role: Yup.string().required('Select a role'),
        password: Yup.string().min(6).required('Password is required'),
        profession: Yup.string().when('role', (role, schema) => {
            return role === 'worker'
                ? schema.required('Profession is required for workers')
                : schema;
        }),
    });
    const initialValues = {
        username: '',
        name: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        profession: '',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white w-[90%] max-w-md p-6 rounded-lg relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-black"
                >
                    <IoMdClose size={20} />
                </button>
                <h2 className="text-lg font-semibold mb-4">Add New User</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        const payload = { ...values };
                        if (values.role !== "worker") {
                            delete payload.profession;
                        }

                        onSubmit(payload, {
                            onSuccess: () => {
                                resetForm();
                                setSubmitting(false);
                                onClose();
                            },
                            onSettled: () => setSubmitting(false),
                        });
                    }}
                >
                    {({ values, isSubmitting }) => (
                        <Form className="space-y-4">
                            <Field
                                name="username"
                                placeholder="Username"
                                className="w-full border rounded px-4 py-2"
                            />
                            <ErrorMessage name="username" component="div" className="text-sm text-red-500" />

                            <Field
                                name="name"
                                placeholder="Name"
                                className="w-full border rounded px-4 py-2"
                            />

                            <Field
                                name="email"
                                type="email"
                                placeholder="Email"
                                className="w-full border rounded px-4 py-2"
                            />
                            <ErrorMessage name="email" component="div" className="text-sm text-red-500" />

                            <Field
                                name="phone"
                                placeholder="Phone"
                                className="w-full border rounded px-4 py-2"
                            />

                            <Field
                                as="select"
                                name="role"
                                className="w-full border rounded px-4 py-2"
                            >
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="worker">Worker</option>
                                <option value="customer">Customer</option>
                            </Field>
                            <ErrorMessage name="role" component="div" className="text-sm text-red-500" />

                            {values.role === 'worker' && (
                                <>
                                    <Field
                                        as="select"
                                        name="profession"
                                        className="w-full border rounded px-4 py-2"
                                    >
                                        <option value="">Select Profession</option>
                                        {isLoading ? (
                                            <option disabled>Loading professions...</option>
                                        ) : (
                                            professions.map((p) => (
                                                <option key={p._id} value={p._id}>
                                                    {p.category}
                                                </option>
                                            ))
                                        )}
                                    </Field>
                                    <ErrorMessage name="profession" component="div" className="text-sm text-red-500" />
                                </>
                            )}

                            <Field
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="w-full border rounded px-4 py-2"
                            />
                            <ErrorMessage name="password" component="div" className="text-sm text-red-500" />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                            >
                                {isSubmitting ? 'Creating...' : 'Create User'}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
