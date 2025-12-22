import fs from "node:fs";
import type { Page } from "puppeteer-core";
import { login } from "../utils/login";

export const scrape25live = async (page: Page) => {
  await login(page, "https://25live.collegenet.com/pro/cmu#!/home/list");

  // scrape for the next 7 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  await surf(page, { start: startDate, end: endDate });
};

export const surf = async (
  page: Page,
  date_range: { start: Date; end: Date },
) => {
  const startDateStr = date_range.start.toISOString().split("T")[0];
  const endDateStr = date_range.end.toISOString().split("T")[0];

  // Use super calendardata endpoint (by removing cache id) which returns some pattern I do not understand
  const url = `https://25live.collegenet.com/25live/data/cmu/run/home/calendar/calendardata.json?mode=pro&start_dt=${startDateStr}&end_dt=${startDateStr}&page=1&comptype=home&sort=evdates_event_name&compsubject=location&last_id=-1&caller=pro-CalendarService.getCalendarDayPage`;
  console.log(`Fetching data from ${startDateStr} to ${endDateStr}`);

  const data: any = await page.evaluate(async (url: string) => {
    return await fetch(url, {
      referrer: "https://25live.collegenet.com/pro/cmu",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json());
  }, url);

  const totalReservations =
    data.space_reservations?.space_reservation?.length || 0;
  console.log(`Fetched ${totalReservations} reservations`);

  console.log(data);

  // save the data to a file
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
};
