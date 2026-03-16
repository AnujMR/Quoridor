// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Adjust path if needed
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This listens for login/logout events
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        
        // Cleanup the listener when the component unmounts
        return () => unsubscribe(); 
    }, []);

    // Show a loading screen while Firebase checks the user's status
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
                Loading game...
            </div>
        );
    }

    // If no user is found, boot them back to the login page
    // Note: Change "/login" to "/" if your login page sits at the root route
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If they are logged in, render the protected component (the board)
    return children;
};

export default ProtectedRoute;