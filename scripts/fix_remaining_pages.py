#!/usr/bin/env python3
"""
修复剩余不合理页面：
1. 为空壳页面补充内容（效益中心、数据洞察中心、返利与佣金、资质管理）
2. 调整渠道秩序的大元素
3. 新补充页面遵循"数据在上、分析结论在下"的规范
"""
import re
import shutil
from pathlib import Path

FILE = Path('鑫渠高保真原型.html')
BACKUP = Path('鑫渠高保真原型.html.remaining-fix-backup')

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


def insert_before_section_close(section, content):
    """在 section 的 </section> 之前插入内容"""
    idx = section.rfind('</section>')
    if idx < 0:
        return section
    return section[:idx] + content + section[idx:]


# ============================================================
# 1. 效益中心：营收/回款/毛利/效益统计
# ============================================================
start, end = find_section('效益中心')
if start and end:
    section = html[start:end]
    if 'AI 分析结论' not in section:
        new_content = '''
          <!-- AI 分析结论 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 rounded-lg bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">回款率需关注</div>
                <div class="text-xs text-sub">回款率 73.7%，低于健康水平 80%，逾期应收 ¥380 万需重点催收</div>
              </div>
              <div class="p-4 rounded-lg bg-success-bg">
                <div class="text-sm font-medium text-success mb-1">毛利结构健康</div>
                <div class="text-xs text-sub">毛利率 26.2%，血球分析流水线贡献最大（¥620 万）</div>
              </div>
              <div class="p-4 rounded-lg bg-info-bg">
                <div class="text-sm font-medium text-info mb-1">区域贡献集中</div>
                <div class="text-xs text-sub">西南区贡献 35% 营收，需防范单一区域依赖风险</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">经营建议</div>
              <div class="text-sm text-sub">1. 建立逾期应收分级催收机制，重点跟进西南区 3 个大额逾期客户；2. 血球产品线保持优势的同时，推动生化免疫一体机向华东、华南复制；3. 监控销售费用率，确保学术活动 ROI 不低于 3:1。</div>
            </div>
          </div>
'''
        section = insert_before_section_close(section, new_content)
        html = html[:start] + section + html[end:]
        print('✅ 效益中心：已补充 AI 分析结论')


# ============================================================
# 2. 数据洞察中心：转化分析与瓶颈识别
# ============================================================
start, end = find_section('数据洞察中心')
if start and end:
    section = html[start:end]
    if 'AI 分析结论' not in section:
        new_content = '''
          <!-- AI 分析结论 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 rounded-lg bg-success-bg">
                <div class="text-sm font-medium text-success mb-1">线索转意向表现优异</div>
                <div class="text-xs text-sub">28.6% 高于行业均值 22%，有效线索占比 63.0% 说明前端获客质量较好</div>
              </div>
              <div class="p-4 rounded-lg bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">意向 → 成交仍有空间</div>
                <div class="text-xs text-sub">意向成交率 19.2%，丢单主因价格/竞品 32%、决策链变动 24%，需强化价值传递与高层覆盖</div>
              </div>
              <div class="p-4 rounded-lg bg-danger-bg">
                <div class="text-sm font-medium text-danger mb-1">华北区转化明显偏低</div>
                <div class="text-xs text-sub">华北区综合转化率 7.7%，仅为西南区的 35%，建议复盘区域打法与资源投放</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">转化优化建议</div>
              <div class="text-sm text-sub">1. 针对价格敏感丢单，建立“临床价值+TCO”话术与竞品对比包；2. 华北区试点“区域打法诊断”，增加样机投放与临床培训；3. 将成交周期已缩短至 86 天的经验复制到华东、华南。</div>
            </div>
          </div>
'''
        section = insert_before_section_close(section, new_content)
        html = html[:start] + section + html[end:]
        print('✅ 数据洞察中心：已补充 AI 分析结论')


# ============================================================
# 3. 返利与佣金：返利政策与结算
# ============================================================
start, end = find_section('返利与佣金')
if start and end:
    section = html[start:end]
    if 'AI 分析结论' not in section:
        new_content = '''
          <!-- AI 分析结论 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="p-4 rounded-lg bg-warning-bg">
                <div class="text-sm font-medium text-warning mb-1">结算进度偏慢</div>
                <div class="text-xs text-sub">Q2 应付返利 ¥186 万，已结算 76.3%，剩余 ¥44 万待结，建议加快对账与付款 SLA</div>
              </div>
              <div class="p-4 rounded-lg bg-info-bg">
                <div class="text-sm font-medium text-info mb-1">阶梯差额可撬动</div>
                <div class="text-xs text-sub">未达阶梯差额 ¥10 万，头部经销商再增量即可解锁更高返利档，提升粘性</div>
              </div>
              <div class="p-4 rounded-lg bg-success-bg">
                <div class="text-sm font-medium text-success mb-1">新客奖励政策有效</div>
                <div class="text-xs text-sub">新客开发奖励覆盖三级医院与二甲，建议向凝血/生化新品线倾斜</div>
              </div>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">返利策略建议</div>
              <div class="text-sm text-sub">1. 对 12 笔待审核佣金建立 T+3 审核 SLA；2. 对接近下一阶梯的经销商推送“再加量 X% 可提升返利比例”提醒；3. 将返利与新品上量挂钩，避免老品过度依赖价格折扣。</div>
            </div>
          </div>
'''
        section = insert_before_section_close(section, new_content)
        html = html[:start] + section + html[end:]
        print('✅ 返利与佣金：已补充 AI 分析结论')


