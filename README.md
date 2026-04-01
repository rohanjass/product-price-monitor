# Product Price Monitor

A full-stack application for tracking product prices across various e-commerce sources. Built with FastAPI (Python) on the backend and React/Vite (Javascript) on the frontend. The system displays aggregate analytics, allows filtering/searching of monitored products, and visualizes dynamic price histories.

## 1. How to Run It

### Backend Setup
The backend runs on FastAPI and uses a local SQLite database that is automatically seeded upon startup.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. (Optional) Create and activate a virtual environment
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`. 
API interactive documentation (Swagger UI) is available at `http://localhost:8000/docs`.

### Frontend Setup
The frontend is a React application powered by Vite using modern UI components and Recharts for graphs.

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
The frontend dashboard will be available at `http://localhost:5173`.

### Running Automated Tests
A comprehensive pytest suite is configured for the backend. It uses an isolated in-memory SQLite database to ensure dev data isn't corrupted.

```bash
cd backend
python -m pytest tests/ -v
```

---

## 2. API Documentation

All API endpoints expect authorization via a header. 
**Required Header**: `X-API-Key: dev-secret-key`

### `GET /products`
Retrieves a list of tracked products.
**Query Parameters:**
- `search` (string): Search by product name.
- `brand` (string): Filter by specific brand.
- `min_price` (float): Minimum price threshold.
- `max_price` (float): Maximum price threshold.

**Example Response:**
```json
[
  {
    "id": 1,
    "name": "Sony WH-1000XM5",
    "brand": "Sony",
    "category": "Electronics",
    "latest_price": 348.0,
    "source": "https://amazon.com/...",
    "image_url": "https://...",
    "condition": "New",
    "unique_product_key": "sony_1"
  }
]
```

### `GET /products/{product_id}`
Retrieves detailed information for a specific product, including its exhaustive price history.
**Example Response:**
```json
{
  "id": 1,
  "name": "Sony WH-1000XM5",
  "latest_price": 348.0,
  "price_history": [
    {
       "price": 350.0,
       "timestamp": "2026-03-22T12:00:00Z"
    },
    {
       "price": 348.0,
       "timestamp": "2026-03-24T12:00:00Z"
    }
  ]
}
```

### `GET /analytics`
Retrieves aggregate statistics for the dashboard visualization.
**Example Response:**
```json
{
  "total_products": 450,
  "by_source": [
    { "source": "Amazon", "total_products": 200 }
  ],
  "by_category": [
    { "category": "Electronics", "average_price": 845.50 }
  ]
}
```

---

## 3. Design Decisions

### How does your price history scale? What happens at millions of rows?
Currently, price history points are tied to a relational SQL table (`price_history`) appended via standard ORM insertion. 
At millions of rows, querying full histories per product becomes highly inefficient. To scale:
1. **Time-Series Database:** I would migrate the `price_history` table to a dedicated Time-Series database (like InfluxDB or TimescaleDB) specifically optimized for high-volume ingest scaling and time-bucketed queries.
2. **Data Rollups:** We would implement chronological rollbacks—compressing older history points (e.g. keeping hourly data for 7 days, then averaging to daily data, then weekly data after 6 months) to constrain raw row bloat in the database.

### How did you implement notification of price changes, and why that approach over alternatives?
For the immediate scope, notification of price changes (flash drops and mock live updates) was implemented directly on the React Frontend via visual Flash variants (framer-motion) and `react-hot-toast` notifications generated from a hook simulator. 
**Why:** Because it tightly couples the feedback to the user's immediate session without requiring heavy infrastructural overhead (like SMTP setup, redis workers).
*In a fully deployed production scenario*, I would decouple this into the backend by utilizing a task queue (like Celery/RabbitMQ) that processes scraping batches, calculates deltas (New Price < Target Alert Price), and fires asynchronous Webhooks/Emails. This prevents standard API ingest from being bottlenecked by heavy outbound network email calls.

### How would you extend this system to 100+ data sources?
If scaling beyond a static JSON to 100+ active sources, the scraper architecture would be standardized using an **Adapter Pattern**:
1. A base `ScraperInterface` that dictates how a source must return normalized data (`extract_price()`, `extract_brand()`, etc.)
2. Each of the 100 sources implements this interface as its own standalone micro-script/plugin. 
3. A distributed crawler orchestrator (like Apache Airflow or Celery Beat) executes tasks to cycle through the queues.
4. Data is pushed to an intermediary "Staging" Database first to sanitize and catch bad schemas/bot blocks before merging to the core `products` table.

---

## 4. Known Limitations

- **Database Concurrency:** We are currently using SQLite, which is convenient for local development but will face lock contention under heavy parallel write-loads (simultaneous scraping and user querying). This should be migrated to PostgreSQL in production.
- **Static Ingestion Loop:** Standard execution relies on parsing a locally stored `combined.json` file. True automated scrapers hooking directly onto live HTML/API requests are stubbed out.
- **Frontend Live Polling:** The React application currently utilizes intervals (polling) to check to simulate live updates. A more efficient pipeline would implement **WebSockets** via FastAPI to push price-change events directly to the application only when a mutation occurs.
- **Security:** The system relies on a hardcoded, static `X-API-Key`. A robust implementation would deploy a true JWT-based OAuth2 authentication flow yielding unique keys per user.
