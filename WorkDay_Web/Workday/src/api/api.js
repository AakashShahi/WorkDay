import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:5050/api";

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

//Request Interceptor – Add Bearer token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = "Bearer " + token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//Response Interceptor – Handle errors globally
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;

        if (status === 401) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("token");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } else if (status === 403) {
            toast.warning("Access denied. You are not authorized.");
        } else if (status === 500) {
            toast.error("Server error. Please try again later.");
        } else {
            toast.error(error?.response?.data?.message || "Something went wrong.");
        }

        return Promise.reject(error);
    }
);

export default instance;
