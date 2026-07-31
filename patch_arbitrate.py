import re
from datetime import datetime

path = '/Users/mac/qucheng/鑫渠高保真原型.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# ---------- helpers ----------
def attr(value):
    if value is None:
        return ''
    return str(value).replace('"', '&quot;')

def format_last_report(last_report):
    if not last_report:
        return '从未汇报'
    date_str = last_report.split(' ')[0]
    try:
        d = datetime.strptime(date_str, '%Y-%m-%d')
        diff = (datetime.now() - d).days
        if diff <= 0:
            return '今天'
        if diff == 1:
            return '昨天'
        return f'{diff} 天前'
    except Exception:
        return last_report

def protect_badge_text(days, status):
    d = int(days)
    if status == 'recycled':
        return '已回收', 'badge-danger'
    if status == 'frozen':
        return '已冻结', 'badge-danger'
    if d < 0:
        return f'已超期 {abs(d)} 天', 'badge-danger'
    if d <= 7:
        return f'剩余 {d} 天', 'badge-warning'
    return f'剩余 {d} 天', 'badge-success'

def protect_status_text(days, status):
    d = int(days)
    if status == 'recycled':
        return '已回收', 'badge-danger'
    if status == 'frozen':
        return '已冻结', 'badge-danger'
    if d < 0:
        return '已超期', 'badge-danger'
    if d <= 7:
        return '即将到期', 'badge-warning'
    return '正常', 'badge-success'

