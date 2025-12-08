# event-scraper

A web scraper for CMU's 25Live calendar system that extracts event and room reservation data, with an API and web interface for finding available rooms.

## Features

- Scrapes event data from CMU's 25Live calendar system
- Handles CMU authentication with Duo 2FA
- Stores events in PostgreSQL database
- Supports multi-day events
- Uses Puppeteer with Browserless for headless browsing
- **REST API for querying available rooms**
- **Web interface for finding free rooms at any time**

## Local Development

### Prerequisites

- [Bun](https://bun.sh) v1.2.20 or higher
- Docker and Docker Compose
- CMU credentials with 25Live access

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd event-scraper
```

2. Copy the environment example file:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
DATABASE_URL=postgres://user:password@postgres:5432/scraper_db
BROWSERLESS_URI=browserless:3000
CMU_USERNAME=your_andrew_id
CMU_PASSWORD=your_password
```

4. Start the services:
```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Browserless** (Chrome) on port 3000
- **API server** on port 3001
- **Frontend** on port 8080

5. Access the web interface:
   - Open http://localhost:8080 in your browser
   - Select a date and time to find available rooms

6. To run the scraper (one-time or scheduled):
```bash
cd scraper
bun install
bun migrate.ts  # Run migrations first time only
bun main.ts     # This requires manual Duo 2FA approval
```

## Using the API and Frontend

### Web Interface

The frontend provides a simple interface to find free rooms:

1. Open http://localhost:8080
2. Select a date and time (or use "Use Current Time")
3. Click "Search Free Rooms"
4. View the list of available rooms

### API Endpoints

See [api/README.md](api/README.md) for detailed API documentation.

Quick examples:

```bash
# Get all rooms
curl http://localhost:3001/api/rooms

# Find free rooms at a specific time
curl "http://localhost:3001/api/free-rooms?datetime=2025-12-08T14:00:00"

# Get schedule for a specific room
curl "http://localhost:3001/api/room-schedule?room=Baker%20Hall%20A53&date=2025-12-08"
```

## Railway Deployment

### Prerequisites

- Railway account
- PostgreSQL database provisioned on Railway
- Browserless service (can use Railway or external service)

### Deployment Steps

1. Create a new project on Railway

2. Add a PostgreSQL database service

3. Add environment variables:
   - `DATABASE_URL` - Your Railway PostgreSQL connection string
   - `BROWSERLESS_URI` - Your Browserless service URL (e.g., `chrome.browserless.io`)
   - `CMU_USERNAME` - Your CMU Andrew ID
   - `CMU_PASSWORD` - Your CMU password

4. Connect your GitHub repository or deploy using Railway CLI:
```bash
railway link
railway up
```

5. The Dockerfile will automatically:
   - Install Bun and dependencies
   - Run database migrations
   - Start the scraper

### Notes

- The scraper requires manual Duo 2FA approval (timeout: 3 minutes)
- For production, consider using Duo API for automated 2FA
- Railway's ephemeral filesystem means the scraper should be stateless

## Database Schema

Events are stored with the following schema:

```typescript
{
  id: serial (primary key)
  eventId: integer
  itemId2: integer (unique - reservation ID)
  name: text
  profileName: text (nullable)
  startDateTime: timestamp
  endDateTime: timestamp
  locations: text
  createdAt: timestamp
  updatedAt: timestamp
}
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

## License

Private - Carnegie Mellon University
