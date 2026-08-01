#!/usr/bin/env python3
"""
扫描鑫渠高保真原型.html，提取模块结构、字段、按钮、状态、规则，
生成结构化 Markdown 报告，用于与领域建模方案对齐。
"""

from bs4 import BeautifulSoup, NavigableString
import re
import json
from pathlib import Path

HTML_PATH = Path('/Users/mac/qucheng/鑫渠高保真原型.html')
OUTPUT_MD = Path('/Users/mac/qucheng/docs/原型结构扫描报告.md')
OUTPUT_JSON = Path('/Users/mac/qucheng/docs/原型结构扫描报告.json')


def clean_text(text):
    """清理文本，去除多余空白和换行"""
    if not text:
        return ''
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_buttons(element):
    """提取元素内的所有按钮文本和 onclick"""
    buttons = []
    for btn in element.find_all(['button', 'a']):
        text = clean_text(btn.get_text())
        onclick = btn.get('onclick', '')
        classes = ' '.join(btn.get('class', []))
        if text or onclick:
            buttons.append({
                'text': text,
                'onclick': onclick,
                'classes': classes,
            })
    return buttons


def extract_inputs(element):
    """提取输入框、下拉框等表单字段"""
    fields = []
    for tag in element.find_all(['input', 'select', 'textarea']):
        tag_id = tag.get('id', '')
        placeholder = tag.get('placeholder', '')
        tag_type = tag.get('type', tag.name)
        value = tag.get('value', '')

        options = []
        if tag.name == 'select':
            for opt in tag.find_all('option'):
                opt_text = clean_text(opt.get_text())
                if opt_text:
                    options.append(opt_text)

        # 尝试找关联 label
        label = ''
        if tag_id:
            lab = element.find('label', attrs={'for': tag_id})
            if lab:
                label = clean_text(lab.get_text())

        text = clean_text(tag.get_text())
        fields.append({
            'id': tag_id,
            'type': tag_type,
            'placeholder': placeholder,
            'label': label,
            'value': value,
            'options': options,
            'text': text,
        })
    return fields


def extract_tabs(element):
    """提取 tab 按钮"""
    tabs = []
    for tab in element.find_all(attrs={'class': re.compile(r'\btab\b')}):
        text = clean_text(tab.get_text())
        onclick = tab.get('onclick', '')
        data_tab = tab.get('data-tab', '') or tab.get('data-pftab', '') or tab.get('data-wotab', '')
        if text:
            tabs.append({
                'text': text,
                'onclick': onclick,
                'data_tab': data_tab,
            })
    return tabs


def extract_tables(element):
    """提取表格表头"""
    tables = []
    for table in element.find_all('table'):
        headers = []
        for th in table.find_all('th'):
            headers.append(clean_text(th.get_text()))
        if headers:
            tables.append({'headers': headers})
    return tables


def extract_kpi_cards(element):
    """提取 KPI 卡片：找 class 包含 kpi-grid 或 card 的 div"""
    cards = []
    for card in element.find_all(attrs={'class': re.compile(r'\bkpi-grid\b')}):
        for child in card.find_all(attrs={'class': re.compile(r'\bcard\b')}):
            text = clean_text(child.get_text())
            if text:
                cards.append(text)
    # 如果没有 kpi-grid，尝试找 card 里的 数字+标签 结构
    return cards


def extract_panels(element):
    """提取面板切换（如 grid/chart/list）"""
    panels = []
    for btn in element.find_all(attrs={'onclick': re.compile(r'switch\w*View|set\w*View')}):
        onclick = btn.get('onclick', '')
        text = clean_text(btn.get_text())
        if onclick:
            panels.append({
                'text': text,
                'onclick': onclick,
            })
    return panels


def extract_modals(soup):
    """提取所有 modal/overlay 弹窗"""
    modals = []
    for modal in soup.find_all(id=re.compile(r'(modal|overlay|drawer)', re.I)):
        modal_id = modal.get('id', '')
        title = ''
        for t in modal.find_all(['h2', 'h3', 'h4', '.font-semibold']):
            title = clean_text(t.get_text())
            if title:
                break
        fields = extract_inputs(modal)
        buttons = extract_buttons(modal)
        modals.append({
            'id': modal_id,
            'title': title,
            'fields': fields,
            'buttons': buttons,
        })
    return modals


