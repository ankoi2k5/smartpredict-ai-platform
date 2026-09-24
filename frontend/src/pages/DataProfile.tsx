import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import mlApi from "../api/mlApi";

interface ColumnProfile {
    dtype: string;
    missing_count: number;
    missing_percent: number;
    unique_count: number;
    type: "numeric" | "categorical";
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    std?: number;
    top_values?: Record<string, number>;
}

interface ProfileResult {
    filename: string;
    total_rows: number;
    total_columns: number;
    duplicate_rows: number;
    columns_profile: Record<string, ColumnProfile>;
}

export default function DataProfile() {
    const [profile, setProfile] = useState<ProfileResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const filename = localStorage.getItem("current_dataset");
        if (!filename) {
            setError("Chưa có dataset nào được upload, quay lại trang Upload trước.");
            setLoading(false);
            return;
        }

        mlApi
            .get(`/profile/${encodeURIComponent(filename)}`)
            .then((res) => setProfile(res.data))
            .catch(() => setError("Không lấy được thông tin profiling"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Đang tải thống kê...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!profile) return null;

    const missingChartData = Object.entries(profile.columns_profile).map(([col, info]) => ({
        name: col,
        missing: info.missing_percent,
    }));

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">Data Profiling Dashboard</h1>
            <p className="text-gray-500 mb-6">{profile.filename}</p>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-gray-500">Tổng số dòng</p>
                    <p className="text-xl font-bold">{profile.total_rows}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-gray-500">Tổng số cột</p>
                    <p className="text-xl font-bold">{profile.total_columns}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-gray-500">Dòng trùng lặp</p>
                    <p className="text-xl font-bold">{profile.duplicate_rows}</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-gray-500">Cột dạng số</p>
                    <p className="text-xl font-bold">
                        {Object.values(profile.columns_profile).filter((c) => c.type === "numeric").length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="font-semibold mb-4">Tỷ lệ dữ liệu thiếu theo cột (%)</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={missingChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={70} fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="missing" fill="#f97316" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-semibold mb-4">Chi tiết từng cột</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2 text-left">Cột</th>
                            <th className="border px-3 py-2 text-left">Kiểu</th>
                            <th className="border px-3 py-2 text-left">Loại</th>
                            <th className="border px-3 py-2 text-left">Thiếu (%)</th>
                            <th className="border px-3 py-2 text-left">Số giá trị duy nhất</th>
                            <th className="border px-3 py-2 text-left">Chi tiết</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(profile.columns_profile).map(([col, info]) => (
                            <tr key={col}>
                                <td className="border px-3 py-2 font-medium">{col}</td>
                                <td className="border px-3 py-2">{info.dtype}</td>
                                <td className="border px-3 py-2">
                    <span
                        className={`px-2 py-1 rounded text-xs ${
                            info.type === "numeric" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      {info.type === "numeric" ? "Số" : "Phân loại"}
                    </span>
                                </td>
                                <td className="border px-3 py-2">{info.missing_percent}%</td>
                                <td className="border px-3 py-2">{info.unique_count}</td>
                                <td className="border px-3 py-2 text-xs">
                                    {info.type === "numeric"
                                        ? `min: ${info.min}, max: ${info.max}, mean: ${info.mean}`
                                        : Object.entries(info.top_values || {})
                                            .map(([k, v]) => `${k}: ${v}`)
                                            .join(", ")}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}