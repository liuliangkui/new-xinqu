const CDP = require('chrome-remote-interface');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

const fileUrl = 'file://' + path.resolve('/Users/mac/qucheng/鑫渠蓝皮书.html');
const outDir = '/Users/mac/qucheng/screenshots_modified';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Launch Chrome with remote debugging
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--hide-scrollbars'
  ], {
    stdio: 'ignore',
    detached: true
  });
  chrome.unref();

  // Wait for Chrome to start
  await sleep(2000);

  let client;
  for (let i = 0; i < 10; i++) {
    try {
      client = await CDP({ port: 9222 });
      break;
    } catch (e) {
      await sleep(500);
    }
  }
  if (!client) throw new Error('Could not connect to Chrome');

  const { Page, Runtime, DOM } = client;

  await Page.enable();
  await DOM.enable();

  // Navigate to file
  await Page.navigate({ url: fileUrl });
  await Page.loadEventFired();
  await sleep(1000);

  // Helper: get element position
  async function getElementY(selector) {
    const { result } = await Runtime.evaluate({
      expression: `
        (function() {
          const el = document.querySelector('${selector}');
          if (!el) return -1;
          const rect = el.getBoundingClientRect();
          return window.scrollY + rect.top;
        })()
      `,
      returnByValue: true
    });
    return result.value;
  }

  // Helper: get document height
  async function getDocHeight() {
    const { result } = await Runtime.evaluate({
      expression: `Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight)`,
      returnByValue: true
    });
    return result.value;
  }

  // Helper: capture full page screenshot
  async function captureFullPage(name) {
    const height = await getDocHeight();
    console.log(`Capturing ${name}, document height: ${height}`);
    const { data } = await Page.captureScreenshot({
      format: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1440,
        height: height,
        scale: 1
      },
      captureBeyondViewport: true,
      fromSurface: true
    });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(data, 'base64'));
    console.log(`Saved ${name}.png`);
  }

  // Helper: capture viewport at a specific Y offset
  async function captureAtY(name, y, h = 1200) {
    await Runtime.evaluate({
      expression: `window.scrollTo(0, ${y})`,
      returnByValue: true
    });
    await sleep(500);
    const { data } = await Page.captureScreenshot({
      format: 'png',
      clip: {
        x: 0,
        y: y,
        width: 1440,
        height: h,
        scale: 1
      },
      captureBeyondViewport: true,
      fromSurface: true
    });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(data, 'base64'));
    console.log(`Saved ${name}.png`);
  }

  // 1. Full page
  await captureFullPage('full_page');

  // 2. Cover
  await captureAtY('cover_region', 0, 900);

  // 3. Section 3
  const y3 = await getElementY('#sec3');
  if (y3 >= 0) await captureAtY('sec3_region', y3, 1700);

  // 4. Section 4
  const y4 = await getElementY('#sec4');
  if (y4 >= 0) await captureAtY('sec4_region', y4, 2200);

  // 5. Section 8 (top)
  const y8 = await getElementY('#sec8');
  if (y8 >= 0) await captureAtY('sec8_region', y8, 1000);

  // 6. Section 3 problem priority cards
  const y3p = await getElementY('#sec3');
  if (y3p >= 0) await captureAtY('sec3_problems_region', y3p + 1700, 1800);

  // 7. Section 8 AI-ready section
  const y8ai = await getElementY('#sec8');
  if (y8ai >= 0) {
    // AI-ready is the last subsection; estimate by document height minus some buffer
    const aiY = y8ai + 1600;
    await captureAtY('sec8_ai_region', aiY, 1500);
  }

  await client.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
