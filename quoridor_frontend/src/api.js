// api.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const getUsers = () => axios.get(`${BASE_URL}/users`);
export const createUser = (data) => {
    // console.log(data);
    return axios.post(`${BASE_URL}/users`, data);
}
export const getUserById = (id) => axios.get(`${BASE_URL}/users/${id}`);
export const updateUser = (id, data) => axios.put(`${BASE_URL}/users/${id}`, data);