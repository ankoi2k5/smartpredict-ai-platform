import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Xin chào, {username} 👋</h1>

            <p className="text-gray-600 mt-2">Đăng nhập thành công, JWT hoạt động!</p>

            <a href="/upload" className="inline-block mt-4 mr-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Đi tới Data Upload
            </a>

            <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Đăng xuất
            </button>
        </div>
    );
}