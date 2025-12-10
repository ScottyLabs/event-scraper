# Event Scraper API

REST API for querying available rooms from the CMU 25Live event database.

## Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### GET /api/rooms
Get all unique rooms/locations in the database.

**Response:**
```json
{
  "rooms": ["Baker Hall A53", "Doherty Hall 2315", ...],
  "count": 150
}
```

### GET /api/free-rooms
Get all rooms that are free at a specific time.

**Query Parameters:**
- `datetime` (required): ISO 8601 datetime string (e.g., `2025-12-08T14:00:00`)

**Example:**
```
GET /api/free-rooms?datetime=2025-12-08T14:00:00
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

### GET /api/room-schedule
Get events for a specific room.

**Query Parameters:**
- `room` (required): Room name
- `date` (optional): ISO 8601 date string to filter events for a specific day

**Example:**
```
GET /api/room-schedule?room=Baker%20Hall%20A53&date=2025-12-08
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

## Development

Install dependencies:
```bash
npm install
```

Run in development mode:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (default: `postgres://user:password@localhost:5432/postgres`)
- `PORT`: Server port (default: `3001`)
