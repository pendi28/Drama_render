# DramaShort

Aplikasi streaming drama pendek vertikal (mirip ReelShort) — mobile-first, dengan sistem koin untuk membuka episode, daftar favorit, dan riwayat tontonan.

Dibangun sebagai pnpm monorepo: backend Express + PostgreSQL (Drizzle ORM) dan frontend React + Vite + TanStack Query, semua diketik dari satu OpenAPI spec via Orval.

---

## Stack

- **Frontend**: React 18 + Vite + TailwindCSS + wouter + TanStack Query + Radix UI
- **Backend**: Express 5 + Pino + Zod
- **Database**: PostgreSQL via Drizzle ORM
- **Codegen**: Orval (OpenAPI → Zod schemas + React Query hooks)
- **Bundler**: esbuild (server), Vite (client)
- **Package manager**: pnpm workspaces (Node 20+)

---

## Struktur Project

```
.
├── artifacts/
│   ├── api-server/       # Express backend (juga melayani SPA di production)
│   └── drama-app/        # React + Vite frontend
├── lib/
│   ├── api-spec/         # Sumber kebenaran OpenAPI 3.0
│   ├── api-zod/          # Zod schemas (auto-generated)
│   ├── api-client-react/ # React Query hooks (auto-generated)
│   └── db/               # Drizzle schema + koneksi
├── render.yaml           # Konfigurasi deploy Render
├── Dockerfile            # Container alternatif
└── package.json
```

---

## Menjalankan Lokal

### Prasyarat

- Node.js 20+
- pnpm 9+ (`corepack enable`)
- PostgreSQL (lokal atau remote, mis. dari Neon/Supabase)

### Setup

```bash
# 1. Install dependency
pnpm install

# 2. Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# 3. Generate API client + push schema database
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db exec tsc -b
pnpm --filter @workspace/db run push

# 4. Jalankan backend (port 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# 5. Di terminal lain, jalankan frontend (port 5173)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/drama-app run dev
```

Buka `http://localhost:5173`. Backend otomatis seed 12 drama + user demo (240 koin) saat pertama kali dijalankan.

---

## Deploy ke Render (Free Tier)

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/dramashort.git
git push -u origin main
```

### 2. Buat Database PostgreSQL gratis

Pakai salah satu:

- **[Neon](https://neon.tech)** — free 0.5 GB, recommended
- **[Supabase](https://supabase.com)** — free 500 MB
- **Render Postgres** — free 90 hari (lalu berbayar)

Salin `connection string` (format: `postgresql://user:pass@host:5432/dbname?sslmode=require`).

### 3. Deploy ke Render

1. Login ke [render.com](https://render.com)
2. Klik **New → Blueprint**
3. Connect repository GitHub Anda
4. Render otomatis baca `render.yaml`
5. Saat ditanya `DATABASE_URL`, paste connection string dari step 2
6. Klik **Apply**

Build pertama butuh ~5-10 menit (install dependencies + codegen + build frontend + build backend + push schema).

Setelah live, app bisa diakses di `https://dramashort.onrender.com` (atau nama yang Anda pilih).

> **Catatan free tier Render**: service akan "tidur" setelah 15 menit tanpa traffic. Request pertama setelah tidur butuh ~30 detik untuk bangun.

---

## Deploy via Docker

```bash
# Build
docker build -t dramashort .

# Run
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e PORT=8080 \
  -e NODE_ENV=production \
  dramashort
```

---

## Environment Variables

| Variable        | Required | Default                                  | Deskripsi                                |
| --------------- | -------- | ---------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`  | ✓        | —                                        | Connection string PostgreSQL             |
| `PORT`          | ✓        | —                                        | Port HTTP server                         |
| `NODE_ENV`      |          | `development`                            | Set ke `production` untuk deploy         |
| `STATIC_DIR`    |          | `./artifacts/drama-app/dist/public`      | Folder build frontend yang akan disajikan |
| `BASE_PATH`     | ✓ (dev)  | —                                        | Base path untuk Vite (set ke `/`)        |

---

## API Endpoints

Semua di-mount di `/api/*`:

| Method | Path                                | Deskripsi                          |
| ------ | ----------------------------------- | ---------------------------------- |
| GET    | `/api/healthz`                      | Health check                       |
| GET    | `/api/me`                           | Profile user demo                  |
| GET    | `/api/coins/packs`                  | Daftar paket koin                  |
| POST   | `/api/coins/purchase`               | Beli paket koin                    |
| GET    | `/api/dramas`                       | List drama (search/genre/sort)     |
| GET    | `/api/dramas/featured`              | Drama featured                     |
| GET    | `/api/dramas/trending`              | Drama trending                     |
| GET    | `/api/dramas/recommended`           | Rekomendasi                        |
| GET    | `/api/dramas/genres`                | Daftar genre + jumlah              |
| GET    | `/api/dramas/:id`                   | Detail drama + episodes            |
| GET    | `/api/episodes/:id`                 | Detail episode (+ prev/next/progress) |
| POST   | `/api/episodes/:id/unlock`          | Unlock episode dengan koin         |
| GET    | `/api/library/favorites`            | Daftar favorit                     |
| POST   | `/api/library/favorites`            | Tambah favorit                     |
| DELETE | `/api/library/favorites/:dramaId`   | Hapus favorit                      |
| GET    | `/api/library/continue-watching`    | Continue watching                  |
| POST   | `/api/library/progress`             | Simpan progress menonton           |

OpenAPI spec lengkap di `lib/api-spec/openapi.yaml`.

---

## Lisensi

MIT — bebas digunakan, modifikasi, dan distribusikan.