intentions = [
    {
        'code':'INT-2026072501','status':'生效中','status_class':'badge-primary',
        'project':'云南省肿瘤医院血球项目','customer':'云南省肿瘤医院 · 检验科','customer_id':'1',
        'amount':'¥ 320万','prob':'75%','progress':'80','progress_color':'bg-primary','date':'2026-08-05',
        'current_stage':'FOLLOW_UP','business_type':'招标','purchase_time':'2026-08','decision_makers':'检验科主任,设备科',
        'owner_name':'张伟','reporter_name':'厂家','submit_time':'2026-07-20 09:30','report_date':'2026-07-20',
        'protect_deadline':'2026-08-11','customer_level':'三级甲等','region':'昆明市','product_model':'XN-9000 血液分析流水线',
        'quantity':'1','region_manager':'刘大区','following_company':'云南华鑫医疗器械有限公司','is_new_dealer':'true',
        'remark':'预算充足，意向明确，需关注竞品报价。','attachments':'招标文件.pdf,授权申请书.pdf',
        'approval_history':'销售提交意向|2026-07-20 09:30|通过|提交审批;上级领导初审|2026-07-21 10:15|通过|同意，进入跟进阶段',
        'life_stage':'装机','life_stage_index':'5','life_dwell':'3','life_overdue':'false','life_health_score':'85','life_risk':'低',
        'protection_days':'12','protection_status':'normal','last_report':'2026-07-28 10:00','next_report':'2026-08-04',
        'conflict_status':'none','conflict_with':'','conflict_reason':'','conflict_opponent_project':'','conflict_opponent_owner':'',
        'conflict_opponent_region':'','conflict_opponent_time':'','conflict_opponent_protect':'','manager_approval':'','director_approval':'','arbitrate_result':'',
        'conflict_info':'预计成交：2026-08-05','action_btn':'<button class="btn btn-primary text-xs" onclick="event.stopPropagation()">推进</button>'
    },
    {
        'code':'INT-2026073106','status':'冲突待判定','status_class':'badge-yellow',
        'project':'昆明医科大学第一附属医院免疫分析仪补充','customer':'昆医附一院 · 检验科','customer_id':'6',
        'amount':'¥ 260万','prob':'55%','progress':'30','progress_color':'bg-warning','date':'冲突待判定',
        'current_stage':'CONFLICT_PENDING','business_type':'招标','purchase_time':'2026-09','decision_makers':'检验科主任',
        'owner_name':'李娜','reporter_name':'李娜','submit_time':'2026-07-31 09:00','report_date':'2026-07-31',
        'protect_deadline':'2026-08-10','customer_level':'三级甲等','region':'昆明市','product_model':'免疫分析仪',
        'quantity':'2','region_manager':'刘大区','following_company':'昆明博奥医学检验所','is_new_dealer':'false',
        'remark':'与新申请免疫分析仪项目冲突，等待厂家经理/负责人并行裁决。','attachments':'',
        'approval_history':'销售提交意向|2026-07-31 09:00|通过|提交审批;系统 冲突检测|2026-07-31 09:00|冲突待判定|检测到同客户同项目有效意向',
        'life_stage':'意向','life_stage_index':'1','life_dwell':'1','life_overdue':'false','life_health_score':'68','life_risk':'中',
        'protection_days':'10','protection_status':'normal','last_report':'','next_report':'2026-08-07',
        'conflict_status':'pending','conflict_with':'张鹏','conflict_reason':'同一客户同一项目重复报单',
        'conflict_opponent_project':'昆明医科大学第一附属医院免疫分析仪升级','conflict_opponent_owner':'张鹏',
        'conflict_opponent_region':'昆明市','conflict_opponent_time':'2026-07-25 10:00','conflict_opponent_protect':'2026-08-20',
        'manager_approval':'待审批','director_approval':'待审批','arbitrate_result':'未裁决',
        'conflict_info':'与张鹏的意向冲突','action_btn':'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrateModal(\'INT-2026073106\')">裁决</button>'
    },
    {
        'code':'INT-2026072802','status':'厂家经理审批中','status_class':'badge-primary',
        'project':'昆明医科大学第一附属医院质谱平台扩建','customer':'昆医附一院 · 中心实验室','customer_id':'2',
        'amount':'¥ 580万','prob':'60%','progress':'50','progress_color':'bg-warning','date':'待审批',
        'current_stage':'MANAGER_REVIEW','business_type':'招标','purchase_time':'2026-09','decision_makers':'分管院长,设备科',
        'owner_name':'李娜','reporter_name':'王芳','submit_time':'2026-07-28 11:20','report_date':'2026-07-28',
        'protect_deadline':'2026-08-02','customer_level':'三级甲等','region':'昆明市','product_model':'质谱平台',
        'quantity':'1','region_manager':'刘大区','following_company':'昆明博奥医学检验所','is_new_dealer':'false',
        'remark':'质谱平台扩建与现有意向保护期重叠，需厂家经理/负责人并行裁决。','attachments':'需求说明.pdf',
        'approval_history':'销售提交意向|2026-07-28 11:20|通过|提交审批;上级领导初审|2026-07-28 14:00|通过|进入冲突裁决;厂家经理审批|2026-07-29 09:00|审批中|待审批',
        'life_stage':'方案','life_stage_index':'2','life_dwell':'5','life_overdue':'false','life_health_score':'72','life_risk':'中',
        'protection_days':'3','protection_status':'warning','last_report':'2026-07-25 14:00','next_report':'2026-08-01',
        'conflict_status':'manager_review','conflict_with':'张鹏','conflict_reason':'保护期重叠',
        'conflict_opponent_project':'昆明医科大学第一附属医院质谱平台','conflict_opponent_owner':'张鹏',
        'conflict_opponent_region':'昆明市','conflict_opponent_time':'2026-07-20 10:00','conflict_opponent_protect':'2026-08-15',
        'manager_approval':'待审批','director_approval':'待审批','arbitrate_result':'未裁决',
        'conflict_info':'与张鹏的意向冲突','action_btn':'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrateModal(\'INT-2026072802\')">裁决</button>'
    },
    {
        'code':'INT-2026061503','status':'裁决完成','status_class':'badge-success',
        'project':'大理州人民医院生化分析仪','customer':'大理州人民医院 · 检验科','customer_id':'3',
        'amount':'¥ 128万','prob':'-','progress':'100','progress_color':'bg-success','date':'2026-07-10',
        'current_stage':'ARBITRATE_COMPLETED','business_type':'非招标','purchase_time':'2026-07','decision_makers':'检验科主任',
        'owner_name':'王强','reporter_name':'李军','submit_time':'2026-06-10 09:00','report_date':'2026-06-10',
        'protect_deadline':'2026-08-24','customer_level':'三级乙等','region':'大理白族自治州','product_model':'BS-2800M 生化分析仪',
        'quantity':'2','region_manager':'陈大区','following_company':'大理康泰商贸有限公司','is_new_dealer':'false',
        'remark':'冲突已裁决，归属给我方，已签约并验收，利润 22%。','attachments':'合同.pdf,验收单.pdf',
        'approval_history':'销售提交意向|2026-06-10 09:00|通过|提交审批;上级领导初审|2026-06-11 10:00|通过|同意，进入跟进;厂家经理审批|2026-07-25 10:00|通过|同意优先保护;厂家负责人审批|2026-07-25 11:00|通过|维持原意向;结束分类|2026-07-10 16:30|通过|正常结束',
        'life_stage':'试剂供应','life_stage_index':'6','life_dwell':'0','life_overdue':'false','life_health_score':'92','life_risk':'低',
        'protection_days':'25','protection_status':'normal','last_report':'2026-07-20 09:00','next_report':'2026-07-27',
        'conflict_status':'completed','conflict_with':'王芳','conflict_reason':'同一客户同一项目重复报单',
        'conflict_opponent_project':'大理州人民医院生化分析仪（补充）','conflict_opponent_owner':'王芳',
        'conflict_opponent_region':'大理白族自治州','conflict_opponent_time':'2026-07-22 09:30','conflict_opponent_protect':'2026-08-10',
        'manager_approval':'已通过|同意优先保护原意向|2026-07-25 10:00','director_approval':'已通过|维持原意向归属|2026-07-25 11:00','arbitrate_result':'归属给我方',
        'conflict_info':'裁决完成，归属给我方','action_btn':'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrationLetter(\'INT-2026061503\')">查看裁决书</button>'
    },
    {
        'code':'INT-2026072004','status':'厂家负责人审批中','status_class':'badge-purple',
        'project':'曲靖市第一人民医院血球项目','customer':'曲靖市第一人民医院 · 检验科','customer_id':'4',
        'amount':'¥ 95万','prob':'40%','progress':'40','progress_color':'bg-danger','date':'-',
        'current_stage':'DIRECTOR_REVIEW','business_type':'招标','purchase_time':'2026-08','decision_makers':'分管院长',
        'owner_name':'赵敏','reporter_name':'周涛','submit_time':'2026-07-18 16:45','report_date':'2026-07-18',
        'protect_deadline':'2026-07-18','customer_level':'三级乙等','region':'曲靖市','product_model':'BC-6800 血液分析流水线',
        'quantity':'1','region_manager':'陈大区','following_company':'云南恒通医疗器械有限公司','is_new_dealer':'true',
        'remark':'厂家经理已通过，等待厂家负责人最终裁决。','attachments':'',
        'approval_history':'销售提交意向|2026-07-18 16:45|通过|提交审批;上级领导初审|2026-07-19 09:10|通过|进入冲突裁决;厂家经理审批|2026-07-28 09:30|通过|建议归原报备人;厂家负责人审批|2026-07-28 10:00|审批中|待审批',
        'life_stage':'线索','life_stage_index':'0','life_dwell':'12','life_overdue':'true','life_health_score':'45','life_risk':'高',
        'protection_days':'-12','protection_status':'recycled','last_report':'2026-07-05 10:00','next_report':'2026-07-12',
        'conflict_status':'director_review','conflict_with':'王芳','conflict_reason':'先报先得原则争议',
        'conflict_opponent_project':'曲靖市第一人民医院血球项目（新申请）','conflict_opponent_owner':'王芳',
        'conflict_opponent_region':'曲靖市','conflict_opponent_time':'2026-07-27 14:00','conflict_opponent_protect':'2026-08-05',
        'manager_approval':'已通过|建议归原报备人|2026-07-28 09:30','director_approval':'待审批','arbitrate_result':'未裁决',
        'conflict_info':'与王芳的意向冲突','action_btn':'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrateModal(\'INT-2026072004\')">裁决</button>'
    },
    {
        'code':'INT-2026073005','status':'已驳回','status_class':'badge-danger',
        'project':'云南省肿瘤医院血球项目（新申请）','customer':'云南省肿瘤医院 · 检验科','customer_id':'5',
        'amount':'¥ 320万','prob':'60%','progress':'30','progress_color':'bg-danger','date':'-',
        'current_stage':'ARBITRATE_REJECTED','business_type':'招标','purchase_time':'2026-08','decision_makers':'检验科主任',
        'owner_name':'王芳','reporter_name':'王芳','submit_time':'2026-07-30 10:00','report_date':'2026-07-30',
        'protect_deadline':'2026-07-28','customer_level':'三级甲等','region':'昆明市','product_model':'XN-9000 血液分析流水线',
        'quantity':'1','region_manager':'刘大区','following_company':'云南华鑫医疗器械有限公司','is_new_dealer':'false',
        'remark':'经厂家经理/负责人并行审批，保护期未满，已驳回。','attachments':'',
        'approval_history':'销售提交意向|2026-07-30 10:00|通过|提交审批;系统 冲突检测|2026-07-30 10:00|冲突待判定|检测到同客户同项目有效意向;厂家经理审批|2026-07-30 14:00|驳回|保护期未满;厂家负责人审批|2026-07-30 15:00|驳回|维持原意向',
        'life_stage':'意向','life_stage_index':'1','life_dwell':'2','life_overdue':'false','life_health_score':'68','life_risk':'中',
        'protection_days':'-2','protection_status':'frozen','last_report':'2026-07-15 10:00','next_report':'2026-07-22',
        'conflict_status':'rejected','conflict_with':'张伟','conflict_reason':'保护期优先原则',
        'conflict_opponent_project':'云南省肿瘤医院血球项目','conflict_opponent_owner':'张伟',
        'conflict_opponent_region':'昆明市','conflict_opponent_time':'2026-07-20 09:30','conflict_opponent_protect':'2026-08-11',
        'manager_approval':'已驳回|保护期未满|2026-07-30 14:00','director_approval':'已驳回|维持原意向|2026-07-30 15:00','arbitrate_result':'已驳回',
        'conflict_info':'与张伟的意向冲突，已驳回','action_btn':'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrationLetter(\'INT-2026073005\')">查看裁决书</button>'
    },
]

for it in intentions:
    if it['life_stage_index'] == '6':
        it['dwell_text'] = '已完结'
        it['dwell_class'] = 'text-sub'
    elif it['life_overdue'] == 'true':
        it['dwell_text'] = f"已停留 {it['life_dwell']} 天 · 超期"
        it['dwell_class'] = 'text-danger'
    else:
        it['dwell_text'] = f"已停留 {it['life_dwell']} 天"
        it['dwell_class'] = 'text-sub'
    if it['life_stage_index'] == '6':
        it['stage_class'] = 'badge-success'
    elif it['life_overdue'] == 'true':
        it['stage_class'] = 'badge-danger'
    else:
        it['stage_class'] = 'badge-primary'