# ============================================================
# 4. 资质管理：资质证照与年审提醒
# ============================================================
start, end = find_section('资质管理')
if start and end:
    section = html[start:end]
    if '证照总数' not in section:
        new_content = '''
          <div class="card mb-5 p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">资质证照总览</h3>
              <button class="btn btn-primary btn-sm">上传资质</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div class="p-4 rounded-xl bg-primary-light text-center">
                <div class="text-xs text-sub mb-1">证照总数</div>
                <div class="text-2xl font-bold text-primary">642</div>
                <div class="text-xs text-sub mt-1">覆盖 86 个品牌</div>
              </div>
              <div class="p-4 rounded-xl bg-success-bg text-center">
                <div class="text-xs text-sub mb-1">有效期内</div>
                <div class="text-2xl font-bold text-success">598</div>
                <div class="text-xs text-sub mt-1">93.1%</div>
              </div>
              <div class="p-4 rounded-xl bg-warning-bg text-center">
                <div class="text-xs text-sub mb-1">30 天内到期</div>
                <div class="text-2xl font-bold text-warning">18</div>
                <div class="text-xs text-sub mt-1">需提醒更新</div>
              </div>
              <div class="p-4 rounded-xl bg-danger-bg text-center">
                <div class="text-xs text-sub mb-1">已过期</div>
                <div class="text-2xl font-bold text-danger">4</div>
                <div class="text-xs text-sub mt-1">暂停合作</div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-sub border-b border-line"><tr><th class="text-left py-2">资质名称</th><th class="text-left py-2">持有方</th><th class="text-left py-2">类型</th><th class="text-right py-2">有效期至</th><th class="text-left py-2">状态</th></tr></thead>
                <tbody>
                  <tr class="border-b border-line-light"><td class="py-2">全自动血液分析仪注册证</td><td class="py-2">希森美康</td><td class="py-2">产品注册证</td><td class="text-right py-2">2027-05-18</td><td class="py-2"><span class="badge badge-success">有效</span></td></tr>
                  <tr class="border-b border-line-light"><td class="py-2">医疗器械经营许可证</td><td class="py-2">昆明博奥</td><td class="py-2">经营许可证</td><td class="text-right py-2">2026-08-22</td><td class="py-2"><span class="badge badge-warning">即将到期</span></td></tr>
                  <tr><td class="py-2">二类医疗器械备案凭证</td><td class="py-2">大理康盛</td><td class="py-2">经营备案</td><td class="text-right py-2 text-danger">2026-06-30</td><td class="py-2"><span class="badge badge-danger">已过期</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card p-4 mb-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-ink">年审提醒</h3>
            </div>
            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm"><span class="text-sub">昆明博奥医疗器械经营许可证</span><span class="font-medium text-warning">30 天内到期</span></div>
              <div class="flex items-center justify-between text-sm"><span class="text-sub">西双版纳医院采购资质</span><span class="font-medium text-warning">60 天内到期</span></div>
              <div class="flex items-center justify-between text-sm"><span class="text-sub">滴宝品牌授权书</span><span class="font-medium text-success">已年审</span></div>
            </div>
          </div>

          <!-- AI 分析结论 -->
          <div class="card p-4 mb-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="icon icon-md text-primary"><use href="#icon-ai"/></svg>
              <h3 class="font-semibold text-ink">AI 分析结论</h3>
            </div>
            <div class="p-3 rounded-lg bg-panel">
              <div class="text-sm font-medium text-ink mb-2">资质风险预警</div>
              <div class="text-sm text-sub">4 张过期证照已触发合作暂停，18 张临期证照需在 30 天内完成更新。建议将年审提醒提前至 90 天，并建立资质到期自动冻结交易机制。</div>
            </div>
          </div>
'''
        section = insert_before_section_close(section, new_content)
        html = html[:start] + section + html[end:]
        print('✅ 资质管理：已补充内容')


# ============================================================
# 5. 渠道秩序：调整大元素
# ============================================================
start, end = find_section('渠道秩序')
if start and end:
    section = html[start:end]
    # 把 h-64/h-72/h-80/h-96 等大元素改为 h-40
    section = re.sub(r'h-(64|72|80|96)', r'h-40', section)
    section = re.sub(r'w-(24|32|40|48|56|64)', r'w-20', section)
    html = html[:start] + section + html[end:]
    print('✅ 渠道秩序：已调整大元素尺寸')


# 保存
with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\n完成。文件从 {original_len} 字节变为 {len(html)} 字节（+{len(html) - original_len} 字节）')
