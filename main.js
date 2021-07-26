const { Cluster } = require("puppeteer-cluster");

var urls = [
  "https://www.google.com/",
  "https://www.porsche.com/",
  "https://www.bmw.com/",
  "https://www.subaru.com/",
  "https://www.bmwseattle.com/",
  "https://www.bmwbellevue.com/",
  "https://www.mercedesbenzofbellevue.com/",
  "https://www.porschebellingham.com/",
  "https://www.porschebellevue.com/",
  "https://www.rentonsubaru.com/",
  "https://www.michaelssubaru.com/",
  "https://www.subaruofpuyallup.com/",
  "https://www.porschebeaverton.com/",
  "https://www.bmwnorthwest.com/",
  "https://www.northwestmini.com/",
];
console.log("Amount of URLs: " + urls.length);

(async () => {
  //Create cluster with 10 workers
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
    monitor: true,
    headless: true,
  });

  // Print errors to console
  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  // Dumb sleep function to wait for page load
  async function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  await cluster.task(async ({ page, data: url, worker }) => {
    // const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    // const page = await browser.newPage();
    console.log("Processing: " + worker.id + url);
    const clickDelay = 3000;
    const waitTimeout = 500000;

    async function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
    // const path = url.replace(/[^a-zA-Z]/g, "_") + ".png";
    //await page.setViewport({ width: 1024, height: 768 });
    let frames = await page.frames();

    await page.screenshot({
      fullPage: true,
      path: `screenshot${worker.id}.png`,
    });
    await page.screenshot({ fullPage: true, path: "screenshot.png" });
    //await page.screenshot({ fullPage: true, path });
    console.log(`Screenshot of ${url} saved`);
  });

  for (let i = 0; i < urls.length; i++) {
    cluster.queue(urls[i]);
  }
  await cluster.idle();
  await cluster.close();
  console.log("Completed, check the screenshots");
})();
