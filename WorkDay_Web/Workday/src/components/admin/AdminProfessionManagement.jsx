import React, { useState } from "react";
import { useAdminProfession } from "../../hooks/admin/useAdminProfession";
import CreateProfessionModal from "./modal/CreateProfessionModal";
import UpdateProfessionModal from "./modal/UpdateProfessionModal";
import DeleteProfessionModal from "./modal/DeleteProfessionModal";
import { getBackendImageUrl } from "../../utils/backend_image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminProfessionManagement() {
    const { professions, isLoading } = useAdminProfession();

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedProfession, setSelectedProfession] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const handleEdit = (profession) => {
        setSelectedProfession(profession);
        setShowEdit(true);
    };

    const handleDelete = (id) => {
        setSelectedId(id);
        setShowDelete(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Profession Management</h1>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    <Plus size={18} />
                    Add Profession
                </button>
            </div>

            {isLoading ? (
                <p className="text-gray-600">Loading professions...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {professions.map((profession, index) => (
                        <motion.div
                            key={profession._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 p-4 flex flex-col items-center text-center"
                        >
                            {profession.icon ? (
                                <img
                                    src={getBackendImageUrl(profession.icon)}
                                    alt="icon"
                                    className="w-16 h-16 object-cover rounded mb-3"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400 mb-3">
                                    No Image
                                </div>
                            )}
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{profession.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">{profession.category || "—"}</p>
                            <p className="text-sm text-gray-600 mb-3">{profession.description || "—"}</p>
                            <div className="flex gap-4 mt-auto">
                                <button
                                    onClick={() => handleEdit(profession)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(profession._id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateProfessionModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
            <UpdateProfessionModal
                isOpen={showEdit}
                onClose={() => setShowEdit(false)}
                profession={selectedProfession}
            />
            <DeleteProfessionModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                professionId={selectedId}
            />
        </div>
    );
}
