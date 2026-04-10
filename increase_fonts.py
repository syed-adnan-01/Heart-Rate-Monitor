import os
import re

size_map = {
    "text-[8px]": "text-[10px]",
    "text-[9px]": "text-[11px]",
    "text-[10px]": "text-[12px]", # mapping to specific value to avoid xs conflicts if needed, but wait:
    "text-[11px]": "text-sm",
    "text-[12px]": "text-sm",
    "text-[13px]": "text-sm",
    "text-[14px]": "text-base",
    "text-xs": "text-sm",
    "text-sm": "text-base",
    "text-base": "text-lg",
    "text-lg": "text-xl",
    "text-xl": "text-2xl",
    "text-2xl": "text-3xl",
    "text-3xl": "text-4xl",
    "text-4xl": "text-5xl",
    "text-5xl": "text-6xl",
    "text-6xl": "text-7xl",
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create a single regex pattern that matches any of the keys
    # Sort keys by length descending to match longest first (e.g. text-[10px] before text-xs if it could overlap)
    keys = sorted(size_map.keys(), key=len, reverse=True)
    escaped_keys = [re.escape(k) for k in keys]
    pattern = r'(?<!-)(?:' + '|'.join(escaped_keys) + r')(?!\w|-)'
    
    def replacer(match):
        return size_map[match.group(0)]

    new_content = re.sub(pattern, replacer, content)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            replace_in_file(os.path.join(root, file))

