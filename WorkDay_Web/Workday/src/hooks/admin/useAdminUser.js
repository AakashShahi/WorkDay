import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllUsersService,
    getOneUserService,
    createUserService,
    updateUserService,
    deleteUserService
} from "../../services/admin/userService";
import { toast } from "react-toastify";
import { ADMIN_USERS, ADMIN_USER_DELETE, ADMIN_USER_DETAIL } from "../../constants/queryKeys";
import { useState } from "react";

// GET all users
export const useAdminUsers = () => {
    const [pageNumber, setPageNumber] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState("")

    const query = useQuery(
        {
            queryKey: [ADMIN_USERS, pageNumber, pageSize, search],
            queryFn: () => {
                return getAllUsersService(
                    {
                        page: pageNumber,
                        limit: pageSize,
                        search: search
                    }
                )
            },
        }
    )
    const users = query.data?.data || []
    const pagination = query.data?.pagination || {
        page: 1, totalPages: 1, limit: 10
    }
    const canPreviousPage = pagination.page > 1
    const canNextPage = pagination.page < pagination.totalPages

    return {
        ...query,
        users,
        pagination,
        canPreviousPage,
        canNextPage,
        setPageNumber,
        setPageSize,
        setSearch
    }
};

// GET single user detail
export const useAdminUserDetail = (id) => {
    return useQuery({
        queryKey: [ADMIN_USER_DETAIL, id],
        queryFn: () => getOneUserService(id),
        enabled: !!id
    });
};

// CREATE new user
export const useCreateAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUserService,
        onSuccess: () => {
            toast.success("User created successfully");

            // Fix: match query keys with params
            queryClient.invalidateQueries({ queryKey: [ADMIN_USERS], exact: false });
        },
        onError: (error) => {
            toast.error(error?.message || "User creation failed");
        }
    });
};

// UPDATE user
export const useUpdateAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateUserService(id, data),
        onSuccess: () => {
            toast.success("User updated successfully");
            queryClient.invalidateQueries([ADMIN_USERS]);
            queryClient.invalidateQueries([ADMIN_USER_DETAIL]);
        },
        onError: (error) => {
            toast.error(error?.message || "User update failed");
        }
    });
};

// DELETE user
export const useDeleteAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteUserService(id),
        mutationKey: [ADMIN_USER_DELETE],
        onSuccess: () => {
            toast.success("User deleted successfully");
            queryClient.invalidateQueries([ADMIN_USERS]);
        },
        onError: (error) => {
            toast.error(error?.message || "User deletion failed");
        }
    });
};
