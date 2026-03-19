// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from './screens/loginPage';
import HomePage from './screens/homePage'
import QuoridorBoard from './screens/quoridorBoard';
import ProfilePage from './screens/profilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* The new Landing Page */}
            <Route 
                path="/home" 
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/board" 
                element={
                    <ProtectedRoute>
                        <QuoridorBoard />
                    </ProtectedRoute>
                } 
            />

            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}

export default App;