import React from 'react';
import { FaTrash } from 'react-icons/fa';

export default function AdminDeleteUserModal({ isOpen, onClose, onConfirm, user }) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Delete User</h2>
                <p>
                    Are you sure you want to delete <strong>{user.username}</strong>
                    ({user.role})?
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                        onClick={() => onConfirm(user._id)}
                    >
                        <FaTrash />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}