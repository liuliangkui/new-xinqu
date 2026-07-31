#!/usr/bin/env python3
"""
第四批原型完善脚本：平台与决策
重点补充任务管理关联对象/看板、目标绩效预测与缺口、客户 360° 触达与标签。
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.batch4-backup')

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
# 1. 任务管理：补充关联对象标签与看板视图
# ============================================================
start, end = find_section('任务管理')
if start and end:
    section = html[start:end]

    # 在 KPI 后插入关联对象快捷筛选（任务管理 KPI 后紧接筛选 card）
    kpi_marker = '<div class="kpi-grid mb-5">'
    kpi_end = '</div>\n          </div>\n\n          <div class="card mb-4">'
    if kpi_marker in section and kpi_end in section:
        relation_filter = '''</div>
          </div>

          <!-- 关联对象快捷筛选 -->
          <div class="card mb-4 p-4">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div class="flex flex-wrap gap-2">
                <button class="tab active">全部任务</button>
                <button class="tab">我的任务</button>
                <button class="tab">团队任务</button>
                <button class="tab">协作任务</button>
              </div>
              <button class="btn btn-primary"><svg class="icon icon-sm"><use href="#icon-plus"/></svg> 新建任务</button>
            </div>
            <div class="flex flex-wrap gap-3 mb-3">
              <div class="relative flex-1 min-w-[200px] max-w-sm">
                <svg class="icon icon-md absolute left-3 top-1/2 -translate-y-1/2 text-placeholder"><use href="#icon-search"/></svg>
                <input type="text" class="input pl-10" placeholder="搜索任务、客户、负责人">
              </div>
              <select class="input w-auto"><option>全部优先级</option><option>高</option><option>中</option><option>低</option></select>
              <select class="input w-auto"><option>全部状态</option><option>待处理</option><option>进行中</option><option>已完成</option></select>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="text-xs text-sub py-1">关联对象：</span>
              <button class="badge badge-light cursor-pointer hover:bg-primary-light">全部</button>
              <button class="badge badge-light cursor-pointer hover:bg-primary-light">客户</button>
              <button class="badge badge-light cursor-pointer hover:bg-primary-light">意向</button>
              <button class="badge badge-light cursor-pointer hover:bg-primary-light">线索</button>
              <button class="badge badge-light cursor-pointer hover:bg-primary-light">工单</button>
            </div>
          </div>

          <div class="card mb-4">''' 
        section = section.replace(kpi_end, relation_filter, 1)
        print('✅ 任务管理：已补充关联对象快捷筛选')

    # 在 List view 后插入看板视图
    list_marker = '<!-- List view -->'
    if list_marker in section:
        idx = section.find(list_marker)
        # 找到 List view 容器结束位置
        after_list = section.find('</div>\n          </div>\n\n          <!-- New task drawer -->', idx)
        if after_list > 0:
            kanban_view = '''</div>
          </div>

          <!-- 看板视图 -->
          <div class="card mb-4 p-4 hidden" id="task-kanban-view">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">任务看板</h3>
              <button class="btn btn-outline btn-sm" onclick="showToast('切换回列表视图')">列表视图</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-panel rounded-xl p-3">
                <div class="text-sm font-medium text-sub mb-3">待处理 <span class="badge badge-light ml-1">12</span></div>
                <div class="space-y-2">
                  <div class="card p-3 cursor-pointer hover:shadow-hover"><div class="text-xs text-placeholder">CA-620</div><div class="text-sm font-medium text-ink">补货确认</div><div class="text-xs text-sub mt-1">曲靖市妇幼保健院 · 中</div></div>
                  <div class="card p-3 cursor-pointer hover:shadow-hover"><div class="text-xs text-placeholder">XN-550</div><div class="text-sm font-medium text-ink">保修续签跟进</div><div class="text-xs text-sub mt-1">昆明市第一人民医院 · 高</div></div>
                </div>
              </div>
              <div class="bg-panel rounded-xl p-3">
                <div class="text-sm font-medium text-sub mb-3">进行中 <span class="badge badge-light ml-1">28</span></div>
                <div class="space-y-2">
                  <div class="card p-3 cursor-pointer hover:shadow-hover"><div class="text-xs text-placeholder">BF-001</div><div class="text-sm font-medium text-ink">拜访：昭通市医院</div><div class="text-xs text-sub mt-1">关联意向 · 30%</div></div>
                </div>
              </div>
              <div class="bg-panel rounded-xl p-3">
                <div class="text-sm font-medium text-sub mb-3">已完成 <span class="badge badge-light ml-1">156</span></div>
                <div class="space-y-2">
                  <div class="card p-3 cursor-pointer hover:shadow-hover"><div class="text-xs text-placeholder">WO-202</div><div class="text-sm font-medium text-ink">工单回访</div><div class="text-xs text-sub mt-1">云南省肿瘤医院 · 已评价</div></div>
                </div>
              </div>
              <div class="bg-panel rounded-xl p-3">
                <div class="text-sm font-medium text-sub mb-3">已逾期 <span class="badge badge-light ml-1">5</span></div>
                <div class="space-y-2">
                  <div class="card p-3 cursor-pointer hover:shadow-hover border-l-4 border-danger"><div class="text-xs text-placeholder">LE-008</div><div class="text-sm font-medium text-ink">线索跟进</div><div class="text-xs text-sub mt-1">逾期 2 天 · 需督办</div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Task detail modal -->'''
            section = section[:after_list] + kanban_view + section[after_list + len('</div>\n          </div>\n\n          <!-- Task detail modal -->'):]
            print('✅ 任务管理：已补充看板视图')

    html = html[:start] + section + html[end:]


# ============================================================
# 2. 目标绩效：补充业绩预测与缺口分析
# ============================================================
start, end = find_section('目标绩效')
if start and end:
    section = html[start:end]

    # 在 KPI 后插入预测与缺口卡片
    kpi_marker = '<div class="kpi-grid mb-5">'
    kpi_end = '</div>\n          </div>\n\n          <!-- Tabs + search -->\n          <div class="card mb-4">'
    if kpi_marker in section and kpi_end in section:
        forecast_card = '''</div>
          </div>

          <!-- 业绩预测与缺口分析 -->
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">业绩预测与缺口分析</h3>
              <div class="flex items-center gap-2">
                <span class="text-xs text-sub">预测模型</span>
                <select class="input text-xs py-1"><option>基于 pipeline 转化</option><option>基于历史同期</option></select>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div class="p-4 rounded-xl bg-primary-light">
                <div class="text-xs text-sub mb-1">预测 Q3 完成</div>
                <div class="text-2xl font-bold text-primary">¥4,280万</div>
                <div class="text-xs text-sub mt-1">置信度 78%</div>
              </div>
              <div class="p-4 rounded-xl bg-warning-bg">
                <div class="text-xs text-sub mb-1">Q3 目标</div>
                <div class="text-2xl font-bold text-warning">¥5,000万</div>
                <div class="text-xs text-sub mt-1">剩余 64 天</div>
              </div>
              <div class="p-4 rounded-xl bg-danger-bg">
                <div class="text-xs text-sub mb-1">预测缺口</div>
                <div class="text-2xl font-bold text-danger">¥720万</div>
                <div class="text-xs text-sub mt-1">需新增重点项目</div>
              </div>
              <div class="p-4 rounded-xl bg-success-bg">
                <div class="text-xs text-sub mb-1">可挽回金额</div>
                <div class="text-2xl font-bold text-success">¥380万</div>
                <div class="text-xs text-sub mt-1">3 个停滞重点意向</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">缺口下钻</div>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm"><span class="text-sub">西南区缺口最大</span><span class="text-danger font-medium">-¥320万</span></div>
                <div class="flex items-center justify-between text-sm"><span class="text-sub">血液分析产品线落后</span><span class="text-danger font-medium">-¥280万</span></div>
                <div class="flex items-center justify-between text-sm"><span class="text-sub">新客户数不足</span><span class="text-warning font-medium">-¥120万</span></div>
              </div>
            </div>
          </div>

          <!-- Tabs + search -->
          <div class="card mb-4">'''
        section = section.replace(kpi_end, forecast_card, 1)
        print('✅ 目标绩效：已补充业绩预测与缺口分析')

    html = html[:start] + section + html[end:]


# ============================================================
# 3. 客户 360°：补充触达管理、分层标签、流失风险
# ============================================================
start, end = find_section('客户 360°')
if start and end:
    section = html[start:end]

    # 在客户信息卡片后插入客户分层与标签
    tag_marker = '<h4 class="font-semibold text-ink mb-3">关键联系人</h4>'
    if tag_marker in section:
        idx = section.find(tag_marker)
        tag_section = '''
            <h4 class="font-semibold text-ink mb-3">客户分层与标签</h4>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="badge badge-primary">重点客户</span>
              <span class="badge badge-success">三甲医院</span>
              <span class="badge badge-warning">血液分析优势</span>
              <span class="badge badge-info">高复购潜力</span>
              <span class="badge badge-light">+ 添加标签</span>
            </div>
            <div class="grid grid-cols-3 gap-3 mb-5">
              <div class="p-3 rounded-xl bg-primary-light text-center">
                <div class="text-xs text-sub">客户等级</div>
                <div class="text-lg font-bold text-primary">A 级</div>
              </div>
              <div class="p-3 rounded-xl bg-success-bg text-center">
                <div class="text-xs text-sub">健康度</div>
                <div class="text-lg font-bold text-success">88</div>
              </div>
              <div class="p-3 rounded-xl bg-gray-bg text-center">
                <div class="text-xs text-sub">流失风险</div>
                <div class="text-lg font-bold text-ink">低</div>
              </div>
            </div>

            <h4 class="font-semibold text-ink mb-3">关键联系人</h4>'''
        section = section.replace(tag_marker, tag_section, 1)
        print('✅ 客户 360°：已补充客户分层、标签、流失风险')

    # 在活跃意向后插入触达管理时间线
    touch_marker = '<h4 class="font-semibold text-ink mb-3">活跃意向</h4>'
    if touch_marker in section:
        idx = section.find(touch_marker)
        touch_section = '''
            <h4 class="font-semibold text-ink mb-3">触达管理</h4>
            <div class="space-y-3 mb-5">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                <div class="flex-1">
                  <div class="text-sm text-ink">电话沟通 · 王主任</div>
                  <div class="text-xs text-sub">2026-07-29 14:30 · 沟通血球流水线升级预算</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-success mt-1.5"></div>
                <div class="flex-1">
                  <div class="text-sm text-ink">现场拜访 · 张经理</div>
                  <div class="text-xs text-sub">2026-07-25 09:00 · GPS 定位正常 · 时长 45 分钟</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-warning mt-1.5"></div>
                <div class="flex-1">
                  <div class="text-sm text-ink">学术活动邀请</div>
                  <div class="text-xs text-sub">2026-07-20 10:00 · 邀请参加 IVD 学术沙龙</div>
                </div>
              </div>
            </div>

            <h4 class="font-semibold text-ink mb-3">活跃意向</h4>'''
        section = section.replace(touch_marker, touch_section, 1)
        print('✅ 客户 360°：已补充触达管理时间线')

    html = html[:start] + section + html[end:]


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节增加到 {len(html)} 字节（+{len(html) - original_len} 字节）')
