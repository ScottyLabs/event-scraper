import { config } from "dotenv";
import puppeteer, { type PuppeteerExtraPlugin } from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import env from "./env";
import { scrape25live } from "./services/25live";
import { scrapeHandshake } from "./services/handshake";
import { login } from "./utils/login";

config();

// Use stealth plugin
puppeteer.use(pluginStealth() as unknown as PuppeteerExtraPlugin);

// Connect to browserless
console.log(`Connecting to browserless...`);
const browser = await puppeteer.connect({
  browserWSEndpoint: env.BROWSERLESS_ENDPOINT,
  protocolTimeout: 15 * 60 * 1000, // 15 minutes
});

// Open new page
console.log("Opening new page...");
const page = await browser.newPage();

// Login to CMU portal
await login(page);

// Scrape
await scrape25live(page);
await scrapeHandshake(browser, page);

// Close browser
await browser.close();
console.log("Closed browser.");
