# PackSure: How to Run the Full Project

PackSure consists of four interconnected services that form the complete Legal Metrology inspection platform:

1. **PostgreSQL 18 Database Cluster** (`port 5433`, database `packsure`)
2. **Python FastAPI AI & Computer Vision Service** (`port 8000`)
3. **Spring Boot 3 Enterprise API & Rule Engine** (`port 8081`)
4. **React 19 + Vite Frontend Application** (`port 5173`)

---

## Option 1: 1-Click Launch (Recommended)

In File Explorer, simply double-click:
```text
run_all.bat
```
*(Or in PowerShell, run `.\run_all.ps1`)*

This script automatically spins up all 4 services in their own individual windows and launches your browser to `http://localhost:5173`.

---

## Option 2: Running Services Manually (Terminal by Terminal)

If you prefer to start each service individually, open **4 separate terminal windows**:

### Terminal 1: Start PostgreSQL Database
```powershell
& "D:\postgreSql\bin\postgres.exe" -D "d:\ProductCompliance\db"
```
> **Port**: `5433`  
> **Database**: `packsure`  
> **Auth**: Local `trust` authentication

---

### Terminal 2: Start Python AI & Computer Vision Service
```powershell
cd d:\ProductCompliance\product-compliance-scanner\ai-service
python main.py
```
> **Port**: `8000`  
> **Engines Loaded**: RapidOCR (PaddleOCR PP-OCRv4 ONNX), pyzbar Barcode/QR, OpenCV  
> **Health Check**: `http://127.0.0.1:8000/api/v1/health`

---

### Terminal 3: Start Spring Boot Backend API
```powershell
cd d:\ProductCompliance\product-compliance-scanner\backend
& "C:\Users\santu_slim99\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```
> **Port**: `8081`  
> **Components**: Spring Data JPA, JWT Authentication, PCR 2011 Rule Engine, OpenPDF Report Generator with SHA-256 Checksum  
> **Health Check**: `http://localhost:8081/api/health`

---

### Terminal 4: Start React Frontend (Vite)
```powershell
cd d:\ProductCompliance\product-compliance-scanner
npm run dev
```
> **Port**: `5173`  
> **URL**: `http://localhost:5173`

---

## Login Credentials

Once the browser opens `http://localhost:5173`:

| Role | Username | Password | Circle / Location |
| :--- | :--- | :--- | :--- |
| **Enforcement Officer** | `officer` | `Officer@123` | Delhi Zone Circle |
| **Administrator** | `admin` | `Admin@123` | Legal Metrology HQ |

*(Quick-fill buttons are also available on the login card for convenience).*

---

## Verifying All Services are Live

You can verify the entire stack with a single PowerShell command:

```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/health"
```

Expected output:
```json
{
  "success": true,
  "data": {
    "database": "CONNECTED",
    "aiService": "AVAILABLE",
    "storage": "AVAILABLE"
  },
  "message": "All core services operational"
}
```

---

## Inspection Workflow Walkthrough

1. **Sign In**: Log in using `officer` / `Officer@123`.
2. **Start Inspection**: Click **"Start Inspection"** or navigate to `/scan`.
3. **Capture or Upload Evidence**:
   - Click **"Open Camera"** to activate the live viewfinder and snap a package picture.
   - Or drag & drop any package image file (e.g. front or back panel).
4. **Automatic Deep Learning Pipeline**:
   - As soon as the image is provided, PackSure immediately runs image quality checks, preprocessing, PaddleOCR text detection, barcode extraction, Legal Metrology field extraction, and rule evaluation.
5. **Interactive 3-Panel Review**:
   - **Left Panel**: View the package image with interactive SVG bounding boxes.
   - **Center Panel**: Review extracted declarations (MRP, Net Qty, Dates, Manufacturer, Helpline) with AI confidence bars and inline officer verification/edit tools.
   - **Right Panel**: Inspect PCR 2011 rule findings with explainability and confirm or dismiss any flagged issues.
6. **Generate Official PDF Report**:
   - Click **"Finalize & Generate Official Report"**.
   - Download the generated court-ready PDF with cryptographic SHA-256 integrity hash!
