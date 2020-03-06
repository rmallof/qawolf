import { devices } from 'playwright';

interface BuildTemplateOptions {
  device?: string;
  name: string;
  statePath?: string;
  url: string;
}

const REQUIRE_QAWOLF = 'const qawolf = require("qawolf");';

const buildRequires = (device?: string): string => {
  if (!device) return REQUIRE_QAWOLF;

  if (!devices[device]) {
    throw new Error(`Device ${device} not available in Playwright`);
  }

  const requires = `const { devices } = require("playwright");
${REQUIRE_QAWOLF}
const device = devices["${device}"];`;

  return requires;
};

const buildNewContext = (device?: string): string => {
  if (!device) return 'const context = await browser.newContext();';

  const context = `const context = await browser.newContext({
      userAgent: device.userAgent,
      viewport: device.viewport
    });`;

  return context;
};

const buildSetState = (statePath?: string): string => {
  if (!statePath) return '';

  return `\n  await qawolf.setState(page, "${statePath}");`;
};

export const buildScriptTemplate = ({
  device,
  name,
  statePath,
  url,
}: BuildTemplateOptions): string => {
  const code = `${buildRequires(device)}

const ${name} = async context => {
  let page = await context.newPage();
  await page.goto("${url}");${buildSetState(statePath)}
  await qawolf.create();
};

exports.${name} = ${name};

if (require.main === module) {
  (async () => {
    const browser = await qawolf.launch();
    ${buildNewContext(device)}
    await qawolf.register(context);
    await ${name}(context);
    await browser.close();
  })();
}`;

  return code;
};

export const buildTestTemplate = ({
  device,
  name,
  statePath,
  url,
}: BuildTemplateOptions): string => {
  const code = `${buildRequires(device)}

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch();
  ${buildNewContext(device)}
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(() => browser.close());

test('${name}', async () => {
  await page.goto("${url}");${buildSetState(statePath)}
  await qawolf.create();
});`;

  return code;
};
