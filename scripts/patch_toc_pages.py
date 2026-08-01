#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Two-pass patch: compute real page numbers from the PDF and write them into the TOC."""
import re
from pathlib import Path
import fitz
from bs4 import BeautifulSoup

HTML = Path('/Users/mac/qucheng/鑫渠解决方案白皮书_印刷版.html')
PDF = Path('/Users/mac/qucheng/鑫渠解决方案白皮书_印刷版.pdf')

def normalize(t: str) -> str:
    t = re.sub(r'[\s\n\r]+', ' ', t)
    return t.strip()

def find_section_pages():
    doc = fitz.open(str(PDF))
    page_texts = [normalize(page.get_text()) for page in doc]

    # Parse HTML to get sections and titles
    soup = BeautifulSoup(HTML.read_text(encoding='utf-8'), 'html.parser')
    sections = soup.find_all('section', id=re.compile(r'^sec\d+$'))
    mapping = {}
    for sec in sections:
        sid = sec['id']
        h2 = sec.find('h2')
        title = h2.get_text(strip=True) if h2 else ''
        if not title:
            continue
        norm_title = normalize(title)
        # Search from page index 2 onward (skip cover and TOC)
        found = None
        for idx, txt in enumerate(page_texts):
            if idx < 2:
                continue
            # A section title might be preceded by its number badge, e.g. "01 IVD ..."
            if norm_title in txt or norm_title.replace(' ', '') in txt.replace(' ', ''):
                found = idx
                break
        if found is None:
            # fallback: search all pages
            for idx, txt in enumerate(page_texts):
                if norm_title in txt:
                    found = idx
                    break
        if found is not None:
            # displayed page = actual PDF page - 2 (cover + TOC are unnumbered)
            mapping[sid] = found - 1
        else:
            mapping[sid] = '?'
    return mapping

def patch_html(mapping):
    soup = BeautifulSoup(HTML.read_text(encoding='utf-8'), 'html.parser')
    # Disable target-counter rule and use explicit numbers
    style = soup.find('style')
    if style:
        css = style.string
        css = re.sub(r'\.toc-pagenum::before\s*\{[^}]*content:\s*target-counter\([^)]+\)[^}]*\}',
                     '.toc-pagenum::before { content: none !important; }', css)
        if '.toc-pagenum::before' not in css:
            css += '\n.toc-pagenum::before { content: none !important; }'
        style.string = css

    for a in soup.select('.toc-list a[href^="#sec"]'):
        sid = a['href'][1:]
        pagenum = mapping.get(sid)
        span = a.find('span', class_='toc-pagenum')
        if span and pagenum is not None:
            span.string = str(pagenum)
            span['data-href'] = ''
    HTML.write_text(str(soup), encoding='utf-8')
    print('Patched TOC with pages:', mapping)

if __name__ == '__main__':
    mapping = find_section_pages()
    patch_html(mapping)
