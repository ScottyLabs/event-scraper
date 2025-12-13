# Quick Start Guide

## For Users (Just Want to Find Free Rooms)

If the database is already populated:

```bash
# Start all services
docker-compose up -d

# Open in browser (requires CMU login)
open http://localhost:4180
```

## For Developers (Setting Up From Scratch)

### Step 1: Start All Services

```bash
docker-compose up -d
```

This starts: PostgreSQL, API, Frontend, Browserless, and OAuth2 Proxy.

### Step 2: Initialize the Database

```bash
cd api
bun install
bun run db:push
```

### Step 3: Populate Room Data (Optional)

To scrape room data from 25Live:

```bash
# Set CMU credentials in .env first
cd scraper
bun install
bun run migrate.ts
bun run main.ts  # Requires Duo 2FA approval within 3 minutes
```

### Step 4: Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:4180 | Main app (via OAuth2 proxy, requires CMU login) |
| http://localhost:8080/api | Direct API access (development only) |
| http://localhost:8080/health | API health check |

## Managing the Stack

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f scraper
```

### Restart Services

```bash
# Restart everything
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Services

```bash
# Stop all containers
docker-compose down

# Stop and remove database volume (full reset)
docker-compose down -v
```

## Database Commands

```bash
cd api

# Push schema to database (development)
bun run db:push

# Generate migration files
bun run db:generate

# Apply migrations
bun run db:migrate

# Open database GUI
bun run db:studio
```

## Troubleshooting

### API can't connect to database

```bash
# Check if postgres is running
docker-compose ps

# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d railway -c "SELECT 1;"
```

### No rooms showing up

```bash
# Check if events exist
docker-compose exec postgres psql -U postgres -d railway -c "SELECT COUNT(*) FROM events;"

# Run the scraper to populate data
cd scraper && bun run main.ts
```

### OAuth2 / Login issues

- For localhost, ensure `OAUTH2_PROXY_COOKIE_SECURE=false` in docker-compose.yml
- Check proxy logs: `docker-compose logs oauth2-proxy`
- Try clearing browser cookies for localhost

### Frontend changes not showing

The frontend is mounted as a volume, so changes should be instant. Just refresh the browser.

### API changes not applying

```bash
docker-compose restart api
# Or rebuild:
docker-compose up -d --build api
```

## Development Workflow

### API Development (with hot reload)

```bash
# Start only the database
docker-compose up -d postgres

# Run API locally with hot reload
cd api
bun install
bun run dev
```

### Frontend Development

The frontend is a static HTML file. Edit `frontend/index.html` and refresh the browser.

For local development without Docker:
```bash
cd frontend
bunx serve .
# Opens at http://localhost:3000
```
