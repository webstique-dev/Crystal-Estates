# Crystal Estates - Frontend Client

This is the Next.js frontend client for Crystal Estates.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` if not already present:
```bash
cp .env.example .env.local
```
- `NEXT_PUBLIC_API_URL`: Backend server address (default: `http://localhost:5000`)
- `SERVER_URL`: Server address for Next.js internal rewrites proxy (default: `http://localhost:5000`)

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

