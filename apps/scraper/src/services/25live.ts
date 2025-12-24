import { uploadJson } from "@event-scraper/storage";
import type { Page } from "puppeteer-core";

export const scrape25live = async (page: Page, range = 7) => {
  console.log("Scraping 25live...");

  // Navigate to 25live page
  await page.goto("https://25live.collegenet.com/pro/cmu#!/home/list");
  await page
    .waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
    .catch(() => {
      throw new Error("Failed to navigate to 25live page.");
    });

  // scrape for the next `range` days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + range);
  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // Fetch data
  console.log(`Fetching 25live data from ${startDateStr} to ${endDateStr}...`);
  // Use super calendardata endpoint (removing unnecessary query params)
  const url = `https://25live.collegenet.com/25live/data/cmu/run/home/calendar/calendardata.json?mode=pro&start_dt=${startDateStr}&end_dt=${endDateStr}&compsubject=location`;
  const data = await page.evaluate(async (url: string) => {
    return await fetch(url, {
      referrer: "https://25live.collegenet.com/pro/cmu",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json());
  }, url);

  // Upload the data to S3
  console.log(`Uploading 25live data to S3...`);
  await uploadJson("25live.json", data);
};
