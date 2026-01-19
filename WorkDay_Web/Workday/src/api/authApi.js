import axios from "./api"

export const registerUserApi = (data) => axios.post("/auth/register", data)

export const loginUserApi = (data) => axios.post("/auth/login", data)

export const requestResetPasswordApi = (data) =>
    axios.post("/auth/request-reset", data)

export const resetPasswordApi = (data, token) =>
    axios.post("/auth/reset-password/" + token, data)

export const requestUpdateOTPApi = () => axios.post("/auth/request-update-otp")

// Authentication API endpoints