def extract_view_details(view):
    """提取单个 view 的详细信息"""
    view_id = view.get('id', '')

    # 找标题：h1/h2/h3
    title = ''
    for t in view.find_all(['h1', 'h2', 'h3']):
        title = clean_text(t.get_text())
        if title:
            break

    # 子标题
    subtitle = ''
    for p in view.find_all('p'):
        subtitle = clean_text(p.get_text())
        if subtitle:
            break

    tabs = extract_tabs(view)
    panels = extract_panels(view)
    buttons = extract_buttons(view)
    inputs = extract_inputs(view)
    tables = extract_tables(view)
    kpis = extract_kpi_cards(view)

    # 提取 section/card 分组标题
    sections = []
    for card in view.find_all(attrs={'class': re.compile(r'\bcard\b')}):
        header = ''
        for h in card.find_all(['div', 'h3', 'h4'], attrs={'class': re.compile(r'font-semibold|font-bold')}):
            header = clean_text(h.get_text())
            if header and len(header) < 100:
                break
        if header:
            sections.append(header)

    return {
        'id': view_id,
        'title': title,
        'subtitle': subtitle,
        'tabs': tabs,
        'panels': panels,
        'buttons': buttons[:30],  # 限制数量避免过大
        'inputs': inputs[:30],
        'tables': tables,
        'kpis': kpis,
        'sections': list(set(sections))[:20],
    }


def scan_html():
    print(f'开始扫描: {HTML_PATH}')
    html = HTML_PATH.read_text(encoding='utf-8')
    soup = BeautifulSoup(html, 'html.parser')

    # 提取所有顶层 view
    views = []
    for view in soup.find_all(id=re.compile(r'^view-')):
        details = extract_view_details(view)
        views.append(details)

    # 提取所有 modal
    modals = extract_modals(soup)

    report = {
        'total_views': len(views),
        'total_modals': len(modals),
        'views': views,
        'modals': modals[:50],  # 限制数量
    }

    # 保存 JSON
    OUTPUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'JSON 报告已保存: {OUTPUT_JSON}')

    # 生成 Markdown
    md = generate_markdown(report)
    OUTPUT_MD.write_text(md, encoding='utf-8')
    print(f'Markdown 报告已保存: {OUTPUT_MD}')

    return report


def generate_markdown(report):
    lines = []
    lines.append('# 鑫渠原型结构扫描报告')
    lines.append('')
    lines.append('> 本报告由脚本自动扫描 `鑫渠高保真原型.html` 生成，用于与 `XQCOP-领域建模方案.md` 对齐。')
    lines.append('')
    lines.append(f'- 扫描视图数：{report["total_views"]}')
    lines.append(f'- 扫描弹窗数：{report["total_modals"]}')
    lines.append('')

    for idx, view in enumerate(report['views'], 1):
        lines.append(f'## {idx}. {view["title"] or view["id"]} `#{view["id"]}`')
        lines.append('')
        if view['subtitle']:
            lines.append(f'**副标题**：{view["subtitle"]}')
            lines.append('')

        if view['tabs']:
            lines.append('### Tab 标签')
            for tab in view['tabs']:
                lines.append(f'- {tab["text"]}')
            lines.append('')

        if view['panels']:
            lines.append('### 视图切换')
            for panel in view['panels']:
                lines.append(f'- {panel["text"] or panel["onclick"]}')
            lines.append('')

        if view['sections']:
            lines.append('### 内容区块')
            for sec in view['sections']:
                lines.append(f'- {sec}')
            lines.append('')

        if view['kpis']:
            lines.append('### KPI 指标')
            for kpi in view['kpis']:
                lines.append(f'- {kpi}')
            lines.append('')

        if view['tables']:
            lines.append('### 表格')
            for table in view['tables']:
                lines.append(f'- 表头：{ " | ".join(table["headers"]) }')
            lines.append('')

        if view['inputs']:
            lines.append('### 搜索/筛选字段')
            for inp in view['inputs']:
                label = inp['label'] or inp['placeholder'] or inp['id'] or inp['type']
                options = f'（选项：{", ".join(inp["options"])}）' if inp['options'] else ''
                lines.append(f'- {label} {options}')
            lines.append('')

        if view['buttons']:
            lines.append('### 主要操作按钮')
            seen = set()
            for btn in view['buttons']:
                text = btn['text'] or btn['onclick']
                if text and text not in seen:
                    seen.add(text)
                    lines.append(f'- {text}')
            lines.append('')

    # 弹窗摘要
    lines.append('---')
    lines.append('')
    lines.append('# 弹窗/抽屉摘要')
    lines.append('')
    for modal in report['modals']:
        lines.append(f'## `{modal["id"]}`')
        if modal['title']:
            lines.append(f'**标题**：{modal["title"]}')
        if modal['fields']:
            lines.append('**字段**：')
            for f in modal['fields'][:10]:
                label = f['label'] or f['placeholder'] or f['id'] or f['type']
                lines.append(f'- {label}')
        if modal['buttons']:
            lines.append('**按钮**：')
            seen = set()
            for b in modal['buttons']:
                text = b['text'] or b['onclick']
                if text and text not in seen:
                    seen.add(text)
                    lines.append(f'- {text}')
        lines.append('')

    return '\n'.join(lines)


if __name__ == '__main__':
    scan_html()
