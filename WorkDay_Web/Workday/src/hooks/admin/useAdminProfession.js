import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProfessionService, getOneProfessionService, updateOneProfessionService, createOneProfessionService, deleteOneProfessionService } from "../../services/admin/professionService";
import { toast } from "react-toastify";
import { ADMIN_PROFESSIONS, ADMIN_PROFESSION_UPDATE, ADMIN_PROFESSION_DELETE, ADMIN_PROFESSION_DETAIL, ADMIN_PROFESSION_CREATE } from "../../constants/queryKeys";

export const useAdminProfession = () => {
    const query = useQuery(
        {
            queryKey: [ADMIN_PROFESSIONS],
            queryFn: () => getAllProfessionService()
        }
    )
    const professions = query.data?.data || []
    return {
        ...query,
        professions
    }
}
export const useCreateProfession = () => {
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationKey:
                [ADMIN_PROFESSION_CREATE],
            mutationFn:
                createOneProfessionService,
            onSuccess: () => {
                queryClient
                    .invalidateQueries(
                        ADMIN_PROFESSIONS
                    )  // refetch get query
            }
        }
    )
}
export const useGetOneProfession = (id) => {
    const query = useQuery(
        {
            queryKey: [ADMIN_PROFESSION_DETAIL, id],
            queryFn: () => getOneProfessionService(id),
            enabled: !!id,
            retry: false
        }
    )
    const profession = query.data?.data || {}
    return {
        ...query, profession
    }
}

export const useUpdateOneProfession = () => {
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn: ({ id, data }) => updateOneProfessionService(id, data),
            mutationKey: [ADMIN_PROFESSION_UPDATE],
            onSuccess: () => {
                toast.success("Updated")
                queryClient.invalidateQueries(
                    [ADMIN_PROFESSIONS, ADMIN_PROFESSION_DETAIL]
                )
            },
            onError: (err) => {
                toast.error(err.message || "Update failed")
            }
        }
    )
}

export const useDeleteOneProfession = () => {
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn: deleteOneProfessionService,
            mutationKey: [ADMIN_PROFESSION_DELETE],
            onSuccess: () => {
                toast.success("Deleted")
                queryClient.invalidateQueries([ADMIN_PROFESSIONS])
            },
            onError: (err) => {
                toast.error(err.message || "Delete Failed")
            }
        }
    )
}