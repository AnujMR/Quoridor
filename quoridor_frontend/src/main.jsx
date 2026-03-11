import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './screens/loginPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <QuoridorBoard /> */}
    <Login></Login>
  </StrictMode>,
)
