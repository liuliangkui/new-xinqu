const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('/Users/mac/qucheng/鑫渠高保真原型.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/qucheng/鑫渠高保真原型.html', beforeParse(window) {
  window.matchMedia = window.matchMedia || function() {
    return { matches: false, addListener: function() {}, removeListener: function() {}, addEventListener: function() {}, removeEventListener: function() {}, dispatchEvent: function() {} };
  };
}});
const { document, window } = dom.window;

function countVisibleInPanel(panelId, type, selector) {
  const panel = document.getElementById(panelId);
  if (!panel || panel.classList.contains('hidden')) return -1;
  let visible = 0;
  panel.querySelectorAll(selector).forEach(el => {
    if (!el.classList.contains('hidden') && el.dataset.type === type) visible++;
  });
  return visible;
}

let passed = true;
const tabs = ['mine', 'team', 'region', 'product', 'channel'];
const expected = { mine: 3, team: 3, region: 3, product: 3, channel: 3 };

// Test grid view
window.switchPerformanceView('grid');
tabs.forEach(tab => {
  const btn = document.querySelector(`#performance-tabs [data-pftab="${tab}"]`);
  window.switchPerformanceTab(btn);
  const visible = countVisibleInPanel('performance-panel-grid', tab, '.pf-card');
  console.log(`Grid Tab ${tab}: visible=${visible}, expected=${expected[tab]}`);
  if (visible !== expected[tab]) {
    console.error(`FAIL: Grid Tab ${tab} expected ${expected[tab]} visible cards, got ${visible}`);
    passed = false;
  }
});

// Test list view
window.switchPerformanceView('list');
tabs.forEach(tab => {
  const btn = document.querySelector(`#performance-tabs [data-pftab="${tab}"]`);
  window.switchPerformanceTab(btn);
  const visible = countVisibleInPanel('performance-panel-list', tab, '.pf-row');
  console.log(`List Tab ${tab}: visible=${visible}, expected=${expected[tab]}`);
  if (visible !== expected[tab]) {
    console.error(`FAIL: List Tab ${tab} expected ${expected[tab]} visible rows, got ${visible}`);
    passed = false;
  }
});

const analysis = document.getElementById('performance-analysis');
if (!analysis) {
  console.error('FAIL: #performance-analysis not found');
  passed = false;
} else {
  console.log('OK: #performance-analysis exists');
}

const section = document.getElementById('view-performance');
const outerCard = section.querySelector('.card.mb-5.p-4');
const innerCards = outerCard ? outerCard.querySelectorAll('.card') : [];
if (innerCards.length > 0) {
  console.error('FAIL: 业绩预测与缺口分析 card still contains nested cards');
  passed = false;
} else {
  console.log('OK: 业绩预测与缺口分析 card no longer nests inner cards');
}

process.exit(passed ? 0 : 1);
