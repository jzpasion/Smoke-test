import { test, expect, Page, devices } from "@playwright/test";

const URL = "https://www.equ.ai";

interface Ilocators {
  name: string;
  expectedLink: string;
}

interface IlocatorSpecial extends Ilocators {
  openNewPage: boolean;
}

interface IbuttonNav extends IlocatorSpecial {
  arrangement: number;
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

  test("Page contains Equmenopolis (株式会社エキュメノポリス)", async ({
    page,
  }) => {
    await page.goto(URL);
    const pageTitle = "株式会社エキュメノポリス";

    await expect(page).toHaveTitle(pageTitle);
  });

  test("Navigation links are visible and clickable", async ({
    page,
  }, testInfo) => {
    let navLink: Ilocators[] = [
      {
        name: "LANGX",
        expectedLink: "https://www.equ.ai/ja/langx",
      },
      {
        name: "Company",
        expectedLink: "https://www.equ.ai/ja/company",
      },

      /* Adding a comment here due to a bug on the website
       * News is Duplicated on Mobile view  */

      // {
      //   name: "Careers",
      //   expectedLink: "https://www.equ.ai/ja/careers",
      // },
      // {
      //   name: "News",
      //   expectedLink: "https://www.equ.ai/ja/news/all",
      // },
      {
        name: "Contact",
        expectedLink: "https://www.equ.ai/ja/contact",
      },
    ];

    await page.goto(URL);
    const isMobile = testInfo.project.use.isMobile;
    for (const link of navLink) {
      if (isMobile) {
        await isMobileMenuClick(page);
      }
      const navPage = isMobile
        ? await page.getByRole("link", { name: link.name })
        : await page.locator("#top").getByRole("link", { name: link.name });

      await visbilityAndOutputCheck(navPage, page, link.expectedLink, false);
    }
  });

  test("Hero Section renders expected copy", async ({ page }) => {
    await page.goto(URL);

    const divContent = await page
      .getByRole("article")
      .locator("div")
      .filter({ hasText: "Towards Human-AI Co-Evolving" })
      .first();

    const divText = await divContent.innerText();
    const heroSubstring =
      "教育や仕事の様々な場面に会話AIエージェントを派遣し、創造性と生産性を向上させる";
    expect(divText).toContain(heroSubstring);
  });

  test("Home page screen shot", async ({ page }, testInfo) => {
    await page.goto(URL);

    await page.screenshot({
      path: testInfo.project.use.isMobile
        ? "artifacts/HomePage_mobile.png"
        : "artifacts/HomePage.png",
      fullPage: true,
    });
  });

  test("Test for button is in the viewport (Desktop and Mobile)", async ({
    page,
  }) => {
    await page.goto(URL);
    const getInTouchBtn = await page
      .locator("section")
      .filter({ hasText: "Towards Human-AI Co-Evolving" })
      .getByRole("link");

    await expect(getInTouchBtn).toBeInViewport();
    await expect(getInTouchBtn).toBeEnabled();
    await expect(getInTouchBtn).toBeVisible();

    /* without using toBeInViewport */

    const buttonPosition = await getInTouchBtn.boundingBox();

    const viewPort = page.viewportSize();

    if (buttonPosition && viewPort) {
      const isInViewport =
        buttonPosition.y + buttonPosition.height > 0 &&
        buttonPosition.y < viewPort.height;

      expect(isInViewport).toBe(true);
    }

    await expect(getInTouchBtn).toBeEnabled();
    await expect(getInTouchBtn).toBeVisible();
  });
});

