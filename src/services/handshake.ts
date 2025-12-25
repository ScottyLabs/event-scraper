import type { Browser, Page } from "puppeteer-core";
import { uploadJson } from "../utils/s3Utils";

/**
 * Scrapes events from Handshake using the given browser and page.
 * Gets the HSS global cookie from the browser and calls `fetchHandshakeEvents`.
 * @param browser The browser to use for authentication.
 * @param page The page to use for navigation.
 */
export const scrapeHandshake = async (browser: Browser, page: Page) => {
  console.log("Scraping Handshake...");

  // Navigate to Handshake login page
  await page.goto(
    "https://app.joinhandshake.com/login?ref=app-domain&selected_host=cmu.joinhandshake.com",
  );

  // Click the CMU sign-on button, which is the first button in the button-wrapper
  console.log("Clicking the CMU sign-on button...");
  await page.click(".button-wrapper a.sso-button.link-as-button.primary");

  // Wait for navigation to complete after login
  await page
    .waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 }) // 1 minute
    .catch(() => {
      throw new Error("Failed to navigate to Handshake.");
    });

  // Get cookies
  const cookies = await browser.cookies();
  const hssGlobalCookie = cookies.filter(
    (cookie) => cookie.name === "hss-global",
  )?.[0]?.value;
  if (!hssGlobalCookie) {
    console.error("HSS global cookie not found.");
    return;
  }

  // Fetch events from Handshake
  await fetchHandshakeEvents(hssGlobalCookie);
};

/**
 * Fetches events from Handshake using the given HSS global cookie.
 * @param hssGlobalCookie The HSS global cookie to use for authentication.
 * Uploads the events to S3.
 */
const fetchHandshakeEvents = async (hssGlobalCookie: string) => {
  console.log("Fetching events from Handshake...");

  // Construct headers and payload
  const apiUrl = `https://app.joinhandshake.com/stu/graphql`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    cookie: `hss-global=${hssGlobalCookie}`,
  };
  const payload = {
    operationName: "GetEventAbstractions",
    variables: {
      params: {
        employers: [],
        categories: [],
        medium: "HYBRID", // Must be one of: VIRTUAL, IN_PERSON, HYBRID
        sort: "DATE", // Must be one of: RELEVANCE, DATE
        date: "NEXT_30", // Must be one of: TODAY, NEXT_5, NEXT_7, NEXT_10, NEXT_30, PAST_YEAR, ALL
        collection: "ALL",
        searchModels: ["Event", "CareerFair", "MeetingSchedule"],
      },
      first: 100,
    },
    query:
      "query GetEventAbstractions($params: EventAbstractionSearchInput, $first: Int) { eventAbstractions(params: $params, first: $first) { edges { node { id name startDate endDate medium registered categories { name } ... on Event { host { name } studentRegistrationStart studentRegistrationEnd } ... on CareerFair { host { name } studentRegistrationStart studentRegistrationEnd } employers { name } } } } }",
  };

  // Fetch events from Handshake
  const data = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    credentials: "include",
    mode: "cors",
  }).then((resp) => resp.json());

  // Upload data to S3
  console.log(`Uploading Handshake data to S3...`);
  await uploadJson("handshake.json", data);
};
