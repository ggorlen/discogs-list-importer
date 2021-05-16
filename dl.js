const puppeteer = require("puppeteer");

(async () => {
  let browser;
  const url = `https://www.discogs.com/lists/desert-island/190092?limit=250`;

  try {
    browser = await puppeteer.launch({headless: false});
    const [page] = await browser.pages();
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", req => {
      if (req.resourceType() === "image") {
        req.abort();
      }
      else {
        req.continue();
      }
    });

    await page.goto(url, {waitUntil: "domcontentloaded"});
    const list = [];
    
    for (;;) {
      await page.waitForSelector(".listitem_data");
      const res = await page.$$eval(
        ".listitem_data",
        els => [...els].map(e => ({
          title: e.querySelector(".listitem_title").textContent.trim(),
          href: e.querySelector(".listitem_title a").href,
          comment: e.querySelector(".listitem_comment p").textContent,
        }))
      );
      list.push(...res);

      if (!(await page.$("a.pagination_next"))) {
        break;
      }

      await Promise.all([
        page.waitForNavigation({waitUntil: "domcontentloaded"}),
        page.click("a.pagination_next"),
      ]);
    }

    console.log(JSON.stringify(list, null, 2));
  }
  catch (err) {
    console.error(err);
  }
  finally {
    await browser.close();
  }
})();

