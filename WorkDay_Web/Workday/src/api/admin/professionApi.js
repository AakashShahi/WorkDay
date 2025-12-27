import axios from "../api";

export const getAllProfessionApi = () => axios.get("/admin/profession")


export const createOneProfessionApi = (data) => axios.post(
    "/admin/profession/create", data,
    {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
)

export const getOneProfessionApi = (id) => axios.get("/admin/profession/" + id)

export const updateOneProfessionApi = (id, data) =>
    axios.put("/admin/profession/" + id, data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }
    )

export const deleteOneProfessionApi = (id) =>
    axios.delete("/admin/profession/" + id)