# ---------- 1. add CSS ----------
css_addition = '''    .badge-purple { background: rgba(124,58,237,0.12); color: #7c3aed; }
    html[data-theme="dark"] .badge-purple { background: rgba(139,92,246,0.18); color: #a78bfa; }
    .conflict-lifecycle-current { background: rgba(255,136,0,0.12) !important; color: #FF8800 !important; border-color: #FF8800 !important; box-shadow: 0 0 0 4px rgba(255,136,0,0.2) !important; }
    html[data-theme="dark"] .conflict-lifecycle-current { background: rgba(255,136,0,0.18) !important; color: #FACC15 !important; }
'''
marker_css = '    .badge-orange { background: rgba(255,136,0,0.12); color: #FF8800; }\n'
if marker_css in text:
    text = text.replace(marker_css, marker_css + css_addition)
else:
    print('CSS marker not found')

# ---------- 2. replace grid view ----------
grid_start = text.find('<!-- Grid view -->')
list_start = text.find('<!-- List view -->')
if grid_start == -1 or list_start == -1:
    raise SystemExit('grid/list markers missing')
grid_old = text[grid_start:list_start]

cards_html = ''
for it in intentions:
    conflict_text_class = 'text-danger' if it['conflict_status'] != 'none' else 'text-placeholder'
    cards_html += f'''            <div class="card card-hover p-4 cursor-pointer intention-card" onclick="openIntentionModal(this)" data-code="{it['code']}" data-status="{it['status']}" data-status-class="{it['status_class']}" data-project="{attr(it['project'])}" data-customer="{attr(it['customer'])}" data-customer-id="{it['customer_id']}" data-amount="{it['amount']}" data-prob="{it['prob']}" data-progress="{it['progress']}" data-progress-color="{it['progress_color']}" data-date="{it['date']}" data-current-stage="{it['current_stage']}" data-business-type="{it['business_type']}" data-tp-type="否" data-purchase-time="{it['purchase_time']}" data-decision-makers="{it['decision_makers']}" data-owner-name="{it['owner_name']}" data-reporter-name="{it['reporter_name']}" data-submit-time="{it['submit_time']}" data-report-date="{it['report_date']}" data-report-cycle="7" data-last-follow-time="{it['last_report']}" data-protect-deadline="{it['protect_deadline']}" data-customer-level="{it['customer_level']}" data-province="云南省" data-region="{it['region']}" data-product-model="{attr(it['product_model'])}" data-quantity="{it['quantity']}" data-region-manager="{it['region_manager']}" data-following-company="{attr(it['following_company'])}" data-is-new-dealer="{it['is_new_dealer']}" data-remark="{attr(it['remark'])}" data-attachments="{it['attachments']}" data-approval-history="{it['approval_history']}" data-life-stage="{it['life_stage']}" data-life-stage-index="{it['life_stage_index']}" data-life-dwell="{it['life_dwell']}" data-life-overdue="{it['life_overdue']}" data-life-health-score="{it['life_health_score']}" data-life-risk="{it['life_risk']}" data-protection-end="{it['protect_deadline']}" data-protection-days="{it['protection_days']}" data-protection-status="{it['protection_status']}" data-last-report="{it['last_report']}" data-next-report="{it['next_report']}" data-conflict-status="{it['conflict_status']}" data-conflict-with="{it['conflict_with']}" data-conflict-reason="{it['conflict_reason']}" data-conflict-opponent-project="{attr(it['conflict_opponent_project'])}" data-conflict-opponent-owner="{it['conflict_opponent_owner']}" data-conflict-opponent-region="{it['conflict_opponent_region']}" data-conflict-opponent-time="{it['conflict_opponent_time']}" data-conflict-opponent-protect="{it['conflict_opponent_protect']}" data-manager-approval="{it['manager_approval']}" data-director-approval="{it['director_approval']}" data-arbitrate-result="{it['arbitrate_result']}">
              <div class="intention-protect" data-protect-deadline="{it['protect_deadline']}" data-protection-status="{it['protection_status']}" data-last-report="{it['last_report']}" data-report-cycle="7" data-next-report="{it['next_report']}"></div>
              <div class="flex items-start justify-between mb-3">
                <span class="badge {it['status_class']}">{it['status']}</span>
                <span class="text-xs text-placeholder">{it['code']}</span>
              </div>
              <div class="font-semibold text-ink mb-1">{it['project']}</div>
              <div class="text-sub text-sm mb-2">客户：{it['customer']}</div>
              <div class="flex items-center gap-2 mb-2"><span class="badge {it['stage_class']}">阶段：{it['life_stage']}</span><span class="text-xs {it['dwell_class']}">{it['dwell_text']}</span></div>
              <div class="flex items-center gap-4 text-xs text-sub mb-3">
                <span>预计金额：{it['amount']}</span>
                <span>概率：{it['prob']}</span>
              </div>
              <div class="mb-3">
                <div class="text-xs text-sub mb-1">审批进度</div>
                <div class="h-2 bg-line rounded-full overflow-hidden"><div class="h-full {it['progress_color']} rounded-full" style="width:{it['progress']}%"></div></div>
                <div class="flex justify-between text-xs text-sub mt-1"><span>销售</span><span>区域总监</span><span>风控</span></div>
              </div>
              <div class="flex items-center justify-between pt-3 border-t border-line">
                <span class="text-xs {conflict_text_class}">{it['conflict_info']}</span>
                {it['action_btn']}
              </div>
            </div>
'''

grid_new = f'''<!-- Grid view -->
          <div id="intention-grid" class="card-grid mb-4">
{cards_html}          </div>

'''
text = text.replace(grid_old, grid_new)

# ---------- 3. replace list view ----------
list_start_marker = '<!-- List view -->'
pagination_marker = '<!-- Pagination -->'
list_start_idx = text.find(list_start_marker)
pagination_idx = text.find(pagination_marker)
if list_start_idx == -1 or pagination_idx == -1:
    raise SystemExit('list markers missing')
list_old = text[list_start_idx:pagination_idx]

