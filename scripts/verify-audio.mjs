import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const appUrl = process.env.AUDIO_TEST_URL ?? "http://127.0.0.1:3107";
await page.addInitScript(() => {
  window.__trailboundAudioEvents = [];
  const audioContext = window.AudioContext;
  const originalCreateOscillator = audioContext.prototype.createOscillator;
  audioContext.prototype.createOscillator = function createTrackedOscillator() {
    const oscillator = originalCreateOscillator.call(this);
    let scheduledFrequency = oscillator.frequency.value;
    const originalSetFrequency = oscillator.frequency.setValueAtTime.bind(oscillator.frequency);
    oscillator.frequency.setValueAtTime = (value, startTime) => {
      scheduledFrequency = value;
      return originalSetFrequency(value, startTime);
    };
    const originalStart = oscillator.start.bind(oscillator);
    oscillator.start = (...args) => {
      window.__trailboundAudioEvents.push({ frequency: Math.round(scheduledFrequency), at: Math.round(performance.now()) });
      return originalStart(...args);
    };
    return oscillator;
  };
});

await page.goto(appUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "Play adventure" }).click();
await page.waitForTimeout(700);
const introEvents = await page.evaluate(() => window.__trailboundAudioEvents);

await page.getByLabel("Explorer nickname").fill("Audio Test");
await page.getByRole("button", { name: "Set sail →" }).click();
await page.getByRole("button", { name: "Keep going" }).click();
await page.getByRole("button", { name: "Keep going" }).click();
await page.getByRole("button", { name: "Explore the shore" }).click();
await page.waitForTimeout(800);
const allEvents = await page.evaluate(() => window.__trailboundAudioEvents);
await browser.close();

const frequencies = allEvents.map((event) => event.frequency);
const result = {
  introThemeDetected: introEvents.some((event) => event.frequency === 392),
  buttonEffectDetected: frequencies.includes(520) && frequencies.includes(760),
  islandThemeDetected: frequencies.includes(523),
  scheduledAudioEvents: allEvents.length,
  frequencies,
};
console.log(JSON.stringify(result, null, 2));
if (!result.introThemeDetected || !result.buttonEffectDetected || !result.islandThemeDetected) process.exitCode = 1;
