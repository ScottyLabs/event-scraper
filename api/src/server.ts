import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './db.js';
import { events, roomBookings } from './schema.js';
import { and, lte, gte, sql, lt, gt } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 8080;


app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Get all unique rooms/locations from the database
app.get('/api/rooms', async (_req: Request, res: Response) => {
  try {
    const result = await db
      .selectDistinct({ locations: events.locations })
      .from(events)
      .orderBy(events.locations);
    
    const rooms = result.map(r => r.locations);
    res.json({ rooms, count: rooms.length });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get free rooms at a specific time
app.get('/api/free-rooms', async (req: Request, res: Response) => {
  try {
    const { datetime } = req.query;
    
    if (!datetime || typeof datetime !== 'string') {
      return res.status(400).json({ 
        error: 'datetime parameter is required (ISO 8601 format)' 
      });
    }
    
    const checkTime = new Date(datetime);
    
    if (isNaN(checkTime.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid datetime format. Please use ISO 8601 format (e.g., 2025-12-08T14:00:00)' 
      });
    }
    
    // Get all unique rooms
    const allRoomsResult = await db
      .selectDistinct({ locations: events.locations })
      .from(events)
      .orderBy(events.locations);
    
    const allRooms = allRoomsResult.map(r => r.locations);
    
    // Get occupied rooms at the specified time
    // A room is occupied if: startDateTime <= checkTime < endDateTime
    const occupiedRoomsResult = await db
      .selectDistinct({ locations: events.locations })
      .from(events)
      .where(
        and(
          lte(events.startDateTime, checkTime),
          gte(events.endDateTime, checkTime)
        )
      );
    
    const occupiedRooms = new Set(occupiedRoomsResult.map(r => r.locations));
    
    // Also check for manual bookings (rooms marked as "in use")
    const bookedRoomsResult = await db
      .selectDistinct({ room: roomBookings.room })
      .from(roomBookings)
      .where(
        and(
          lte(roomBookings.startTime, checkTime),
          gt(roomBookings.endTime, checkTime)
        )
      );
    
    bookedRoomsResult.forEach(r => occupiedRooms.add(r.room));
    
    // Calculate free rooms
    const freeRooms = allRooms.filter(room => !occupiedRooms.has(room));
    
    res.json({
      datetime: checkTime.toISOString(),
      totalRooms: allRooms.length,
      occupiedRooms: occupiedRooms.size,
      freeRooms: freeRooms.length,
      rooms: freeRooms.sort()
    });
  } catch (error) {
    console.error('Error fetching free rooms:', error);
    res.status(500).json({ error: 'Failed to fetch free rooms' });
  }
});

// Get events for a specific room
app.get('/api/room-schedule', async (req: Request, res: Response) => {
  try {
    const { room, date } = req.query;
    
    if (!room || typeof room !== 'string') {
      return res.status(400).json({ 
        error: 'room parameter is required' 
      });
    }
    
    let dateFilter;
    if (date && typeof date === 'string') {
      const checkDate = new Date(date);
      if (isNaN(checkDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format. Please use ISO 8601 format' 
        });
      }
      
      const startOfDay = new Date(checkDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(checkDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      dateFilter = and(
        sql`${events.locations} = ${room}`,
        gte(events.endDateTime, startOfDay),
        lte(events.startDateTime, endOfDay)
      );
    } else {
      dateFilter = sql`${events.locations} = ${room}`;
    }
    
    const roomEvents = await db
      .select()
      .from(events)
      .where(dateFilter)
      .orderBy(events.startDateTime);
    
    res.json({
      room,
      date: date || 'all',
      events: roomEvents
    });
  } catch (error) {
    console.error('Error fetching room schedule:', error);
    res.status(500).json({ error: 'Failed to fetch room schedule' });
  }
});

// Mark a room as "in use" for one hour
app.post('/api/room-in-use', async (req: Request, res: Response) => {
  try {
    const { room } = req.body;
    
    if (!room || typeof room !== 'string') {
      return res.status(400).json({ 
        error: 'room parameter is required' 
      });
    }
    
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const [booking] = await db
      .insert(roomBookings)
      .values({
        room,
        startTime,
        endTime,
      })
      .returning();
    
    res.json({
      success: true,
      booking: {
        id: booking.id,
        room: booking.room,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
      },
      message: `Room "${room}" marked as in use until ${endTime.toLocaleTimeString()}`
    });
  } catch (error) {
    console.error('Error marking room as in use:', error);
    res.status(500).json({ error: 'Failed to mark room as in use' });
  }
});

// catchall return 404 for undefined routes
app.use((req: Request, res: Response) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
