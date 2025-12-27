import { getAllProfessionApi, getOneProfessionApi, createOneProfessionApi, deleteOneProfessionApi, updateOneProfessionApi } from "../../api/admin/professionApi"

export const getAllProfessionService = async () => {
    try {
        const response = await getAllProfessionApi()
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to fetch' }
    }
}
export const createOneProfessionService = async (data) => {
    try {
        const response = await createOneProfessionApi(data)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to create' }
    }
}

export const getOneProfessionService = async (id) => {
    try {
        const response = await getOneProfessionApi(id)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to load' }
    }
}

export const updateOneProfessionService = async (id, data) => {
    try {
        const response = await updateOneProfessionApi(id, data)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to update' }
    }
}
export const deleteOneProfessionService = async (id) => {
    try {
        const response = await deleteOneProfessionApi(id)
        return response.data
    } catch (err) {
        throw err.response?.data || { message: 'Failed to delete' }
    }
}