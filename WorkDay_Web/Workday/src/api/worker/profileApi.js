import axios from "../api"

// Get worker profile (GET)
export const getWorkerProfileApi = () => axios.get("/worker/profile");

// Update worker profile (PUT with multipart/form-data)
export const updateWorkerProfileApi = (formData) =>
    axios.put("/worker/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

// Change worker password (PUT with JSON)
export const updateWorkerPasswordApi = (payload) =>
    axios.put("/worker/profile/change-password", payload);

export const applyForVerified = () => axios.post("/worker/profile/apply-verification")
export const cancelVerification = () => axios.post("/worker/profile/cancel-verification")