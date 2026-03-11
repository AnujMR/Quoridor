import React from "react";

export default function Login() {
    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
            // style={{
            //     backgroundImage:
            //         "url('/quoridor-bg.jpg')", // place your background image in public folder
            // }}
        >
            {/* Login Card */}
            <div className="bg-black/70 backdrop-blur-md p-10 rounded-2xl shadow-xl w-96 text-center">

                {/* Logo */}
                <img
                    src="/quoridor-logo.png"
                    alt="Quoridor Logo"
                    className="w-24 mx-auto mb-6"
                />

                <h1 className="text-3xl text-white font-bold mb-6">Quoridor</h1>

                {/* Username */}
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-6 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
                        Login
                    </button>

                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}