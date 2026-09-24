import { useState } from "react";
import mlApi from "../api/mlApi";

interface UploadResult {
    filename: string;
    rows: number;
    columns: number;
    column_names: string[];
    missing_values: Record<string, number>;
    preview: Record<string, any>[];
}

export default function DataUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await mlApi.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Upload thất bại, kiểm tra ML Service đã chạy chưa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Data Upload Center</h1>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="mb-4"
                />
                <p className="text-sm text-gray-500 mb-4">Hỗ trợ file CSV, XLSX, XLS</p>
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                    {loading ? "Đang tải lên..." : "Upload"}
                </button>
            </div>

            {error && (
                <div className="mt-4 bg-red-50 text-red-600 p-4 rounded">{error}</div>
            )}

            {result && (
                <div className="mt-6 bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold mb-3">Thông tin dataset</h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Số dòng</p>
                            <p className="text-xl font-bold">{result.rows}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Số cột</p>
                            <p className="text-xl font-bold">{result.columns}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Tên file</p>
                            <p className="text-sm font-medium truncate">{result.filename}</p>
                        </div>
                    </div>

                    <h3 className="font-semibold mb-2">Xem trước dữ liệu (5 dòng đầu)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border">
                            <thead className="bg-gray-100">
                            <tr>
                                {result.column_names.map((col) => (
                                    <th key={col} className="border px-3 py-2 text-left whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {result.preview.map((row, i) => (
                                <tr key={i}>
                                    {result.column_names.map((col) => (
                                        <td key={col} className="border px-3 py-2 whitespace-nowrap">
                                            {row[col] === null ? "—" : String(row[col])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}