rows_html = ''
for it in intentions:
    conflict_status_text = {
        'none':'<span class="badge badge-gray">无冲突</span>',
        'pending':'<span class="badge badge-yellow">冲突待判定</span>',
        'manager_review':'<span class="badge badge-primary">厂家经理审批中</span>',
        'director_review':'<span class="badge badge-purple">厂家负责人审批中</span>',
        'completed':'<span class="badge badge-success">裁决完成</span>',
        'rejected':'<span class="badge badge-danger">已驳回</span>'
    }.get(it['conflict_status'], '<span class="badge badge-gray">-</span>')
    if it['conflict_status'] != 'none':
        conflict_status_text += f'<div class="text-xs text-sub">与{it["conflict_with"]}冲突</div>'
    stage_badge = f'<span class="badge {it["stage_class"]}">阶段：{it["life_stage"]}</span>'
    if it['life_overdue'] == 'true':
        stage_badge += f'<div class="text-xs text-danger">已停留 {it["life_dwell"]} 天 · 超期</div>'
    else:
        stage_badge += f'<div class="text-xs text-sub">已停留 {it["life_dwell"]} 天</div>'
    protect_text, protect_cls = protect_badge_text(it['protection_days'], it['protection_status'])
    status_text, status_cls = protect_status_text(it['protection_days'], it['protection_status'])
    if it['conflict_status'] != 'none' and it['conflict_status'] != 'completed':
        status_text = '冲突冻结' if it['protection_status'] == 'frozen' else '冲突中'
        status_cls = 'badge-warning'
    recent = format_last_report(it['last_report'])
    if it['conflict_status'] == 'completed' or it['conflict_status'] == 'rejected':
        op = f'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrationLetter(\'{it["code"]}\')">查看裁决书</button>'
    elif it['conflict_status'] != 'none':
        op = f'<button class="btn btn-primary text-xs" onclick="event.stopPropagation();openArbitrateModal(\'{it["code"]}\')">裁决</button>'
    else:
        op = '<button class="btn btn-ghost text-xs" onclick="openIntentionModal(this.closest(\'tr\'))">详情</button>'
    rows_html += f'''                <tr class="intention-row" data-code="{it['code']}" data-status="{it['status']}" data-status-class="{it['status_class']}" data-project="{attr(it['project'])}" data-customer="{attr(it['customer'])}" data-customer-id="{it['customer_id']}" data-amount="{it['amount']}" data-prob="{it['prob']}" data-progress="{it['progress']}" data-progress-color="{it['progress_color']}" data-date="{it['date']}" data-current-stage="{it['current_stage']}" data-business-type="{it['business_type']}" data-tp-type="否" data-purchase-time="{it['purchase_time']}" data-decision-makers="{it['decision_makers']}" data-owner-name="{it['owner_name']}" data-reporter-name="{it['reporter_name']}" data-submit-time="{it['submit_time']}" data-report-date="{it['report_date']}" data-report-cycle="7" data-last-follow-time="{it['last_report']}" data-protect-deadline="{it['protect_deadline']}" data-customer-level="{it['customer_level']}" data-province="云南省" data-region="{it['region']}" data-product-model="{attr(it['product_model'])}" data-quantity="{it['quantity']}" data-region-manager="{it['region_manager']}" data-following-company="{attr(it['following_company'])}" data-is-new-dealer="{it['is_new_dealer']}" data-remark="{attr(it['remark'])}" data-attachments="{it['attachments']}" data-approval-history="{it['approval_history']}" data-life-stage="{it['life_stage']}" data-life-stage-index="{it['life_stage_index']}" data-life-dwell="{it['life_dwell']}" data-life-overdue="{it['life_overdue']}" data-life-health-score="{it['life_health_score']}" data-life-risk="{it['life_risk']}" data-protection-end="{it['protect_deadline']}" data-protection-days="{it['protection_days']}" data-protection-status="{it['protection_status']}" data-last-report="{it['last_report']}" data-next-report="{it['next_report']}" data-conflict-status="{it['conflict_status']}" data-conflict-with="{it['conflict_with']}" data-conflict-reason="{it['conflict_reason']}" data-conflict-opponent-project="{attr(it['conflict_opponent_project'])}" data-conflict-opponent-owner="{it['conflict_opponent_owner']}" data-conflict-opponent-region="{it['conflict_opponent_region']}" data-conflict-opponent-time="{it['conflict_opponent_time']}" data-conflict-opponent-protect="{it['conflict_opponent_protect']}" data-manager-approval="{it['manager_approval']}" data-director-approval="{it['director_approval']}" data-arbitrate-result="{it['arbitrate_result']}"><td>{it['code']}</td><td class="col-project">{it['project']}</td><td class="col-customer">{it['customer']}</td><td>{it['amount']}</td><td>{it['prob']}</td><td><span class="badge {it['status_class']}">{it['status']}</span></td><td>{conflict_status_text}</td><td>{stage_badge}</td><td><div class="h-2 bg-line rounded-full overflow-hidden w-24"><div class="h-full {it['progress_color']} rounded-full" style="width:{it['progress']}%"></div></div></td><td>{it['date']}</td><td><span class="badge {protect_cls}">{protect_text}</span></td><td>{recent}</td><td><span class="badge {status_cls}">{status_text}</span></td><td>{it['owner_name']}</td><td>{op}</td></tr>
'''

list_new = f'''<!-- List view -->
          <div id="intention-list" class="card mb-4 hidden">
            <table class="data-table">
              <thead><tr><th>意向编号</th><th class="col-project">项目名称</th><th class="col-customer">客户</th><th>预计金额</th><th>概率</th><th>状态</th><th>冲突状态</th><th>项目阶段</th><th>审批进度</th><th>预计成交</th><th>保护期剩余</th><th>最近汇报</th><th>保护期状态</th><th>负责人</th><th>操作</th></tr></thead>
              <tbody>
{rows_html}              </tbody>
            </table>
          </div>

'''
text = text.replace(list_old, list_new)

print('Grid/list replaced')

# write intermediate to inspect if needed
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
print('saved intermediate')

# ---------- 4. insert conflict module in detail modal ----------
conflict_module_html = '''                <!-- 撞单冲突与裁决 -->
                <div id="modal-intention-conflict" class="hidden mb-5">
                  <div class="bg-warning-bg border border-warning rounded-xl p-4">
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="flex items-center gap-2">
                        <svg class="icon icon-md text-warning flex-shrink-0"><use href="#icon-warning"/></svg>
                        <span class="font-semibold text-ink">撞单冲突与裁决</span>
                        <span id="modal-conflict-status-badge"></span>
                      </div>
                      <span class="text-xs text-sub" id="modal-conflict-with"></span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div class="bg-card rounded-lg p-3">
                        <div class="text-xs text-sub mb-2">我方意向</div>
                        <div class="font-medium text-ink mb-1" id="modal-conflict-my-project"></div>
                        <div class="text-xs text-sub">负责人：<span id="modal-conflict-my-owner"></span></div>
                        <div class="text-xs text-sub">报单时间：<span id="modal-conflict-my-time"></span></div>
                      </div>
                      <div class="bg-card rounded-lg p-3">
                        <div class="text-xs text-sub mb-2">对方意向</div>
                        <div class="font-medium text-ink mb-1" id="modal-conflict-opponent-project"></div>
                        <div class="text-xs text-sub">负责人：<span id="modal-conflict-opponent-owner"></span></div>
                        <div class="text-xs text-sub">所属区域：<span id="modal-conflict-opponent-region"></span></div>
                        <div class="text-xs text-sub">报单时间：<span id="modal-conflict-opponent-time"></span></div>
                      </div>
                    </div>
                    <div class="bg-card rounded-lg p-3 mb-3">
                      <div class="text-xs text-sub mb-1">冲突原因</div>
                      <div class="text-sm text-ink" id="modal-conflict-reason"></div>
                    </div>
                    <div class="bg-card rounded-lg p-3 mb-3">
                      <div class="text-xs text-sub mb-2">两级并行审批时间线</div>
                      <div class="timeline" id="modal-conflict-timeline"></div>
                    </div>
                    <div class="flex flex-wrap gap-2" id="modal-conflict-actions"></div>
                  </div>
                </div>

'''
marker_protect = '                <!-- 保护期与汇报管理 -->\n'
if marker_protect in text:
    text = text.replace(marker_protect, conflict_module_html + marker_protect)
else:
    print('protect marker not found')

# ---------- 5. update stageLabel map ----------
old_stage_map = "        CONFLICT_PENDING: '冲突待判定',\n"
new_stage_map = """        CONFLICT_PENDING: '冲突待判定',
        MANAGER_REVIEW: '厂家经理审批中',
        DIRECTOR_REVIEW: '厂家负责人审批中',
        ARBITRATE_COMPLETED: '裁决完成',
        ARBITRATE_REJECTED: '已驳回',
"""
if old_stage_map in text:
    text = text.replace(old_stage_map, new_stage_map)
