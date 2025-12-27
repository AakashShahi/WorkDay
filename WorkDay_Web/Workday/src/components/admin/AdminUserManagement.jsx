import React, { useState } from 'react';
import { FaSearch, FaTrash, FaUserCircle, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { HiOutlinePlus } from 'react-icons/hi';
import AdminAddUserModal from './modal/AdminAddUserModal';
import AdminDeleteUserModal from './modal/AdminDeleteUserModal';
import {
    useAdminUsers,
    useDeleteAdminUser,
    useCreateAdminUser
} from '../../hooks/admin/useAdminUser';
import { useAdminProfession } from '../../hooks/admin/useAdminProfession';
import { getBackendImageUrl } from '../../utils/backend_image';

export default function AdminUserManagement() {
    const [showModal, setShowModal] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');

    const {
        users, setPageNumber, pagination,
        isPending, canPreviousPage, canNextPage, setSearch
    } = useAdminUsers();

    const { mutate: deleteUser } = useDeleteAdminUser();
    const { mutate: createUser } = useCreateAdminUser();
    const { professions, isLoading: isProfessionsLoading } = useAdminProfession();

    const handlePrev = () => {
        if (pagination.page > 1) setPageNumber(prev => prev - 1);
    };

    const handleNext = () => {
        if (pagination.page < pagination.totalPages) setPageNumber(prev => prev + 1);
    };

    const handleSearch = (e) => {
        setPageNumber(1);
        setSearch(e.target.value);
    };

    const filteredUsers = roleFilter
        ? users.filter(user => user.role === roleFilter)
        : users;

    const getRoleColorClass = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-blue-100 text-blue-700';
            case 'worker':
                return 'bg-yellow-100 text-yellow-700';
            case 'customer':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                    <p className="text-sm text-gray-500">Manage admins, workers, and customers</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
                >
                    <HiOutlinePlus size={20} /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative w-full sm:w-1/2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        onChange={handleSearch}
                        className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="worker">Worker</option>
                    <option value="customer">Customer</option>
                </select>
            </div>

            {/* Users Grid */}
            {isPending ? (
                <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No users found</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                        <div
                            key={user._id}
                            className="bg-white shadow-md rounded-xl p-5 group hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-4">
                                    {user.profilePic ? (
                                        <img
                                            src={getBackendImageUrl(user.profilePic)}
                                            alt={user.username}
                                            className="w-14 h-14 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <FaUserCircle
                                            className="w-14 h-14 text-gray-400"
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{user.username}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full ${getRoleColorClass(user.role)}`}
                                >
                                    {user.role}
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 space-y-2">
                                {/* Profession only if NOT admin or customer */}
                                {user.role !== 'admin' && user.role !== 'customer' && (
                                    <p className="flex items-center gap-2">
                                        <FaBriefcase className="text-yellow-600" />
                                        <span><strong>Profession:</strong> {user.profession?.category || '—'}</span>
                                    </p>
                                )}

                                {/* Joined date */}
                                <p className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-blue-400" />
                                    <span><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</span>
                                </p>

                                {/* Location */}
                                <p className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-red-400" />
                                    <span><strong>Location:</strong> {user.location || '—'}</span>
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedUserToDelete(user);
                                        setDeleteModalOpen(true);
                                    }}
                                    className="text-red-500 hover:text-red-700 transition"
                                    title="Delete user"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between text-sm">
                <button
                    onClick={handlePrev}
                    disabled={!canPreviousPage}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Previous
                </button>
                <span>
                    Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
                <button
                    onClick={handleNext}
                    disabled={!canNextPage}
                    className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                    Next
                </button>
            </div>

            {/* Modals */}
            <AdminAddUserModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={createUser}
                professions={professions}
                isLoading={isProfessionsLoading}
            />

            <AdminDeleteUserModal
                isOpen={deleteModalOpen}
                user={selectedUserToDelete}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={(id) => {
                    deleteUser(id, {
                        onSuccess: () => {
                            setDeleteModalOpen(false);
                            setSelectedUserToDelete(null);
                        }
                    });
                }}
            />
        </div>
    );
}
