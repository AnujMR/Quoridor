import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBoard from '../components/AnimatedBoard';

// 1. Import provider and auth
import { auth, provider } from '../firebase'; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup 
} from 'firebase/auth';

export default function LoginPage() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if(currentUser)
    {
      navigate('/home');
    }
  }, [currentUser, navigate])

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 
    if (!username || !password) return setError("Please enter both an email and password.");

    try {
      await signInWithEmailAndPassword(auth, username, password);
      console.log("Successfully logged in!");
      navigate('/home')
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
      navigate('/home'); 
    } catch (err) {
      setError("Failed to create account: " + err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithPopup(auth, provider);
      console.log("Successfully logged in with Google!");
      navigate('/home');
    } catch (err) {
      console.error("Google Auth Error:", err.message);
      setError("Failed to sign in with Google.");
    }
  };

  return (
    // Quoridor Theme dark background
    <div className="flex h-screen bg-[#241c15] text-[#f0d9b5] font-sans overflow-hidden">
      
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto relative z-10">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          
          {/* Left Side: Animated Board Graphic */}
          <div className="flex-1 w-full max-w-md lg:max-w-xl flex justify-center">
            <AnimatedBoard />
          </div>

          {/* Right Side: Hero Text & Form */}
          <div className="flex-1 w-full max-w-sm flex flex-col items-center text-center">
            
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-white drop-shadow-[0_0_15px_rgba(212,112,10,0.3)]">
              Play Quoridor Online!
            </h1>
            <p className="text-[#a08b74] mb-8 text-lg">
              Join players in the world's best Quoridor community.
            </p>

            {/* Login Form Container */}
            <div className="w-full bg-[#1a140f]/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] border border-[#3d2b1f]">
              
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
                      className="w-full bg-[#2a2118] hover:bg-[#3d2b1f] text-white py-3 rounded-lg font-bold border border-[#3d2b1f] transition-colors"
                  >
                      Log In
                  </button>

                  <button 
                      onClick={handleSignUp} 
                      className="w-full bg-[#d4700a] hover:bg-[#f08a1c] text-white py-3 rounded-lg font-bold shadow-[0_4px_0_#8a4600] active:translate-y-1 active:shadow-none transition-all"
                  >
                      Sign Up
                  </button>
                  
                  {/* Divider */}
                  <div className="flex items-center my-2 opacity-60">
                      <div className="flex-grow border-t border-[#3d2b1f]"></div>
                      <span className="px-3 text-sm text-[#a08b74]">OR</span>
                      <div className="flex-grow border-t border-[#3d2b1f]"></div>
                  </div>

                  {/* Google Button */}
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