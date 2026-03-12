import { Routes, Route } from "react-router-dom";
import Login from './screens/loginPage.jsx'
import QuoridorBoard from './screens/quoridorBoard.jsx'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/board" element={<QuoridorBoard />} />
        </Routes>
    );
}

export default App;