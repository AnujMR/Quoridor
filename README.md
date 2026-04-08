# ♟️ Quoridor: The Game of Mazes & Strategy

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)

## Overview
Quoridor is a real-time, asynchronous multiplayer web game based on the classic board game of strategy and mazes. Players compete 1-on-1 to navigate their pawn to the opposite side of the board while strategically placing walls to block their opponent's path. 

This platform features a competitive matchmaking system, Elo-based rankings, real-time in-game chat, timed game modes, and a persistent history of matches and player statistics.

### Key Features
* **Real-Time Multiplayer:** Instantaneous move synchronization and clock management powered by Socket.IO.
* **Matchmaking & Elo Rating:** Automated queue system with dynamic Elo rating calculations updated instantly upon game completion.
* **Game Modes:** Play Timed (Rapid/Blitz) or Untimed matches.
* **Social Features:** In-game live chat, friend requests, and profile viewing.
* **Smart Board Interactions:** BFS (Breadth-First Search) pathfinding algorithms ensure players cannot be completely boxed in, strictly adhering to official Quoridor rules.
* **Responsive UI/UX:** A dark, wooden-themed UI built with Tailwind CSS, featuring splash screens, smooth animations, and intuitive controls.
* **Play Against BOTS:** 3 levels of bots to practice and improve your skills 

---

## Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Zustand (State Management), React Router.
* **Backend:** Node.js, Express.js, Socket.IO.
* **Database:** PostgreSQL.
* **Authentication:** Firebase Auth.

---

## Local Installation Guide

Want to run Quoridor locally or contribute to the project? Follow these step-by-step instructions to get both the backend and frontend running on your machine.

### Prerequisites
Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [PostgreSQL](https://www.postgresql.org/) (Running locally, or a cloud database URL like Supabase/Render)
* A [Firebase Project](https://firebase.google.com/) for authentication credentials.

### 1. Clone the Repository
```bash
git clone https://github.com/AnujMR/Quoridor.git
```

### 2. Open the Quoridor Folder in Any Code Editor

### 3. Start Backend
```bash
cd quoridor_backend
npm i
node index.js
```

### 4. Start Frontend
```bash
cd quoridor_frontend
npm i
npm run dev
```

### Once Frontend has Started, You Can Visit http://localhost:5173 and Explore Quoridor.
