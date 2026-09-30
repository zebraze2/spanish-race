"""Stamp index.html's script/style links with a version from their contents.

Browsers (and GitHub Pages, which caches for 10 minutes) could otherwise mix
old and new files after an update. Run before every commit:

    python3 tools/stamp-version.py
"""
import hashlib
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), '..')
index = os.path.join(ROOT, 'index.html')
html = open(index, encoding='utf-8').read()
pattern = re.compile(r'((?:src|href)=")([\w-]+\.(?:js|css))(?:\?v=\w+)?(")')
digest = hashlib.sha1()
for name in pattern.findall(html):
    digest.update(open(os.path.join(ROOT, name[1]), 'rb').read())
version = digest.hexdigest()[:8]
html = pattern.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={version}{m.group(3)}', html)
open(index, 'w', encoding='utf-8').write(html)
print('stamped', version)
