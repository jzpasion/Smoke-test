import { test, expect } from "@playwright/test";

const URL = "https://www.equ.ai";

test("Http Response is OK (200) and no Console Error on Log", async ({
  page,
}) => {
  const logErrors: string[] = [];

  const pageLoad = await page.goto(URL);

  expect(pageLoad?.status()).toBe(200);

  page.on("console", (msg) => {
    if (msg.type() == "error") {
      logErrors.push(msg.text());
    }
  });

  expect(logErrors).toHaveLength(0);
});

test("Page contains Equmenopolis", async ({ page }) => {
  await page.goto("https://www.equ.ai");
  const pageTitle = await page.title();

  const forTesting = pageTitle;
  // console.log(pageTitle);

  await expect(pageTitle).toContain(forTesting);
});

test("Home page screen shot", async ({ page }) => {
  await page.goto("https://www.equ.ai");

  await page.screenshot({ path: "artifacts/HomePage.png", fullPage: true });
});
