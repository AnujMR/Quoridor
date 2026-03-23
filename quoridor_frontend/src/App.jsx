// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from './screens/loginPage';
import SignUp from './screens/signupPage'; 
import HomePage from './screens/homePage'; 
import QuoridorBoard from './screens/quoridorBoard';
import ProfilePage from './screens/profilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { GamePlayScreen } from "./screens/gamePlayScreen";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useAuthStore } from "./store/useAuthStore";

// 👉 1. Make sure to import Layout!
import Layout from './components/Layout'; 
import { getUserById } from "./api";

function App() {
    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const res = await getUserById(firebaseUser.uid);
                login(res.data);
            } else {
                logout();
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            
            {/* Protected Routes Wrapped in Layout */}
            <Route 
                path="/home" 
                element={
                    <ProtectedRoute>
                        {/* 👉 2. Wrap HomePage in Layout */}
                        <Layout>
                            <HomePage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/board" 
                element={
                    <ProtectedRoute>
                        {/* 👉 3. Wrap Board in Layout */}
                        <Layout>
                            <QuoridorBoard />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        {/* 👉 4. Wrap Profile in Layout */}
                        <Layout>
                            <ProfilePage />
                        </Layout>
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}

export default App;