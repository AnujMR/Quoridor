// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from './screens/loginPage';
import HomePage from './screens/homePage'; 
import QuoridorBoard from './screens/quoridorBoard';
import ProfilePage from './screens/profilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { GamePlayScreen } from "./screens/gamePlayScreen";

// 👉 1. Make sure to import Layout!
import Layout from './components/Layout'; 

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
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