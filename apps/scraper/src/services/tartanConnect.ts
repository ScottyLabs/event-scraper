import { uploadJson } from "@event-scraper/storage";
import type { Page } from "puppeteer-core";

export const scrapeTartanConnect = async (page: Page) => {
  console.log("Scraping Tartan Connect...");

  // This is the link on the login button on the Tartan Connect page
  // Directly navigating to https://tartanconnect.cmu.edu/events doesn't automatically authenticate
  await page.goto("https://www.campusgroups.com/shibboleth/login?idp=tepper");
  await page
    .waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
    .catch(() => {
      throw new Error("Failed to navigate to Tartan Connect page.");
    });

  // Fetch the events
  const events = await page.evaluate(async () => {
    const response = await fetch(
      "https://tartanconnect.cmu.edu/mobile_ws/v17/mobile_events_list?range=0",
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
          Referer: "https://tartanconnect.cmu.edu/events",
        },
      },
    );
    return await response.json();
  });

  // Upload the events to S3
  await uploadJson("tartanConnect.json", events);
};
