// src/App.jsx
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useAuthStore } from "./store/useAuthStore";
import { getUserById } from "./api";

import Login from './screens/loginPage';
import SignUp from './screens/signupPage';
import HomePage from './screens/homePage';
import ProfilePage from './screens/profilePage';
import GameLobby from "./screens/gameLobby";
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const res = await getUserById(firebaseUser.uid);
                    if (res && res.data) {
                        login(res.data);
                    }
                } catch (error) {
                    console.error("Error fetching user data on auth change:", error);
                }
            } else {
                logout();
            }
        });
        return () => unsubscribe();
    }, [login, logout]);

    // Define the router object
    const router = createBrowserRouter([
        { path: "/", element: <Login /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <SignUp /> },
        {
            // All protected routes go here
            element: <ProtectedRoute><Outlet /></ProtectedRoute>,
            children: [
                {
                    // All routes needing the Sidebar/Layout go here
                    element: <Layout><Outlet /></Layout>,
                    children: [
                        { path: "/home", element: <HomePage /> },
                        { path: "/board", element: <GameLobby /> },
                        { path: "/profile", element: <ProfilePage /> }, // 👈 View your own profile
                        { path: "/profile/:userId", element: <ProfilePage /> }, // 👈 NEW: View a friend's profile
                    ]
                }
            ]
        },
        { path: "*", element: <Navigate to="/" replace /> }
    ]);

    return <RouterProvider router={router} />;
}

export default App;