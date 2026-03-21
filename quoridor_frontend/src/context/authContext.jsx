// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    // This listener triggers whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Done checking session
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [auth]);

  const value = {
    currentUser,
    loading // 1. ADD THIS: Export loading so ProtectedRoute can use it
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 2. CHANGE THIS: Always render children so your "Loading game..." screen can actually show up! */}
      {children}
    </AuthContext.Provider>
  );
}