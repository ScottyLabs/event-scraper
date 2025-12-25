import { config } from "dotenv";
import puppeteer, { type PuppeteerExtraPlugin } from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import env from "./env";
import { scrape25live } from "./services/25live";
import { scrapeHandshake } from "./services/handshake";
import { scrapeTartanConnect } from "./services/tartanConnect";
import { login } from "./utils/login";
import { loadNotifConfig } from "./utils/notif";
import { fetchLatestDeployment, restartDeployment } from "./utils/railway";

config();
const notifConfig = loadNotifConfig();

// Scrape the data
const scrape = async () => {
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
  await scrapeTartanConnect(page);

  // Close browser
  await browser.close();
  console.log("Closed browser.");
};

// Notify the processors that the data is ready
const notify = async () => {
  for (const project of notifConfig) {
    for (const environmentId of project.environmentIds) {
      const deploymentId = await fetchLatestDeployment(
        project.projectId,
        environmentId,
        project.serviceId,
      );

      if (!deploymentId) {
        console.error("No deployment found.");
        return;
      }
      await restartDeployment(deploymentId);
    }
  }
};

await scrape();
await notify();
