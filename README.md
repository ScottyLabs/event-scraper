# CMU Room Finder

> **Live Site:** [rooms.scotty.lol](https://rooms.scotty.lol)

A web application for finding available rooms at CMU. Scrapes event data from CMU's 25Live calendar system and provides a REST API and web interface for querying room availability.

## Features

- 🏫 **Room Finder** - Find available rooms at any date/time
- 🔴 **"In Use" Button** - Mark a room as occupied for 1 hour
- 🗺️ **CMU Maps Integration** - Click rooms to view on ScottyLabs Maps
- 🔐 **CMU SSO Authentication** - Protected via OAuth2 proxy with Keycloak
- 📊 **REST API** - Query rooms, schedules, and availability programmatically

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   OAuth2 Proxy  │────▶│     Frontend    │     │   Browserless   │
│   (Port 4180)   │     │   (Nginx/HTML)  │     │  (Chrome/3000)  │
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                                │
         ▼                                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    API Server   │────▶│   PostgreSQL    │◀────│     Scraper     │
│   (Port 8080)   │     │   (Port 5432)   │     │   (One-time)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Bun](https://bun.sh) v1.2.20+ (for local development)
- CMU credentials with 25Live access (for scraping)

### 1. Clone and Configure

```bash
git clone https://github.com/ScottyLabs/event-scraper.git
cd event-scraper

# Create environment file
cp .env.example .env

# Edit .env with your CMU credentials (required for scraper only)
```

### 2. Start All Services

```bash
docker-compose up -d
```

This starts:
| Service | Port | Description |
|---------|------|-------------|
| OAuth2 Proxy | 4180 | Authentication gateway (main entry point) |
| Frontend | 80 (internal) | Static HTML/JS served by Nginx |
| API | 8080 (internal) | REST API with Express/Bun |
| PostgreSQL | 5432 | Database for events and bookings |
| Browserless | 3000 | Headless Chrome for scraping |

### 3. Access the Application

- **Web Interface:** http://localhost:4180 (requires CMU login)
- **Direct API (dev only):** http://localhost:8080

### 4. Initialize Database (First Time Only)

```bash
cd api
bun install
bun run db:push
```

### 5. Populate Data (Optional)

To scrape room data from 25Live:

```bash
cd scraper
bun install
bun run migrate.ts  # Run migrations
bun run main.ts     # Requires Duo 2FA approval
```

⚠️ **Note:** The scraper requires manual Duo 2FA approval within 3 minutes.

## API Documentation

See [api/README.md](api/README.md) for full API documentation.

### Quick Examples

```bash
# Health check
curl http://localhost:8080/health

# Get all rooms
curl http://localhost:8080/api/rooms

# Find free rooms at a specific time
curl "http://localhost:8080/api/free-rooms?datetime=2025-12-08T14:00:00"

# Get schedule for a specific room
curl "http://localhost:8080/api/room-schedule?room=Baker%20Hall%20A53&date=2025-12-08"

# Mark a room as "in use" for 1 hour
curl -X POST http://localhost:8080/api/room-in-use \
  -H "Content-Type: application/json" \
  -d '{"room": "Baker Hall A53"}'
```

## Development

### Local Development (without Docker)

```bash
# Start just the database
docker-compose up -d postgres

# Run API with hot reload
cd api
bun install
bun run dev

# Frontend is static - just open frontend/index.html in browser
# Or use a local server:
cd frontend
bunx serve .
```

### Database Commands

```bash
cd api

# Generate migrations from schema changes
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema directly (development)
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Project Structure

```
event-scraper/
├── api/                    # REST API (Express + Bun)
│   ├── src/
│   │   ├── server.ts       # API routes
│   │   ├── schema.ts       # Drizzle schema (events, room_bookings)
│   │   └── db.ts           # Database connection
│   ├── drizzle/            # Migrations
│   ├── drizzle.config.ts   # Drizzle Kit config
│   └── Dockerfile
├── frontend/               # Static web interface
│   ├── index.html          # Single-page app
│   └── Dockerfile          # Nginx container
├── scraper/                # 25Live scraper
│   ├── main.ts             # Scraper entry point
│   ├── surfer.ts           # Puppeteer automation
│   └── Dockerfile
└── docker-compose.yml      # Full stack orchestration
```

## Database Schema

### Events Table
Scraped from 25Live calendar:

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| eventId | integer | 25Live event ID |
| itemId2 | integer | Unique reservation ID |
| name | text | Event name |
| profileName | text | Event profile/category |
| startDateTime | timestamp | Event start time |
| endDateTime | timestamp | Event end time |
| locations | text | Room name |
| createdAt | timestamp | Record created |
| updatedAt | timestamp | Record updated |

### Room Bookings Table
Manual "in use" bookings from the web interface:

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| room | text | Room name |
| startTime | timestamp | Booking start (now) |
| endTime | timestamp | Booking end (now + 1 hour) |
| createdAt | timestamp | Record created |

## Deployment

### Railway

1. Create a new Railway project
2. Add PostgreSQL service
3. Add environment variables:
   - `DATABASE_URL` - Railway PostgreSQL connection string
   - `BROWSERLESS_URI` - Browserless service URL
   - `CMU_USERNAME` / `CMU_PASSWORD` - For scraper

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://...@postgres:5432/railway` |
| `PORT` | API server port | `8080` |
| `BROWSERLESS_URI` | Browserless WebSocket URL | `ws://browserless:3000` |
| `CMU_USERNAME` | CMU Andrew ID | - |
| `CMU_PASSWORD` | CMU password | - |

## Stopping Services

```bash
# Stop all containers
docker-compose down

# Stop and remove database volume
docker-compose down -v
```

## Troubleshooting

### API can't connect to database
```bash
# Check if postgres is running
docker-compose ps

# View postgres logs
docker-compose logs postgres
```

### No rooms showing up
- Run the scraper to populate the database
- Check event count: `docker-compose exec postgres psql -U postgres -d railway -c "SELECT COUNT(*) FROM events;"`

### OAuth2 proxy issues
- Ensure `OAUTH2_PROXY_COOKIE_SECURE=false` for localhost
- Check proxy logs: `docker-compose logs oauth2-proxy`

## License

MIT
```

## Architecture

- **Scraper**: Bun + TypeScript + Puppeteer
- **Database**: PostgreSQL with Drizzle ORM
- **Browser Automation**: Browserless (Chrome headless)
- **Authentication**: CMU SSO with Duo 2FA
- **API**: Node.js + Express + TypeScript
- **Frontend**: Static HTML/CSS/JavaScript served via Nginx

## Development Commands

```bash
# Install dependencies
bun install

# Run migrations
bun migrate.ts

# Generate new migration
bun db:generate

# Run the scraper
bun main.ts

# View database in Drizzle Studio
bun db:studio
```