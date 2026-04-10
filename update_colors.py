import os
import re

# We will replace these specific tailwind classes with the newly defined theme classes
replacements = {
    r'bg-\[\#08090a\]': 'bg-theme-bg',
    r'bg-\[\#111418\]': 'bg-theme-card',
    r'border-white/5': 'border-theme-border',
    r'text-slate-200': 'text-text-primary',
    r'text-white': 'text-text-primary',
    r'text-slate-300': 'text-text-primary',
    r'text-slate-400': 'text-text-secondary',
    r'text-slate-500': 'text-text-secondary',
    r'text-cyan-400': 'text-accent-cyan',
    r'text-cyan-500': 'text-accent-cyan',
    r'bg-cyan-500/10': 'bg-accent-cyan/10',
    r'bg-cyan-500/20': 'bg-accent-cyan/20',
    r'border-cyan-500/20': 'border-accent-cyan/20',
    r'border-cyan-500/30': 'border-accent-cyan/30',
    r'border-cyan-400/30': 'border-accent-cyan/30',
    r'bg-[#0a0c12]': 'bg-theme-bg',
    r'bg-slate-800/50': 'bg-theme-border/50',
    r'bg-slate-800': 'bg-theme-card-hover',
    r'bg-slate-900/50': 'bg-theme-card',
    r'text-emerald-400': 'text-accent-yellow', # Use yellow for positive/active states like the image
    r'text-emerald-500': 'text-accent-yellow',
    r'bg-emerald-500/10': 'bg-accent-yellow/10',
    r'bg-emerald-500/20': 'bg-accent-yellow/20',
    r'bg-emerald-400/20': 'bg-accent-yellow/20',
    r'bg-emerald-500': 'bg-accent-yellow',
    r'bg-orange-500': 'bg-accent-yellow',
    r'text-orange-500': 'text-accent-yellow',
    r'text-red-500': 'text-accent-cyan', # Replacing red with cyan for consistency unless it's a critical error
    r'bg-red-500': 'bg-accent-cyan',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in replacements.items():
        # Match class names bounded by quotes, spaces, or start/end of line
        # This regex ensures we replace within tailwind class strings
        new_content = re.sub(r'(?<=\s|"|\'|`)' + pattern + r'(?=\s|"|\'|`)', replacement, new_content)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            replace_in_file(os.path.join(root, file))

