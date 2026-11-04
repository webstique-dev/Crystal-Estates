# Crystal Estates - Backend API Server

Dedicated Node.js / Express backend server for Crystal Estates, providing REST APIs connected to MongoDB for real-time plot layouts, inventory management, and CRUD operations.

## Architecture & Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js            # MongoDB connection pooling & getDb helper
│   ├── routes/
│   │   ├── plots.js         # /api/plots (Featured plots endpoints)
│   │   └── kolapakkam.js    # /api/plots/kolapakkam (Master plan & CRUD endpoints)
│   ├── lib/
│   │   └── svgPathCentroid.js # Centroid computation for SVG boundaries
│   ├── data/
│   │   ├── kolapakkamPlots.js # Layout metadata & fallback plot coordinates
│   │   └── site.js          # Fallback featured plots data
│   └── server.js            # Express server initialization, CORS, middleware & routes
├── scripts/
│   ├── seed_mongodb.mjs     # Database seeder script
│   └── test_mongo.mjs       # Database connectivity verification
├── .env                     # Server environment variables (port, db uri)
├── .env.example             # Example environment file
└── package.json             # Server dependencies & scripts
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status and MongoDB database connectivity

### Featured Plots
- `GET /api/plots` - Retrieve all featured plots from MongoDB (with static fallback)
- `PATCH /api/plots` or `PATCH /api/plots/:id` - Update status, price, facing, or area

### Kolapakkam Interactive Master Plan
- `GET /api/plots/kolapakkam` - Retrieve layout metadata and dynamic plot boundaries
- `POST /api/plots/kolapakkam` - Add a new plot (with automated label centroid calculation)
- `PATCH /api/plots/kolapakkam` - Update plot status (`Available`, `Booked`, `Sold`, `Blocked`), dimensions, or price
- `DELETE /api/plots/kolapakkam?plotNo=1` - Delete a plot by `plotNo` or `id`

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` if needed:
```bash
cp .env.example .env
```
Default port is `5000`.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

### 5. Seed Database
```bash
npm run seed
```

