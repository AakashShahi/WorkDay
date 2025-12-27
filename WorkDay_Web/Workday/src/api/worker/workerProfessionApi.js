import axios from "../api"

// Get profession by worker
export const getWorkerProfessionApi = () => axios.get("/worker/profession")