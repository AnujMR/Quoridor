// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if you put it elsewhere

const ProtectedRoute = ({ children }) => {
    // Grab the user and loading state directly from your global context!
    const { currentUser, loading } = useAuth();

    // Show your awesome loading screen while Firebase figures out the session
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
                Loading game...
            </div>
        );
    }

    // If no user is found, boot them back to the login page
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // If they are logged in, render the protected component
    return children;
};

export default ProtectedRoute;