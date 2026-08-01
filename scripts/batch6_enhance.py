#!/usr/bin/env python3
"""
第六批原型完善脚本：细节打磨
补充转化漏斗、工程师移动端/智能派单、飞检抽查任务、敏感词审计命中记录等细节。
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.batch6-backup')

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
# 1. 意向管理：补充转化漏斗可视化
# ============================================================
start, end = find_section('意向管理')
if start and end:
    section = html[start:end]

    # 在 KPI 后插入转化漏斗卡片
    kpi_marker = '<div class="kpi-grid mb-5">'
    kpi_end = '</div>\n          </div>\n\n          <!-- Grid view -->'
    if kpi_marker in section and kpi_end in section:
        funnel_card = '''</div>
          </div>

          <!-- 转化漏斗分析 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">转化漏斗分析</h3>
              <select class="input text-xs py-1"><option>本月</option><option>本季</option><option>本年</option></select>
            </div>
            <div class="flex items-end justify-between gap-2 mb-2">
              <div class="flex-1 text-center">
                <div class="bg-primary-light rounded-t-lg mx-auto" style="height: 160px; width: 90%;"></div>
                <div class="text-sm font-medium text-ink mt-2">线索</div>
                <div class="text-xl font-bold text-primary">248</div>
                <div class="text-xs text-sub">100%</div>
              </div>
              <div class="flex-1 text-center">
                <div class="bg-primary-light/80 rounded-t-lg mx-auto" style="height: 120px; width: 85%;"></div>
                <div class="text-sm font-medium text-ink mt-2">意向</div>
                <div class="text-xl font-bold text-primary">128</div>
                <div class="text-xs text-sub">51.6%</div>
              </div>
              <div class="flex-1 text-center">
                <div class="bg-primary-light/60 rounded-t-lg mx-auto" style="height: 90px; width: 75%;"></div>
                <div class="text-sm font-medium text-ink mt-2">方案</div>
                <div class="text-xl font-bold text-primary">86</div>
                <div class="text-xs text-sub">34.7%</div>
              </div>
              <div class="flex-1 text-center">
                <div class="bg-primary-light/40 rounded-t-lg mx-auto" style="height: 60px; width: 65%;"></div>
                <div class="text-sm font-medium text-ink mt-2">投标/临评</div>
                <div class="text-xl font-bold text-primary">52</div>
                <div class="text-xs text-sub">21.0%</div>
              </div>
              <div class="flex-1 text-center">
                <div class="bg-primary rounded-t-lg mx-auto" style="height: 40px; width: 55%;"></div>
                <div class="text-sm font-medium text-ink mt-2">签约</div>
                <div class="text-xl font-bold text-primary">28</div>
                <div class="text-xs text-sub">11.3%</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">瓶颈识别</div>
              <div class="text-sm text-sub">「方案 → 投标/临评」阶段转化率最低（60.5%），建议加强方案确认与临评推动力度。</div>
            </div>
          </div>

          <!-- Grid view -->'''
        section = section.replace(kpi_end, funnel_card, 1)
        print('✅ 意向管理：已补充转化漏斗分析')

    html = html[:start] + section + html[end:]


# ============================================================
# 2. 工单管理：补充工程师移动端与智能派单
# ============================================================
start, end = find_section('工单管理')
if start and end:
    section = html[start:end]

    # 在服务闭环能力卡片后插入工程师移动端预览和智能派单规则
    loop_marker = '<!-- 服务闭环能力 -->'
    if loop_marker in section:
        idx = section.find(loop_marker)
        # 找到该卡片结束位置
        loop_end = section.find('</div>\n          </div>\n\n          <!-- Kanban -->', idx)
        if loop_end > 0:
            insert_pos = loop_end + len('</div>\n          </div>')
            mobile_section = '''

          <!-- 工程师移动端与智能派单 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div class="card p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-ink">工程师移动端</h3>
                <span class="badge badge-primary">企业微信/小程序</span>
              </div>
              <div class="space-y-2 text-sm text-sub">
                <div class="flex items-center gap-2"><svg class="icon icon-xs text-success"><use href="#icon-check"/></svg> 接单推送与一键导航</div>
                <div class="flex items-center gap-2"><svg class="icon icon-xs text-success"><use href="#icon-check"/></svg> GPS 到场打卡与拍照留痕</div>
                <div class="flex items-center gap-2"><svg class="icon icon-xs text-success"><use href="#icon-check"/></svg> 备件申领与电子签收</div>
                <div class="flex items-center gap-2"><svg class="icon icon-xs text-success"><use href="#icon-check"/></svg> 客户满意度评价</div>
              </div>
              <div class="mt-3 p-3 rounded-lg bg-panel">
                <div class="text-xs text-sub">今日移动端打卡 18 次 · 平均响应 12 分钟</div>
              </div>
            </div>
            <div class="card p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-ink">智能派单规则</h3>
                <button class="btn btn-outline btn-sm" onclick="showToast('配置派单规则')">配置</button>
              </div>
              <div class="space-y-2 text-sm text-sub">
                <div class="flex items-center justify-between"><span>按技能匹配</span><span class="badge badge-light">启用</span></div>
                <div class="flex items-center justify-between"><span>按距离就近</span><span class="badge badge-light">启用</span></div>
                <div class="flex items-center justify-between"><span>按负载均衡</span><span class="badge badge-light">启用</span></div>
                <div class="flex items-center justify-between"><span>客户指定工程师</span><span class="badge badge-light">启用</span></div>
              </div>
              <div class="mt-3 p-3 rounded-lg bg-panel">
                <div class="text-xs text-sub">智能派单覆盖率 78% · 平均派单时间 3 分钟</div>
              </div>
            </div>
          </div>'''
            section = section[:insert_pos] + mobile_section + section[insert_pos:]
            print('✅ 工单管理：已补充工程师移动端与智能派单')

    html = html[:start] + section + html[end:]


# ============================================================
# 3. 合规风控：补充飞检任务列表与敏感词命中记录
# ============================================================
start, end = find_section('合规风控')
if start and end:
    section = html[start:end]

    # 在飞检抽查 panel 内补充任务列表
    spot_panel_marker = 'id="compliance-panel-spot"'
    if spot_panel_marker in section:
        idx = section.find(spot_panel_marker)
        card_idx = section.find('<div class="card-grid mb-4">', idx)
        if card_idx > 0:
            spot_list = '''
            <div class="card p-4 mb-4 bg-info-bg/30">
              <div class="flex items-center justify-between mb-3">
                <div class="font-medium text-ink">飞检任务列表</div>
                <button class="btn btn-outline btn-sm" onclick="showToast('新建飞检任务')">新建任务</button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="text-sub border-b border-line"><tr><th class="text-left py-2">任务编号</th><th class="text-left py-2">检查对象</th><th class="text-left py-2">检查项</th><th class="text-left py-2">负责人</th><th class="text-left py-2">状态</th></tr></thead>
                  <tbody>
                    <tr class="border-b border-line-light"><td class="py-2">FJ-2026072901</td><td class="py-2">昆明博奥生物技术有限公司</td><td class="py-2">授权区域 / 库存台账</td><td class="py-2">合规专员 · 李娜</td><td class="py-2"><span class="badge badge-primary">执行中</span></td></tr>
                    <tr class="border-b border-line-light"><td class="py-2">FJ-2026072802</td><td class="py-2">大理康盛医疗器械有限公司</td><td class="py-2">样品流向 / 费用凭证</td><td class="py-2">合规专员 · 王芳</td><td class="py-2"><span class="badge badge-warning">待整改</span></td></tr>
                    <tr><td class="py-2">FJ-2026072503</td><td class="py-2">西双版纳医院</td><td class="py-2">拜访记录 / GPS 定位</td><td class="py-2">合规专员 · 张敏</td><td class="py-2"><span class="badge badge-success">已关闭</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            '''
            section = section[:card_idx] + spot_list + section[card_idx:]
            print('✅ 合规风控：已补充飞检任务列表')

    # 在敏感词审计 panel 内补充命中记录
    sensitive_panel_marker = 'id="compliance-panel-sensitive"'
    if sensitive_panel_marker in section:
        idx = section.find(sensitive_panel_marker)
        card_idx = section.find('<div class="card-grid mb-4">', idx)
        if card_idx > 0:
            sensitive_list = '''
            <div class="card p-4 mb-4 bg-danger-bg/30">
              <div class="flex items-center justify-between mb-3">
                <div class="font-medium text-ink">敏感词命中记录</div>
                <button class="btn btn-outline btn-sm" onclick="showToast('查看全部命中')">全部命中</button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="text-sub border-b border-line"><tr><th class="text-left py-2">来源</th><th class="text-left py-2">命中词</th><th class="text-left py-2">上下文</th><th class="text-left py-2">时间</th><th class="text-left py-2">状态</th></tr></thead>
                  <tbody>
                    <tr class="border-b border-line-light"><td class="py-2">拜访记录 · 张经理</td><td class="py-2 text-danger">回扣</td><td class="py-2">"能否给科室一些回扣..."</td><td class="py-2">2026-07-29 14:32</td><td class="py-2"><span class="badge badge-warning">待复核</span></td></tr>
                    <tr class="border-b border-line-light"><td class="py-2">学术活动申请</td><td class="py-2 text-danger">赞助费</td><td class="py-2">"赞助费直接转给..."</td><td class="py-2">2026-07-28 09:15</td><td class="py-2"><span class="badge badge-danger">已驳回</span></td></tr>
                    <tr><td class="py-2">样品申请 · 李丽</td><td class="py-2 text-danger">试用</td><td class="py-2">"先试用再决定..."</td><td class="py-2">2026-07-27 16:45</td><td class="py-2"><span class="badge badge-success">已澄清</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            '''
            section = section[:card_idx] + sensitive_list + section[card_idx:]
            print('✅ 合规风控：已补充敏感词命中记录')

    html = html[:start] + section + html[end:]


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节增加到 {len(html)} 字节（+{len(html) - original_len} 字节）')
