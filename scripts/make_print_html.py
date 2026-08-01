#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Transform the screen-reading HTML into a print-ready A4 HTML."""
import re
from pathlib import Path
from bs4 import BeautifulSoup

SRC = Path('/Users/mac/qucheng/鑫渠解决方案白皮书.html')
OUT = Path('/Users/mac/qucheng/鑫渠解决方案白皮书_印刷版.html')

def clean_caption(text: str) -> str:
    if not text:
        return ''
    text = re.sub(r'[\n\r]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove the generic disclaimer that follows almost every screenshot caption
    text = re.sub(r'[（(]产品界面示意图，具体以实际系统为准[）)]', '', text).strip()
    return text

def parse_chapter_number(section) -> str:
    """Return a numeric chapter string like '1' from the sec-num badge, or ''."""
    num_el = section.find(class_='sec-num')
    if num_el:
        txt = num_el.get_text(strip=True)
        m = re.search(r'\d+', txt)
        if m:
            return str(int(m.group()))
    sec_id = section.get('id', '')
    m = re.search(r'\d+', sec_id)
    if m:
        return str(int(m.group()))
    return ''

def section_title(section) -> str:
    h2 = section.find('h2')
    if h2:
        return h2.get_text(strip=True)
    return ''

def page_header_title(section) -> str:
    """Title used in running header (fallback to h3 for the front-matter sec0)."""
    t = section_title(section)
    if t:
        return t
    h3 = section.find('h3')
    if h3:
        return h3.get_text(strip=True)
    return ''

def convert_screenshot_to_figure(section, chapter: str):
    """Wrap standalone screenshot images + their small caption paragraph into <figure>."""
    for img in list(section.find_all('img')):
        src = img.get('src', '')
        if not src or not src.startswith('screenshots/'):
            continue
        if img.find_parent('figure'):
            continue
        # Remove zoomable class if any
        img_classes = (img.get('class') or [])
        if 'zoomable' in img_classes:
            img_classes.remove('zoomable')
            if img_classes:
                img['class'] = img_classes
            else:
                del img['class']
        caption_text = ''
        nxt = img.find_next_sibling()
        if nxt and nxt.name == 'p' and 'small' in (nxt.get('class') or []):
            caption_text = clean_caption(nxt.get_text())
            nxt.decompose()
        if not caption_text:
            caption_text = clean_caption(img.get('alt', ''))
        fig = section.new_tag('figure')
        fig['class'] = ['print-figure']
        fig['data-chapter'] = chapter
        img.wrap(fig)
        if caption_text:
            cap = section.new_tag('figcaption')
            cap.string = caption_text
            cap['data-chapter'] = chapter
            fig.append(cap)

def add_table_captions(section, chapter: str):
    for tbl in section.find_all('table'):
        cap = tbl.find('caption')
        if not cap:
            cap = section.new_tag('caption')
            tbl.insert(0, cap)
        cap['data-chapter'] = chapter
        cap['class'] = ['tbl-caption']

def cleanup_figures(section, chapter: str):
    for fig in section.find_all('figure'):
        fig['data-chapter'] = chapter
        cap = fig.find('figcaption')
        if cap:
            cap['data-chapter'] = chapter
        # remove the generic "示意图" note paragraph inside figure
        for p in fig.find_all('p'):
            txt = p.get_text(strip=True)
            if '产品界面示意图' in txt or '具体以实际系统为准' in txt:
                p.decompose()

def strip_inline_styles(root):
    for tag in root.find_all(True):
        if 'style' in tag.attrs:
            del tag['style']

def build_cover(soup, source_cover):
    title = source_cover.find('h1').get_text(strip=True) if source_cover.find('h1') else '鑫渠解决方案白皮书'
    subtitle_el = source_cover.find('h2')
    subtitle = subtitle_el.get_text(strip=True) if subtitle_el else '数字化协作运营平台（XQ.COP）'
    en_sub = ''
    for p in source_cover.find_all('p', class_='desc'):
        txt = p.get_text(strip=True)
        if 'Xinqu' in txt or 'XQ.COP' in txt:
            en_sub = txt
            break
    meta = source_cover.find('div', class_='meta')
    meta_text = meta.get_text('\n', strip=True) if meta else ''

    cover_html = f'''
<section class="cover" id="cover">
  <svg class="cover-deco" viewBox="0 0 595 842" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d9488" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#0f766e" stop-opacity="0.04"/>
      </linearGradient>
    </defs>
    <rect width="595" height="842" fill="#f0fdfa"/>
    <rect x="-80" y="620" width="760" height="300" fill="url(#g1)" transform="rotate(-12 300 700)"/>
    <circle cx="480" cy="120" r="180" fill="#ccfbf1" fill-opacity="0.5"/>
    <circle cx="80" cy="720" r="220" fill="#ccfbf1" fill-opacity="0.35"/>
    <g stroke="#0d9488" stroke-width="0.8" fill="none" opacity="0.35">
      <line x1="80" y1="680" x2="180" y2="620"/>
      <line x1="180" y1="620" x2="300" y2="650"/>
      <line x1="300" y1="650" x2="420" y2="600"/>
      <line x1="420" y1="600" x2="520" y2="640"/>
      <line x1="180" y1="620" x2="260" y2="560"/>
      <line x1="260" y1="560" x2="380" y2="540"/>
      <line x1="300" y1="650" x2="380" y2="540"/>
    </g>
    <g fill="#0d9488" opacity="0.6">
      <circle cx="80" cy="680" r="4"/>
      <circle cx="180" cy="620" r="5"/>
      <circle cx="300" cy="650" r="4"/>
      <circle cx="420" cy="600" r="5"/>
      <circle cx="520" cy="640" r="4"/>
      <circle cx="260" cy="560" r="3.5"/>
      <circle cx="380" cy="540" r="4"/>
    </g>
    <g stroke="#0d9488" stroke-width="1.2" fill="none" opacity="0.25">
      <path d="M520 780 Q560 740 520 700 Q480 660 520 620 Q560 580 520 540"/>
      <path d="M560 780 Q520 740 560 700 Q600 660 560 620 Q520 580 560 540"/>
      <line x1="520" y1="700" x2="560" y2="700"/>
      <line x1="520" y1="620" x2="560" y2="620"/>
    </g>
  </svg>
  <div class="cover-content">
    <div class="cover-badge">广州华鑫科技有限公司 · 数字化协作运营解决方案</div>
    <h1 class="cover-title">{title}</h1>
    <h2 class="cover-subtitle">{subtitle}</h2>
    <p class="cover-en">{en_sub}</p>
    <p class="cover-desc">本白皮书与系统方案专为 <strong>广州华鑫科技有限公司</strong> 量身撰写。鑫渠本质上是一套<strong>数字化协作体系</strong>，连接总部、省区、销售、代理商、工程师与原厂，以意向/项目推进效率与转化成功率为首要抓手，通过项目全生命周期 SOP、实时协作与数据驱动决策，提升装机速度与试剂上量，最终实现业绩提升与企业可持续发展。</p>
    <div class="cover-meta">{meta_text.replace(chr(10), '<br>')}</div>
  </div>
</section>
'''
    return BeautifulSoup(cover_html, 'html.parser')

def build_toc(soup, sections):
    items = []
    for sec in sections:
        sec_id = sec.get('id', '')
        if not sec_id:
            continue
        chap = parse_chapter_number(sec)
        title = section_title(sec)
        if not title:
            continue
        num_label = chap if chap else '·'
        items.append((sec_id, num_label, title))
    toc_html = '<section class="toc-page" id="toc"><h2 class="toc-title">目录</h2><ul class="toc-list">'
    for sec_id, num_label, title in items:
        toc_html += f'''
<li>
  <a href="#{sec_id}">
    <span class="toc-num">{num_label}</span>
    <span class="toc-text">{title}</span>
    <span class="toc-dots"></span>
    <span class="toc-pagenum" data-href="#{sec_id}"></span>
  </a>
</li>'''
    toc_html += '</ul></section>'
    return BeautifulSoup(toc_html, 'html.parser')

def build_print_html():
    raw = SRC.read_text(encoding='utf-8')
    soup = BeautifulSoup(raw, 'html.parser')

    main = soup.find('main')
    source_cover = main.find('div', class_='cover') if main else soup.find('div', class_='cover')
    sections = []
    if main:
        sections = list(main.find_all('section', recursive=False))
    else:
        sections = list(soup.find_all('section'))

    # Build per-chapter @page rules for running headers
    chapter_page_rules = []
    for sec in sections:
        sid = sec.get('id', '')
        if not re.match(r'^sec\d+$', sid):
            continue
        title = page_header_title(sec).replace('"', '\\"')
        if not title:
            continue
        chapter_page_rules.append(f'@page {sid} {{ @top-right {{ content: "{title}"; }} }}')
    chapter_page_css = '\n'.join(chapter_page_rules)

    new_soup = BeautifulSoup('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>鑫渠解决方案白皮书 · 印刷版</title></head><body></body></html>', 'html.parser')
    head = new_soup.head
    style = new_soup.new_tag('style')
    style.string = f'''
:root {{
  --primary: #0d9488;
  --primary-dark: #0f766e;
  --primary-light: #ccfbf1;
  --bg-light: #f0fdfa;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #d1d5db;
}}
@page {{
  size: A4 portrait;
  margin: 25mm 20mm 22mm 28mm;
  @top-left {{
    content: "鑫渠解决方案白皮书";
    font-size: 9pt;
    color: #6b7280;
    border-bottom: 0.5pt solid #e5e7eb;
    padding-bottom: 3mm;
  }}
  @top-right {{
    content: "鑫渠解决方案白皮书";
    font-size: 9pt;
    color: #0d9488;
    text-align: right;
    border-bottom: 0.5pt solid #e5e7eb;
    padding-bottom: 3mm;
  }}
  @bottom-center {{
    content: counter(page);
    font-size: 9pt;
    color: #6b7280;
    padding-top: 3mm;
  }}
}}
@page cover {{
  margin: 0;
  @top-left {{ content: none; }}
  @top-right {{ content: none; }}
  @bottom-center {{ content: none; }}
}}
@page toc {{
  margin: 25mm 20mm 22mm 28mm;
  @top-left {{ content: none; }}
  @top-right {{ content: none; }}
  @bottom-center {{ content: none; }}
}}
@page back {{
  @top-left {{ content: none; }}
  @top-right {{ content: none; }}
  @bottom-center {{ content: none; }}
}}
{chapter_page_css}
html {{
  counter-reset: page -2;
}}
body {{
  margin: 0;
  padding: 0;
  font-family: 'Source Han Serif CN', 'PingFang SC', 'Microsoft YaHei', Georgia, 'Times New Roman', serif;
  font-size: 10.5pt;
  line-height: 1.7;
  color: #1f2937;
  text-align: justify;
}}
/* Cover */
.cover {{
  page: cover;
  page-break-after: always;
  width: 210mm;
  height: 297mm;
  margin: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #1f2937;
  overflow: hidden;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}
.cover-deco {{
  position: absolute;
  top: 0;
  left: 0;
  width: 210mm;
  height: 297mm;
  z-index: 0;
}}
.cover-content {{
  position: relative;
  z-index: 1;
  max-width: 160mm;
  padding: 0 10mm;
}}
.cover-badge {{
  display: inline-block;
  background: #0d9488;
  color: #fff;
  padding: 2mm 5mm;
  border-radius: 4mm;
  font-size: 10pt;
  letter-spacing: 0.5pt;
  margin-bottom: 12mm;
}}
.cover-title {{
  font-size: 36pt;
  color: #0d9488;
  margin: 0 0 4mm;
  letter-spacing: 2pt;
  font-weight: 800;
  line-height: 1.2;
}}
.cover-subtitle {{
  font-size: 18pt;
  color: #0f766e;
  margin: 0 0 4mm;
  font-weight: 600;
  letter-spacing: 0.5pt;
}}
.cover-en {{
  font-size: 11pt;
  color: #6b7280;
  margin: 0 0 10mm;
  text-indent: 0;
}}
.cover-desc {{
  font-size: 10.5pt;
  line-height: 1.75;
  color: #374151;
  margin: 0 0 12mm;
  text-indent: 2em;
  text-align: justify;
}}
.cover-meta {{
  font-size: 10.5pt;
  color: #6b7280;
  line-height: 1.8;
}}
/* TOC */
.toc-page {{
  page: toc;
  page-break-after: always;
}}
.toc-title {{
  font-size: 22pt;
  color: #0d9488;
  text-align: center;
  margin: 0 0 12mm;
  font-weight: 700;
}}
.toc-list {{
  list-style: none;
  padding: 0;
  margin: 0;
}}
.toc-list li {{
  margin: 0 0 0.55em;
}}
.toc-list a {{
  display: flex;
  align-items: baseline;
  text-decoration: none;
  color: #1f2937;
}}
.toc-num {{
  flex: 0 0 2.2em;
  color: #0d9488;
  font-weight: 700;
  font-size: 10.5pt;
}}
.toc-text {{
  flex: 0 1 auto;
  font-size: 10.5pt;
}}
.toc-dots {{
  flex: 1 1 auto;
  border-bottom: 1px dotted #9ca3af;
  margin: 0 0.4em;
  min-width: 2em;
  height: 0.6em;
}}
.toc-pagenum::before {{
  content: target-counter(attr(data-href), page);
  color: #6b7280;
  font-size: 10.5pt;
}}
/* Main sections */
section[data-chapter] {{
  page-break-before: always;
  counter-reset: figure 0 table 0;
}}
.sec-head {{
  display: flex;
  align-items: center;
  gap: 3mm;
  margin-bottom: 6mm;
}}
.sec-num {{
  flex-shrink: 0;
  width: 12mm;
  height: 12mm;
  border-radius: 2mm;
  background: #0d9488;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14pt;
  font-weight: 700;
}}
h2 {{
  font-size: 18pt;
  font-weight: 700;
  color: #0d9488;
  margin: 0;
  page-break-after: avoid;
  line-height: 1.3;
}}
h3 {{
  font-size: 14pt;
  font-weight: 700;
  color: #374151;
  margin: 1em 0 0.5em;
  page-break-after: avoid;
}}
h4 {{
  font-size: 11pt;
  font-weight: 700;
  color: #1f2937;
  margin: 0.8em 0 0.4em;
  page-break-after: avoid;
}}
p {{
  margin: 0 0 0.35em;
  text-indent: 2em;
  orphans: 3;
  widows: 3;
}}
.lead {{
  font-size: 11pt;
  color: #374151;
  text-indent: 0;
  margin-bottom: 0.8em;
}}
.small {{
  font-size: 9pt;
  color: #6b7280;
}}
ul, ol {{
  padding-left: 1.5em;
  margin: 0.3em 0 0.6em;
  text-align: left;
}}
li {{
  margin-bottom: 0.25em;
  text-align: justify;
}}
ul li::marker {{
  color: #0d9488;
}}
/* Cards / highlights */
.card, .key-card, .domain-card {{
  border: 0.5pt solid #e5e7eb;
  border-radius: 3pt;
  padding: 0.6em 0.8em;
  margin: 0.5em 0;
  background: #fff;
  page-break-inside: avoid;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}}
.key-card {{
  border-left: 3px solid #0d9488;
  background: #f0fdfa;
}}
.domain-card {{
  border-top: 2pt solid #0d9488;
  border-left: 0.5pt solid #e5e7eb;
}}
.card p, .key-card p, .domain-card p {{
  text-indent: 0;
}}
.grid-2 {{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8em;
}}
.grid-3 {{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8em;
}}
.grid-4 {{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.7em;
}}
.flow {{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3em;
  margin: 0.6em 0;
}}
.flow .step {{
  background: #0d9488;
  color: #fff;
  padding: 0.25em 0.6em;
  border-radius: 2.5pt;
  font-size: 9.5pt;
  font-weight: 500;
}}
.flow .arrow {{
  color: #0d9488;
  font-weight: 700;
}}
/* Tables */
table {{
  width: 100%;
  border-collapse: collapse;
  margin: 0.8em 0;
  font-size: 9.5pt;
  page-break-inside: auto;
}}
thead {{
  display: table-header-group;
}}
tr {{
  page-break-inside: avoid;
}}
th, td {{
  border: 0.5pt solid #d1d5db;
  padding: 0.35em 0.5em;
  vertical-align: top;
  text-align: left;
}}
th {{
  background: #0d9488;
  color: #fff;
  font-weight: 700;
}}
caption {{
  caption-side: top;
  text-align: center;
  font-size: 9.5pt;
  color: #1f2937;
  margin-bottom: 0.3em;
  counter-increment: table;
}}
caption::before {{
  content: "表 " attr(data-chapter) "-" counter(table);
  font-weight: 700;
}}
/* Figures */
figure {{
  margin: 0.8em 0;
  text-align: center;
  page-break-inside: avoid;
}}
figure img {{
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  border: 0.5pt solid #e5e7eb;
  border-radius: 2pt;
}}
figcaption {{
  font-size: 9pt;
  color: #6b7280;
  margin-top: 0.4em;
  text-align: center;
  text-indent: 0;
  counter-increment: figure;
}}
figcaption::before {{
  content: "图 " attr(data-chapter) "-" counter(figure) " ";
  font-weight: 700;
  color: #1f2937;
}}
/* Q&A */
.qa-item {{
  page-break-inside: avoid;
  margin: 0.6em 0;
  border-bottom: 0.5pt solid #e5e7eb;
  padding-bottom: 0.4em;
}}
.qa-meta {{
  display: none;
}}
.qa-group-title {{
  font-size: 13pt;
  color: #0f766e;
  font-weight: 700;
  margin: 1em 0 0.4em;
  page-break-after: avoid;
}}
.qa-q {{
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.3em;
  text-indent: 0;
}}
.qa-q::before {{
  content: "Q ";
  color: #0d9488;
}}
.qa-context {{
  font-size: 9.5pt;
  color: #6b7280;
  margin-bottom: 0.3em;
  text-indent: 0;
}}
.qa-a {{
  color: #374151;
  text-indent: 0;
}}
.qa-a::before {{
  content: "A ";
  color: #0d9488;
  font-weight: 700;
}}
.qa-nav, .qa-summary {{
  display: none;
}}
/* Footer / colophon */
.colophon {{
  page: back;
  page-break-before: always;
  text-align: center;
  color: #6b7280;
  font-size: 9.5pt;
  padding-top: 60%;
  line-height: 1.8;
}}
.colophon p {{
  text-indent: 0;
}}
/* Utility */
.tag {{
  display: inline-block;
  background: #ccfbf1;
  color: #0f766e;
  padding: 0.1em 0.4em;
  border-radius: 2mm;
  font-size: 8.5pt;
  font-weight: 500;
}}
.icon {{
  width: 16pt;
  height: 16pt;
  fill: #0d9488;
  vertical-align: middle;
}}
img {{
  max-width: 100%;
  height: auto;
}}
'''
    head.append(style)

    body = new_soup.body
    body.append(build_cover(new_soup, source_cover))
    body.append(build_toc(new_soup, sections))

    for sec in sections:
        sec_id = sec.get('id', '')
        chapter = parse_chapter_number(sec)
        strip_inline_styles(sec)
        sec['data-chapter'] = chapter
        sec['data-title'] = section_title(sec)
        # Named page for per-chapter header
        if re.match(r'^sec\d+$', sec_id):
            sec['style'] = f'page: {sec_id};'
        convert_screenshot_to_figure(sec, chapter)
        add_table_captions(sec, chapter)
        cleanup_figures(sec, chapter)
        body.append(sec)

    source_footer = soup.find('footer')
    if source_footer:
        colophon = new_soup.new_tag('div')
        colophon['class'] = ['colophon']
        colophon.append(BeautifulSoup(source_footer.decode_contents(), 'html.parser'))
        body.append(colophon)

    OUT.write_text(str(new_soup), encoding='utf-8')
    print(f'Wrote {OUT}')

if __name__ == '__main__':
    build_print_html()
