import { test, expect } from "@playwright/test";

const URL = "https://www.equ.ai";

interface IbuttonNav {
  locator: string;
  expectedOutput: string;
}

test.describe("Minimum Requirements", () => {
  test("Http Response is OK (200) and no Console Error on Log", async ({
    page,
  }) => {
    const logErrors: string[] = [];

    const pageLoad = await page.goto(URL);

    expect(pageLoad?.status()).toBe(200);

    page.on("console", (log) => {
      if (log.type() == "error") {
        logErrors.push(log.text());
      }
    });

    expect(logErrors).toHaveLength(0);
  });

  test("Page contains Equmenopolis", async ({ page }) => {
    await page.goto(URL);
    const pageTitle = await page.title();

    const forTesting = pageTitle;
    // console.log(pageTitle);

    await expect(pageTitle).toContain(forTesting);
  });

  test("CTA Buttons", async ({ page }) => {
    let buttons: IbuttonNav[] = [
      { locator: "About Us", expectedOutput: "https://www.equ.ai/ja/company" },
      {
        locator: "See Open Positions",
        expectedOutput: "https://www.equ.ai/ja/careers",
      },
      {
        locator: "Learn More",
        expectedOutput: "https://www.equ.ai/ja/langx",
      },
    ];

    await page.goto(URL);
    for (const btn of buttons) {
      const btnOption = await page.getByRole("link", { name: btn.locator });
      expect(await btnOption.isVisible()).toBe(true);
      expect(await btnOption.isEnabled()).toBe(true);

      await page.getByRole("link", { name: btn.locator }).click();
      const pagePromiseOpened = await page.waitForEvent("popup");
      const openedPage = pagePromiseOpened;

      expect(openedPage.url()).toBe(btn.expectedOutput);
      await openedPage.close();
    }
  });

  test("Hero Section renders expected copy", async ({ page }) => {
    await page.goto(URL);

    const divContent = await page
      .getByRole("article")
      .locator("div")
      .filter({ hasText: "peopleCareers" })
      .first();

    const divText = await divContent.innerText();
    expect(divText).toContain("Contact");
  });

  test("Home page screen shot", async ({ page }) => {
    await page.goto(URL);

    await page.screenshot({ path: "artifacts/HomePage.png", fullPage: true });
  });
});
