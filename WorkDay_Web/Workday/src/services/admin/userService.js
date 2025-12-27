import {
    createUserApi,
    getAllUsersApi,
    updateUserApi,
    deleteUserApi,
    getOneUserApi,
} from "../../api/admin/userApi";

// Get All Users
export const getAllUsersService = async (params) => {
    try {
        const response = await getAllUsersApi(params);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || { message: "User Fetch Failed" };
    }
};

// Get One User by ID
export const getOneUserService = async (id) => {
    try {
        const response = await getOneUserApi(id);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || { message: "User Not Found" };
    }
};

// Create User (expects FormData if profile_pic is included)
export const createUserService = async (formData) => {
    try {
        const response = await createUserApi(formData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || { message: "User Creation Failed" };
    }
};

// Update User by ID (also expects FormData if profile_pic is included)
export const updateUserService = async (id, formData) => {
    try {
        const response = await updateUserApi(id, formData);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || { message: "User Update Failed" };
    }
};

// Delete User by ID
export const deleteUserService = async (id) => {
    try {
        const response = await deleteUserApi(id);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || { message: "User Deletion Failed" };
    }
};
