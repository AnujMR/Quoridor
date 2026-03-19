// import { useState } from "react";
import QuoridorBoard from "./quoridorBoard";

export function GamePlayScreen() {
    return (
        <div className="flex w-full h-screen">
            <div className="flex flex-col space-y-1 bg-black-100 flex items-center justify-center pr-4 pl-6 py-2">
                <div className="text-xl w-full h-[10%] font-bold text-white-800 bg-blue-500 p-2 rounded flex items-center gap-2">
                    <div className="w-[50px] h-[50px] rounded-full bg-white inline-block">
                    </div>
                    Player 1
                </div>

                <div className="h-full">
                    <QuoridorBoard />
                </div>

                <div className="text-xl w-full h-[10%] font-bold text-white-800 bg-red-500 p-2 rounded flex items-center gap-2">
                    <div className="w-[50px] h-[50px] rounded-full bg-white inline-block"></div>
                    Player 2
                </div>
            </div>

            <div className="w-full h-screen bg-black flex items-center justify-center">
                <h1 className="text-3xl font-bold text-white-200">Game Info & Chat</h1>
            </div>
        </div>
    );
}