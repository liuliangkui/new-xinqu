#!/usr/bin/env python3
"""
按规范调整数据分析页面布局：
- 页面顶部只放 KPI、图表、数据表格
- 分析结论、归因、瓶颈识别、AI 建议统一放到页面底部
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.analysis-layout-backup')

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


def move_to_bottom(section, block_start_marker, block_end_marker, new_block):
    """把指定区块从当前位置移除，并插入到 section 底部（</section> 之前）"""
    start_idx = section.find(block_start_marker)
    if start_idx < 0:
        return section, False
    
    end_idx = section.find(block_end_marker, start_idx)
    if end_idx < 0:
        return section, False
    end_idx += len(block_end_marker)
    
    block_html = section[start_idx:end_idx]
    section_without = section[:start_idx] + section[end_idx:]
    
    # 插入到底部 </section> 之前
    bottom_idx = section_without.rfind('</section>')
    if bottom_idx < 0:
        return section, False
    
    section_new = section_without[:bottom_idx] + new_block + section_without[bottom_idx:]
    return section_new, True


# ============================================================
# 1. 经营驾驶舱：把"缺口归因"从业绩预测卡片移到底部
# ============================================================
start, end = find_section('经营驾驶舱')
if start and end:
    section = html[start:end]
    
    # 找到业绩预测卡片中的"缺口归因"部分
    attribution_marker = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4">\n                <div class="p-3 rounded-lg bg-panel">\n                  <div class="flex items-center justify-between text-sm mb-1"><span class="text-sub">意向转化率低于预期</span>'
    attribution_end = '</div>\n                </div>\n              </div>\n            </div>\n\n            <!-- 核心指标卡片'
    
    if attribution_marker in section:
        # 构造新的底部分析结论区块
        new_bottom = '''

            <!-- AI 分析结论：缺口归因 -->
            <div class="card p-4 mb-5">
              <div class="flex items-center gap-2 mb-4">
                <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
                <h3 class="font-semibold text-ink">AI 分析结论</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="p-4 rounded-lg bg-danger-bg">
                  <div class="text-sm font-medium text-danger mb-1">意向转化率低于预期</div>
                  <div class="text-2xl font-bold text-danger">-¥620万</div>
                  <div class="text-xs text-sub mt-1">占比 42%，最大缺口来源。建议加强方案确认阶段的客户引导与销售培训。</div>
                </div>
                <div class="p-4 rounded-lg bg-warning-bg">
                  <div class="text-sm font-medium text-warning mb-1">签约周期延长</div>
                  <div class="text-2xl font-bold text-warning">-¥480万</div>
                  <div class="text-xs text-sub mt-1">占比 33%。重点医院招标流程放缓，需提前介入招标办与采购科。</div>
                </div>
                <div class="p-4 rounded-lg bg-info-bg">
                  <div class="text-sm font-medium text-info mb-1">重点项目停滞</div>
                  <div class="text-2xl font-bold text-info">-¥360万</div>
                  <div class="text-xs text-sub mt-1">占比 25%。3 个重点意向超过 30 天无跟进更新，建议管理层介入督办。</div>
                </div>
              </div>
              <div class="p-3 rounded-lg bg-panel">
                <div class="text-sm font-medium text-ink mb-2">行动建议</div>
                <div class="text-sm text-sub">1. 下周召开重点项目复盘会，对 3 个停滞项目进行逐一诊断；2. 针对西南区销售开展方案呈现与异议处理培训；3. 提前启动 Q4 重点项目招标关系建设。</div>
              </div>
            </div>
'''
        
        section, ok = move_to_bottom(section, attribution_marker, attribution_end, new_bottom)
        if ok:
            html = html[:start] + section + html[end:]
            print('✅ 经营驾驶舱：缺口归因已移到底部')


# ============================================================
# 2. 意向管理：把"瓶颈识别"从转化漏斗移到底部
# ============================================================
start, end = find_section('意向管理')
if start and end:
    section = html[start:end]
    
    bottleneck_marker = '<div class="p-3 rounded-lg bg-panel">\n              <div class="text-sm font-medium text-ink mb-2">瓶颈识别</div>'
    bottleneck_end = '</div>\n          </div>\n\n          <!-- Grid view -->'
    
    if bottleneck_marker in section:
        new_bottom = '''

          <!-- AI 分析结论：转化瓶颈 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="p-4 rounded-lg bg-danger-bg mb-4">
              <div class="text-sm font-medium text-danger mb-2">主要瓶颈：方案 → 投标/临评</div>
              <div class="text-sm text-sub">该阶段转化率仅 60.5%，低于健康水平（≥75%）。主要原因：临评资料准备周期长、客户内部审批节点多、竞品同期送样干扰。</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-3 rounded-lg bg-panel">
                <div class="text-sm font-medium text-ink mb-1">行动建议 1</div>
                <div class="text-xs text-sub">建立临评资料模板库，将准备周期从 14 天缩短至 7 天</div>
              </div>
              <div class="p-3 rounded-lg bg-panel">
                <div class="text-sm font-medium text-ink mb-1">行动建议 2</div>
                <div class="text-xs text-sub">提前识别客户采购委员会成员，分阶段推进内部审批</div>
              </div>
              <div class="p-3 rounded-lg bg-panel">
                <div class="text-sm font-medium text-ink mb-1">行动建议 3</div>
                <div class="text-xs text-sub">监控竞品试用动态，针对性准备性能对比数据</div>
              </div>
            </div>
          </div>
'''
        section, ok = move_to_bottom(section, bottleneck_marker, bottleneck_end, new_bottom)
        if ok:
            html = html[:start] + section + html[end:]
            print('✅ 意向管理：瓶颈识别已移到底部')


# ============================================================
# 3. 目标绩效：把"缺口下钻"从业绩预测移到底部
# ============================================================
start, end = find_section('目标绩效')
if start and end:
    section = html[start:end]
    
    gap_marker = '<div class="p-3 rounded-lg bg-panel">\n              <div class="text-sm font-medium text-ink mb-2">缺口下钻</div>'
    gap_end = '</div>\n          </div>\n\n          <!-- Tabs + search -->'
    
    if gap_marker in section:
        new_bottom = '''

          <!-- AI 分析结论：绩效缺口归因 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 rounded-lg bg-danger-bg">
                <div class="text-sm font-medium text-danger mb-1">西南区缺口最大</div>
                <div class="text-2xl font-bold text-danger">-¥320万</div>
                <div class="text-xs text-sub mt-1">受重点项目延期与人员变动影响，需区域总监重点跟进</div>
              </div>
              <div class="p-4 rounded-lg bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">血液分析产品线落后</div>
                <div class="text-2xl font-bold text-warning">-¥280万</div>
                <div class="text-xs text-sub mt-1">竞品价格战激烈，建议调整促销策略与捆绑方案</div>
              </div>
              <div class="p-4 rounded-lg bg-info-bg">
                <div class="text-sm font-medium text-info mb-1">新客户数不足</div>
                <div class="text-2xl font-bold text-info">-¥120万</div>
                <div class="text-xs text-sub mt-1">新客转化率低于预期，需加强市场活动与代理商协同</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">达成路径</div>
              <div class="text-sm text-sub">若要补足 ¥720 万缺口，需：1. 确保 3 个停滞重点意向在 8 月签约；2. 新增 2-3 个血球流水线项目进入投标阶段；3. 西南区每周召开缺口追赶会议。</div>
            </div>
          </div>
'''
        section, ok = move_to_bottom(section, gap_marker, gap_end, new_bottom)
        if ok:
            html = html[:start] + section + html[end:]
            print('✅ 目标绩效：缺口下钻已移到底部')


# ============================================================
# 4. 试剂运营：把"流失预警与挽回跟进"移到底部
# ============================================================
start, end = find_section('试剂运营')
if start and end:
    section = html[start:end]
    
    churn_marker = '<!-- 补充：流失预警 -->'
    churn_end = '</div>\n\n          <!-- New reagent modal -->'
    
    if churn_marker in section:
        new_bottom = '''

          <!-- AI 分析结论：流失预警与挽回建议 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 rounded-lg bg-danger-bg">
                <div class="text-sm font-medium text-danger mb-1">消耗环比下降</div>
                <div class="text-2xl font-bold text-danger">15 台设备</div>
                <div class="text-xs text-sub mt-1">近 30 天消耗环比下降 &gt; 20%，可能存在设备故障或竞品替换</div>
              </div>
              <div class="p-4 rounded-lg bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">竞品替换风险</div>
                <div class="text-2xl font-bold text-warning">6 个项目</div>
                <div class="text-xs text-sub mt-1">检测到竞品报价或试用记录，需主动介入</div>
              </div>
              <div class="p-4 rounded-lg bg-success-bg">
                <div class="text-sm font-medium text-success mb-1">已挽回项目</div>
                <div class="text-2xl font-bold text-success">3 个项目</div>
                <div class="text-xs text-sub mt-1">本月通过主动跟进挽回，建议总结成功经验</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">挽回策略</div>
              <div class="text-sm text-sub">1. 对 15 台消耗下降设备安排工程师上门巡检；2. 针对 6 个竞品风险项目启动价格/服务专项方案；3. 对重点客户推送试剂库存预警，避免断货被竞品替代。</div>
            </div>
          </div>
'''
        section, ok = move_to_bottom(section, churn_marker, churn_end, new_bottom)
        if ok:
            html = html[:start] + section + html[end:]
            print('✅ 试剂运营：流失预警分析已移到底部')


# ============================================================
# 5. 数据洞察中心：把"瓶颈识别"移到底部
# ============================================================
start, end = find_section('数据洞察中心')
if start and end:
    section = html[start:end]
    
    # 由于数据洞察中心是我们刚要创建的空壳页面，这里先检查是否已存在
    bottleneck_marker = '<div class="p-3 rounded-lg bg-panel">\n              <div class="text-sm font-medium text-ink mb-2">瓶颈识别</div>'
    if bottleneck_marker in section:
        new_bottom = '''

          <!-- AI 分析结论：转化瓶颈 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 rounded-lg bg-danger-bg">
                <div class="text-sm font-medium text-danger mb-1">方案 → 投标/临评</div>
                <div class="text-xs text-sub">转化率仅 60.5%，建议加强临评推动力度</div>
              </div>
              <div class="p-4 rounded-lg bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">意向 → 方案</div>
                <div class="text-xs text-sub">转化率 76.6%，部分意向停留在早期阶段</div>
              </div>
              <div class="p-4 rounded-lg bg-success-bg">
                <div class="text-sm font-medium text-success mb-1">投标/临评 → 签约</div>
                <div class="text-xs text-sub">转化率 53.8%，符合行业平均水平</div>
              </div>
            </div>
          </div>
'''
        section, ok = move_to_bottom(section, bottleneck_marker, '</div>\n\n          </div>\n\n          </section>', new_bottom)
        if ok:
            html = html[:start] + section + html[end:]
            print('✅ 数据洞察中心：瓶颈识别已移到底部')


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节变为 {len(html)} 字节（+{len(html) - original_len} 字节）')
