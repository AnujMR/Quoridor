// src/components/SplashScreen.jsx
import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Start fading out at 3 seconds
        const fadeTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 3000);

        // Completely unmount at 3.5 seconds
        const unmountTimer = setTimeout(() => {
            onComplete();
        }, 3500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(unmountTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] bg-[#1a140f] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            {/* Background subtle grid pattern to match your UI */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#f0d9b5 1px, transparent 1px), linear-gradient(90deg, #f0d9b5 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* Main Logo Container */}
            <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
                {/* Dummy Logo (Replace the img src with your actual logo later) */}
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#d4700a] to-[#8a4600] rounded-3xl shadow-[0_0_40px_rgba(212,112,10,0.4)] flex items-center justify-center border-4 border-[#2a2118] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/logo.png')] bg-cover bg-center"></div>
                    {/* Fallback icon if no image */}
                    {/* <span className="text-6xl text-white font-extrabold drop-shadow-md">Q</span> */}
                </div>

                {/* Title */}
                <h1 className="mt-8 text-4xl md:text-5xl font-extrabold text-white tracking-widest uppercase drop-shadow-lg">
                    Quoridor
                </h1>
                <p className="mt-2 text-[#a08b74] tracking-[0.3em] text-sm uppercase font-bold">
                    The Maze Awaits
                </p>
            </div>

            {/* Loading Bar */}
            <div className="absolute bottom-16 w-48 h-1.5 bg-[#2a2118] rounded-full overflow-hidden">
                <div className="h-full bg-[#d4700a] w-full animate-progress-bar rounded-full"></div>
            </div>
        </div>
    );
}