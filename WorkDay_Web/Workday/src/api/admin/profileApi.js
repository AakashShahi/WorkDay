import axios from "../api";

export const getAdminProfileApi = () => axios.get("/admin/profile");

export const updateAdminProfileApi = (formData) =>
    axios.put("/admin/profile/update", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const changeAdminPasswordApi = (payload) =>
    axios.put("/admin/profile/password", payload);