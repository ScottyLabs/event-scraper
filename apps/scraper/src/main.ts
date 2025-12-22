// load env

import { config } from "dotenv";
import puppeteer from "puppeteer-core";
import { scrape25live } from "./25live/main";
import env from "./env";

config();

console.log(`Connecting to browserless...`);
const browser = await puppeteer.connect({
  browserWSEndpoint: env.BROWSERLESS_ENDPOINT,
  protocolTimeout: 15 * 60 * 1000, // 15 minutes
});
console.log("Connected to browserless.");

console.log("Opening new page...");
const page = await browser.newPage();
await scrape25live(page);

await browser.close();
console.log("Closed browser.");