else:
    print('stage map marker not found')

# ---------- 6. update openIntentionModal lifecycle render & todo ----------
lifecycle_render_line = "      document.getElementById('modal-intention-lifecycle').innerHTML = renderLifecycleStageBar(lifeStage, lifeDwell, lifeOverdue);\n"
lifecycle_extra = """      document.getElementById('modal-intention-lifecycle').innerHTML = renderLifecycleStageBar(lifeStage, lifeDwell, lifeOverdue);
      // 撞单冲突生命周期高亮
      if (d.conflictStatus && d.conflictStatus !== 'none') {
        const lc = document.getElementById('modal-intention-lifecycle');
        const stages = lc.querySelectorAll('> div');
        const curIdx = getLifecycleStages().indexOf(lifeStage);
        stages.forEach((s, i) => {
          if (i === curIdx) {
            const box = s.querySelector('.flex');
            if (box) box.className = 'flex flex-col items-center min-w-[4.5rem] p-2 rounded-lg conflict-lifecycle-current';
          }
        });
        const banner = document.createElement('div');
        banner.className = 'mt-2 flex items-center gap-2 text-sm text-warning font-medium';
        banner.innerHTML = '<svg class="icon icon-sm"><use href="#icon-warning"/></svg><span>撞单裁决中</span>';
        lc.parentElement.appendChild(banner);
      }
"""
if lifecycle_render_line in text:
    text = text.replace(lifecycle_render_line, lifecycle_extra)
else:
    print('lifecycle render line not found')

# replace CONFLICT_PENDING todo block
old_conflict_todo = """      } else if (d.currentStage === 'CONFLICT_PENDING') {
        todoTitle = '等待厂家经理/负责人裁决';
        todoNote = '双人并行审批，任一驳回则当前意向结束。';
        todoActions = '<button class="btn btn-primary" onclick="openIntentionArbitrate()">通过当前申请</button><button class="btn btn-ghost" onclick="openIntentionArbitrate()">驳回当前申请</button>';
        footerActions = '<button class="btn btn-primary" onclick="openIntentionArbitrate()">裁决</button>';
"""
new_conflict_todo = """      } else if (['CONFLICT_PENDING','MANAGER_REVIEW','DIRECTOR_REVIEW','ARBITRATE_COMPLETED','ARBITRATE_REJECTED'].includes(d.currentStage)) {
        const cstat = d.conflictStatus || 'none';
        const cwith = d.conflictWith || '-';
        if (cstat === 'pending') {
          todoTitle = '等待提交厂家经理审批';
          todoNote = '与「' + cwith + '」的意向冲突，需启动撞单裁决流程。';
        } else if (cstat === 'manager_review') {
          todoTitle = '厂家经理审批中';
          todoNote = '等待厂家经理审批，通过后进入厂家负责人审批。';
        } else if (cstat === 'director_review') {
          todoTitle = '厂家负责人审批中';
          todoNote = '厂家经理已通过，等待厂家负责人并行审批。';
        } else if (cstat === 'completed') {
          todoTitle = '撞单裁决已完成';
          todoNote = '裁决结果：' + (d.arbitrateResult || '-') + '。';
        } else if (cstat === 'rejected') {
          todoTitle = '撞单裁决已驳回';
          todoNote = '厂家经理/负责人已驳回，当前意向无效。';
        } else {
          todoTitle = '等待厂家经理/负责人裁决';
          todoNote = '双人并行审批，任一驳回则当前意向结束。';
        }
        if (cstat === 'pending') {
          todoActions = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">提交经理审批</button>';
          footerActions = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">提交经理审批</button>';
        } else if (cstat === 'manager_review') {
          todoActions = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">提交负责人审批</button><button class="btn btn-ghost" onclick="openArbitrateModal(\'' + d.code + '\')">申诉</button>';
          footerActions = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">提交负责人审批</button>';
        } else if (cstat === 'director_review') {
          todoActions = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">查看裁决书</button><button class="btn btn-ghost" onclick="openArbitrateModal(\'' + d.code + '\')">申诉</button>';
          footerActions = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">查看裁决书</button>';
        } else {
          todoActions = '<button class="btn btn-primary" onclick="openArbitrationLetter(\'' + d.code + '\')">查看裁决书</button><button class="btn btn-ghost" onclick="openArbitrateModal(\'' + d.code + '\')">申诉</button>';
          footerActions = '<button class="btn btn-primary" onclick="openArbitrationLetter(\'' + d.code + '\')">查看裁决书</button>';
        }
"""
if old_conflict_todo in text:
    text = text.replace(old_conflict_todo, new_conflict_todo)
else:
    print('conflict todo block not found')

# ---------- 7. add renderIntentionConflict helper ----------
render_conflict_js = """
    function parseArbitrateApproval(str) {
      if (!str || str === '待审批') return { status: '待审批', comment: '', time: '' };
      const parts = str.split('|');
      return { status: parts[0] || '待审批', comment: parts[1] || '', time: parts[2] || '' };
    }

    function renderIntentionConflict(d) {
      const wrap = document.getElementById('modal-intention-conflict');
      if (!wrap) return;
      wrap.classList.remove('hidden');
      const map = {
        pending: { label: '冲突待判定', cls: 'badge-yellow' },
        manager_review: { label: '厂家经理审批中', cls: 'badge-primary' },
        director_review: { label: '厂家负责人审批中', cls: 'badge-purple' },
        completed: { label: '裁决完成', cls: 'badge-success' },
        rejected: { label: '已驳回', cls: 'badge-danger' }
      };
      const s = map[d.conflictStatus] || { label: '冲突', cls: 'badge-gray' };
      document.getElementById('modal-conflict-status-badge').innerHTML = '<span class="badge ' + s.cls + '">' + s.label + '</span>';
      document.getElementById('modal-conflict-with').textContent = d.conflictWith ? '与对方：' + d.conflictWith : '';
      document.getElementById('modal-conflict-my-project').textContent = d.project || '-';
      document.getElementById('modal-conflict-my-owner').textContent = (d.ownerName || '-') + ' / ' + (d.reporterName || '-');
      document.getElementById('modal-conflict-my-time').textContent = d.submitTime || '-';
      document.getElementById('modal-conflict-opponent-project').textContent = d.conflictOpponentProject || '-';
      document.getElementById('modal-conflict-opponent-owner').textContent = d.conflictOpponentOwner || '-';
      document.getElementById('modal-conflict-opponent-region').textContent = d.conflictOpponentRegion || '-';
      document.getElementById('modal-conflict-opponent-time').textContent = d.conflictOpponentTime || '-';
      document.getElementById('modal-conflict-reason').textContent = d.conflictReason || '-';
      const mgr = parseArbitrateApproval(d.managerApproval);
      const dir = parseArbitrateApproval(d.directorApproval);
      let mgrCls = mgr.status === '已通过' ? 'bg-success' : (mgr.status === '已驳回' ? 'bg-danger' : 'bg-warning');
      let dirCls = dir.status === '已通过' ? 'bg-success' : (dir.status === '已驳回' ? 'bg-danger' : 'bg-warning');
      const timeline =
        '<div class="timeline-item"><div class="timeline-dot ' + mgrCls + '"></div><div class="flex-1 min-w-0"><div class="text-sm text-ink">厂家经理审批 · ' + mgr.status + '</div>' + (mgr.comment ? '<div class="text-xs text-sub mt-0.5">' + mgr.comment + '</div>' : '') + (mgr.time ? '<div class="text-xs text-placeholder mt-0.5">' + mgr.time + '</div>' : '') + '</div></div>' +
        '<div class="timeline-item"><div class="timeline-dot ' + dirCls + '"></div><div class="flex-1 min-w-0"><div class="text-sm text-ink">厂家负责人审批 · ' + dir.status + '</div>' + (dir.comment ? '<div class="text-xs text-sub mt-0.5">' + dir.comment + '</div>' : '') + (dir.time ? '<div class="text-xs text-placeholder mt-0.5">' + dir.time + '</div>' : '') + '</div></div>';
      const result = d.arbitrateResult && d.arbitrateResult !== '未裁决' ? '<div class="timeline-item"><div class="timeline-dot bg-primary"></div><div class="flex-1 min-w-0"><div class="text-sm text-ink">最终裁决结果 · ' + d.arbitrateResult + '</div></div></div>' : '';
      document.getElementById('modal-conflict-timeline').innerHTML = timeline + result;
      const actions = document.getElementById('modal-conflict-actions');
      let btns = '';
      if (d.conflictStatus === 'pending') {
        btns = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">提交经理审批</button>';
      } else if (d.conflictStatus === 'manager_review') {
        btns = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">提交负责人审批</button><button class="btn btn-ghost" onclick="openArbitrateModal(\'' + d.code + '\')">申诉</button>';
      } else if (d.conflictStatus === 'director_review') {
        btns = '<button class="btn btn-primary" onclick="openArbitrateModal(\'' + d.code + '\')">查看裁决书</button><button class="btn btn-ghost" onclick="openArbitrateModal(\'' + d.code + '\')">申诉</button>';
      } else {
        btns = '<button class="btn btn-primary" onclick="openArbitrationLetter(\'' + d.code + '\')">查看裁决书</button><button class="btn btn-ghost" onclick="openArbitrateModal(\'' + d.code + '\')">申诉</button>';
      }
      actions.innerHTML = btns;
    }
"""
marker_create_intention = '    /* ===== Create / edit intention ===== */'
if marker_create_intention in text:
    text = text.replace(marker_create_intention, render_conflict_js + '\n' + marker_create_intention)
