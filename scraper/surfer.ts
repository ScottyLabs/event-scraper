/**
 * Surfer Module
 * This puppets the page interactions to make the page load the data we want to intercept.
 * It owns all of the puppeteer interaction, outside of logging in.
 * 
 * We use the list page here: https://25live.collegenet.com/pro/cmu#!/home/calendar
 * to trigger requests to the calendardata.json endpoint.
 * 
 * Rather than navigating through the page, we can just make requests from the page directly. 
 * This gets us the cookies etc without having to mess with clicking and whatnot
 */

import puppeteer, { Page } from "puppeteer-core";
import { db } from './db';
import { events } from './schema';
import { SuperCalendarDataResponse, SpaceReservation } from './types';
import { eq } from 'drizzle-orm';

async function saveEvents(data: SuperCalendarDataResponse) {
    for (const reservation of data.space_reservations.space_reservation) {
        const eventName = reservation.event.event_name;
        const locationName = reservation.spaces.space_name;
        const profileName = reservation.event.profile_name || undefined;
        
        // Check if reservation spans multiple days
        const startDate = new Date(reservation.reservation_start_dt);
        const endDate = new Date(reservation.reservation_end_dt);
        const isMultiDay = startDate.toDateString() !== endDate.toDateString();
        
        try {
            // Use upsert pattern: try to update, if not exists then insert
            const existing = await db.select()
                .from(events)
                .where(eq(events.itemId2, reservation.reservation_id))
                .limit(1);
            
            if (existing.length > 0) {
                await db.update(events)
                    .set({
                        name: eventName,
                        eventId: reservation.event.event_id,
                        profileName: profileName,
                        startDateTime: startDate,
                        endDateTime: endDate,
                        locations: locationName,
                        updatedAt: new Date(),
                    })
                    .where(eq(events.itemId2, reservation.reservation_id));
                console.log(`Updated event: ${eventName}${isMultiDay ? ' (multi-day)' : ''}`);
            } else {
                await db.insert(events).values({
                    itemId2: reservation.reservation_id,
                    eventId: reservation.event.event_id,
                    name: eventName,
                    profileName: profileName,
                    startDateTime: startDate,
                    endDateTime: endDate,
                    locations: locationName,
                });
                console.log(`Inserted event: ${eventName}${isMultiDay ? ' (multi-day)' : ''}`);
            }
        } catch (error) {
            console.error(`Error saving event ${eventName}:`, error);
        }
    }
}

export default async function surf(page: Page, date_range: { start: Date; end: Date; }) {
    const startDateStr = date_range.start.toISOString().split('T')[0];
    const endDateStr = date_range.end.toISOString().split('T')[0];
    
    // Use super calendardata endpoint (by removing cache id) which returns some pattern I do not understand
    const url = `https://25live.collegenet.com/25live/data/cmu/run/home/calendar/calendardata.json?mode=pro&start_dt=${startDateStr}&end_dt=${startDateStr}&page=1&comptype=home&sort=evdates_event_name&compsubject=location&last_id=-1&caller=pro-CalendarService.getCalendarDayPage`
    console.log(`Fetching data from ${startDateStr} to ${endDateStr}`);
    
    const data = await page.evaluate(async (url: string) => {
        return await fetch(url, {
            "referrer": "https://25live.collegenet.com/pro/cmu",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        }).then(r => r.json());
    }, url);
    
    const totalReservations = data.space_reservations?.space_reservation?.length || 0;
    console.log(`Fetched ${totalReservations} reservations`);
    
    // Save events to database
    if (data.space_reservations?.space_reservation && totalReservations > 0) {
        await saveEvents(data as SuperCalendarDataResponse);
    }
}
