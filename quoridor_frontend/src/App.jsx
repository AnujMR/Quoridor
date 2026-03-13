// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Login from './screens/loginPage.jsx';
import QuoridorBoard from './screens/quoridorBoard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Import the new wrapper

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