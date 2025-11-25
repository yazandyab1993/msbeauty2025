#!/usr/bin/env python3
import os
import shutil

source_dir = '.'
dest_dir = 'TEXTS'

# حذف مجلد TEXTS بالكامل إذا كان موجوداً لإنشاء نسخة نظيفة
if os.path.exists(dest_dir):
    shutil.rmtree(dest_dir)

for root, dirs, files in os.walk(source_dir, topdown=True):
    # تجاهل المجلدات المخفية والـ TEXTS نفسه
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != dest_dir]
    
    for file in files:
        # تجاهل الملفات المخفية والـ TEXTS
        if file.startswith('.') or root.startswith(f'./{dest_dir}'):
            continue
            
        source_path = os.path.join(root, file)
        rel_path = os.path.relpath(root, source_dir)
        dest_folder = os.path.join(dest_dir, rel_path)
        os.makedirs(dest_folder, exist_ok=True)
        
        # إنشاء الاسم الجديد مع .txt
        new_filename = f"{file}.txt"
        dest_path = os.path.join(dest_folder, new_filename)
        
        # النسخ مع استبدال التلقائي لأي ملفات مكررة
        shutil.copy2(source_path, dest_path)

print(f"✓ تم تحويل جميع الملفات بنجاح إلى مجلد '{dest_dir}'")
print(f"✓ جميع الملفات المكررة تم استبدالها تلقائياً")