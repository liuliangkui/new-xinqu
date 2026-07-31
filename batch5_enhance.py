#!/usr/bin/env python3
"""
第五批原型完善脚本：经营决策与 AI
重点补充经营驾驶舱的渠道体检、提成核算卡片，以及 AI Agent 数字员工中心的配置与监控。
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.batch5-backup')

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
# 1. 经营驾驶舱：补充渠道体检与提成核算卡片
# ============================================================
start, end = find_section('经营驾驶舱')
if start and end:
    section = html[start:end]

    # 在经销商协同 panel 内插入渠道体检和提成核算卡片
    dealer_panel_marker = 'id="db-panel-dealer"'
    if dealer_panel_marker in section:
        idx = section.find(dealer_panel_marker)
        # 找到 panel 内第一个 div 的结束位置，在其后插入
        first_card_end = section.find('</div>\n            </div>', idx)
        if first_card_end > 0:
            insert_pos = first_card_end + len('</div>\n            </div>')
            new_cards = '''

            <!-- 渠道体检 -->
            <div class="card p-4 mb-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-ink">渠道体检</h3>
                <button class="btn btn-outline btn-sm" onclick="showToast('生成渠道体检报告')">生成报告</button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="p-3 rounded-xl bg-success-bg text-center">
                  <div class="text-2xl font-bold text-success">86</div>
                  <div class="text-xs text-sub">渠道健康度</div>
                </div>
                <div class="p-3 rounded-xl bg-warning-bg text-center">
                  <div class="text-2xl font-bold text-warning">3</div>
                  <div class="text-xs text-sub">冲突待裁决</div>
                </div>
                <div class="p-3 rounded-xl bg-danger-bg text-center">
                  <div class="text-2xl font-bold text-danger">2</div>
                  <div class="text-xs text-sub">越权报备</div>
                </div>
                <div class="p-3 rounded-xl bg-info-bg text-center">
                  <div class="text-2xl font-bold text-info">94%</div>
                  <div class="text-xs text-sub">返利结算准确率</div>
                </div>
              </div>
              <div class="p-3 rounded-lg bg-panel">
                <div class="text-sm font-medium text-ink mb-2">经销商评级</div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">A 级经销商（核心伙伴）</span><span class="font-medium text-success">12 家</span></div>
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">B 级经销商（稳定合作）</span><span class="font-medium text-primary">28 家</span></div>
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">C 级经销商（观察培育）</span><span class="font-medium text-warning">18 家</span></div>
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">D 级经销商（预警整改）</span><span class="font-medium text-danger">5 家</span></div>
                </div>
              </div>
            </div>

            <!-- 提成核算与复购返佣分析 -->
            <div class="card p-4 mb-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-ink">提成核算与复购返佣分析</h3>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-sub">核算周期</span>
                  <select class="input text-xs py-1"><option>2026 Q3</option><option>2026 Q2</option></select>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div class="p-3 rounded-xl bg-primary-light text-center">
                  <div class="text-2xl font-bold text-primary">¥128万</div>
                  <div class="text-xs text-sub">销售提成总额</div>
                </div>
                <div class="p-3 rounded-xl bg-success-bg text-center">
                  <div class="text-2xl font-bold text-success">¥46万</div>
                  <div class="text-xs text-sub">复购返佣</div>
                </div>
                <div class="p-3 rounded-xl bg-warning-bg text-center">
                  <div class="text-2xl font-bold text-warning">¥12万</div>
                  <div class="text-xs text-sub">待复核调整</div>
                </div>
                <div class="p-3 rounded-xl bg-info-bg text-center">
                  <div class="text-2xl font-bold text-info">156</div>
                  <div class="text-xs text-sub">参与核算人员</div>
                </div>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="text-sub border-b border-line"><tr><th class="text-left py-2">人员</th><th class="text-right py-2">销售额</th><th class="text-right py-2">回款额</th><th class="text-right py-2">提成</th><th class="text-right py-2">复购返佣</th><th class="text-right py-2">合计</th></tr></thead>
                  <tbody>
                    <tr class="border-b border-line-light"><td class="py-2">张经理</td><td class="text-right py-2">¥860万</td><td class="text-right py-2">¥720万</td><td class="text-right py-2">¥12.8万</td><td class="text-right py-2">¥3.2万</td><td class="text-right py-2 font-medium">¥16.0万</td></tr>
                    <tr class="border-b border-line-light"><td class="py-2">王强</td><td class="text-right py-2">¥620万</td><td class="text-right py-2">¥540万</td><td class="text-right py-2">¥9.2万</td><td class="text-right py-2">¥2.1万</td><td class="text-right py-2 font-medium">¥11.3万</td></tr>
                    <tr><td class="py-2">李丽</td><td class="text-right py-2">¥480万</td><td class="text-right py-2">¥420万</td><td class="text-right py-2">¥7.1万</td><td class="text-right py-2">¥1.8万</td><td class="text-right py-2 font-medium">¥8.9万</td></tr>
                  </tbody>
                </table>
              </div>
            </div>'''
            section = section[:insert_pos] + new_cards + section[insert_pos:]
            print('✅ 经营驾驶舱：已补充渠道体检与提成核算卡片')

    html = html[:start] + section + html[end:]


# ============================================================
# 2. AI Agent 数字员工中心：补充配置与监控
# ============================================================
start, end = find_section('AI Agent 数字员工中心')
if start and end:
    section = html[start:end]

    # 在运行看板后插入 Agent 配置与训练反馈
    board_marker = '<div class="font-semibold text-ink mb-3">Agent 运行看板</div>'
    if board_marker in section:
        idx = section.find(board_marker)
        # 找到运行看板 div 的结束位置（到 </section> 之前）
        after_board = section.find('</section>', idx)
        if after_board > 0:
            insert_pos = after_board
            config_section = '''

          <!-- Agent 配置与训练反馈 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">Agent 配置与训练反馈</h3>
              <button class="btn btn-outline btn-sm" onclick="showToast('进入 Agent 配置器')">配置 Agent</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="p-4 rounded-xl bg-panel">
                <div class="font-medium text-ink mb-2">权限管理</div>
                <div class="text-sm text-sub mb-2">按角色与数据范围控制 Agent 可访问对象与可执行操作。</div>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center justify-between"><span class="text-sub">可访问数据</span><span class="font-medium">客户 360°、意向、拜访、工单</span></div>
                  <div class="flex items-center justify-between"><span class="text-sub">可执行操作</span><span class="font-medium">查询、生成草稿、推送提醒</span></div>
                  <div class="flex items-center justify-between"><span class="text-sub">需人工确认</span><span class="font-medium">修改状态、创建记录、审批</span></div>
                </div>
              </div>
              <div class="p-4 rounded-xl bg-panel">
                <div class="font-medium text-ink mb-2">训练数据反馈</div>
                <div class="text-sm text-sub mb-2">销售标注、客户画像、历史问答日志共同提升 Agent 准确率。</div>
                <div class="space-y-1 text-sm">
                  <div class="flex items-center justify-between"><span class="text-sub">本月标注数</span><span class="font-medium">1,248 条</span></div>
                  <div class="flex items-center justify-between"><span class="text-sub">人工反馈采纳率</span><span class="font-medium">86%</span></div>
                  <div class="flex items-center justify-between"><span class="text-sub">最新训练时间</span><span class="font-medium">2026-07-30 02:00</span></div>
                </div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-primary-light">
              <div class="text-sm font-medium text-primary mb-2">AI 成长路径</div>
              <div class="text-sm text-sub">当前阶段：AI 助理（半自动辅助）。下一阶段目标：AI 正式员工（独立执行），需累计 5,000 条高质量反馈且任务完成率 ≥ 95%。</div>
            </div>
          </div>'''
            section = section[:insert_pos] + config_section + section[insert_pos:]
            print('✅ AI Agent 数字员工中心：已补充配置与训练反馈')

    html = html[:start] + section + html[end:]


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节增加到 {len(html)} 字节（+{len(html) - original_len} 字节）')
