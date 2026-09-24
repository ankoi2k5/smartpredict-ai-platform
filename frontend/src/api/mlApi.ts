import axios from "axios";

const mlApi = axios.create({
    baseURL: "http://localhost:8000",
});

export default mlApi;