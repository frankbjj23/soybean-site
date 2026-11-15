const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "qa-output");
const pages = [
  "index.html",
  "about.html",
  "buy-soybeans.html",
  "corn.html",
  "contact.html",
  "404.html",
];
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
fs.mkdirSync(output, { recursive: true });

// A temporary local server lets the tests exercise ordinary HTTP loading.
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  );
  let relative = pathname === "/" ? "index.html" : pathname.slice(1);
  if (!path.extname(relative)) relative += ".html";
  let file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    file = path.join(root, "404.html");
    res.statusCode = 404;
  }
  res.setHeader(
    "Content-Type",
    types[path.extname(file)] || "application/octet-stream",
  );
  res.end(fs.readFileSync(file));
});

async function run() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.CHROME_CHANNEL === "chromium" ? undefined : "chrome",
  });
  const failures = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (error) => failures.push(error.message));
    const viewports = [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const file of pages) {
        await page.goto(base + "/" + file);
        await page.evaluate(async () => {
          await document.fonts.ready;
          document.querySelectorAll("img").forEach((img) => {
            img.loading = "eager";
          });
          await Promise.all(
            [...document.images].map((img) => img.decode().catch(() => {})),
          );
        });
        const report = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          brokenImages: [...document.images]
            .filter((img) => !img.complete || !img.naturalWidth)
            .map((img) => img.src),
          headings: document.querySelectorAll("h1").length,
          json: [
            ...document.querySelectorAll('script[type="application/ld+json"]'),
          ].map((el) => JSON.parse(el.textContent)),
          links: [...document.querySelectorAll("a[href]")].map((a) =>
            a.getAttribute("href"),
          ),
          centered: [...document.querySelectorAll("h1,h2,h3,p,label")]
            .filter(
              (el) =>
                el.getClientRects().length &&
                getComputedStyle(el).textAlign !== "center",
            )
            .map((el) => el.textContent.slice(0, 60)),
          oldContacts: /Mitch|Gluckman|Joseph|Mauro/.test(
            document.body.textContent,
          ),
        }));
        const label = file + " at " + viewport.width;
        assert.equal(report.overflow, false, label + ": horizontal overflow");
        assert.deepEqual(report.brokenImages, [], label + ": broken images");
        assert.equal(report.headings, 1, label + ": expected one H1");
        assert.equal(report.oldContacts, false, label + ": old contacts");
        if (viewport.width <= 640)
          assert.deepEqual(
            report.centered,
            [],
            label + ": mobile text alignment",
          );
        if (viewport.width === 390 || viewport.width === 1440) {
          await page.addScriptTag({
            path: require.resolve("axe-core/axe.min.js"),
          });
          const audit = await page.evaluate(async () =>
            (
              await axe.run(document, {
                runOnly: {
                  type: "tag",
                  values: ["wcag2a", "wcag2aa", "wcag21aa"],
                },
              })
            ).violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => n.target),
            })),
          );
          assert.deepEqual(
            audit,
            [],
            label + ": accessibility violations " + JSON.stringify(audit),
          );
        }
        if (viewport.width === 1440) {
          for (const href of report.links) {
            if (/^(mailto:|tel:|https?:)/.test(href)) continue;
            const target = new URL(href, base + "/" + file);
            const response = await page.request.get(target.href);
            assert.equal(
              response.status(),
              200,
              label + ": broken link " + href,
            );
            if (target.hash) {
              const html = await response.text();
              assert(
                html.includes('id="' + target.hash.slice(1) + '"'),
                label + ": missing anchor " + href,
              );
            }
          }
        }
        if (
          [390, 1440].includes(viewport.width) &&
          ["index.html", "contact.html", "buy-soybeans.html"].includes(file)
        ) {
          await page.screenshot({
            path: path.join(
              output,
              file.replace(".html", "") + "-" + viewport.width + ".png",
            ),
            fullPage: true,
          });
        }
      }
      console.log("Validated six pages at " + viewport.width + "px.");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/index.html");
    await page.getByRole("button", { name: "Open navigation" }).click();
    assert.equal(
      await page.locator(".nav-toggle").getAttribute("aria-expanded"),
      "true",
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator(".nav-toggle").getAttribute("aria-expanded"),
      "false",
    );
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .locator("#main-nav")
      .getByRole("link", { name: "Corn", exact: true })
      .click();
    assert(page.url().endsWith("/corn.html"));

    await page.goto(base + "/contact.html?product=corn#quote");
    assert.equal(await page.locator('[name="product"]').inputValue(), "corn");
    await page.getByRole("button", { name: "Review Request" }).click();
    assert.equal(await page.locator("#quote-review").isVisible(), false);
    await page.locator('[name="name"]').fill("QA Buyer");
    await page.locator('[name="company"]').fill("Sample Trading");
    await page.locator('[name="email"]').fill("buyer@example.com");
    await page.locator('[name="quantity"]').fill("5000");
    await page
      .locator('[name="destination"]')
      .fill("Port of Rotterdam, Netherlands");
    await page.locator('[name="terms"]').selectOption("CIF");
    await page
      .locator('[name="message"]')
      .fill("Please discuss specifications. <script>invalid</script>");
    await page.getByRole("button", { name: "Review Request" }).click();
    assert.equal(await page.locator("#quote-review").isVisible(), true);
    const mail = new URL(
      await page.locator("#email-request").getAttribute("href"),
    );
    assert.equal(mail.pathname, "sales@agroexpress.farm");
    assert(mail.searchParams.get("body").includes("5000 metric tons"));
    assert(mail.searchParams.get("body").includes("GMO corn"));
    assert.equal(await page.locator("#quote-summary script").count(), 0);
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async (text) => {
            window.copiedRequest = text;
          },
        },
        configurable: true,
      }),
    );
    await page.getByRole("button", { name: "Copy Request" }).click();
    assert(
      (await page.evaluate(() => window.copiedRequest)).includes(
        "Sample Trading",
      ),
    );
    await page.getByRole("button", { name: "Edit details" }).click();
    assert.equal(await page.locator('[name="quantity"]').inputValue(), "5000");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base + "/index.html");
    assert.equal(
      await page
        .locator(".moving-arrow")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    assert.equal(
      (await page.request.get(base + "/missing-page")).status(),
      404,
    );
    await page.goto(base + "/missing/nested-page");
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    });
    assert.equal(
      await page.evaluate(() => [...document.images].every((img) => img.naturalWidth > 0)),
      true,
      "Nested 404 page must load its assets",
    );
    assert.deepEqual(failures, [], "Browser JavaScript errors");
    console.log(
      "Navigation, quote review/edit/copy, preselection, required fields, safe text rendering, reduced motion, links, schemas and 404 checks passed.",
    );
  } finally {
    await browser.close();
  }
}
run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
