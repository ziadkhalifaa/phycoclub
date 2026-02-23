# Qiyam React (Full Stack)

المشروع ده بقى **موقع كامل جاهز للنشر**: 
- Frontend: React + Vite (نفس الستايل الموجود)
- Backend: Flask API + SQLite (موجود داخل `backend/`)
- الـ Flask بيخدم ملفات الـ React بعد `npm run build`.

## التشغيل محليًا (Development)

### 1) تشغيل الباك إند

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # على Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

هيشتغل على:
- `http://localhost:5000`

### 2) تشغيل الفرونت إند (Vite)

في ترمينال تاني:

```bash
cd ..
npm install
npm run dev
```

هيشتغل على:
- `http://localhost:5173`

> Vite معمول له proxy للـ API تلقائيًا (`/api` → `http://localhost:5000`).

## النشر (Production)

1) ابنِ الـ React:

```bash
npm install
npm run build
```

ده هيطلع فولدر `dist/`.

2) شغّل Flask (هيخدم الـ dist كـ SPA):

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### متغيرات اختيارية

- `PORT` لتغيير بورت الباك إند.
- `FLASK_SECRET` لتثبيت secret key.
- `CORS_ORIGIN` لو محتاج CORS في بيئة مختلفة.

### إنشاء Admin تلقائيًا (مهم)

لو دي أول مرة تشغل المشروع وعايز حساب Admin بسرعة، حط المتغيرات دي قبل تشغيل الباك إند:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_USERNAME` (اختياري)

مثال (Windows PowerShell):

```powershell
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="StrongPass123"
$env:ADMIN_USERNAME="admin"
python app.py
```

أول تشغيل هيعمل/يرقّي المستخدم ده لـ **admin** تلقائيًا.

## ملاحظات

- قاعدة البيانات موجودة في `backend/database/site.db`.
- ممكن تعمل reset بإنك تمسح `site.db` وتخلي `init_db.py` ينشئها تاني.