test.describe("Other Tests", () => {
  test("Buttons contents are displayed and clickable (expecting correct URL upon click)", async ({
    page,
  }) => {
    let buttons: IbuttonNav[] = [
      {
        name: "About Us",
        expectedLink: "https://www.equ.ai/ja/company",
        openNewPage: true,
        arrangement: 0,
      },
      {
        name: "Learn More",
        expectedLink: "https://www.equ.ai/ja/langx",
        openNewPage: true,
        arrangement: 0,
      },
      {
        name: "See Open Positions",
        expectedLink: "https://www.equ.ai/ja/careers",
        openNewPage: true,
        arrangement: 0,
      },
      {
        name: "Get In Touch",
        expectedLink: "https://www.equ.ai/ja/contact",
        openNewPage: false,
        arrangement: 1,
      },
    ];

    await page.goto(URL);

    /* Get In Touch button because it has different syntax for button click */

    const getInTouchBtn = await page
      .locator("section")
      .filter({ hasText: "Towards Human-AI Co-Evolving" })
      .getByRole("link");

    await visbilityAndOutputCheck(
      getInTouchBtn,
      page,
      "https://www.equ.ai/ja/contact",
      true
    );

    for (const btn of buttons) {
      let btnOption = await page
        .getByRole("link", { name: btn.name })
        .nth(btn.arrangement);

      await visbilityAndOutputCheck(
        btnOption,
        page,
        btn.expectedLink,
        btn.openNewPage
      );
    }
  });

  test("Research Navigation functionality", async ({ page }, testInfo) => {
    await page.goto(URL);

    const hoverItems: Ilocators[] = [
      {
        name: "Overview",
        expectedLink: "https://www.equ.ai/ja/research",
      },
      {
        name: "Dialogue Systems",
        expectedLink: "https://www.equ.ai/ja/research/dialogue-systems",
      },
      {
        name: "Assessment and Learning",
        expectedLink: "https://www.equ.ai/ja/research/assessment-and-learning",
      },
      {
        name: "Social Innovation",
        expectedLink: "https://www.equ.ai/ja/research/social-innovation",
      },
    ];

    const isMobile = testInfo.project.use.isMobile;

    for (const hItem of hoverItems) {
      if (isMobile) {
        await isMobileMenuClick(page);
      }

      await page.getByRole("button", { name: "Research" }).hover();

      const hLink = await page.getByRole("link", { name: hItem.name });

      await visbilityAndOutputCheck(hLink, page, hItem.expectedLink, false);
    }
  });

  test("Other Clickable contents are displayed and clickable (expecting correct URL upon click)", async ({
    page,
  }) => {
    await page.goto(URL);

    const clickableItems: IlocatorSpecial[] = [
      {
        name: "NEW エキュメノポリス、創業3周年",
        expectedLink: "https://www.equ.ai/ja/posts/B_YsANpX",
        openNewPage: true,
      },
      {
        name: "エキュメノポリス、創業3周年 2025/5/2",
        expectedLink: "https://www.equ.ai/ja/posts/B_YsANpX",
        openNewPage: false,
      },
      {
        name: "JST A-STEP 実装支援 に採択 2025/5/1",
        expectedLink: "https://www.equ.ai/ja/posts/vsdsx06n",
        openNewPage: false,
      },
      {
        name: "「第10回 JEITAベンチャー賞」を受賞 2025/3/",
        expectedLink: "https://www.equ.ai/ja/posts/rjJqdzA3",
        openNewPage: false,
      },
    ];

    for (const clickableItem of clickableItems) {
      const clickItem = await page.getByRole("link", {
        name: clickableItem.name,
      });

      await visbilityAndOutputCheck(
        clickItem,
        page,
        clickableItem.expectedLink,
        clickableItem.openNewPage
      );
    }
  });

  test("Changing Languange to english (Title Update to english)", async ({
    page,
  }, testInfo) => {
    await page.goto(URL);

    const isMobile = testInfo.project.use.isMobile;

    if (isMobile) {
      await isMobileMenuClick(page);
    } else {
      await page.getByRole("button", { name: "日本語" }).hover();
    }

    await page.getByRole("link", { name: "English" }).click();

    const pageTitle = "Equmenopolis, Inc.";

    await expect(page).toHaveTitle(pageTitle);
  });
});

const visbilityAndOutputCheck = async (
  item: any,
  page: Page,
  expectedLink: string,
  opensNewPage: boolean
) => {
  await item.waitFor({ state: "visible", timeout: 3000 });
  await expect(item).toBeVisible();
  await expect(item).toBeEnabled();

  await item.click();

  let openedPage;

  if (opensNewPage) {
    openedPage = await page.waitForEvent("popup");
    await openedPage.waitForLoadState("load");

    await expect(openedPage.url()).toBe(expectedLink);
    await openedPage.waitForLoadState("load");
    await openedPage.close();
  } else {
    await expect(page).toHaveURL(expectedLink);
    await page.waitForLoadState("load");
  }

  await page.goto(URL);
};

const isMobileMenuClick = async (page) => {
  await page.getByRole("button", { name: "" }).click();
  await page.waitForTimeout(1500); //Putting an timeout here because we need to wait for all the menu to show
};
