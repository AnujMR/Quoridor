import { create } from "zustand";
import { UserModel } from "../models/UserModel";

export const useAuthStore = create((set) => ({
    user: null,
    login: (data) => set({ user: new UserModel(data) }),
    logout: () => set({ user: null }),
}));