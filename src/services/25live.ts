import type { Page } from "puppeteer-core";
import puppeteer, { type PuppeteerExtraPlugin } from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import env from "../env";
import { login } from "../utils/login";
import { uploadJson } from "../utils/s3Utils";

// Types for 25live API responses
interface ListDataResponse {
  rows: Array<{ row: unknown[] }>;
}

interface RoomData {
  roomId: string;
  roomCategory: string;
  roomSpecifications: string[];
  roomType: string;
  capacity: number;
}

// Parse roomType: if >= 1 comma, take only the first option
const parseRoomType = (roomType: string): string => {
  if (!roomType) return "";
  if (roomType.includes(",")) {
    const option = roomType.split(",")[0];
    return option?.trim() ?? "";
  }
  return roomType;
};

// Parse specifications string and group by category
const parseSpecifications = (specs: string): string[] => {
  if (!specs) return [];

  const items = specs.split(", ");
  const grouped: Record<string, string[]> = {};

  for (const item of items) {
    const colonIndex = item.indexOf(":");
    if (colonIndex === -1) continue;

    const category = item.substring(0, colonIndex).trim();
    const value = item.substring(colonIndex + 1).trim();

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(value);
  }

  const result: string[] = [];

  Object.keys(grouped).forEach((key) => {
    result.push(`${key}: (x${grouped[key]?.length})`);
  });

  return result;
};

/**
 * Scrape 25live calendar/event data for the next `range` days and upload to S3.
 */
export const scrape25live = async (page: Page, range = 7) => {
  console.log("Scraping 25live calendar data...");

  // Scrape for the next `range` days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + range);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  // Fetch calendar data
  console.log(`Fetching 25live data from ${startDateStr} to ${endDateStr}...`);
  const calendarUrl = `https://25live.collegenet.com/25live/data/cmu/run/home/calendar/calendardata.json?mode=pro&start_dt=${startDateStr}&end_dt=${endDateStr}&compsubject=location`;

  const data = await page.evaluate(async (url: string) => {
    return await fetch(url, {
      referrer: "https://25live.collegenet.com/pro/cmu",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json());
  }, calendarUrl);

  // Upload the data to S3
  console.log(`Uploading 25live calendar data to S3...`);
  await uploadJson("events/25live.json", data);
};

/**
 * Scrape 25live room/location list data (paginated) and write to local JSON.
 */
export const scrapeRoomData = async (page: Page, _range = 7) => {
  console.log("Scraping 25live room data...");

  // Fetch room list data (page 1)
  console.log("Fetching 25live room data (page 1)...");
  const listBaseUrl =
    "https://25live.collegenet.com/25live/data/cmu/run/list/listdata.json?compsubject=location&sort=name&order=asc&page_size=100&obj_cache_accl=0&category_id=76+116+64+133+134+117+81+90+92+91+175+105+209+104+79+66+63+65&feature_id=34+33+82+55+42+4+47+65+20+32+7+72+71+59+58+18+99+5+46+57+17+24+81+25+90+37+48+54+75+78+21+64+77+41+40&layout_id=24+2+5+3+25+19+28+34+17+8+35+21+20+37+23+12+9+38+15+16+29+22+33+13&caller=pro-ListService.getData";

  const url1 = `${listBaseUrl}&page=1`;
  const data = (await page.evaluate(async (url: string) => {
    return await fetch(url, {
      referrer: "https://25live.collegenet.com/pro/cmu",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json());
  }, url1)) as ListDataResponse;

  // Fetch room list data (page 2)
  console.log("Fetching 25live room data (page 2)...");
  const url2 = `${listBaseUrl}&page=2`;
  const data2 = (await page.evaluate(async (url: string) => {
    return await fetch(url, {
      referrer: "https://25live.collegenet.com/pro/cmu",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }).then((r) => r.json());
  }, url2)) as ListDataResponse;

  // Merge and extract relevant fields from each row
  const allItems = [...(data.rows || []), ...(data2.rows || [])];
  const allRows: RoomData[] = allItems.map((item) => {
    const row = item.row;
    return {
      roomId: row[2] as string,
      roomCategory: row[3] as string,
      roomSpecifications: parseSpecifications(row[4] as string),
      roomType: parseRoomType(row[5] as string),
      capacity: row[6] as number,
    };
  });

  await uploadJson("events/25live.json", allRows);
};

/**
 * Main entry point: runs both scrapers.
 */
const run25live = async () => {
  // Use stealth plugin
  puppeteer.use(pluginStealth() as unknown as PuppeteerExtraPlugin);

  // Connect to browserless
  console.log("Connecting to browserless...");
  const browser = await puppeteer.connect({
    browserWSEndpoint: env.BROWSERLESS_ENDPOINT,
    protocolTimeout: 15 * 60 * 1000, // 15 minutes
  });

  // Open new page
  console.log("Opening new page...");
  const page = await browser.newPage();

  // Login to CMU portal
  await login(page);

  // Navigate to 25live page and wait for it to load
  await page.goto("https://25live.collegenet.com/pro/cmu#!/home/list");
  await page
    .waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
    .catch(() => {
      throw new Error("Failed to navigate to 25live page.");
    });

  // Scrape calendar data and upload to S3
  await scrape25live(page);

  // Scrape room data and write locally
  await scrapeRoomData(page);

  // Close browser
  await browser.close();
  console.log("Closed browser.");
};

await run25live();
