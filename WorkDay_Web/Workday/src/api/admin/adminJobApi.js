import axios from "../api";

//Api

export const getAllJobApi = () => axios.get("/admin/job");
export const deleteJobApi = (id) => axios.delete("/admin/job/" + id);
export const deleteAllJobApi = () => axios.delete("/admin/job");
