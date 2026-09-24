from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import json

app = FastAPI(title="SmartPredict ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def read_root():
    return {"message": "SmartPredict ML Service đang chạy"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        return {"error": f"Không đọc được file: {str(e)}"}

    # to_json tự xử lý NaN -> null, ngày tháng -> chuỗi, int64 -> số thường
    preview = json.loads(df.head(5).to_json(orient="records", date_format="iso"))
    missing_values = {col: int(val) for col, val in df.isnull().sum().items()}

    return {
        "filename": file.filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "missing_values": missing_values,
        "preview": preview,
    }

current_dataset = {"filename": None}


@app.get("/profile/{filename}")
def profile_data(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        return {"error": "File không tồn tại, hãy upload lại"}

    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        return {"error": f"Không đọc được file: {str(e)}"}

    profile = {}
    for col in df.columns:
        col_data = df[col]
        col_info = {
            "dtype": str(col_data.dtype),
            "missing_count": int(col_data.isnull().sum()),
            "missing_percent": round(float(col_data.isnull().sum() / len(df) * 100), 2),
            "unique_count": int(col_data.nunique()),
        }

        if pd.api.types.is_numeric_dtype(col_data):
            col_info["type"] = "numeric"
            col_info["min"] = float(col_data.min()) if not col_data.empty else None
            col_info["max"] = float(col_data.max()) if not col_data.empty else None
            col_info["mean"] = round(float(col_data.mean()), 2) if not col_data.empty else None
            col_info["median"] = float(col_data.median()) if not col_data.empty else None
            col_info["std"] = round(float(col_data.std()), 2) if not col_data.empty else None
        else:
            col_info["type"] = "categorical"
            top_values = col_data.value_counts().head(5)
            col_info["top_values"] = {str(k): int(v) for k, v in top_values.items()}

        profile[col] = col_info

    return {
        "filename": filename,
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "duplicate_rows": int(df.duplicated().sum()),
        "columns_profile": profile,
    }