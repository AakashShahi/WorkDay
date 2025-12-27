// services/userApi.js
import axios from "../api";

//Create User (Admin only)
export const createUserApi = async (formData) => {
    const res = await axios.post("/admin/users/create", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

//Get All Users
export const getAllUsersApi = async (params) => {
    const res = await axios.get("/admin/users/", {
        params: {
            page: params.page,
            limit: params.limit,
            search: params.search || ""
        }
    });
    return res;
};

// Get One User by ID
export const getOneUserApi = async (id) => {
    const res = await axios.get(`/admin/users/${id}`);
    return res.data;
};

//Update User by ID
export const updateUserApi = async (id, formData) => {
    const res = await axios.put(`/admin/users/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

// Delete User by ID
export const deleteUserApi = async (id) => {
    const res = await axios.delete(`/admin/users/${id}`);
    return res.data;
};
