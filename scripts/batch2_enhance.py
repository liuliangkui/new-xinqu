#!/usr/bin/env python3
"""
第二批原型完善脚本：试剂运营 / 品牌库管理 / 设备管理 / 线索管理
对照《鑫渠解决方案白皮书》补充业务管理深度功能。
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.batch2-backup')

if not BACKUP.exists():
    shutil.copy(FILE, BACKUP)

with open(FILE, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

original_len = len(html)


def find_section(title):
    h1_pattern = re.compile(r'<h1[^>]*>(.*?)</h1>', re.DOTALL)
    matches = list(h1_pattern.finditer(html))
    for i, m in enumerate(matches):
        t = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        t = re.sub(r'\s+', ' ', t)
        if t == title:
            end = matches[i + 1].start() if i + 1 < len(matches) else len(html)
            return m.start(), end
    return None, None


# ============================================================
# 1. 试剂运营：补充消耗记录、库存、AI 预测、效期、流失预警
# ============================================================
start, end = find_section('试剂运营')
if start and end:
    section = html[start:end]

    # 在"New reagent modal" 之前插入一个功能卡片区
    modal_marker = '<!-- New reagent modal -->'
    if modal_marker in section:
        insert_pos = section.find(modal_marker)
        new_section = '''
          <!-- 补充：消耗记录与库存管理 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">消耗记录与库存管理</h3>
              <div class="flex items-center gap-2">
                <button class="btn btn-outline btn-sm" onclick="showToast('导入消耗记录')">导入数据</button>
                <button class="btn btn-primary btn-sm" onclick="showToast('新建补货意向')">新建补货意向</button>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 rounded-xl bg-primary-light">
                <div class="text-xs text-sub mb-1">多级库存可视化</div>
                <div class="text-lg font-bold text-primary">仓库 8 / 医院 45 / 科室 133</div>
                <div class="text-xs text-sub mt-1">实时同步各层级库存水位</div>
              </div>
              <div class="p-4 rounded-xl bg-warning-bg">
                <div class="text-xs text-sub mb-1">AI 补货预测</div>
                <div class="text-lg font-bold text-warning">30 天内建议补货 ¥86万</div>
                <div class="text-xs text-sub mt-1">基于历史消耗 30/60/90 天预测</div>
              </div>
              <div class="p-4 rounded-xl bg-danger-bg">
                <div class="text-xs text-sub mb-1">效期预警</div>
                <div class="text-lg font-bold text-danger">12 批试剂 90 天内到期</div>
                <div class="text-xs text-sub mt-1">按先进先出自动预警</div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-sub border-b border-line"><tr><th class="text-left py-2">试剂名称</th><th class="text-left py-2">客户/科室</th><th class="text-right py-2">近 30 天消耗</th><th class="text-right py-2">当前库存</th><th class="text-right py-2">预计断货日</th><th class="text-left py-2">状态</th></tr></thead>
                <tbody>
                  <tr class="border-b border-line-light"><td class="py-2">希森美康血球试剂 20L</td><td class="py-2">云南省肿瘤医院 · 检验科</td><td class="text-right py-2">45 瓶</td><td class="text-right py-2">15 天</td><td class="text-right py-2 text-danger">5 天后</td><td class="py-2"><span class="badge badge-danger">红色预警</span></td></tr>
                  <tr class="border-b border-line-light"><td class="py-2">希森美康凝血试剂 10L</td><td class="py-2">昆明医科大学第一附属医院 · 检验科</td><td class="text-right py-2">28 瓶</td><td class="text-right py-2">32 天</td><td class="text-right py-2 text-warning">18 天后</td><td class="py-2"><span class="badge badge-warning">橙色预警</span></td></tr>
                  <tr><td class="py-2">滴宝生化试剂 5L</td><td class="py-2">大理州人民医院 · 检验科</td><td class="text-right py-2">12 瓶</td><td class="text-right py-2">60 天</td><td class="text-right py-2 text-success">46 天后</td><td class="py-2"><span class="badge badge-success">正常</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 补充：流失预警 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">流失预警与挽回跟进</h3>
              <button class="btn btn-outline btn-sm" onclick="showToast('查看流失分析')">查看分析</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-xl border border-line">
                <div class="text-sm font-medium text-ink">消耗环比下降</div>
                <div class="text-2xl font-bold text-danger mt-1">15 <span class="text-sm font-normal text-sub">台设备</span></div>
                <div class="text-xs text-sub mt-1">近 30 天消耗环比下降 &gt; 20%</div>
              </div>
              <div class="p-4 rounded-xl border border-line">
                <div class="text-sm font-medium text-ink">竞品替换风险</div>
                <div class="text-2xl font-bold text-warning mt-1">6 <span class="text-sm font-normal text-sub">个项目</span></div>
                <div class="text-xs text-sub mt-1">检测到竞品报价或试用记录</div>
              </div>
              <div class="p-4 rounded-xl border border-line">
                <div class="text-sm font-medium text-ink">已挽回项目</div>
                <div class="text-2xl font-bold text-success mt-1">3 <span class="text-sm font-normal text-sub">个项目</span></div>
                <div class="text-xs text-sub mt-1">本月通过主动跟进挽回</div>
              </div>
            </div>
          </div>

          '''
        section = section[:insert_pos] + new_section + section[insert_pos:]
        print('✅ 试剂运营：已补充消耗记录、库存管理、AI 预测、效期、流失预警')

    html = html[:start] + section + html[end:]


# ============================================================
# 2. 品牌库管理：补充代理/自主品牌、投放政策、授权区域
# ============================================================
start, end = find_section('品牌库管理')
if start and end:
    section = html[start:end]

    # 在品牌列表 panel 开头插入品牌属性说明和标签
    market_panel_marker = '<div id="brand-panel-brand" class="brand-panel">'
    if market_panel_marker in section:
        insert_pos = section.find(market_panel_marker) + len(market_panel_marker)
        brand_card = '''
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="p-4 rounded-xl bg-primary-light text-center">
                  <div class="text-2xl font-bold text-primary">5</div>
                  <div class="text-xs text-sub mt-1">代理品牌</div>
                  <div class="text-xs text-sub">Sysmex / BioTek / 梅里埃 / 罗氏 / 酒井医疗</div>
                </div>
                <div class="p-4 rounded-xl bg-success-bg text-center">
                  <div class="text-2xl font-bold text-success">2</div>
                  <div class="text-xs text-sub mt-1">自主品牌</div>
                  <div class="text-xs text-sub">滴宝 / 康都</div>
                </div>
                <div class="p-4 rounded-xl bg-warning-bg text-center">
                  <div class="text-2xl font-bold text-warning">18</div>
                  <div class="text-xs text-sub mt-1">临期注册证</div>
                  <div class="text-xs text-sub">30 天内到期</div>
                </div>
                <div class="p-4 rounded-xl bg-info-bg text-center">
                  <div class="text-2xl font-bold text-info">156</div>
                  <div class="text-xs text-sub mt-1">区域授权</div>
                  <div class="text-xs text-sub">覆盖 14 个地州</div>
                </div>
              </div>
              <div class="p-4 rounded-xl bg-panel mb-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="icon icon-sm text-primary"><use href="#icon-info"/></svg>
                  <span class="font-medium text-ink">多品牌管理规则</span>
                </div>
                <div class="text-sm text-sub">
                  支持代理品牌与自主品牌并行运营：品牌、产品线、型号、注册证、投放政策、区域授权均可独立配置，避免「一物多码」与口径混乱。
                </div>
              </div>
'''
        section = section[:insert_pos] + brand_card + section[insert_pos:]
        print('✅ 品牌库管理：已补充品牌属性、投放政策、授权区域说明')

    html = html[:start] + section + html[end:]


# ============================================================
# 3. 设备管理：补充维保记录时间线和保修预警
# ============================================================
start, end = find_section('设备管理')
if start and end:
    section = html[start:end]

    # 在 KPI 后插入维保与保修预警卡片
    kpi_marker = '<div class="kpi-grid mb-5">'
    kpi_end = '</div>\n          </div>\n\n          <!-- Tabs + search -->'
    if kpi_marker in section and kpi_end in section:
        maintain_card = '''</div>
          </div>

          <!-- 维保与保修预警 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">维保与保修预警</h3>
              <button class="btn btn-outline btn-sm" onclick="showToast('查看维保日历')">维保日历</button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <div class="p-3 rounded-xl bg-danger-bg text-center">
                <div class="text-xl font-bold text-danger">3</div>
                <div class="text-xs text-sub">已超时</div>
              </div>
              <div class="p-3 rounded-xl bg-warning-bg text-center">
                <div class="text-xl font-bold text-warning">5</div>
                <div class="text-xs text-sub">7 天内到期</div>
              </div>
              <div class="p-3 rounded-xl bg-warning-bg text-center">
                <div class="text-xl font-bold text-warning">8</div>
                <div class="text-xs text-sub">30 天内到期</div>
              </div>
              <div class="p-3 rounded-xl bg-info-bg text-center">
                <div class="text-xl font-bold text-info">12</div>
                <div class="text-xs text-sub">60 天内到期</div>
              </div>
              <div class="p-3 rounded-xl bg-gray-bg text-center">
                <div class="text-xl font-bold text-ink">18</div>
                <div class="text-xs text-sub">90 天内到期</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">即将到期设备</div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm"><span class="text-sub">希森美康 XN-550 · 云南省肿瘤医院</span><span class="text-danger font-medium">剩余 5 天</span></div>
                <div class="flex items-center justify-between text-sm"><span class="text-sub">伯腾 ELx800 · 昆明博奥</span><span class="text-warning font-medium">剩余 12 天</span></div>
                <div class="flex items-center justify-between text-sm"><span class="text-sub">滴宝 CS-1200 · 大理州人民医院</span><span class="text-warning font-medium">剩余 25 天</span></div>
              </div>
            </div>
          </div>

          <!-- Tabs + search -->
          <div class="card mb-4">'''
        section = section.replace(kpi_end, maintain_card, 1)
        print('✅ 设备管理：已补充维保与保修预警')

    # 在设备详情 modal 中增加维保记录时间线
    timeline_marker = '<h4 class="font-semibold text-ink mb-3">状态时间线</h4>'
    if timeline_marker in section:
        insert_pos = section.find(timeline_marker)
        # 找到这个时间线 div 的结束位置
        after_timeline = section.find('</div>', insert_pos)
        if after_timeline > 0:
            after_timeline += len('</div>')
            maintain_timeline = '''
            <h4 class="font-semibold text-ink mb-3 mt-5">维保记录</h4>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                <div class="flex-1">
                  <div class="text-sm text-ink">年度保养完成</div>
                  <div class="text-xs text-sub">2026-07-15 · 工程师：王强 · 更换光源、校准光路</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-warning mt-1.5"></div>
                <div class="flex-1">
                  <div class="text-sm text-ink">故障维修</div>
                  <div class="text-xs text-sub">2026-05-22 · 工程师：李明 · 更换吸样针组件</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-success mt-1.5"></div>
                <div class="flex-1">
                  <div class="text-sm text-ink">装机验收</div>
                  <div class="text-xs text-sub">2025-08-10 · 工程师：张伟 · 培训完成</div>
                </div>
              </div>
            </div>'''
            section = section[:after_timeline] + maintain_timeline + section[after_timeline:]
            print('✅ 设备管理：已补充维保记录时间线')

    html = html[:start] + section + html[end:]


# ============================================================
# 4. 线索管理：补充查重分配机制
# ============================================================
start, end = find_section('线索管理')
if start and end:
    section = html[start:end]

    # 在 KPI 后插入查重分配机制卡片
    kpi_marker = '<div class="kpi-grid mb-5">'
    kpi_end = '</div>\n          </div>\n\n          <!-- Tabs + search -->'
    if kpi_marker in section and kpi_end in section:
        dup_card = '''</div>
          </div>

          <!-- 查重分配机制 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">查重分配机制</h3>
              <button class="btn btn-outline btn-sm" onclick="showToast('查看分配规则')">分配规则</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-xl bg-primary-light">
                <div class="text-sm font-medium text-primary mb-1">线索查重</div>
                <div class="text-xs text-sub">按客户名称、科室、联系人手机号自动查重，防止重复跟进</div>
                <div class="text-lg font-bold text-primary mt-2">23 <span class="text-sm font-normal">条今日查重</span></div>
              </div>
              <div class="p-4 rounded-xl bg-success-bg">
                <div class="text-sm font-medium text-success mb-1">自动分配</div>
                <div class="text-xs text-sub">按区域、产品线、销售负载自动分配至责任人</div>
                <div class="text-lg font-bold text-success mt-2">86% <span class="text-sm font-normal">自动分配率</span></div>
              </div>
              <div class="p-4 rounded-xl bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">公海池回收</div>
                <div class="text-xs text-sub">超过 7 天未跟进自动回收公海池，重新分配</div>
                <div class="text-lg font-bold text-warning mt-2">12 <span class="text-sm font-normal">条今日回收</span></div>
              </div>
            </div>
          </div>

          <!-- Tabs + search -->
          <div class="card mb-4">'''
        section = section.replace(kpi_end, dup_card, 1)
        print('✅ 线索管理：已补充查重分配机制')

    html = html[:start] + section + html[end:]


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节增加到 {len(html)} 字节（+{len(html) - original_len} 字节）')
