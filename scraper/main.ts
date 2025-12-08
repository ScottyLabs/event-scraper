import puppeteer from 'puppeteer-core';
import surf from './surfer';
import { client } from './db';

const WAIT_FOR_DUO_PROMPT_SECS = 180; // 3 minutes
const BROWSERLESS_URI = process.env.BROWSERLESS_URI || 'ws://localhost:3000';

// print pid
console.log(`Scraper PID: ${process.pid}`);

console.log(`Connecting to browserless at ws://${BROWSERLESS_URI}...`);
const browser = await puppeteer.connect({
  browserWSEndpoint: `${BROWSERLESS_URI}`,
});
console.log("Connected to browserless.");

console.log("Opening new page...");
const page = await browser.newPage();
await page.goto('https://25live.collegenet.com/pro/cmu#!/home/list');

if (!process.env.CMU_USERNAME || !process.env.CMU_PASSWORD) {
  console.error("CMU_USERNAME and CMU_PASSWORD environment variables must be set.");
  await browser.close();
  process.exit(1);
}

// Phase 1: Log in to the university's authentication portal
console.log("Filling in login form...");
await page.locator('#username').fill(process.env.CMU_USERNAME);
await page.locator('#passwordinput').fill(process.env.CMU_PASSWORD);
await page.locator('.loginbutton').click();

// Phase 2: Handle Duo two-factor authentication (wait for 2FA approval)
console.log("Duo is up next, waiting for user to complete 2FA...");
await page.waitForSelector('#trust-browser-button', { timeout: WAIT_FOR_DUO_PROMPT_SECS * 1000 });

// Click the "Trust Browser" button to proceed after Duo authentication
console.log("Duo completed, clicking 'Trust Browser'...");
await page.locator('#trust-browser-button').click();

// wait for navigation to complete after Duo authentication
console.log("Waiting for navigation to complete after Duo authentication...");
await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 6000 }).catch(() => {});

if (!page.url().includes('25live.collegenet.com')) {
    console.error("Duo authentication failed or was not completed in time.");
    await browser.close();
    process.exit(1);
}

console.log("Logged in successfully! Starting surfing...");
await surf(page, { start: new Date('2025-12-08'), end: new Date('2025-12-10') })
  .then(() => console.log('Surfing completed'))
  .catch(err => console.error('Error during surfing:', err));
  
// Close the browser when done
await browser.close();
console.log('Browser closed');

// Close database connection
await client.end();
console.log('Database connection closed');
console.log('Scraper finished successfully');