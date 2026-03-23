// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // 👉 1. Import 'auth' directly instead of 'app'

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const auth = getAuth(app);
  
  // 👉 2. We removed "const auth = getAuth(app)" because we already imported auth above!

  useEffect(() => {
    // This listener triggers whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Done checking session
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []); // 👉 3. Removed 'auth' from the dependency array to keep it clean

  const value = {
    currentUser,
    loading 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}