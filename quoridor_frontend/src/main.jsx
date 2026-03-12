import { StrictMode } from 'react'
import './index.css'
import Login from './screens/loginPage.jsx'
import QuoridorBoard from './screens/quoridorBoard.jsx'
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