else:
    print('create intention marker not found')

# ---------- 8. add arbitration modals before </body> ----------
modals_html = '''
  <!-- ===== 撞单裁决弹窗 ===== -->
  <div id="modal-arbitrate" class="intention-modal-overlay" onclick="if(event.target===this) closeArbitrateModal()">
    <div class="intention-modal intention-modal-wide" onclick="event.stopPropagation()">
      <div class="intention-modal-header">
        <div class="min-w-0">
          <h3 class="text-lg font-bold text-ink">撞单裁决</h3>
          <p class="text-sub text-sm mt-1">冲突编号：<span id="arbitrate-conflict-code"></span></p>
        </div>
        <button class="btn btn-ghost flex-shrink-0" onclick="closeArbitrateModal()"><svg class="icon icon-md"><use href="#icon-close"/></svg></button>
      </div>
      <div class="intention-modal-body">
        <div class="bg-panel rounded-xl p-4 mb-4 overflow-x-auto">
          <h4 class="font-semibold text-ink mb-3">冲突双方对比</h4>
          <table class="data-table">
            <thead><tr><th>对比项</th><th>我方意向</th><th>对方意向</th></tr></thead>
            <tbody>
              <tr><td>意向编号</td><td id="arbitrate-my-code"></td><td id="arbitrate-opponent-code"></td></tr>
              <tr><td>客户</td><td id="arbitrate-my-customer"></td><td id="arbitrate-opponent-customer"></td></tr>
              <tr><td>项目</td><td id="arbitrate-my-project"></td><td id="arbitrate-opponent-project"></td></tr>
              <tr><td>负责人</td><td id="arbitrate-my-owner"></td><td id="arbitrate-opponent-owner"></td></tr>
              <tr><td>报单时间</td><td id="arbitrate-my-time"></td><td id="arbitrate-opponent-time"></td></tr>
              <tr><td>保护期截止</td><td id="arbitrate-my-protect"></td><td id="arbitrate-opponent-protect"></td></tr>
              <tr><td>当前阶段</td><td id="arbitrate-my-stage"></td><td id="arbitrate-opponent-stage"></td></tr>
              <tr><td>已投入资源</td><td id="arbitrate-my-resource"></td><td id="arbitrate-opponent-resource"></td></tr>
            </tbody>
          </table>
        </div>
        <div class="bg-primary-light border border-primary rounded-xl p-4 mb-4">
          <div class="flex items-start gap-2">
            <svg class="icon icon-md text-primary flex-shrink-0"><use href="#icon-info"/></svg>
            <div>
              <div class="text-sm font-medium text-ink">裁决依据</div>
              <div class="text-xs text-sub mt-1" id="arbitrate-basis">优先适用「先报先得原则」；保护期内重复报单适用「保护期优先原则」。请厂家经理与负责人分别独立审批并留痕。</div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div class="bg-panel rounded-xl p-4">
            <h4 class="font-semibold text-ink mb-3">厂家经理审批意见</h4>
            <textarea class="input w-full mb-3" id="arbitrate-manager-comment" rows="3" placeholder="请填写审批意见"></textarea>
            <input type="hidden" id="arbitrate-manager-action">
            <div class="flex gap-2">
              <button class="btn btn-primary" onclick="setArbitrateManagerAction('approve')">通过</button>
              <button class="btn btn-danger" onclick="setArbitrateManagerAction('reject')">驳回</button>
            </div>
            <div class="text-xs text-sub mt-2" id="arbitrate-manager-status">当前状态：待审批</div>
          </div>
          <div class="bg-panel rounded-xl p-4">
            <h4 class="font-semibold text-ink mb-3">厂家负责人审批意见</h4>
            <textarea class="input w-full mb-3" id="arbitrate-director-comment" rows="3" placeholder="请填写审批意见"></textarea>
            <input type="hidden" id="arbitrate-director-action">
            <div class="flex gap-2">
              <button class="btn btn-primary" onclick="setArbitrateDirectorAction('approve')">通过</button>
              <button class="btn btn-danger" onclick="setArbitrateDirectorAction('reject')">驳回</button>
            </div>
            <div class="text-xs text-sub mt-2" id="arbitrate-director-status">当前状态：待审批</div>
          </div>
        </div>
        <div class="bg-panel rounded-xl p-4 mb-4">
          <h4 class="font-semibold text-ink mb-3">最终裁决结果</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="arbitrate-result-group">
            <label class="radio-card selected" onclick="selectArbitrateResult('mine')">
              <input type="radio" name="arbitrateResult" value="mine" checked onchange="selectArbitrateResult(this.value)">
              <span class="text-sm font-medium text-ink">归属给我方</span>
            </label>
            <label class="radio-card" onclick="selectArbitrateResult('opponent')">
              <input type="radio" name="arbitrateResult" value="opponent" onchange="selectArbitrateResult(this.value)">
              <span class="text-sm font-medium text-ink">归属给对方</span>
            </label>
            <label class="radio-card" onclick="selectArbitrateResult('merge')">
              <input type="radio" name="arbitrateResult" value="merge" onchange="selectArbitrateResult(this.value)">
              <span class="text-sm font-medium text-ink">合并跟进</span>
            </label>
            <label class="radio-card" onclick="selectArbitrateResult('reject')">
              <input type="radio" name="arbitrateResult" value="reject" onchange="selectArbitrateResult(this.value)">
              <span class="text-sm font-medium text-ink">驳回双方</span>
            </label>
          </div>
          <div class="form-group mt-4 mb-0">
            <label class="form-label">裁决原因</label>
            <textarea class="input w-full" id="arbitrate-final-reason" rows="2" placeholder="请填写最终裁决原因"></textarea>
          </div>
        </div>
      </div>
      <div class="intention-modal-footer">
        <button class="btn btn-ghost" onclick="closeArbitrateModal()">取消</button>
        <button class="btn btn-ghost" onclick="saveArbitrateDraft()">保存草稿</button>
        <button class="btn btn-primary" onclick="submitArbitrate()">提交裁决</button>
      </div>
    </div>
  </div>

  <!-- ===== 裁决书弹窗 ===== -->
  <div id="modal-arbitration-letter" class="intention-modal-overlay" onclick="if(event.target===this) closeArbitrationLetter()">
    <div class="intention-modal" onclick="event.stopPropagation()">
      <div class="intention-modal-header">
        <h3 class="text-lg font-bold text-ink">裁决书</h3>
        <button class="btn btn-ghost flex-shrink-0" onclick="closeArbitrationLetter()"><svg class="icon icon-md"><use href="#icon-close"/></svg></button>
      </div>
      <div class="intention-modal-body">
        <div class="bg-panel rounded-xl p-4 mb-4">
          <div class="text-xs text-sub mb-1">裁决编号</div>
          <div class="font-medium text-ink" id="letter-code"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="bg-panel rounded-xl p-4">
            <div class="text-xs text-sub mb-1">我方意向</div>
            <div class="font-medium text-ink" id="letter-my-project"></div>
            <div class="text-xs text-sub mt-1" id="letter-my-owner"></div>
          </div>
          <div class="bg-panel rounded-xl p-4">
            <div class="text-xs text-sub mb-1">对方意向</div>
            <div class="font-medium text-ink" id="letter-opponent-project"></div>
            <div class="text-xs text-sub mt-1" id="letter-opponent-owner"></div>
          </div>
        </div>
        <div class="bg-panel rounded-xl p-4 mb-4">
          <div class="text-xs text-sub mb-1">裁决依据</div>
          <div class="text-sm text-ink" id="letter-basis"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="bg-panel rounded-xl p-4">
            <div class="text-xs text-sub mb-1">厂家经理意见</div>
            <div class="text-sm text-ink" id="letter-manager"></div>
          </div>
          <div class="bg-panel rounded-xl p-4">
            <div class="text-xs text-sub mb-1">厂家负责人意见</div>
            <div class="text-sm text-ink" id="letter-director"></div>
          </div>
        </div>
        <div class="bg-warning-bg border border-warning rounded-xl p-4 mb-4">
          <div class="text-xs text-sub mb-1">最终裁决结果</div>
          <div class="font-semibold text-ink" id="letter-result"></div>
        </div>
        <div class="text-xs text-sub" id="letter-time"></div>
      </div>
      <div class="intention-modal-footer">
        <button class="btn btn-ghost" onclick="closeArbitrationLetter()">关闭</button>
        <button class="btn btn-primary" onclick="closeArbitrationLetter()">接受裁决</button>
        <button class="btn btn-ghost" onclick="closeArbitrationLetter();openArbitrateModal(currentArbitrateCode)">申诉</button>
      </div>
    </div>
  </div>
'''
marker_body_end = '</body>\n'
if marker_body_end in text:
    text = text.replace(marker_body_end, modals_html + '\n' + marker_body_end)
