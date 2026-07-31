#!/usr/bin/env python3
"""
第三批原型完善脚本：合规与服务运营域
重点补充合规风控页面的 GPS 签到、证据链、学术活动/样品临评/飞检抽查完整流程。
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.batch3-backup')

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
# 合规风控：补充 GPS 签到、证据链、各 tab 流程说明
# ============================================================
start, end = find_section('合规风控')
if start and end:
    section = html[start:end]

    # 1. 在 KPI 后插入"合规证据链要求"说明卡片
    kpi_marker = '<div class="kpi-grid mb-5">'
    # 合规风控的 KPI 后是 tab 导航，结构可能不同
    kpi_end = '</div>\n          </div>\n\n          <!-- Tabs + search -->'
    if kpi_marker in section and kpi_end in section:
        evidence_card = '''</div>
          </div>

          <!-- 合规证据链要求 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-ink">合规证据链要求</h3>
              <span class="text-xs text-sub">日志保留 5 年以上 · 审批记录不可篡改</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div class="p-3 rounded-xl bg-primary-light text-center">
                <div class="text-2xl mb-1">📍</div>
                <div class="text-sm font-medium text-ink">拜访记录</div>
                <div class="text-xs text-sub mt-1">GPS 定位 + 拍照 + 电子签名</div>
              </div>
              <div class="p-3 rounded-xl bg-success-bg text-center">
                <div class="text-2xl mb-1">📋</div>
                <div class="text-sm font-medium text-ink">学术活动</div>
                <div class="text-xs text-sub mt-1">申请 + 预算校验 + 签到 + 核销</div>
              </div>
              <div class="p-3 rounded-xl bg-warning-bg text-center">
                <div class="text-2xl mb-1">🧪</div>
                <div class="text-sm font-medium text-ink">样品/临评</div>
                <div class="text-xs text-sub mt-1">出库 + 签收 + 回库 + 核销</div>
              </div>
              <div class="p-3 rounded-xl bg-info-bg text-center">
                <div class="text-2xl mb-1">🔍</div>
                <div class="text-sm font-medium text-ink">飞检抽查</div>
                <div class="text-xs text-sub mt-1">任务下发 + 现场取证 + 整改跟踪</div>
              </div>
              <div class="p-3 rounded-xl bg-gray-bg text-center">
                <div class="text-2xl mb-1">🛡️</div>
                <div class="text-sm font-medium text-ink">敏感词审计</div>
                <div class="text-xs text-sub mt-1">实时扫描 + 命中复核 + 处置留痕</div>
              </div>
            </div>
          </div>

          <!-- Tabs -->'''
        section = section.replace(kpi_end, evidence_card, 1)
        print('✅ 合规风控：已补充合规证据链要求')

    # 2. 在"拜访合规"panel 内补充 GPS 签到说明
    visit_panel_marker = 'id="compliance-panel-visit"'
    if visit_panel_marker in section:
        # 找到 panel 开头后的第一个合适位置（过滤区之后）
        idx = section.find(visit_panel_marker)
        # 简单插入到 panel 内第一个 card 之前
        card_idx = section.find('<div class="card-grid mb-4">', idx)
        if card_idx > 0:
            gps_card = '''
            <div class="card p-4 mb-4 bg-primary-light/30">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">📍</div>
                <div class="flex-1">
                  <div class="font-medium text-ink">拜访 GPS 签到规则</div>
                  <div class="text-sm text-sub mt-1">销售人员到达客户现场后需进行 GPS 定位打卡，系统校验定位偏差。偏差 ≤ 100 米视为正常；偏差 100–500 米需补充说明；偏差 > 500 米需部门负责人审批。</div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="badge badge-primary">正常 14</span>
                    <span class="badge badge-warning">需说明 3</span>
                    <span class="badge badge-danger">待审批 1</span>
                  </div>
                </div>
              </div>
            </div>
            '''
            section = section[:card_idx] + gps_card + section[card_idx:]
            print('✅ 合规风控：已补充拜访 GPS 签到规则')

    # 3. 在"学术活动"panel 内补充完整流程说明
    event_panel_marker = 'id="compliance-panel-activity"'
    if event_panel_marker in section:
        idx = section.find(event_panel_marker)
        card_idx = section.find('<div class="card-grid mb-4">', idx)
        if card_idx > 0:
            event_flow = '''
            <div class="card p-4 mb-4 bg-success-bg/30">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center flex-shrink-0">📋</div>
                <div class="flex-1">
                  <div class="font-medium text-ink">学术活动全流程</div>
                  <div class="text-sm text-sub mt-1">活动申请 → 预算校验 → 分级审批 → 执行签到 → 费用核销 → 资料归档 → ROI 分析 → 客户时间线沉淀。</div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="text-xs text-sub">本月活动 7 场</span>
                    <span class="text-xs text-sub">超预算 2 笔</span>
                    <span class="text-xs text-sub">待核销 3 笔</span>
                  </div>
                </div>
              </div>
            </div>
            '''
            section = section[:card_idx] + event_flow + section[card_idx:]
            print('✅ 合规风控：已补充学术活动全流程')

    # 4. 在"样品临评"panel 内补充完整流程说明
    sample_panel_marker = 'id="compliance-panel-sample"'
    if sample_panel_marker in section:
        idx = section.find(sample_panel_marker)
        card_idx = section.find('<div class="card-grid mb-4">', idx)
        if card_idx > 0:
            sample_flow = '''
            <div class="card p-4 mb-4 bg-warning-bg/30">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-warning text-white flex items-center justify-center flex-shrink-0">🧪</div>
                <div class="flex-1">
                  <div class="font-medium text-ink">样品 / 临评 / 赠品证据链</div>
                  <div class="text-sm text-sub mt-1">出库 → 签收 → 回库 → 核销，临评报告归档。每步均关联客户、设备、销售人员，形成完整进院证据链，满足合规审计要求。</div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="text-xs text-sub">超期 3 笔</span>
                    <span class="text-xs text-sub">授权到期 2 笔</span>
                  </div>
                </div>
              </div>
            </div>
            '''
            section = section[:card_idx] + sample_flow + section[card_idx:]
            print('✅ 合规风控：已补充样品临评证据链')

    # 5. 在"飞检抽查"panel 内补充规则说明
    inspect_panel_marker = 'id="compliance-panel-spot"'
    if inspect_panel_marker in section:
        idx = section.find(inspect_panel_marker)
        card_idx = section.find('<div class="card-grid mb-4">', idx)
        if card_idx > 0:
            inspect_flow = '''
            <div class="card p-4 mb-4 bg-info-bg/30">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-info text-white flex items-center justify-center flex-shrink-0">🔍</div>
                <div class="flex-1">
                  <div class="font-medium text-ink">飞检抽查机制</div>
                  <div class="text-sm text-sub mt-1">合规部门随机抽取拜访记录、学术活动、样品流向进行复核。发现问题后下发整改任务，限期闭环，整改结果纳入经销商评级。</div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="badge badge-primary">执行中 5</span>
                    <span class="badge badge-warning">待整改 3</span>
                    <span class="badge badge-success">已关闭 4</span>
                  </div>
                </div>
              </div>
            </div>
            '''
            section = section[:card_idx] + inspect_flow + section[card_idx:]
            print('✅ 合规风控：已补充飞检抽查机制')

    html = html[:start] + section + html[end:]


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节增加到 {len(html)} 字节（+{len(html) - original_len} 字节）')
