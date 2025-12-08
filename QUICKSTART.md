# Quick Start Guide

## For Users (Just want to find free rooms)

If you just want to use the room finder and the database is already populated:

1. Start the services:
```bash
docker-compose up -d
```

2. Open your browser to http://localhost:8080

3. Select a date/time and search for free rooms!

## For Developers (Setting up from scratch)

### Step 1: Start Infrastructure
```bash
docker-compose up -d
```

This starts PostgreSQL, the API server, and the frontend.

### Step 2: Initialize the Database

```bash
cd scraper
bun install
bun migrate.ts
```

### Step 3: Populate the Database (Optional)

To scrape room data from 25Live:

```bash
# Make sure you have CMU credentials set in .env
cd scraper
bun main.ts
```

⚠️ **Note:** This requires manual Duo 2FA approval within 3 minutes.

### Step 4: Use the Application

- **Frontend:** http://localhost:8080
- **API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

## Stopping Services

```bash
docker-compose down
```

To also remove the database volume:
```bash
docker-compose down -v
```

## Troubleshooting

### API can't connect to database
- Make sure PostgreSQL is running: `docker-compose ps`
- Check connection string in docker-compose.yml matches database credentials

### Frontend can't reach API
- Make sure API is running on port 3001
- Check browser console for CORS errors
- Verify API health: `curl http://localhost:3001/health`

### No rooms showing up
- You need to run the scraper first to populate the database
- Check if there are events in the database:
  ```bash
  docker-compose exec postgres psql -U user -d scraper_db -c "SELECT COUNT(*) FROM events;"
  ```

## Development Workflow

1. Make changes to API code in `api/src/`
2. Restart API service: `docker-compose restart api`
3. Make changes to frontend in `frontend/index.html`
4. Refresh browser (changes are instant since it's static HTML)

For API development with auto-reload:
```bash
cd api
npm install
npm run dev
```
