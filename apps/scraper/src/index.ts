import { config } from "dotenv";
import puppeteer from "puppeteer-core";
import { scrape25live } from "./25live";
import env from "./env";

config();

// Connect to browserless
console.log(`Connecting to browserless...`);
const browser = await puppeteer.connect({
  browserWSEndpoint: env.BROWSERLESS_ENDPOINT,
  protocolTimeout: 15 * 60 * 1000, // 15 minutes
});
console.log("Connected to browserless.");

// Open new page
console.log("Opening new page...");
const page = await browser.newPage();

// Scrape
await scrape25live(page);

// Close browser
await browser.close();
console.log("Closed browser.");
