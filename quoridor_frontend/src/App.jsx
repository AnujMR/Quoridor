// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from './screens/loginPage';
import QuoridorBoard from './screens/quoridorBoard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Wrap the board component to protect it */}
            <Route 
                path="/board" 
                element={
                    <ProtectedRoute>
                        <QuoridorBoard />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}

export default App;