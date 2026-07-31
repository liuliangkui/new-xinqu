const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HTML_PATH = 'file:///Users/mac/qucheng/鑫渠高保真原型.html';
const OUTPUT_DIR = '/Users/mac/qucheng/screenshots';

const views = [
  { name: 'workbench', label: '工作台' },
  { name: 'apps', label: '应用中心' },
  { name: 'messages', label: '消息中心' },
  { name: 'calendar', label: '日历与日程' },
  { name: 'leads', label: '线索管理' },
  { name: 'intentions', label: '意向管理' },
  { name: 'customer360', label: '客户360°' },
  { name: 'dealers', label: '代理商管理' },
  { name: 'workorders', label: '工单管理' },
  { name: 'approvals', label: '审批中心' },
  { name: 'dashboard', label: '经营驾驶舱' },
  { name: 'settings', label: '后台设置' }
];

(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto(HTML_PATH, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for the page to fully render
  await page.waitForFunction(() => typeof switchView === 'function', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));

  const results = [];
  for (const view of views) {
    try {
      await page.evaluate((viewName) => {
        if (typeof switchView === 'function') {
          switchView(viewName);
        }
      }, view.name);
      // Wait for transition and rendering
      await new Promise(r => setTimeout(r, 1200));

      const fileName = `${view.name}.png`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      await page.screenshot({ path: filePath, fullPage: false });
      results.push({ view: view.name, label: view.label, path: filePath, status: 'ok' });
      console.log(`Captured: ${view.label} -> ${filePath}`);
    } catch (err) {
      results.push({ view: view.name, label: view.label, error: err.message, status: 'error' });
      console.error(`Failed: ${view.label} -> ${err.message}`);
    }
  }

  await browser.close();

  const summaryPath = path.join(OUTPUT_DIR, 'capture-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log(`\nDone. Summary written to ${summaryPath}`);
})();