else:
    print('body end marker not found')

# ---------- 9. add JS functions before </script> ----------
arbitrate_js = """
    let currentArbitrateCode = '';
    function openArbitrateModal(code) {
      currentArbitrateCode = code || currentArbitrateCode || '';
      let el = null;
      if (currentArbitrateCode) {
        el = document.querySelector('.intention-card[data-code="' + currentArbitrateCode + '"], .intention-row[data-code="' + currentArbitrateCode + '"]');
      }
      if (!el) {
        el = document.querySelector('[data-conflict-status]:not([data-conflict-status="none"])');
        if (el) currentArbitrateCode = el.dataset.code;
      }
      const d = el ? el.dataset : {};
      document.getElementById('arbitrate-conflict-code').textContent = currentArbitrateCode || '-';
      document.getElementById('arbitrate-my-code').textContent = d.code || '-';
      document.getElementById('arbitrate-opponent-code').textContent = d.conflictOpponentProject ? '对方意向' : '-';
      document.getElementById('arbitrate-my-customer').textContent = d.customer || '-';
      document.getElementById('arbitrate-opponent-customer').textContent = d.customer || '-';
      document.getElementById('arbitrate-my-project').textContent = d.project || '-';
      document.getElementById('arbitrate-opponent-project').textContent = d.conflictOpponentProject || '-';
      document.getElementById('arbitrate-my-owner').textContent = (d.ownerName || '-') + ' / ' + (d.reporterName || '-');
      document.getElementById('arbitrate-opponent-owner').textContent = d.conflictOpponentOwner || '-';
      document.getElementById('arbitrate-my-time').textContent = d.submitTime || '-';
      document.getElementById('arbitrate-opponent-time').textContent = d.conflictOpponentTime || '-';
      document.getElementById('arbitrate-my-protect').textContent = (d.protectDeadline && d.protectDeadline !== '-') ? d.protectDeadline : '-';
      document.getElementById('arbitrate-opponent-protect').textContent = d.conflictOpponentProtect || '-';
      document.getElementById('arbitrate-my-stage').textContent = stageLabel(d.currentStage) || '-';
      document.getElementById('arbitrate-opponent-stage').textContent = '生效中';
      document.getElementById('arbitrate-my-resource').textContent = '已提交方案、报价单';
      document.getElementById('arbitrate-opponent-resource').textContent = '已报备、保护期内';
      const basisMap = {
        '同一客户同一项目重复报单': '同一客户同一项目重复报单，适用「先报先得原则」及保护期规则。',
        '保护期重叠': '保护期重叠，适用「保护期优先原则」。',
        '先报先得原则争议': '双方均主张先报先得，需结合保护期与投入资源综合判定。',
        '保护期优先原则': '原意向保护期未满，新申请重复报单应被驳回。'
      };
      document.getElementById('arbitrate-basis').textContent = basisMap[d.conflictReason] || '优先适用「先报先得原则」；保护期内重复报单适用「保护期优先原则」。请厂家经理与负责人分别独立审批并留痕。';
      document.getElementById('arbitrate-manager-comment').value = '';
      document.getElementById('arbitrate-director-comment').value = '';
      document.getElementById('arbitrate-manager-action').value = '';
      document.getElementById('arbitrate-director-action').value = '';
      document.getElementById('arbitrate-manager-status').textContent = '当前状态：待审批';
      document.getElementById('arbitrate-director-status').textContent = '当前状态：待审批';
      selectArbitrateResult('mine');
      document.getElementById('arbitrate-final-reason').value = '';
      document.getElementById('modal-arbitrate').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeArbitrateModal() {
      document.getElementById('modal-arbitrate').classList.remove('open');
      document.body.style.overflow = '';
    }

    function selectArbitrateResult(value) {
      document.querySelectorAll('input[name="arbitrateResult"]').forEach(r => {
        r.checked = r.value === value;
        const card = r.closest('.radio-card');
        if (card) card.classList.toggle('selected', r.checked);
      });
    }

    function setArbitrateManagerAction(action) {
      document.getElementById('arbitrate-manager-action').value = action;
      document.getElementById('arbitrate-manager-status').textContent = '当前状态：' + (action === 'approve' ? '已通过' : '已驳回');
      showToast('厂家经理审批意见已标记：' + (action === 'approve' ? '通过' : '驳回'));
    }

    function setArbitrateDirectorAction(action) {
      document.getElementById('arbitrate-director-action').value = action;
      document.getElementById('arbitrate-director-status').textContent = '当前状态：' + (action === 'approve' ? '已通过' : '已驳回');
      showToast('厂家负责人审批意见已标记：' + (action === 'approve' ? '通过' : '驳回'));
    }

    function submitArbitrate() {
      const mgrAction = document.getElementById('arbitrate-manager-action').value;
      const dirAction = document.getElementById('arbitrate-director-action').value;
      const reason = document.getElementById('arbitrate-final-reason').value.trim();
      if (!mgrAction || !dirAction) { alert('请分别给出厂家经理与厂家负责人的审批意见'); return; }
      if (!reason || reason.length < 3) { alert('请填写至少 3 个字的裁决原因'); return; }
      const typeEl = document.querySelector('input[name="arbitrateResult"]:checked');
      const type = typeEl ? typeEl.value : 'mine';
      const resultText = { mine: '归属给我方', opponent: '归属给对方', merge: '合并跟进', reject: '驳回双方' }[type] || type;
      showToast('裁决已提交：' + resultText);
      closeArbitrateModal();
    }

    function saveArbitrateDraft() {
      showToast('裁决草稿已保存');
      closeArbitrateModal();
    }

    function openArbitrationLetter(code) {
      currentArbitrateCode = code || currentArbitrateCode || '';
      const el = document.querySelector('.intention-card[data-code="' + currentArbitrateCode + '"], .intention-row[data-code="' + currentArbitrateCode + '"]');
      const d = el ? el.dataset : {};
      document.getElementById('letter-code').textContent = 'ARB-' + (d.code || currentArbitrateCode || '000000');
      document.getElementById('letter-my-project').textContent = d.project || '-';
      document.getElementById('letter-my-owner').textContent = '负责人：' + (d.ownerName || '-') + ' / ' + (d.reporterName || '-');
      document.getElementById('letter-opponent-project').textContent = d.conflictOpponentProject || '-';
      document.getElementById('letter-opponent-owner').textContent = '负责人：' + (d.conflictOpponentOwner || '-');
      const basisMap = {
        '同一客户同一项目重复报单': '同一客户同一项目重复报单，适用「先报先得原则」及保护期规则。',
        '保护期重叠': '保护期重叠，适用「保护期优先原则」。',
        '先报先得原则争议': '双方均主张先报先得，需结合保护期与投入资源综合判定。',
        '保护期优先原则': '原意向保护期未满，新申请重复报单应被驳回。'
      };
      document.getElementById('letter-basis').textContent = basisMap[d.conflictReason] || '依据先报先得及保护期优先原则裁决。';
      const mgr = parseArbitrateApproval(d.managerApproval);
      const dir = parseArbitrateApproval(d.directorApproval);
      document.getElementById('letter-manager').innerHTML = mgr.status + (mgr.comment ? ' · ' + mgr.comment : '') + (mgr.time ? '<div class="text-xs text-placeholder mt-1">' + mgr.time + '</div>' : '');
      document.getElementById('letter-director').innerHTML = dir.status + (dir.comment ? ' · ' + dir.comment : '') + (dir.time ? '<div class="text-xs text-placeholder mt-1">' + dir.time + '</div>' : '');
      document.getElementById('letter-result').textContent = d.arbitrateResult || '-';
      document.getElementById('letter-time').textContent = '裁决时间：' + (dir.time || mgr.time || '-');
      document.getElementById('modal-arbitration-letter').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeArbitrationLetter() {
      document.getElementById('modal-arbitration-letter').classList.remove('open');
      document.body.style.overflow = '';
    }
"""
marker_script_end = '  </script>'
if marker_script_end in text:
    text = text.replace(marker_script_end, arbitrate_js + '\n' + marker_script_end)
