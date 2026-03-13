import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

// 1. Import provider and signInWithPopup
import { auth, provider } from '../firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup // <-- Added this
} from 'firebase/auth';

export default function LoginPage() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 
    if (!username || !password) return setError("Please enter both an email and password.");

    try {
      await signInWithEmailAndPassword(auth, username, password);
      console.log("Successfully logged in!");
      navigate('/board'); 
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) return setError("Please enter both an email and password.");

    try {
      await createUserWithEmailAndPassword(auth, username, password);
      console.log("Successfully created an account!");
      navigate('/board'); 
    } catch (err) {
      setError("Failed to create account: " + err.message);
    }
  };

  // 2. New Google Sign-In Logic
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithPopup(auth, provider);
      console.log("Successfully logged in with Google!");
      navigate('/board');
    } catch (err) {
      console.error("Google Auth Error:", err.message);
      setError("Failed to sign in with Google.");
    }
  };

  return (
      <div className="h-screen w-screen bg-[#1e1e1e] bg-cover bg-center flex items-center justify-center">
          <div className="bg-[#0f0f0f] border border-gray-800 p-10 rounded-2xl shadow-2xl w-96 text-center">

              <img
                  src="/quoridor-logo.png"
                  alt="Quoridor Logo"
                  className="w-24 mx-auto mb-6"
                  onError={(e) => e.target.style.display = 'none'}
              />

              <h1 className="text-3xl text-white font-bold mb-6">Quoridor</h1>

              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <input
                  type="email" 
                  placeholder="Email Address"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mb-6 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex flex-col gap-3">
                  <button 
                      onClick={handleLogin} 
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                      Login
                  </button>

                  <button 
                      onClick={handleSignUp} 
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                      Sign Up
                  </button>
                  
                  {/* Divider */}
                  <div className="flex items-center my-2">
                      <div className="flex-grow border-t border-gray-700"></div>
                      <span className="px-3 text-gray-500 text-sm">OR</span>
                      <div className="flex-grow border-t border-gray-700"></div>
                  </div>

                  {/* Google Button */}
                  <button 
                      onClick={handleGoogleSignIn}
                      className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold transition"
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
  );
}