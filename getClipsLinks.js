const fs = require("node:fs");
const playwright = require("playwright");

const getClipsLink = async () => {
  const launchOptions = {
    headless: true,
  };
  const browser = await playwright.firefox.launch(launchOptions);
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Browser ready')

  const maxClips = 21;
  let isKeepLoading = true;
  let counts = 0;
  let tries = 0;
  try {
    await page.goto(
      "https://www.twitch.tv/alehahze/videos?filter=clips&range=24hr"
    );
    await page.waitForTimeout(5000);

    await page.getByText("1K followers").dblclick();
    await page
      .locator(".scrollable-trigger__trigger-area--up")
      .scrollIntoViewIfNeeded();

    while (isKeepLoading) {
      let itemsCount = await page.evaluate(() => {
        const items = document.querySelectorAll(
          '[data-a-target="preview-card-image-link"]'
        );

        return items.length;
      });

      if (itemsCount >= maxClips || (tries === 2 && counts === itemsCount)) {
        isKeepLoading = false;
        break;
      }

      if (itemsCount < maxClips) {
        counts = itemsCount;
        tries++;
        await page
          .locator(".scrollable-trigger__trigger-area--up")
          .scrollIntoViewIfNeeded();
      }
    }

    const links = await page.evaluate(() => {
      const links = [];
      const items = document.querySelectorAll(
        '[data-a-target="preview-card-image-link"]'
      );
      for (const item of items) {
        links.push(item.href);
      }
      return links;
    });

    const clips = [];

    console.info("SEARCHING CLIPS LINK");

    for (const link of links) {
      await page.goto(link);
      await page.locator("video").waitFor();
      await page.waitForTimeout(1400);

      const clipLink = await page.locator("video").evaluate((video) => {
        video.muted = true;
        return video.src;
      });

      clips.push(clipLink);
    }

    fs.writeFileSync("clips.txt", clips.join("\n"));
  } finally {
    await context.close();
    await browser.close();
  }
}

module.exports = getClipsLink