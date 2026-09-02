import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve("output/playwright/trailbound-demo");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({
  viewport: { width: 430, height: 780 },
  recordVideo: { dir: outputDir, size: { width: 430, height: 780 } },
});
const page = await context.newPage();
const pause = (seconds) => page.waitForTimeout(seconds * 1000);

await page.goto("https://trailbound-survival-island.vercel.app", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await pause(7);

await page.getByRole("button", { name: "Play adventure" }).click();
await pause(4);
await page.getByRole("button", { name: "Choose avatar 🧑🏿‍🔬" }).click();
await page.getByLabel("Explorer nickname").fill("Nova");
await page.getByLabel("Learning trail").selectOption("5");
await pause(5);
await page.getByRole("button", { name: "Set sail →" }).click();

await pause(4);
await page.getByRole("button", { name: "Keep going" }).click();
await pause(4);
await page.getByRole("button", { name: "Keep going" }).click();
await pause(4);
await page.getByRole("button", { name: "Explore the shore" }).click();
await pause(8);

await page.getByRole("button", { name: "Stormbreak Beach" }).click();
await pause(5);
await page.getByRole("button", { name: "Start challenge" }).click();
await pause(7);
await page.getByRole("button", { name: "18 meters" }).click();
await page.getByRole("button", { name: "Check my plan" }).click();
await pause(7);
await page.getByRole("button", { name: "24 meters" }).click();
await page.getByRole("button", { name: "Check my plan" }).click();
await pause(7);
await page.getByRole("button", { name: "Back to the island" }).click();
await pause(5);

await page.getByRole("button", { name: "Craft", exact: true }).click();
await pause(5);
const axeCard = page.locator(".craft-list article").filter({ hasText: "Stone Axe" });
await axeCard.getByRole("button", { name: "Craft" }).click();
await pause(6);
await page.locator(".panel-sheet .close-button").click();
await pause(4);

await page.getByRole("button", { name: "Go" }).click();
await pause(5);
await page.getByRole("button", { name: "Start challenge" }).click();
await pause(6);
for (const step of ["Choose high ground", "Raise the frame", "Tie the roof"]) {
  await page.getByRole("button", { name: step }).click();
  await pause(2);
}
await page.getByRole("button", { name: "Check my plan" }).click();
await pause(7);
await page.getByRole("button", { name: "Back to the island" }).click();
await pause(6);

await page.getByRole("button", { name: "Quests", exact: true }).click();
await pause(7);
await page.locator(".panel-sheet .close-button").click();
await page.getByRole("button", { name: "Pack", exact: true }).click();
await pause(7);
await page.locator(".panel-sheet .close-button").click();
await page.getByRole("button", { name: "Camp", exact: true }).click();
await pause(7);
await page.locator(".panel-sheet .close-button").click();
await page.getByRole("button", { name: "Me", exact: true }).click();
await pause(5);
await page.getByRole("button", { name: "Parent progress view" }).click();
await pause(14);

await page.goto("https://trailbound-survival-island.vercel.app", { waitUntil: "networkidle" });
await pause(10);

const video = page.video();
await context.close();
if (!video) throw new Error("Playwright did not create a video.");
await video.saveAs(resolve(outputDir, "gameplay-mobile.webm"));
await browser.close();

function renderMusicWav(durationSeconds = 170, sampleRate = 22050) {
  const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 0];
  const bass = [130.81, 146.83, 174.61, 196];
  const samples = Math.floor(durationSeconds * sampleRate);
  const data = Buffer.alloc(samples * 2);
  const beatDuration = 0.31;
  for (let index = 0; index < samples; index += 1) {
    const time = index / sampleRate;
    const beat = Math.floor(time / beatDuration);
    const local = time % beatDuration;
    const frequency = melody[beat % melody.length];
    const envelope = Math.min(1, local / 0.02) * Math.exp(-local * 7);
    const lead = frequency ? (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * local)) * envelope * 0.13 : 0;
    const bassFrequency = bass[Math.floor(beat / 4) % bass.length];
    const bassLocal = time % (beatDuration * 4);
    const bassEnvelope = Math.min(1, bassLocal / 0.04) * Math.exp(-bassLocal * 1.8);
    const bassWave = Math.sin(2 * Math.PI * bassFrequency * bassLocal) * bassEnvelope * 0.07;
    const value = Math.max(-1, Math.min(1, lead + bassWave));
    data.writeInt16LE(Math.round(value * 32767), index * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + data.length, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

await writeFile(resolve(outputDir, "island-theme.wav"), renderMusicWav());
console.log(outputDir);
