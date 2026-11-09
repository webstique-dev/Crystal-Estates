# Crystal Estates — Architecture & Setup Guide

Crystal Estates is organized as a decoupled, production-grade full-stack architecture with a dedicated **Backend Server (`server/`)** and a standalone **Frontend Client (`client/`)**.

---

## 📁 Project Architecture

```
crystal-estates/
├── client/                     # 🌐 Standalone Frontend Application
│   ├── src/                    # UI Components, Layouts, Design System & App Pages
│   │   ├── app/                # Next.js App Router (Home, Layout Viewer, 404)
│   │   ├── components/         # Reusable UI & Section Components
│   │   ├── data/               # Static Site & Layout Data
│   │   ├── lib/                # Client Utilities (GSAP, SVG Centroid)
│   │   └── index.css           # Global Design Tokens & Typography
│   ├── public/                 # Static Assets (Images, Logos, Icons)
│   ├── next.config.mjs         # Next.js Configuration & API Proxy Rewrites
│   ├── jsconfig.json           # Path Aliases (@/* -> ./src/*)
│   ├── eslint.config.js        # ESLint Configuration
│   ├── .env.local              # Client Environment Variables
│   └── package.json            # Client Dependencies & Scripts
│
├── server/                     # ⚡ Dedicated Backend API Server
│   ├── src/
│   │   ├── config/             # Database Connection Pooling (MongoDB)
│   │   ├── routes/             # REST Endpoints (/api/plots, /api/plots/kolapakkam)
│   │   ├── lib/                # SVG Centroid & Geometric Calculations
│   │   ├── data/               # Fallback Plot & Metadata Sources
│   │   └── server.js           # Express App, CORS, Logging, Health Check
│   ├── scripts/                # Database Seeding & Verification Scripts
│   ├── .env                    # Server Port, Database URI & Credentials
│   └── package.json            # Server Dependencies & Scripts
│
├── scripts/                    # 🛠️ Unified Development & Startup Scripts
│   ├── dev.js                  # Concurrently runs both Server & Client
│   └── start.js                # Concurrently starts production builds
├── .gitignore                  # Monorepo Git Ignore Rules
└── package.json                # Monorepo Workspace Configuration
```

---

## 🚀 Quick Start (Running All Three Together)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Both Server & Client Concurrently
```bash
npm run dev
```
- **Backend Server:** [http://localhost:5000](http://localhost:5000)
- **Frontend Client:** [http://localhost:3000](http://localhost:3000)
- **CRM Portal:** [http://localhost:5173](http://localhost:5173)

---

## 🖥️ Running Services Independently

### Run Backend Server Only
```bash
# Navigate to server
cd server
npm install
npm run dev
```
Or from the root directory:
```bash
npm run dev:server
```

**Available Server Endpoints:**
- `GET /api/health` — Service and database connection status
- `GET /api/plots` — Featured plots list
- `PATCH /api/plots` — Update featured plot
- `GET /api/plots/kolapakkam` — Master plan layout & plots
- `POST /api/plots/kolapakkam` — Add new plot
- `PATCH /api/plots/kolapakkam` — Update plot details / status
- `DELETE /api/plots/kolapakkam?plotNo=1` — Delete plot

### Run Frontend Client Only
```bash
# Navigate to client
cd client
npm install
npm run dev
```
Or from the root directory:
```bash
npm run dev:client
```
Build client for production:
```bash
npm run build
```

---

### Run CRM Portal Only
```bash
# Navigate to crm
cd crm
npm run dev
```
Or from the root directory:
```bash
npm run dev:crm
```

---

## 🗄️ Database Management
To seed or refresh the MongoDB database with initial plots and the Kolapakkam master layout:
```bash
npm run seed:server
```
Or from within the `server` directory:
```bash
cd server
npm run seed
```
