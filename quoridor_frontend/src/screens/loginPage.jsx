// src/screens/loginPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { useAuth } from "../context/authContext";
import AnimatedBoard from "../components/AnimatedBoard";
import { useAuthStore } from '../store/useAuthStore';

import { auth, provider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { createUser, getUserById } from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // 👉 2. Only bypass login screen if they are logged in AND verified
    if (currentUser && currentUser.emailVerified) {
      navigate("/home");
    }
  }, [currentUser, navigate]);

  /*
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password)
      return setError("Please enter both an email and password.");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 👉 3. The Verification Gatekeeper
      if (!userCredential.user.emailVerified) {
        // Log them right back out if they haven't clicked the link
        await signOut(auth);
        return setError("Please verify your email address before logging in. Check your inbox!");
      }

      const databaseUser = await getUserById(userCredential.user.uid);
      login({
        id: databaseUser.id,
        name: databaseUser.name,
        email: databaseUser.email,
        firebase_uid: databaseUser.firebase_uid,
        rating: databaseUser.rating,
        profile: databaseUser.profile,
        created_at: databaseUser.created_at
      })
      console.log("Successfully logged in!");
      navigate("/home");
    } catch (err) {
      // Handle incorrect passwords or missing accounts
      if (err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password.");
      } else {
        setError("Failed to login. Please check your credentials.");
      }
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Successfully logged in with Google!");
      var res = await createUser({ firebase_uid: userCredential.user.uid, name: userCredential.user.displayName, email: userCredential.user.email, created_at: userCredential.user.metadata.creationTime }); // Save to DB
      login({
        id: res.id,
        name: res.name,
        email: res.email,
        firebase_uid: res.firebase_uid,
        rating: res.rating,
        profile: res.profile,
        created_at: res.created_at
      })
      navigate("/home");
    } catch (err) {
      console.error("Google Auth Error:", err.message);
      setError("Failed to sign in with Google.");
    }
  };
  */

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password)
      return setError("Please enter both an email and password.");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 👉 3. The Verification Gatekeeper
      if (!userCredential.user.emailVerified) {
        // Log them right back out if they haven't clicked the link
        await signOut(auth);
        return setError("Please verify your email address before logging in. Check your inbox!");
      }

      // Fetch from your backend (using Firebase UID)
      const res = await getUserById(userCredential.user.uid);
      
      // 👉 Extract data from Axios response
      const databaseUser = res.data;

      // Handle edge case: What if the user exists in Firebase but not in your Postgres DB?
      if (!databaseUser || !databaseUser.id) {
        await signOut(auth);
        return setError("User profile not found in database. Please contact support.");
      }

      login({
        id: databaseUser.id,
        name: databaseUser.name,
        email: databaseUser.email,
        firebase_uid: databaseUser.firebase_uid,
        rating: databaseUser.rating,
        profile: databaseUser.profile,
        created_at: databaseUser.created_at
      });
      
      console.log("Successfully logged in!");
      navigate("/home");
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password.");
      } else {
        setError("Failed to login. Please check your credentials.");
      }
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log("Successfully logged in with Google!");
      
      // Google Login often acts as "Sign Up / Log In", so we upsert
      const res = await createUser({ 
        firebase_uid: userCredential.user.uid, 
        name: userCredential.user.displayName, 
        email: userCredential.user.email, 
        created_at: userCredential.user.metadata.creationTime 
      }); 
      
      // 👉 Extract data from Axios response
      const databaseUser = res.data;

      login({
        id: databaseUser.id,
        name: databaseUser.name,
        email: databaseUser.email,
        firebase_uid: databaseUser.firebase_uid,
        rating: databaseUser.rating,
        profile: databaseUser.profile,
        created_at: databaseUser.created_at
      });
      
      navigate("/home");
    } catch (err) {
      console.error("Google Auth Error:", err.message);
      setError("Failed to sign in with Google.");
    }
  };
  
  return (
    <div className="flex h-screen bg-[#241c15] text-[#f0d9b5] font-sans overflow-hidden">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto relative z-10">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          <div className="flex-1 w-full max-w-md lg:max-w-xl flex justify-center">
            <AnimatedBoard />
          </div>

          <div className="flex-1 w-full max-w-sm flex flex-col items-center text-center">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-white drop-shadow-[0_0_15px_rgba(212,112,10,0.3)]">
              Welcome Back!
            </h1>
            <p className="text-[#a08b74] mb-8 text-lg">
              Log in to continue your Quoridor journey.
            </p>

            <div className="w-full bg-[#1a140f]/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] border border-[#3d2b1f]">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mb-3 rounded-lg bg-[#241c15] border border-[#3d2b1f] text-white focus:outline-none focus:border-[#d4700a] transition-colors shadow-inner"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-5 rounded-lg bg-[#241c15] border border-[#3d2b1f] text-white focus:outline-none focus:border-[#d4700a] transition-colors shadow-inner"
              />

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLogin}
                  className="w-full bg-[#d4700a] hover:bg-[#f08a1c] text-white py-3 rounded-lg font-bold shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all"
                >
                  Log In
                </button>

                <div className="text-sm mt-2">
                  <span className="text-[#a08b74]">Don't have an account? </span>
                  <Link to="/signup" className="text-[#d4700a] hover:text-[#f08a1c] font-bold transition-colors">
                    Sign up here
                  </Link>
                </div>

                <div className="flex items-center my-2 opacity-60">
                  <div className="flex-grow border-t border-[#3d2b1f]"></div>
                  <span className="px-3 text-sm text-[#a08b74]">OR</span>
                  <div className="flex-grow border-t border-[#3d2b1f]"></div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-[#f0d9b5] hover:bg-white text-gray-900 py-3 rounded-lg font-extrabold transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}