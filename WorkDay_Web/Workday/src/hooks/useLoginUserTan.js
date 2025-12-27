import { toast } from "react-toastify";
import { loginUserService, requestResetPasswordService, resetPasswordService } from "../services/authService";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthProvider";

export const useLoginUserTan = () => {
    const { login } = useContext(AuthContext)
    return useMutation(

        {
            mutationFn: loginUserService,
            mutationKey: ["login-key"],
            onSuccess: (data) => {
                login(data?.data, data?.token)
                toast.success(data?.message || "Login Success")
            }
        }
    )
}

export const useRequestResetPassword = () => {
    return useMutation(
        {
            mutationFn: requestResetPasswordService,
            mutationKey: ['request-reset'],
            onSuccess: (data) => {
                toast.success(data?.message || "Email Sent")
            },
            onError: (err) => {
                toast.error(err?.message || "Request Failed")
            }
        }
    )
}

export const useResetPassword = () => {
    return useMutation(
        {
            mutationKey: ['reset-password'],
            mutationFn: ({ data, token }) => resetPasswordService(data, token),
            onSuccess: (data) => {
                toast.success(data?.message || "Reset successful");
            },
            onError: (err) => {
                toast.error(err?.message || "Reset Failed");
            }
        }
    );
}