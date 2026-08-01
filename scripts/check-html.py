#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查鑫渠高保真原型.html 的 HTML 标签是否平衡。
不平衡会直接导致后续 view 脱离 main.content，出现页面右偏、未铺满等问题。
"""
import sys
from html.parser import HTMLParser
from pathlib import Path

HTML_FILE = Path(__file__).resolve().parent.parent / "prototype" / "鑫渠高保真原型.html"

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}


class BalanceChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.issues = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID_TAGS:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
            return
        # 不匹配，向上查找
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                popped = self.stack[i:]
                self.stack = self.stack[:i]
                self.issues.append(
                    ("autoclose", tag, popped[0][1][0], self.getpos()[0])
                )
                return
        self.issues.append(("extra_close", tag, self.getpos()[0]))


def main():
    if not HTML_FILE.exists():
        print(f"ERROR: 找不到文件 {HTML_FILE}", file=sys.stderr)
        return 1

    html = HTML_FILE.read_text(encoding="utf-8")
    checker = BalanceChecker()
    checker.feed(html)

    if checker.stack or checker.issues:
        print("❌ HTML 结构检查未通过")
        print(f"   文件: {HTML_FILE}")
        if checker.stack:
            print(f"   未闭合标签: {len(checker.stack)}")
            for tag, (line, col) in checker.stack[-10:]:
                print(f"     - <{tag}> 行 {line}, 列 {col}")
        if checker.issues:
            print(f"   结构问题: {len(checker.issues)}")
            for issue in checker.issues[:10]:
                if issue[0] == "autoclose":
                    _, tag, opened_line, closed_line = issue
                    print(
                        f"     - 行 {closed_line} 的 </{tag}> 导致行 {opened_line} 的标签被强制闭合"
                    )
                else:
                    _, tag, closed_line = issue
                    print(f"     - 行 {closed_line} 存在多余的 </{tag}>")
        return 1

    print(f"✅ HTML 结构检查通过 ({len(html):,} 字符)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
