import { config } from "dotenv";
import puppeteer, { type PuppeteerExtraPlugin } from "puppeteer-extra";
import pluginStealth from "puppeteer-extra-plugin-stealth";
import env from "./env";
import { scrape25live } from "./services/25live";
import { scrapeHandshake } from "./services/handshake";
import { scrapeTartanConnect } from "./services/tartanConnect";
import { login } from "./utils/login";
import { loadNotifConfig } from "./utils/notifConfig";
import {
  getProjectWithServicesAndEnvs,
  restartDeployment,
} from "./utils/railway";

config();

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
  const { projectSet, projectToServices } = loadNotifConfig();
  const projects = await getProjectWithServicesAndEnvs();

  // Filter out projects that are not in the NOTIF_CONFIG
  const filteredProjects = projects.filter((project) =>
    projectSet.has(project.name),
  );

  // Restart deployments for each of the filtered projects
  for (const project of filteredProjects) {
    const serviceSet = projectToServices[project.name];
    if (!serviceSet) {
      continue;
    }

    // Filter out services that are not in the NOTIF_CONFIG
    const filteredServices = project.services.filter((service) =>
      serviceSet.includes(service.name),
    );

    // Restart deployments for each filtered services for every environment
    for (const service of filteredServices) {
      for (const environment of project.environments) {
        await restartDeployment(project, environment, service);
      }
    }
  }
};

await scrape();
await notify();
