require("dotenv").config();
const {readFile} = require("fs").promises;
const puppeteer = require("puppeteer");

const args = process.argv.slice(2).reduce((a, e, i, arr) => {
  if (e.startsWith("--")) {
    a[e] = arr[i+1];
  }

  return a;
}, {});
const listName = args["--list"];
const filePath = args["--file"];
const {user: username, password} = process.env;

if (!username || !password) {
  console.error("set user= and password= in the .env file");
  process.exit();
}
else if (!listName || !filePath) {
  console.error('usage: node discogs-list-upload.js --file ' +
    'path/to/list.json --list "existing list name to upload to"');
  process.exit();
}
 
(async () => {
  const {items} = JSON.parse(await readFile(filePath));
  let browser;

  try {
    browser = await puppeteer.launch({
      userDataDir: "browser_data",
      headless: true, 
    });
    const [page] = await browser.pages();
    await page.setDefaultNavigationTimeout(120000);
    await page.setRequestInterception(true);
    page.on("request", req => {
      if (req.resourceType() === "image") {
        req.abort();
      }
      else {
        req.continue();
      }
    });

    await page.goto(
      "https://www.discogs.com/login", 
      {waitUntil: "networkidle0"}
    );

    if (await page.$("#onetrust-accept-btn-handler")) {
      await page.waitForSelector(
        "#onetrust-accept-btn-handler", 
        {visible: true}
      );
      await page.click("#onetrust-accept-btn-handler");
    }

    if (await page.$("#username")) {
      await page.type("#username", username);
      await page.type("#password", password);
      await Promise.all([
        page.waitForNavigation({waitUntil: "domcontentloaded"}),
        page.click('button[type="submit"]'),
      ]);
    }

    for (const {uri} of items) {
      await page.goto(uri, {waitUntil: "domcontentloaded"});
      await page.waitForSelector("#list .add_to_list");
      
      for (let tries = 0; 
           !(await page.$("#list_oldpick")) && tries < 50; tries++) {

        await page.evaluate(() => 
          document.querySelector("#list .add_to_list").click())
        ;
        await new Promise(res => setTimeout(res, 1000));
      }
      
      const found = await page.evaluate(listName => {
        const el = [...document.querySelectorAll("#list_oldpick option")]
          .find(option => option.text === listName)
        ;
        return el && (el.selected = true);
      }, listName);

      if (!found) {
        console.error(`list '${listName}' wasn't found ` +
          `-- please ensure this list exists for account ${username}`);
        break;
      }

      await page.click(".lists_list_add_save");
    }
  }
  catch (err) {
    console.error(err);
  }
  finally {
    await browser.close();
  }
})();

