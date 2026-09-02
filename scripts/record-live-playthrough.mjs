import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve("output/playwright/trailbound-demo");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: outputDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const pause = (seconds) => page.waitForTimeout(seconds * 1000);

await page.addInitScript(() => {
  window.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
      * { cursor: none !important; }
      #demo-cursor { position: fixed; width: 24px; height: 24px; border-radius: 50%; background: #ffb547; border: 4px solid white; box-shadow: 0 3px 12px rgba(0,0,0,.35); z-index: 2147483647; pointer-events: none; transform: translate(-50%,-50%); left: 50%; top: 50%; }
      .demo-click { position: fixed; width: 28px; height: 28px; border: 5px solid #ff6b4b; border-radius: 50%; z-index: 2147483646; pointer-events: none; transform: translate(-50%,-50%); animation: demo-ring .55s ease-out forwards; }
      @keyframes demo-ring { to { width: 78px; height: 78px; opacity: 0; } }
    `;
    document.head.appendChild(style);
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    document.body.appendChild(cursor);
    document.addEventListener("pointermove", (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    document.addEventListener("pointerdown", (event) => {
      const ring = document.createElement("div");
      ring.className = "demo-click";
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      document.body.appendChild(ring);
      window.setTimeout(() => ring.remove(), 600);
    });
  });
});

async function click(locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Could not locate visible click target.");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 14 });
  await pause(0.5);
  await locator.click();
}

await page.goto("https://trailbound-survival-island.vercel.app", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.mouse.move(190, 560, { steps: 18 });
await pause(6);

await click(page.getByRole("button", { name: "Play adventure" }));
await pause(3);
await click(page.getByRole("button", { name: "Choose avatar 🧑🏿‍🔬" }));
const nickname = page.getByLabel("Explorer nickname");
await click(nickname);
await nickname.pressSequentially("Nova", { delay: 180 });
await click(page.getByLabel("Learning trail"));
await page.getByLabel("Learning trail").selectOption("5");
await pause(4);
await click(page.getByRole("button", { name: "Set sail →" }));

await pause(4);
await click(page.getByRole("button", { name: "Keep going" }));
await pause(4);
await click(page.getByRole("button", { name: "Keep going" }));
await pause(4);
await click(page.getByRole("button", { name: "Explore the shore" }));
await pause(7);

await click(page.getByRole("button", { name: "Stormbreak Beach" }));
await pause(4);
await click(page.getByRole("button", { name: "Start challenge" }));
await pause(6);
await click(page.getByRole("button", { name: "18 meters" }));
await click(page.getByRole("button", { name: "Check my plan" }));
await pause(6);
await click(page.getByRole("button", { name: "24 meters" }));
await click(page.getByRole("button", { name: "Check my plan" }));
await pause(6);
await click(page.getByRole("button", { name: "Back to the island" }));
await pause(4);

await click(page.getByRole("button", { name: "Craft", exact: true }));
await pause(4);
const axeCard = page.locator(".craft-list article").filter({ hasText: "Stone Axe" });
await click(axeCard.getByRole("button", { name: "Craft" }));
await pause(5);
await click(page.locator(".panel-sheet .close-button"));
await pause(3);

await click(page.getByRole("button", { name: "Go" }));
await pause(4);
await click(page.getByRole("button", { name: "Start challenge" }));
await pause(5);
for (const step of ["Choose high ground", "Raise the frame", "Tie the roof"]) {
  await click(page.getByRole("button", { name: step }));
  await pause(1.5);
}
await click(page.getByRole("button", { name: "Check my plan" }));
await pause(6);
await click(page.getByRole("button", { name: "Back to the island" }));
await pause(5);

await click(page.getByRole("button", { name: "Quests", exact: true }));
await pause(6);
await click(page.locator(".panel-sheet .close-button"));
await click(page.getByRole("button", { name: "Pack", exact: true }));
await pause(6);
await click(page.locator(".panel-sheet .close-button"));
await click(page.getByRole("button", { name: "Camp", exact: true }));
await pause(6);
await click(page.locator(".panel-sheet .close-button"));
await click(page.getByRole("button", { name: "Me", exact: true }));
await pause(5);
await click(page.getByRole("button", { name: "Parent progress view" }));
await pause(14);

const video = page.video();
await context.close();
if (!video) throw new Error("Playwright did not create a video.");
await video.saveAs(resolve(outputDir, "live-playthrough-raw.webm"));
await browser.close();
console.log(resolve(outputDir, "live-playthrough-raw.webm"));
