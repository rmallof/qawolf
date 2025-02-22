import fs from "fs";
import path from "path";
import playwright, { Browser, BrowserContext, Page } from "playwright";
import webpackConfig from "../webpack.config";

type LaunchOptions = {
  devtools?: boolean;
};

export type LaunchResult = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
};

let recorderScript: string;

const getRecorderScriptAsString = async (): Promise<string> => {
  if (recorderScript) return recorderScript;

  // Read the output file that was built by setup-global.js
  const outputFile = path.join(
    webpackConfig.output.path,
    webpackConfig.output.filename
  );
  recorderScript = await fs.promises.readFile(outputFile, "utf8");
  return recorderScript;
};

export const parseBrowserName = (
  name?: string
): "chromium" | "firefox" | "webkit" => {
  if (name === "firefox" || name === "webkit") return name;

  return "chromium";
};

export const launch = async ({ devtools }: LaunchOptions = {}): Promise<
  LaunchResult
> => {
  const browserName = parseBrowserName(process.env.QAWOLF_BROWSER);

  const options = {
    args: browserName === "chromium" ? ["--no-sandbox"] : [],
    devtools,
    headless: !devtools,
  };

  const browser = await playwright[browserName].launch(options);

  // The better way to do this long term would be to get a "context"
  // event added to Browser class in Playwright.
  const originalNewContext = browser.newContext.bind(browser);
  browser.newContext = async (...args): Promise<BrowserContext> => {
    const context = await originalNewContext(...args);
    await context.addInitScript(await getRecorderScriptAsString());

    return context;
  };

  const context = await browser.newContext();
  const page = await context.newPage();

  // workaround since we need to navigate for init script
  await page.goto("file://" + require.resolve("./fixtures/empty.html"));

  return { browser, context, page };
};

export const setBody = async (page: Page, content: string): Promise<void> => {
  await page.setContent(`<html><body>${content}</body></html`);
};
