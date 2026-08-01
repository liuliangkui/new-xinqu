const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve('/Users/mac/qucheng/鑫渠高保真原型.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.on('error', (err) => {
  console.error('jsdom error:', err && err.stack ? err.stack : err);
});
virtualConsole.on('jsdomError', (err) => {
  console.error('jsdom jsdomError:', err && err.stack ? err.stack : err);
});

const dom = new JSDOM(html, {
  virtualConsole,
  url: 'http://localhost/qucheng/鑫渠高保真原型.html',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.matchMedia = function() {
      return {
        matches: false,
        media: '',
        onchange: null,
        addListener: function() {},
        removeListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {},
        dispatchEvent: function() { return true; }
      };
    };
    const store = {};
    window.localStorage = {
      getItem: k => store[k] || null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; }
    };
    window.sessionStorage = window.localStorage;
  }
});
const { window } = dom;
const { document } = window;

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function run() {
  // 等待 DOMContentLoaded
  await wait(100);

  const errors = [];
  function assert(cond, msg) {
    if (!cond) errors.push(msg);
  }

  // 默认视图应为 grid
  const gridPanel = document.getElementById('performance-panel-grid');
  const chartPanel = document.getElementById('performance-panel-chart');
  const listPanel = document.getElementById('performance-panel-list');
  assert(gridPanel && !gridPanel.classList.contains('hidden'), '默认视图应为 grid');
  assert(chartPanel && chartPanel.classList.contains('hidden'), 'chart 视图默认应隐藏');
  assert(listPanel && listPanel.classList.contains('hidden'), 'list 视图默认应隐藏');

  // 检查默认标题
  const nameEl = document.getElementById('pf-tab-name');
  assert(nameEl && nameEl.textContent === '我的绩效', '默认标题应为“我的绩效”');

  const tabs = ['mine', 'team', 'region', 'product', 'channel'];
  const expectedCounts = { mine: 3, team: 3, region: 3, product: 3, channel: 3 };
  const rankTitles = {
    mine: '人员达成率排名',
    team: '团队达成率排名',
    region: '区域达成率排名',
    product: '产品线达成率排名',
    channel: '经销商达成率排名'
  };

  for (const tab of tabs) {
    const btn = document.querySelector(`#performance-tabs .tab[data-pftab="${tab}"]`);
    assert(btn, `找不到 ${tab} 标签按钮`);
    btn.click();
    await wait(50);

    // grid 视图过滤
    const visibleGrid = document.querySelectorAll('#performance-panel-grid .pf-card:not(.hidden)');
    assert(visibleGrid.length === expectedCounts[tab], `${tab} grid 视图应显示 ${expectedCounts[tab]} 条，实际 ${visibleGrid.length}`);

    // list 视图过滤
    window.switchPerformanceView('list');
    await wait(50);
    const visibleList = document.querySelectorAll('#performance-panel-list .pf-row:not(.hidden)');
    assert(visibleList.length === expectedCounts[tab], `${tab} list 视图应显示 ${expectedCounts[tab]} 条，实际 ${visibleList.length}`);

    // chart 视图排名
    window.switchPerformanceView('chart');
    await wait(50);
    const rankTitle = document.getElementById('pf-rank-title');
    assert(rankTitle && rankTitle.textContent === rankTitles[tab], `${tab} chart 排名标题应为“${rankTitles[tab]}”，实际“${rankTitle ? rankTitle.textContent : 'null'}”`);

    const rankList = document.getElementById('pf-rank-list');
    assert(rankList, `找不到 pf-rank-list`);
    const rankItems = rankList.querySelectorAll('.flex.items-center.justify-between');
    assert(rankItems.length > 0, `${tab} chart 排名应至少有一条数据`);

    // 排名数据应来自当前 tab
    const firstName = rankItems[0].querySelector('.text-ink')?.textContent || '';
    const expectedFirst = {
      mine: '王强',
      team: '华东销售团队',
      region: '华东区',
      product: '希森美康血球产品线',
      channel: '昆明博奥生物技术有限公司'
    };
    assert(firstName === expectedFirst[tab], `${tab} chart 排名第一应为 ${expectedFirst[tab]}，实际 ${firstName}`);
  }

  if (errors.length) {
    console.error('测试失败:');
    errors.forEach(e => console.error(' - ' + e));
    process.exit(1);
  }
  console.log('✅ 绩效模块测试通过');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
