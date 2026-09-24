import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DataUpload from "./pages/DataUpload";
import DataProfile from "./pages/DataProfile";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<DataUpload />} />
                <Route path="/profile" element={<DataProfile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;