else:
    print('script end marker not found')

# ---------- 10. update approval center records ----------
old_approval_badge = '待我审批 <span class="badge badge-danger ml-1">5</span>'
new_approval_badge = '待我审批 <span class="badge badge-danger ml-1">7</span>'
if old_approval_badge in text:
    text = text.replace(old_approval_badge, new_approval_badge)
else:
    print('approval badge not found')

old_approval_total = '共 5 条待审批'
new_approval_total = '共 7 条待审批'
if old_approval_total in text:
    text = text.replace(old_approval_total, new_approval_total)
else:
    print('approval total not found')

approval_insert_marker = '              </div>\n\n          <div class="flex items-center justify-between">\n            <div class="text-sub text-sm">共 7 条待审批</div>'
approval_insert_marker_alt = '            </div>\n\n          <div class="flex items-center justify-between">\n            <div class="text-sub text-sm">共 7 条待审批</div>'
new_approval_cards = '''              </div>

              <div class="app-card card p-4">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-warning-bg text-warning flex items-center justify-center flex-shrink-0"><svg class="icon icon-xl"><use href="#icon-warning"/></svg></div>
                    <div>
                      <div class="font-semibold text-ink">撞单裁决 · 昆医附一院质谱平台扩建</div>
                      <div class="text-sub text-sm mt-1">冲突双方：李娜 vs 张鹏 · 预计金额：¥580万 · 冲突原因：保护期重叠</div>
                      <div class="text-placeholder text-xs mt-1">提交人：王芳 · 2026-07-28 11:20 · 当前节点：厂家经理审批中</div>
                    </div>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                    <button class="btn btn-primary text-xs" onclick="openArbitrateModal('INT-2026072802')">处理</button>
                    <button class="btn btn-ghost text-xs" onclick="openArbitrateModal('INT-2026072802')">查看</button>
                  </div>
                </div>
              </div>

              <div class="app-card card p-4">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0"><svg class="icon icon-xl"><use href="#icon-warning"/></svg></div>
                    <div>
                      <div class="font-semibold text-ink">撞单裁决 · 曲靖市第一人民医院血球项目</div>
                      <div class="text-sub text-sm mt-1">冲突双方：赵敏 vs 王芳 · 预计金额：¥95万 · 冲突原因：先报先得原则争议</div>
                      <div class="text-placeholder text-xs mt-1">提交人：周涛 · 2026-07-18 16:45 · 当前节点：厂家负责人审批中</div>
                    </div>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                    <button class="btn btn-primary text-xs" onclick="openArbitrateModal('INT-2026072004')">处理</button>
                    <button class="btn btn-ghost text-xs" onclick="openArbitrateModal('INT-2026072004')">查看</button>
                  </div>
                </div>
              </div>

          <div class="flex items-center justify-between">
            <div class="text-sub text-sm">共 7 条待审批</div>'''
if approval_insert_marker in text:
    text = text.replace(approval_insert_marker, new_approval_cards)
elif approval_insert_marker_alt in text:
    text = text.replace(approval_insert_marker_alt, new_approval_cards)
else:
    print('approval insert marker not found')

# ---------- save ----------
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
print('All patches applied')
