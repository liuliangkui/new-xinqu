#!/usr/bin/env python3
"""
修复经营驾驶舱 overview panel 布局：
1. 把业绩预测与缺口分析移出小卡片 grid，作为顶部独立全宽卡片
2. 修复收入趋势卡片结构
3. 调整回款达成率环形图大小
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.dashboard-fix-backup')

if not BACKUP.exists():
    shutil.copy(FILE, BACKUP)

with open(FILE, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

original_len = len(html)

# 找到经营驾驶舱 section
h1_pattern = re.compile(r'<h1[^>]*>(.*?)</h1>', re.DOTALL)
matches = list(h1_pattern.finditer(html))

section_start = None
section_end = None
for i, m in enumerate(matches):
    title = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    title = re.sub(r'\s+', ' ', title)
    if title == '经营驾驶舱':
        section_start = m.start()
        section_end = matches[i + 1].start() if i + 1 < len(matches) else len(html)
        break

if not section_start or not section_end:
    print('❌ 未找到经营驾驶舱 section')
    exit(1)

section = html[section_start:section_end]

# 找到 overview panel 的起止
overview_start_marker = '<div id="db-panel-overview" class="db-panel">'
overview_end_marker = '<!-- 专题屏占位（后续可扩展） -->'
overview_start = section.find(overview_start_marker)
overview_end = section.find(overview_end_marker)

if overview_start < 0 or overview_end < 0:
    print('❌ 未找到 overview panel 边界')
    exit(1)

# 构造新的 overview panel
new_overview = '''<div id="db-panel-overview" class="db-panel">
            <!-- 业绩预测与缺口分析：全宽独立卡片 -->
            <div class="card p-4 mb-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-ink">业绩预测与缺口分析</h3>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-sub">预测周期</span>
                  <select class="input text-xs py-1"><option>本季度</option><option>本年度</option></select>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="p-4 rounded-xl bg-primary-light">
                  <div class="text-xs text-sub mb-1">预测收入</div>
                  <div class="text-2xl font-bold text-primary">¥9,540万</div>
                  <div class="text-xs text-sub mt-1">基于当前 pipeline 与历史转化率</div>
                </div>
                <div class="p-4 rounded-xl bg-warning-bg">
                  <div class="text-xs text-sub mb-1">目标收入</div>
                  <div class="text-2xl font-bold text-warning">¥11,000万</div>
                  <div class="text-xs text-sub mt-1">年度目标分解</div>
                </div>
                <div class="p-4 rounded-xl bg-danger-bg">
                  <div class="text-xs text-sub mb-1">预测缺口</div>
                  <div class="text-2xl font-bold text-danger">¥1,460万</div>
                  <div class="text-xs text-sub mt-1">需新增 6–8 个重点项目</div>
                </div>
                <div class="p-4 rounded-xl bg-success-bg">
                  <div class="text-xs text-sub mb-1">可挽回金额</div>
                  <div class="text-2xl font-bold text-success">¥380万</div>
                  <div class="text-xs text-sub mt-1">3 个停滞重点意向</div>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-3 rounded-lg bg-panel">
                  <div class="flex items-center justify-between text-sm mb-1"><span class="text-sub">意向转化率低于预期</span><span class="font-medium text-danger">-¥620万</span></div>
                  <div class="w-full bg-line rounded-full h-2"><div class="bg-danger h-2 rounded-full" style="width: 42%"></div></div>
                </div>
                <div class="p-3 rounded-lg bg-panel">
                  <div class="flex items-center justify-between text-sm mb-1"><span class="text-sub">签约周期延长</span><span class="font-medium text-warning">-¥480万</span></div>
                  <div class="w-full bg-line rounded-full h-2"><div class="bg-warning h-2 rounded-full" style="width: 33%"></div></div>
                </div>
                <div class="p-3 rounded-lg bg-panel">
                  <div class="flex items-center justify-between text-sm mb-1"><span class="text-sub">重点项目停滞</span><span class="font-medium text-info">-¥360万</span></div>
                  <div class="w-full bg-line rounded-full h-2"><div class="bg-info h-2 rounded-full" style="width: 25%"></div></div>
                </div>
              </div>
            </div>

            <!-- 核心指标卡片：4 列布局 -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
              <!-- 收入趋势 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">收入趋势</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="text-2xl font-bold text-ink mb-2">¥2,860万</div>
                <div class="text-xs text-success mb-3">环比 +12% · 同比 +18%</div>
                <div class="h-24 flex items-end gap-1">
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:40%"></div>
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:55%"></div>
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:45%"></div>
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:70%"></div>
                  <div class="flex-1 bg-primary/30 rounded-t" style="height:65%"></div>
                  <div class="flex-1 bg-primary rounded-t" style="height:85%"></div>
                </div>
                <div class="flex justify-between text-xs text-sub mt-2"><span>1月</span><span>6月</span></div>
              </div>
              <!-- 回款达成 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">回款达成</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="flex items-center gap-3">
                  <div class="relative w-14 h-14 flex-shrink-0">
                    <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path class="text-line" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"/>
                      <path class="text-warning" stroke-dasharray="76, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"/>
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink">76%</div>
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs text-sub">目标 ¥2,800万</div>
                    <div class="text-xs text-sub">实际 ¥2,120万</div>
                    <div class="text-xs text-danger mt-1">缺口 ¥680万</div>
                  </div>
                </div>
              </div>
              <!-- 意向阶段分布 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">意向阶段分布</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center gap-2"><div class="w-12 text-xs text-sub">线索</div><div class="flex-1 h-2 bg-line rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width:90%"></div></div><div class="w-10 text-xs text-right">128</div></div>
                  <div class="flex items-center gap-2"><div class="w-12 text-xs text-sub">意向</div><div class="flex-1 h-2 bg-line rounded-full overflow-hidden"><div class="h-full bg-primary rounded-full" style="width:70%"></div></div><div class="w-10 text-xs text-right">98</div></div>
                  <div class="flex items-center gap-2"><div class="w-12 text-xs text-sub">中标</div><div class="flex-1 h-2 bg-line rounded-full overflow-hidden"><div class="h-full bg-warning rounded-full" style="width:45%"></div></div><div class="w-10 text-xs text-right">42</div></div>
                  <div class="flex items-center gap-2"><div class="w-12 text-xs text-sub">成交</div><div class="flex-1 h-2 bg-line rounded-full overflow-hidden"><div class="h-full bg-success rounded-full" style="width:35%"></div></div><div class="w-10 text-xs text-right">32</div></div>
                </div>
              </div>
              <!-- 客户健康度 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">客户健康度</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="p-2 rounded-lg bg-success-bg">
                    <div class="text-lg font-bold text-success">96</div>
                    <div class="text-xs text-sub">健康</div>
                  </div>
                  <div class="p-2 rounded-lg bg-warning-bg">
                    <div class="text-lg font-bold text-warning">7</div>
                    <div class="text-xs text-sub">关注</div>
                  </div>
                  <div class="p-2 rounded-lg bg-danger-bg">
                    <div class="text-lg font-bold text-danger">2</div>
                    <div class="text-xs text-sub">风险</div>
                  </div>
                </div>
                <div class="mt-3 text-xs text-sub">健康度平均分 85，较上月 +2</div>
              </div>
              <!-- 拜访覆盖 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">拜访覆盖</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="text-2xl font-bold text-ink mb-1">1,246 次</div>
                <div class="text-xs text-success mb-3">覆盖率 83% · 环比 +5%</div>
                <div class="h-24 flex items-end gap-2">
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:50%"></div>
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:65%"></div>
                  <div class="flex-1 bg-primary/20 rounded-t" style="height:55%"></div>
                  <div class="flex-1 bg-primary/30 rounded-t" style="height:75%"></div>
                  <div class="flex-1 bg-primary rounded-t" style="height:83%"></div>
                </div>
                <div class="flex justify-between text-xs text-sub mt-2"><span>第1周</span><span>第4周</span></div>
              </div>
              <!-- 试剂消耗 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">试剂消耗</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="text-2xl font-bold text-ink mb-1">¥486万</div>
                <div class="text-xs text-success mb-3">复购率 78% · 环比 +3%</div>
                <div class="h-24 relative">
                  <svg class="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#3370FF" stroke-width="2" points="0,45 30,35 60,40 90,25 120,30 150,15 180,20 200,10"/>
                    <polygon fill="rgba(51,112,255,0.1)" points="0,60 0,45 30,35 60,40 90,25 120,30 150,15 180,20 200,10 200,60"/>
                  </svg>
                </div>
                <div class="flex justify-between text-xs text-sub mt-2"><span>1月</span><span>6月</span></div>
              </div>
              <!-- 设备装机 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">设备装机</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="text-2xl font-bold text-ink mb-2">42 台</div>
                <div class="text-xs text-success mb-3">本月新增 8 台 · 同比 +21%</div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs"><span class="text-sub">血液分析</span><span class="font-medium">18 台</span></div>
                  <div class="flex items-center justify-between text-xs"><span class="text-sub">生化分析</span><span class="font-medium">12 台</span></div>
                  <div class="flex items-center justify-between text-xs"><span class="text-sub">质谱平台</span><span class="font-medium">8 台</span></div>
                  <div class="flex items-center justify-between text-xs"><span class="text-sub">POCT</span><span class="font-medium">4 台</span></div>
                </div>
              </div>
              <!-- 合规风险 -->
              <div class="card p-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="font-semibold text-ink">合规风险</div>
                  <button class="text-xs text-sub hover:text-primary">说明</button>
                </div>
                <div class="flex items-center gap-4 mb-3">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-danger">3</div>
                    <div class="text-xs text-sub">待处理</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-warning">5</div>
                    <div class="text-xs text-sub">关注</div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-success">91%</div>
                    <div class="text-xs text-sub">合规率</div>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-xs"><span class="w-2 h-2 rounded-full bg-danger"></span><span class="text-sub">3 条拜访记录缺少定位照片</span></div>
                  <div class="flex items-center gap-2 text-xs"><span class="w-2 h-2 rounded-full bg-warning"></span><span class="text-sub">1 笔样品出库超过 30 天未回库</span></div>
                </div>
              </div>
            </div>
          </div>
'''

# 替换 overview panel
section = section[:overview_start] + new_overview + section[overview_end:]
html = html[:section_start] + section + html[section_end:]

# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'✅ 经营驾驶舱布局已修复')
print(f'文件从 {original_len} 字节变为 {len(html)} 字节')
