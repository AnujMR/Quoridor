// api.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const getUsers = () => axios.get(`${BASE_URL}/users`);
export const createUser = (data) => axios.post(`${BASE_URL}/users`, data);