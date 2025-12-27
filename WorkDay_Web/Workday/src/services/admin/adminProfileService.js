import { changeAdminPasswordApi, getAdminProfileApi, updateAdminProfileApi } from "../../api/admin/profileApi";

export const getAdminProfileService = async () => {
    try {
        const res = await getAdminProfileApi();
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to fetch admin profile" };
    }
};

export const updateAdminProfileService = async (formData) => {
    try {
        const res = await updateAdminProfileApi(formData);
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to update admin profile" };
    }
};

export const changeAdminPasswordService = async (payload) => {
    try {
        const res = await changeAdminPasswordApi(payload);
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to change password" };
    }
};