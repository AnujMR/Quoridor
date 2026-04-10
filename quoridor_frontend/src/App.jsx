// src/App.jsx
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react"; // <-- Import useState
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
import LeaderboardPage from "./screens/leaderboard";
import Layout from './components/Layout';
import SplashScreen from './screens/splashScreen'; // <-- Import the Splash Screen
import RuleBook from "./screens/RuleBook";

function App() {
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    // NEW: State to control Splash Screen visibility
    const [showSplash, setShowSplash] = useState(true);

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

    const router = createBrowserRouter([
        // Auto-redirect to home if logged in, otherwise show login
        {
            path: "/",
            element: useAuthStore.getState().isAuthenticated ? <Navigate to="/home" replace /> : <Login />
        },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <SignUp /> },
        {
            element: <ProtectedRoute><Outlet /></ProtectedRoute>,
            children: [
                {
                    element: <Layout><Outlet /></Layout>,
                    children: [
                        { path: "/home", element: <HomePage /> },
                        { path: "/board", element: <GameLobby /> },
                        { path: "/profile", element: <ProfilePage /> },
                        { path: "/profile/:userId", element: <ProfilePage /> },
                        { path: "/leaderboard", element: <LeaderboardPage /> },
                        { path: "/rules", element: <RuleBook /> },
                    ]
                }
            ]
        },
        { path: "*", element: <Navigate to="/" replace /> }
    ]);

    return (
        <>
            {/* Show Splash Screen on top of everything. When it finishes, it sets showSplash to false */}
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

            <RouterProvider router={router} />
        </>
    );
}

export default App;