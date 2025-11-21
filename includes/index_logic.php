<?php
// index_logic.php
date_default_timezone_set('Asia/Damascus');
require_once __DIR__ . '/db.php';

// === جلب الإعدادات ===
$settings_result = $mysqli->query("SELECT * FROM settings")->fetch_all(MYSQLI_ASSOC);
$settings = [];
foreach ($settings_result as $row) {
    $settings[$row['setting_key']] = $row['setting_value'];
}
$discount_type = $settings['discount_type'] ?? 'global';
$discount_value = floatval($settings['discount_value'] ?? 0);
$discount_target_id = $settings['discount_target_id'] ?? null;
$usd_exchange_rate = isset($settings['usd_exchange_rate']) ? floatval($settings['usd_exchange_rate']) : 15000;

// === جلب الأقسام الرئيسية ===
$parent_sections_result = $mysqli->query("SELECT * FROM parent_sections WHERE is_active = 1 ORDER BY display_order ASC, name ASC");
$parent_sections = $parent_sections_result->fetch_all(MYSQLI_ASSOC);

// === جلب الفئات الفرعية ===
$categories_result = $mysqli->query("SELECT * FROM categories ORDER BY parent_section, name");
$categories = [];
while ($row = $categories_result->fetch_assoc()) {
    $categories[$row['parent_section']][] = $row;
}

// === جلب المنتجات مع parent_section (مهم جداً للخصم) ===
$products_result = $mysqli->query("
    SELECT 
        p.*, 
        c.parent_section,
        IF(
            (SELECT COUNT(pv.id) FROM product_variants pv WHERE pv.product_id = p.id) > 0, 
            (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id), 
            p.stock
        ) AS display_stock
    FROM products p 
    JOIN categories c ON p.category_id = c.id 
    ORDER BY p.name
");
$products = $products_result->fetch_all(MYSQLI_ASSOC);
?>