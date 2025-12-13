# Event Scraper API

REST API for querying available rooms from the CMU 25Live event database.

## Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

---

### GET /api/rooms

Get all unique rooms/locations in the database.

**Response:**
```json
{
  "rooms": ["Baker Hall A53", "Doherty Hall 2315", ...],
  "count": 150
}
```

---

### GET /api/free-rooms

Get all rooms that are free at a specific time. Considers both scheduled events and manual "in use" bookings.

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `datetime` | Yes | ISO 8601 datetime (e.g., `2025-12-08T14:00:00`) |

**Example:**
```bash
curl "http://localhost:8080/api/free-rooms?datetime=2025-12-08T14:00:00"
```

**Response:**
```json
{
  "datetime": "2025-12-08T14:00:00.000Z",
  "totalRooms": 150,
  "occupiedRooms": 25,
  "freeRooms": 125,
  "rooms": ["Baker Hall A53", "Doherty Hall 2315", ...]
}
```

---

### GET /api/room-schedule

Get events for a specific room.

**Query Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `room` | Yes | Room name |
| `date` | No | ISO 8601 date to filter by day |

**Example:**
```bash
curl "http://localhost:8080/api/room-schedule?room=Baker%20Hall%20A53&date=2025-12-08"
```

**Response:**
```json
{
  "room": "Baker Hall A53",
  "date": "2025-12-08",
  "events": [
    {
      "id": 1,
      "name": "CS Lecture",
      "startDateTime": "2025-12-08T10:00:00.000Z",
      "endDateTime": "2025-12-08T11:30:00.000Z",
      ...
    }
  ]
}
```

---

### POST /api/room-in-use

Mark a room as "in use" for 1 hour. This creates a manual booking that will show the room as occupied.

**Request Body:**
```json
{ "room": "Baker Hall A53" }
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/room-in-use \
  -H "Content-Type: application/json" \
  -d '{"room": "Baker Hall A53"}'
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": 1,
    "room": "Baker Hall A53",
    "startTime": "2025-12-08T14:00:00.000Z",
    "endTime": "2025-12-08T15:00:00.000Z"
  },
  "message": "Room \"Baker Hall A53\" marked as in use until 3:00:00 PM"
}
```

---

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.2.20+
- PostgreSQL database

### Install Dependencies

```bash
bun install
```

### Run Development Server (with hot reload)

```bash
bun run dev
```

### Run Production Server

```bash
bun run start
```

### Database Commands

```bash
# Push schema to database (development)
bun run db:push

# Generate migrations from schema changes
bun run db:generate

# Apply migrations
bun run db:migrate

# Open Drizzle Studio (database GUI)
bun run db:studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:password@localhost:5432/scraper_db` |
| `PORT` | API server port | `8080` |

## Project Structure

```
api/
├── src/
│   ├── server.ts      # Express routes and middleware
│   ├── schema.ts      # Drizzle ORM schema (events, room_bookings)
│   ├── db.ts          # Database connection
│   └── migrate.ts     # Migration runner
├── drizzle/           # Generated migrations
├── drizzle.config.ts  # Drizzle Kit configuration
├── package.json
├── tsconfig.json
└── Dockerfile
```
