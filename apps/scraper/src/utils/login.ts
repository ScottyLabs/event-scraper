import type { Page } from "puppeteer-core";
import env from "../env";

/**
 * Logs in to the given login portal URL and handles Duo authentication
 */
export async function login(page: Page, url: string, waitForDuoSecs = 180) {
  console.log(`Navigating to login page: ${url}`);
  await page.goto(url);

  // Fill in login form
  console.log("Filling in login form...");
  await page.locator("#username").fill(env.CMU_USERNAME);
  await page.locator("#passwordinput").fill(env.CMU_PASSWORD);
  await page.locator(".loginbutton").click();

  // Wait for Duo prompt
  await page
    .waitForSelector("#trust-browser-button", {
      timeout: waitForDuoSecs * 1000,
    })
    .catch(() => {
      throw new Error("Duo login timeout exceeded.");
    });

  console.log("Approving Duo and continuing...");
  await page.locator("#trust-browser-button").click();

  // Wait for navigation to complete after Duo auth
  console.log("Waiting for navigation to complete after Duo auth...");
  await page
    .waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
    .catch(() => {});

  console.log("Login successful!");
}
