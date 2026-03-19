import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
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

  const handleLogin = async (e) => {
    e.preventDefault(); 
    setError(''); 
    if (!username || !password) return setError("Please enter both an email and password.");

    try {
      await signInWithEmailAndPassword(auth, username, password);
      console.log("Successfully logged in!");
      //navigate('/board'); 
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
      navigate('/board'); 
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
      navigate('/board');
    } catch (err) {
      console.error("Google Auth Error:", err.message);
      setError("Failed to sign in with Google.");
    }
  };

  return (
    // Chess.com style dark background
    <div className="flex h-screen bg-[#302e2b] text-white font-sans overflow-hidden">
      
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          
          {/* Left Side: Large Board Graphic */}
          
          {/* <div className="flex-1 w-full max-w-md lg:max-w-xl flex justify-center">
            {/* REPLACE THIS DIV WITH YOUR ACTUAL BOARD IMAGE/COMPONENT */}
            {/* <div className="aspect-square w-full bg-[#739552] rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-black/10"></div>
               <span className="text-white/50 font-bold text-2xl z-10 text-center px-4">
                 [Insert Quoridor Board Image Here] <br/>
                 <span className="text-sm font-normal">e.g., &lt;img src="/board-preview.png" /&gt;</span>
               </span>
            </div>
          </div> */}
           
          <div className="flex-1 w-full max-w-md lg:max-w-xl flex justify-center">
            
            {/* We replaced the placeholder with our new component! */}
            <AnimatedBoard />

          </div>

          {/* Right Side: Hero Text & Form */}
          <div className="flex-1 w-full max-w-sm flex flex-col items-center text-center">
            
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
              Play Quoridor Online!
            </h1>
            <p className="text-[#c3c2c0] mb-8 text-lg">
              Join players in the world's best Quoridor community.
            </p>

            {/* Login Form Container */}
            <div className="w-full bg-[#262421] p-6 rounded-xl shadow-2xl border border-[#36332e]">
              
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
                  className="w-full p-3 mb-3 rounded-lg bg-[#302e2b] border border-[#433f39] text-white focus:outline-none focus:border-[#81b64c] transition-colors"
              />

              <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 mb-5 rounded-lg bg-[#302e2b] border border-[#433f39] text-white focus:outline-none focus:border-[#81b64c] transition-colors"
              />

              <div className="flex flex-col gap-3">
                  <button 
                      onClick={handleLogin} 
                      className="w-full bg-[#36332e] hover:bg-[#433f39] text-white py-3 rounded-lg font-bold transition-colors"
                  >
                      Log In
                  </button>

                  <button 
                      onClick={handleSignUp} 
                      className="w-full bg-[#81b64c] hover:bg-[#a3d160] text-white py-3 rounded-lg font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                  >
                      Sign Up
                  </button>
                  
                  {/* Divider */}
                  <div className="flex items-center my-2 opacity-60">
                      <div className="flex-grow border-t border-[#433f39]"></div>
                      <span className="px-3 text-sm text-[#c3c2c0]">OR</span>
                      <div className="flex-grow border-t border-[#433f39]"></div>
                  </div>

                  {/* Google Button */}
                  <button 
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3 rounded-lg font-bold transition-colors shadow-sm"
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