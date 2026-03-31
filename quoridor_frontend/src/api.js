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

export const searchUsersByName = (term) => axios.get(`${BASE_URL}/users/search?term=${term}`);

// Send a friend request
// Expected data: { senderId: 1, receiverId: 2 }
export const sendFriendRequest = (data) => axios.post(`${BASE_URL}/friends/request`, data);

// Accept a friend request
// Expected data: { senderId: 1, receiverId: 2 }
export const acceptFriendRequest = (data) => axios.post(`${BASE_URL}/friends/accept`, data);

// Reject a friend request
// Expected data: { senderId: 1, receiverId: 2 }
export const rejectFriendRequest = (data) => axios.post(`${BASE_URL}/friends/reject`, data);

// Remove an existing friend
// Expected data: { user1: 1, user2: 2 }
// Note: axios.delete requires the body to be wrapped in a 'data' property!
export const removeFriend = (data) => axios.delete(`${BASE_URL}/friends/remove`, { data });

// Fetch a user's accepted friends
export const getFriendsList = (userId) => axios.get(`${BASE_URL}/friends/${userId}/list`);

// Fetch a user's pending received friend requests
export const getPendingRequests = (userId) => axios.get(`${BASE_URL}/friends/${userId}/pending`);

export const getGameHistory = (userId) => axios.get(`${BASE_URL}/games/history/${userId}`);

export const getSentRequests = (userId) => axios.get(`${BASE_URL}/friends/${userId}/sent`);

// Fetch Leaderboard
export const getLeaderboard = (limit = 50) => axios.get(`${BASE_URL}/users/leaderboard?limit=${limit}`);
