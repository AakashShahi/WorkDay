import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateOneProfession } from "../../../hooks/admin/useAdminProfession";

export default function UpdateProfessionModal({ isOpen, onClose, profession }) {
    const { register, handleSubmit, reset } = useForm();
    const [iconFile, setIconFile] = useState(null);
    const [fileSizeMB, setFileSizeMB] = useState(null);
    const { mutate, isPending } = useUpdateOneProfession();

    useEffect(() => {
        if (profession) {
            reset({
                name: profession.name,
                category: profession.category,
                description: profession.description
            });
            setIconFile(null); // clear previous file when profession changes
        }
    }, [profession, reset]);

    const onSubmit = (data) => {
        // Build FormData for file upload
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("category", data.category || "");
        formData.append("description", data.description || "");
        if (iconFile) {
            formData.append("icon", iconFile);
        }

        mutate(
            { id: profession._id, data: formData },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-md rounded-md shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Update Profession</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <input {...register("name")} required className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Category</label>
                        <input {...register("category")} className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <textarea {...register("description")} className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">Icon</label>
                            <span className="text-[10px] text-gray-400 font-bold">Max 5MB</span>
                        </div>
                        <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFileSizeMB((file.size / (1024 * 1024)).toFixed(2));
                                    setIconFile(file);
                                }
                            }}
                            className="w-full text-sm border p-1 rounded bg-gray-50 mt-1 cursor-pointer"
                        />
                        {fileSizeMB && (
                            <p className={`text-[10px] mt-1 font-bold ${fileSizeMB > 5 ? "text-red-500" : "text-green-500"}`}>
                                File size: {fileSizeMB} MB {fileSizeMB > 5 && "(Too large!)"}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-white rounded">
                            {isPending ? "Saving..." : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
