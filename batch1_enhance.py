#!/usr/bin/env python3
"""
第一批原型完善脚本：经营驾驶舱 / 工单管理 / 消息中心 / 应用配置
对照《鑫渠解决方案白皮书》补充关键缺失内容。
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.batch1-backup')

# 确保备份存在
if not BACKUP.exists():
    shutil.copy(FILE, BACKUP)

with open(FILE, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

original_len = len(html)


def find_section(title):
    """根据 h1 标题找到 section 的起止位置"""
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
# 1. 经营驾驶舱：补充关键运营指标 + 业绩预测与缺口分析
# ============================================================
start, end = find_section('经营驾驶舱')
if start and end:
    section = html[start:end]

    # 1.1 在全局健康度 KPI 网格后插入关键运营指标
    kpi_insert_marker = '</div>\n          </div>\n\n          <!-- 第二层：主题导航 -->'
    kpi_new = '''</div>
          </div>

          <!-- 第一层补充：关键运营指标 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-ink">关键运营指标</h3>
              <span class="text-xs text-sub">数据截至今日 08:00</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div class="text-center p-3 rounded-xl bg-gray-bg cursor-pointer hover:bg-primary-light/30" onclick="openDrillDown('install','集团')">
                <div class="text-xs text-sub mb-1 flex items-center justify-center gap-1">本月装机量 <svg class="icon icon-xs text-primary"><use href="#icon-arrow-right"/></svg></div>
                <div class="text-xl font-bold text-ink">18 台</div>
                <div class="text-xs text-success mt-1">↑ +20%</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-gray-bg cursor-pointer hover:bg-primary-light/30" onclick="openDrillDown('winrate','集团')">
                <div class="text-xs text-sub mb-1 flex items-center justify-center gap-1">赢单率 <svg class="icon icon-xs text-primary"><use href="#icon-arrow-right"/></svg></div>
                <div class="text-xl font-bold text-ink">34.2%</div>
                <div class="text-xs text-success mt-1">↑ +2.1%</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-gray-bg cursor-pointer hover:bg-primary-light/30" onclick="openDrillDown('health','集团')">
                <div class="text-xs text-sub mb-1 flex items-center justify-center gap-1">项目健康度 <svg class="icon icon-xs text-primary"><use href="#icon-arrow-right"/></svg></div>
                <div class="text-xl font-bold text-ink">82</div>
                <div class="text-xs text-warning mt-1">3 个异常</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-gray-bg cursor-pointer hover:bg-primary-light/30" onclick="openDrillDown('satisfaction','集团')">
                <div class="text-xs text-sub mb-1 flex items-center justify-center gap-1">服务满意度 <svg class="icon icon-xs text-primary"><use href="#icon-arrow-right"/></svg></div>
                <div class="text-xl font-bold text-ink">4.7</div>
                <div class="text-xs text-success mt-1">↑ +0.2</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-gray-bg cursor-pointer hover:bg-primary-light/30" onclick="openDrillDown('channel','集团')">
                <div class="text-xs text-sub mb-1 flex items-center justify-center gap-1">渠道健康度 <svg class="icon icon-xs text-primary"><use href="#icon-arrow-right"/></svg></div>
                <div class="text-xl font-bold text-ink">88</div>
                <div class="text-xs text-success mt-1">↑ +1</div>
              </div>
              <div class="text-center p-3 rounded-xl bg-danger-bg cursor-pointer hover:bg-danger-bg/80" onclick="openDrillDown('gap','集团')">
                <div class="text-xs text-sub mb-1 flex items-center justify-center gap-1">业绩缺口 <svg class="icon icon-xs text-danger"><use href="#icon-arrow-right"/></svg></div>
                <div class="text-xl font-bold text-danger">¥720万</div>
                <div class="text-xs text-danger mt-1">低于目标 24%</div>
              </div>
            </div>
          </div>

          <!-- 第二层：主题导航 -->'''

    if kpi_insert_marker in section:
        section = section.replace(kpi_insert_marker, kpi_new, 1)
        print('✅ 经营驾驶舱：已补充关键运营指标')
    else:
        print('⚠️ 经营驾驶舱：未找到 KPI 插入点')

    # 1.2 在 overview panel 中插入业绩预测与缺口分析卡片
    overview_marker = '<div id="db-panel-overview" class="db-panel">'
    if overview_marker in section:
        idx = section.find(overview_marker)
        # 找到该 div 内的第一个 grid 之后的位置
        after_grid = section.find('</div>', idx + len(overview_marker))
        if after_grid > 0:
            insert_pos = after_grid + len('</div>')
            forecast_card = '''
            <!-- 业绩预测与缺口分析 -->
            <div class="card p-4 mb-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-ink">业绩预测与缺口分析</h3>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-sub">预测周期</span>
                  <select class="input text-xs py-1"><option>本季度</option><option>本年度</option></select>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              </div>
              <div class="p-3 rounded-lg bg-panel">
                <div class="text-sm font-medium text-ink mb-2">缺口归因</div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">意向转化率低于预期</span><span class="font-medium text-danger">-¥620万</span></div>
                  <div class="w-full bg-line rounded-full h-2"><div class="bg-danger h-2 rounded-full" style="width: 42%"></div></div>
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">签约周期延长</span><span class="font-medium text-warning">-¥480万</span></div>
                  <div class="w-full bg-line rounded-full h-2"><div class="bg-warning h-2 rounded-full" style="width: 33%"></div></div>
                  <div class="flex items-center justify-between text-sm"><span class="text-sub">重点项目停滞</span><span class="font-medium text-info">-¥360万</span></div>
                  <div class="w-full bg-line rounded-full h-2"><div class="bg-info h-2 rounded-full" style="width: 25%"></div></div>
                </div>
              </div>
            </div>'''
            section = section[:insert_pos] + forecast_card + section[insert_pos:]
            print('✅ 经营驾驶舱：已补充业绩预测与缺口分析')

    html = html[:start] + section + html[end:]


# ============================================================
# 2. 工单管理：补充服务闭环能力 + 工程师信息
# ============================================================
start, end = find_section('工单管理')
if start and end:
    section = html[start:end]

    # 2.1 在 KPI 后插入服务闭环能力卡片
    wo_kpi_marker = '<div class="kpi-grid mb-5">'
    wo_kpi_end = '</div>\n\n          <div class="card mb-4">'
    if wo_kpi_marker in section and wo_kpi_end in section:
        service_loop = '''</div>

          <!-- 服务闭环能力 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-ink">服务闭环能力</h3>
              <button class="btn btn-outline btn-sm" onclick="showToast('工程师移动端开发中')">查看移动端</button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-3 rounded-xl bg-primary-light text-center">
                <div class="text-2xl mb-1">🤖</div>
                <div class="text-sm font-medium text-ink">智能派单</div>
                <div class="text-xs text-sub mt-1">基于技能、位置、负载自动派单</div>
              </div>
              <div class="p-3 rounded-xl bg-success-bg text-center">
                <div class="text-2xl mb-1">📍</div>
                <div class="text-sm font-medium text-ink">GPS 打卡</div>
                <div class="text-xs text-sub mt-1">到场/离场定位与拍照留痕</div>
              </div>
              <div class="p-3 rounded-xl bg-warning-bg text-center">
                <div class="text-2xl mb-1">🔧</div>
                <div class="text-sm font-medium text-ink">备件管理</div>
                <div class="text-xs text-sub mt-1">申领、核销、库存联动</div>
              </div>
              <div class="p-3 rounded-xl bg-info-bg text-center">
                <div class="text-2xl mb-1">✍️</div>
                <div class="text-sm font-medium text-ink">电子签收</div>
                <div class="text-xs text-sub mt-1">客户签字确认与服务评价</div>
              </div>
            </div>
          </div>

          <div class="card mb-4">'''
        section = section.replace(wo_kpi_end, service_loop, 1)
        print('✅ 工单管理：已补充服务闭环能力')
    else:
        print('⚠️ 工单管理：未找到 KPI 插入点')

    # 2.2 在 kanban 卡片中增加工程师信息
    kanban_card_marker = '<div class="kanban-card cursor-pointer" data-wo="WO-2026072901" data-title="云南省肿瘤医院 BC-6800 报错" data-priority="紧急" data-customer="云南省肿瘤医院" data-engineer="" data-sla="剩余 2 小时超时" onclick="openWorkorderModal(this)">'
    kanban_card_new = '<div class="kanban-card cursor-pointer" data-wo="WO-2026072901" data-title="云南省肿瘤医院 BC-6800 报错" data-priority="紧急" data-customer="云南省肿瘤医院" data-engineer="张工" data-sla="剩余 2 小时超时" onclick="openWorkorderModal(this)">'
    if kanban_card_marker in section:
        section = section.replace(kanban_card_marker, kanban_card_new, 1)
        print('✅ 工单管理：已补充工程师信息')

    html = html[:start] + section + html[end:]


# ============================================================
# 3. 消息中心：补充保护期提醒 + 已读未读状态
# ============================================================
start, end = find_section('消息中心')
if start and end:
    section = html[start:end]

    # 3.1 在消息列表开头插入保护期到期提醒
    msg_list_marker = '<div class="space-y-2 mt-3" id="msg-list">'
    if msg_list_marker in section:
        insert_pos = section.find(msg_list_marker) + len(msg_list_marker)
        new_msg = '''
              <div class="msg-item flex items-start gap-3 p-3 rounded-lg hover:bg-line-light cursor-pointer transition-colors unread" data-type="warning" onclick="openMessageModal(this)" data-type="warning">
                <div class="w-10 h-10 rounded-full bg-danger-bg text-danger flex items-center justify-center flex-shrink-0"><svg class="icon icon-md"><use href="#icon-warning"/></svg></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2"><span class="font-medium text-ink">保护期到期提醒：昆明市第一人民医院血球项目</span><span class="badge badge-danger">预警</span><span class="w-2 h-2 rounded-full bg-danger flex-shrink-0" title="未读"></span></div>
                  <div class="text-sub text-xs mt-1">该项目保护期将于 2026-08-02 到期，已到期前 3 天/1 天/当天自动提醒，超期未汇报将自动回收或冻结。</div>
                  <div class="text-placeholder text-xs mt-2">刚刚</div>
                </div>
              </div>'''
        section = section[:insert_pos] + new_msg + section[insert_pos:]
        print('✅ 消息中心：已补充保护期到期提醒')

    # 3.2 给第一个已有消息增加未读点
    first_badge_marker = '<span class="badge badge-danger">待办</span></div>'
    if first_badge_marker in section:
        section = section.replace(
            first_badge_marker,
            '<span class="badge badge-danger">待办</span><span class="w-2 h-2 rounded-full bg-danger flex-shrink-0 ml-1" title="未读"></span></div>',
            1
        )
        print('✅ 消息中心：已补充已读未读标识')

    html = html[:start] + section + html[end:]


# ============================================================
# 4. 应用配置：补充配置层级关系说明
# ============================================================
start, end = find_section('应用配置')
if start and end:
    section = html[start:end]

    # 在应用市场 panel 的开头插入配置层级关系说明
    market_panel_marker = '<div id="appconfig-panel-market" class="appconfig-panel">'
    if market_panel_marker in section:
        insert_pos = section.find(market_panel_marker) + len(market_panel_marker)
        level_card = '''
              <div class="p-4 rounded-xl bg-primary-light mb-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="icon icon-sm text-primary"><use href="#icon-info"/></svg>
                  <span class="font-medium text-ink">配置层级关系</span>
                </div>
                <div class="text-sm text-sub">
                  平台级默认配置 → 租户级配置 → 应用级配置 → 用户级偏好。下级覆盖上级，应用级配置决定字段、视图、流程绑定与权限在运行时如何生效。
                </div>
              </div>'''
        section = section[:insert_pos] + level_card + section[insert_pos:]
        print('✅ 应用配置：已补充配置层级关系说明')

    html = html[:start] + section + html[end:]


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节增加到 {len(html)} 字节（+{len(html) - original_len} 字节）')
