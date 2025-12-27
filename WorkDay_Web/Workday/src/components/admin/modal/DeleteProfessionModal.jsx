import React from "react";
import { useDeleteOneProfession } from "../../../hooks/admin/useAdminProfession";

export default function DeleteProfessionModal({ isOpen, onClose, professionId }) {
    const { mutate, isPending } = useDeleteOneProfession();

    const handleDelete = () => {
        mutate(professionId, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-sm rounded-md shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this profession?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                    <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 bg-red-600 text-white rounded">
                        {isPending ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
