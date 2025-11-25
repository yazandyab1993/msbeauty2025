<?php
header('Content-Type: application/json');
require_once __DIR__ . '/includes/db.php';
// لا تُظهِر الأخطاء للمستخدم (لتجنب تدمير JSON)
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
// لكن ما زلنا نُسجّلها داخليًا للتصحيح
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/api_errors.log');
date_default_timezone_set('Asia/Damascus');
// Ensure uploads directory exists
if (!file_exists('uploads')) {
    mkdir('uploads', 0777, true);
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
if (empty($action)) {
    $input = json_decode(file_get_contents('php://input'), true);
   if ($input && isset($input['action'])) {
        $_POST = $input; // نعيد تعيين $_POST ليحتوي البيانات
        $action = $input['action'];
    }
}


// Fetch settings once for use in multiple actions
$settings_result = $mysqli->query("SELECT * FROM settings");
$settings = [];
while($row = $settings_result->fetch_assoc()) {
    $settings[$row['setting_key']] = $row['setting_value'];
}
$settings_result->close();
try {
switch ($action) {
 case 'get_settings':
    $settings_result = $mysqli->query("SELECT * FROM settings");
    $settings = [];
    while ($row = $settings_result->fetch_assoc()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    echo json_encode(['success' => true, 'data' => $settings]);
    break;

    case 'search_products':
    $term = $_GET['term'] ?? '';
    if (strlen($term) < 1) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
    $searchTerm = "%{$term}%";
    $data = [];
    
    // البحث في المنتجات الأساسية
    $stmt = $mysqli->prepare("SELECT *, (stock - reserved_stock) as available_stock FROM products WHERE (name LIKE ? OR barcode = ?)");
    $stmt->bind_param("ss", $searchTerm, $term);
    $stmt->execute();
    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    
    foreach ($products as $product) {
        // جلب آخر سعر تكلفة
        $cost_stmt = $mysqli->prepare("
            SELECT cost_price 
            FROM purchase_invoice_items 
            WHERE product_id = ? AND variant_id IS NULL 
            ORDER BY id DESC LIMIT 1
        ");
        $cost_stmt->bind_param("i", $product['id']);
        $cost_stmt->execute();
        $cost_res = $cost_stmt->get_result();
        $last_cost = $cost_res->num_rows > 0 ? $cost_res->fetch_assoc()['cost_price'] : 0;
        $cost_stmt->close();
        
        $product['last_cost_price'] = $last_cost;
        $data[] = $product;
    }
    
    // البحث في درجات المنتجات
    $stmtv = $mysqli->prepare("SELECT v.*, (v.stock - v.reserved_stock) as available_stock, p.name as product_name, p.description, p.price as base_price, p.image as product_image, p.category_id FROM product_variants v JOIN products p ON v.product_id = p.id WHERE v.barcode = ?");
    $stmtv->bind_param("s", $term);
    $stmtv->execute();
    $vres = $stmtv->get_result();
    
    while($vr = $vres->fetch_assoc()) {
        $v_cost_stmt = $mysqli->prepare("
            SELECT cost_price 
            FROM purchase_invoice_items 
            WHERE product_id = ? AND variant_id = ? 
            ORDER BY id DESC LIMIT 1
        ");
        $v_cost_stmt->bind_param("ii", $vr['product_id'], $vr['id']);
        $v_cost_stmt->execute();
        $v_cost_res = $v_cost_stmt->get_result();
        $v_last_cost = $v_cost_res->num_rows > 0 ? $v_cost_res->fetch_assoc()['cost_price'] : 0;
        $v_cost_stmt->close();
        
        $data[] = [
            'id' => intval($vr['product_id']),
            'name' => $vr['product_name'],
            'description' => $vr['description'],
            'price' => $vr['price_override'] !== null ? $vr['price_override'] : $vr['base_price'],
            'stock' => intval($vr['stock']),
            'reserved_stock' => intval($vr['reserved_stock']),
            'available_stock' => intval($vr['available_stock']),
            'image' => $vr['image'] ?: $vr['product_image'],
            'category_id' => intval($vr['category_id']),
            'barcode' => $vr['barcode'],
            'variant_id' => intval($vr['id']),
            'variant_name' => $vr['name'],
            'last_cost_price' => $v_last_cost
        ];
    }
    $stmtv->close();
    
    if (empty($data)) {
        $stmt_products_with_variants = $mysqli->prepare("
            SELECT DISTINCT p.*, (p.stock - p.reserved_stock) as available_stock
            FROM products p 
            JOIN product_variants pv ON p.id = pv.product_id 
            WHERE p.name LIKE ?
        ");
        $stmt_products_with_variants->bind_param("s", $searchTerm);
        $stmt_products_with_variants->execute();
        $variant_products_result = $stmt_products_with_variants->get_result();
        while($variant_product = $variant_products_result->fetch_assoc()) {
            $data[] = $variant_product;
        }
        $stmt_products_with_variants->close();
    }
    
    echo json_encode(['success' => true, 'data' => $data]);
    break;

case 'ping':
    echo json_encode(['success' => true, 'message' => 'pong']);
    break;


case 'get_all_products_for_modal':
    $stmt = $mysqli->prepare("
        SELECT p.id, p.name, p.price, p.barcode, p.image, p.is_new,
               c.name as category_name, ps.name as parent_section,
               COALESCE(SUM(v.stock), p.stock) as display_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN parent_sections ps ON c.parent_section = ps.slug
        LEFT JOIN product_variants v ON p.id = v.product_id
        GROUP BY p.id
        ORDER BY p.id DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode(['success' => true, 'products' => $products]);
    break;


    case 'get_variants':
        $product_id = intval($_GET['product_id'] ?? 0);
        if ($product_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'معرّف المنتج غير صالح']);
            break;
        }
        $stmt = $mysqli->prepare("SELECT id, product_id, name, barcode, stock, price_override, image FROM product_variants WHERE product_id = ? ORDER BY id ASC");
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $variants = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode(['success' => true, 'data' => $variants]);
        break;



// === كوبونات الخصم ===
case 'get_coupons':
    $stmt = $mysqli->prepare("SELECT * FROM coupons ORDER BY created_at DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $coupons = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode(['success' => true, 'data' => $coupons]);
    break;

case 'save_coupon':
    $id = $_POST['id'] ?? null;
    $name = trim($_POST['name'] ?? '');
    $code = strtoupper(trim($_POST['code'] ?? ''));
    $discount_type = $_POST['discount_type'] ?? 'percentage';
    $discount_value = floatval($_POST['discount_value'] ?? 0);
    $expiry_date = $_POST['expiry_date'] ?? '';

    // التحقق من البيانات
    if (empty($name) || empty($code) || empty($expiry_date)) {
        echo json_encode(['success' => false, 'message' => 'جميع الحقول مطلوبة']);
        break;
    }
    if (!in_array($discount_type, ['percentage', 'fixed'])) {
        echo json_encode(['success' => false, 'message' => 'نوع الخصم غير صالح']);
        break;
    }
    if ($discount_value <= 0) {
        echo json_encode(['success' => false, 'message' => 'قيمة الخصم يجب أن تكون أكبر من الصفر']);
        break;
    }
    if (strtotime($expiry_date) < strtotime(date('Y-m-d'))) {
        echo json_encode(['success' => false, 'message' => 'تاريخ الانتهاء يجب أن يكون في المستقبل']);
        break;
    }

    if ($id) {
        // تحديث كوبون موجود
        $stmt = $mysqli->prepare("UPDATE coupons SET name=?, code=?, discount_type=?, discount_value=?, expiry_date=? WHERE id=?");
        $stmt->bind_param("sssdsi", $name, $code, $discount_type, $discount_value, $expiry_date, $id);
    } else {
        // إضافة كوبون جديد
        $stmt = $mysqli->prepare("INSERT INTO coupons (name, code, discount_type, discount_value, expiry_date) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssds", $name, $code, $discount_type, $discount_value, $expiry_date);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => $id ? 'تم تحديث الكوبون بنجاح' : 'تم إنشاء الكوبون بنجاح']);
    } else {
        // التحقق من خطأ الـ UNIQUE
        if (strpos($stmt->error, 'Duplicate entry') !== false && strpos($stmt->error, 'for key \'code\'') !== false) {
            echo json_encode(['success' => false, 'message' => 'هذا الكود مستخدم مسبقاً. يرجى استخدام كود فريد.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في الحفظ: ' . $stmt->error]);
        }
    }
    $stmt->close();
    break;

case 'delete_coupon':
    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'معرف الكوبون غير صالح']);
        break;
    }
    $stmt = $mysqli->prepare("DELETE FROM coupons WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $mysqli->error]);
    }
    $stmt->close();
    break;

case 'validate_coupon':
    $code = strtoupper(trim($_POST['code'] ?? ''));
    if (empty($code)) {
        echo json_encode(['success' => false, 'message' => 'يرجى إدخال كود الخصم']);
        break;
    }

    $stmt = $mysqli->prepare("
        SELECT id, name, discount_type, discount_value, expiry_date, usage_count
        FROM coupons 
        WHERE code = ? AND expiry_date >= CURDATE()
    ");
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();
    $coupon = $result->fetch_assoc();
    $stmt->close();

    if (!$coupon) {
        echo json_encode(['success' => false, 'message' => 'الكوبون غير صالح أو منتهٍ الصلاحية']);
        break;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $coupon['id'],
            'name' => $coupon['name'],
            'discount_type' => $coupon['discount_type'],
            'discount_value' => floatval($coupon['discount_value']),
            'expiry_date' => $coupon['expiry_date']
        ]
    ]);
    break;






   case 'create_order':
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['items'])) {
            echo json_encode(['success' => false, 'message' => 'Shopping cart is empty.']);
            exit;
        }
        
        $mysqli->begin_transaction();
        try {
            // 1. جلب بيانات المنتجات وقفل الصفوف (Pessimistic Locking) لمنع تضارب المخزون
            $item_ids = array_column($data['items'], 'id');
            $placeholders = implode(',', array_fill(0, count($item_ids), '?'));
            $stmt = $mysqli->prepare("SELECT id, name, price, stock, reserved_stock, category_id FROM products WHERE id IN ($placeholders) FOR UPDATE");
            $stmt->bind_param(str_repeat('i', count($item_ids)), ...$item_ids);
            $stmt->execute();
            $result = $stmt->get_result();
            $db_products = [];
            while($row = $result->fetch_assoc()) {
                $db_products[$row['id']] = $row;
            }
            $stmt->close();

            // جلب بيانات الدرجات (Variants)
            $variant_ids = array_values(array_unique(array_filter(array_map(fn($i) => isset($i['variant_id']) && $i['variant_id'] !== null ? (int)$i['variant_id'] : null, $data['items']))));
            $db_variants = [];
            if (!empty($variant_ids)) {
                $place_v = implode(',', array_fill(0, count($variant_ids), '?'));
                $stmtv = $mysqli->prepare("SELECT id, product_id, name, stock, reserved_stock, price_override FROM product_variants WHERE id IN ($place_v) FOR UPDATE");
                $stmtv->bind_param(str_repeat('i', count($variant_ids)), ...$variant_ids);
                $stmtv->execute();
                $resv = $stmtv->get_result();
                while($row = $resv->fetch_assoc()) { $db_variants[$row['id']] = $row; }
                $stmtv->close();
            }

            // 2. التحقق من توفر الكميات وتحديد أهلية الخصم
            $discount_type = $settings['discount_type'] ?? 'global';
            $discount_value = floatval($settings['discount_value'] ?? 0);
            $discount_target_id = $settings['discount_target_id'] ?? null;
            $eligible_product_ids = [];

            foreach ($data['items'] as $item) {
                $product_id = $item['id'];
                $product = $db_products[$product_id] ?? null;
                if (!$product) continue; // أو رمي خطأ

                $variant_id = isset($item['variant_id']) && $item['variant_id'] !== null ? (int)$item['variant_id'] : null;
                $quantity = intval($item['quantity']);

                // فحص المخزون
                if ($variant_id !== null) {
                    $variant = $db_variants[$variant_id] ?? null;
                    if (!$variant || $variant['product_id'] != $product['id']) throw new Exception("الدرجة غير صالحة للمنتج {$product['name']}");
                    $available = intval($variant['stock']) - intval($variant['reserved_stock']);
                    if ($quantity > $available) throw new Exception("الكمية غير متوفرة للدرجة {$variant['name']}");
                } else {
                    // التأكد من عدم وجود درجات إذا لم يختر العميل درجة
                    $check_v = $mysqli->query("SELECT 1 FROM product_variants WHERE product_id = $product_id LIMIT 1");
                    if ($check_v->num_rows > 0) throw new Exception("يجب اختيار درجة للمنتج {$product['name']}");
                    
                    $available = intval($product['stock']) - intval($product['reserved_stock']);
                    if ($quantity > $available) throw new Exception("الكمية غير متوفرة للمنتج {$product['name']}");
                }

                // فحص أهلية الخصم (Store Discount Eligibility)
                $is_eligible = false;
                if ($discount_type === 'global') {
                    $is_eligible = true;
                } elseif ($discount_type === 'parent_section') {
                    $cat_res = $mysqli->query("SELECT parent_section FROM categories WHERE id = {$product['category_id']}");
                    $cat_row = $cat_res->fetch_assoc();
                    if ($cat_row && $cat_row['parent_section'] === $discount_target_id) $is_eligible = true;
                } elseif ($discount_type === 'category') {
                    if ((string)$product['category_id'] === (string)$discount_target_id) $is_eligible = true;
                }

                if ($is_eligible) {
                    $eligible_product_ids[] = $product_id;
                }
            }

            // =========================================================
            // 3. إجراء الحسابات المالية (Waterfall Model) - مطابق لـ JS
            // =========================================================
            
            // تحديد العملة من البيانات المرسلة (USD أو SYP)
            $order_currency = isset($data['currency']) ? $data['currency'] : 'USD';
            $exchange_rate = floatval($settings['usd_exchange_rate'] ?? 15000);
            
            // المرحلة 1: المجموع الكلي
        $gross_total = 0;
        $discountable_total = 0; 

        foreach ($data['items'] as $item) {
            $product = $db_products[$item['id']];
            $variant_id = isset($item['variant_id']) ? (int)$item['variant_id'] : null;

            $unit_price = floatval($product['price']);
            if ($variant_id !== null && isset($db_variants[$variant_id])) {
                $v_price = $db_variants[$variant_id]['price_override'];
                $unit_price = ($v_price !== null) ? floatval($v_price) : $unit_price;
            }
            
            // تحويل السعر إلى العملة المطلوبة عند إتمام الطلب
            if ($order_currency === 'SYP') {
                $unit_price = $unit_price * $exchange_rate; // تحويل الدولار إلى ليرة
            }

            $line_total = $unit_price * intval($item['quantity']);
            $gross_total += $line_total;

            if (in_array($item['id'], $eligible_product_ids)) {
                $discountable_total += $line_total;
            }
        }

        // المرحلة 2: خصم المتجر
        $store_discount_amount = $discountable_total * ($discount_value / 100);
        $subtotal_stage_1 = max(0, $gross_total - $store_discount_amount);

        // المرحلة 3: خصم الكوبون
        $coupon_code = isset($data['coupon_code']) ? $data['coupon_code'] : null;
        $coupon_discount_amount = 0;
        
        if ($coupon_code) {
            $cp_stmt = $mysqli->prepare("SELECT discount_type, discount_value FROM coupons WHERE code = ? AND expiry_date >= CURDATE()");
            $cp_stmt->bind_param("s", $coupon_code);
            $cp_stmt->execute();
            $cp_res = $cp_stmt->get_result();
            if ($cp_row = $cp_res->fetch_assoc()) {
                if ($cp_row['discount_type'] == 'percentage') {
                    $coupon_discount_amount = $subtotal_stage_1 * (floatval($cp_row['discount_value']) / 100);
                } else {
                    $coupon_discount_amount = min(floatval($cp_row['discount_value']), $subtotal_stage_1);
                }
            }
            $cp_stmt->close();
        }
        
        $subtotal_stage_2 = max(0, $subtotal_stage_1 - $coupon_discount_amount);

        // المرحلة 4: خصم منتج الحظ
        $lucky_product_id = null;
        $lucky_discount_percent = 0;
        $lucky_discount_amount = 0;
        $contains_lucky = 0;

        $lp_res = $mysqli->query("SELECT product_id, discount_percent FROM lucky_product WHERE active_from <= NOW() AND active_to >= NOW() ORDER BY id DESC LIMIT 1");
        if ($lp_row = $lp_res->fetch_assoc()) {
            foreach ($data['items'] as $item) {
                if ($item['id'] == $lp_row['product_id']) {
                    $contains_lucky = 1;
                    $lucky_product_id = $lp_row['product_id'];
                    $lucky_discount_percent = floatval($lp_row['discount_percent']);
                    // يطبق على الصافي 2
                    $lucky_discount_amount = $subtotal_stage_2 * ($lucky_discount_percent / 100);
                    break;
                }
            }
        }

        // المرحلة 5: صافي البضاعة النهائي
        $net_goods_total = max(0, $subtotal_stage_2 - $lucky_discount_amount);

        // المرحلة 6: رسوم التوصيل
        $delivery_fee_type = $settings['delivery_fee_type'] ?? 'fixed';
        $delivery_fee_val = floatval($settings['delivery_fee_value'] ?? 0);
        
        // تحويل رسوم التوصيل إلى العملة المطلوبة
        $delivery_fee = ($delivery_fee_type == 'percentage') 
            ? $net_goods_total * ($delivery_fee_val / 100) 
            : $delivery_fee_val;
            
        if ($order_currency === 'SYP' && $delivery_fee_type !== 'percentage') {
            $delivery_fee = $delivery_fee * $exchange_rate; // تحويل التوصيل إلى ليرة إذا لم يكن نسبي
        }

        // المرحلة 7: الإجمالي النهائي
        $total_amount = $net_goods_total + $delivery_fee;

            // =========================================================
            // 4. معالجة بيانات العميل (إنشاء أو تحديث)
            // =========================================================
            $customer_phone = $data['customer_phone'];
            $customer_name = $data['customer_name'];
            $customer_location = $data['customer_location'];
            $customer_id = null;

            $cust_stmt = $mysqli->prepare("SELECT customer_id FROM customers WHERE phone = ?");
            $cust_stmt->bind_param("s", $customer_phone);
            $cust_stmt->execute();
            $cust_res = $cust_stmt->get_result();

            if ($cust_res->num_rows > 0) {
                $cust_row = $cust_res->fetch_assoc();
                $customer_id = $cust_row['customer_id'];
                $cust_stmt->close();
                // تحديث البيانات
                $upd_cust = $mysqli->prepare("UPDATE customers SET name=?, location=?, last_order_date=NOW() WHERE customer_id=?");
                $upd_cust->bind_param("ssi", $customer_name, $customer_location, $customer_id);
                $upd_cust->execute();
                $upd_cust->close();
            } else {
                $cust_stmt->close();
                // إنشاء جديد
                $ins_cust = $mysqli->prepare("INSERT INTO customers (name, phone, location) VALUES (?, ?, ?)");
                $ins_cust->bind_param("sss", $customer_name, $customer_phone, $customer_location);
                $ins_cust->execute();
                $customer_id = $ins_cust->insert_id;
                $ins_cust->close();
            }

            // =========================================================
            // 5. نظام المكافآت (Loyalty Rewards)
            // =========================================================
            $qualified_rule = null;
            $reward_discount_amount = 0;
            $reward_message = null;
            $gift_item_to_add = null;

            // فحص استحقاق المكافأة (بناءً على الطلبات السابقة المكتملة فقط)
            $rules_res = $mysqli->query("SELECT * FROM reward_rules WHERE is_active = 1 ORDER BY priority DESC");
            while ($rule = $rules_res->fetch_assoc()) {
                $period = intval($rule['period_days']);
                $threshold = floatval($rule['spend_threshold']);
                
                $sp_stmt = $mysqli->prepare("SELECT SUM(total_amount) as total FROM orders WHERE customer_id=? AND status='Completed' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)");
                $sp_stmt->bind_param("ii", $customer_id, $period);
                $sp_stmt->execute();
                $spent = floatval($sp_stmt->get_result()->fetch_assoc()['total']);
                $sp_stmt->close();

                if ($spent >= $threshold) {
                    // التحقق من عدم استلام المكافأة مسبقاً
                    $log_chk = $mysqli->prepare("SELECT log_id FROM reward_log WHERE customer_id=? AND rule_id=? AND reward_date >= DATE_SUB(NOW(), INTERVAL ? DAY)");
                    $log_chk->bind_param("iii", $customer_id, $rule['rule_id'], $period);
                    $log_chk->execute();
                    if ($log_chk->get_result()->num_rows == 0) {
                        $qualified_rule = $rule;
                        $log_chk->close();
                        break; // وجدنا القاعدة
                    }
                    $log_chk->close();
                }
            }

            // تطبيق المكافأة (إذا كانت كوبون مالي، تخصم من الإجمالي النهائي)
            if ($qualified_rule) {
                $reward_message = $qualified_rule['reward_note'];
                
                if ($qualified_rule['reward_type'] == 'coupon') {
                    $reward_discount_amount = floatval($qualified_rule['reward_value']);
                    // خصم المكافأة من الإجمالي
                    $total_amount = max(0, $total_amount - $reward_discount_amount);
                } 
                elseif ($qualified_rule['reward_type'] == 'product') {
                    // اختيار هدية عشوائية متوفرة
                    $gift_q = "SELECT gp.product_id, gp.variant_id, p.name, pv.name as variant_name,
                               IF(gp.variant_id IS NOT NULL, (pv.stock - pv.reserved_stock), (p.stock - p.reserved_stock)) as qty
                               FROM reward_gift_pool gp
                               JOIN products p ON gp.product_id = p.id
                               LEFT JOIN product_variants pv ON gp.variant_id = pv.id
                               WHERE gp.is_active = 1 HAVING qty > 0 ORDER BY RAND() LIMIT 1";
                    $gift_res = $mysqli->query($gift_q);
                    if ($gift_row = $gift_res->fetch_assoc()) {
                        $gift_item_to_add = $gift_row;
                        $n = $gift_row['name'] . ($gift_row['variant_name'] ? ' - '.$gift_row['variant_name'] : '');
                        $reward_message .= " (هدية: $n)";
                    }
                }
            }

            // =========================================================
            // 6. إدخال الطلب في قاعدة البيانات
            // =========================================================
            $exchange_rate = floatval($settings['usd_exchange_rate'] ?? 15000);

            $ord_stmt = $mysqli->prepare("
                INSERT INTO orders (
                    customer_id, customer_name, customer_phone, customer_location, 
                    total_amount, discount_percentage, delivery_fee, 
                    contains_lucky_product, lucky_product_id, lucky_discount_percent, lucky_discount_amount,
                    coupon_code, coupon_discount_amount, 
                    reward_discount_amount, reward_message, 
                    is_new, exchange_rate, currency
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
            ");
            
            $ord_stmt->bind_param("isssdddiiidsddsss", 
                $customer_id, $customer_name, $customer_phone, $customer_location,
                $total_amount, $discount_value, $delivery_fee,
                $contains_lucky, $lucky_product_id, $lucky_discount_percent, $lucky_discount_amount,
                $coupon_code, $coupon_discount_amount,
                $reward_discount_amount, $reward_message,
                $exchange_rate, $order_currency
            );
            
            $ord_stmt->execute();
            $order_id = $mysqli->insert_id;
            $ord_stmt->close();

            // 7. إدخال العناصر + حجز الكميات
            foreach ($data['items'] as $item) {
                $product = $db_products[$item['id']];
                $variant_id = isset($item['variant_id']) ? (int)$item['variant_id'] : null;
                $qty = intval($item['quantity']);
                
                // السعر للقطعة (بعد خصم المتجر إن وجد)
                $base_price = floatval($product['price']);
                if ($variant_id !== null && isset($db_variants[$variant_id])) {
                    $ovr = $db_variants[$variant_id]['price_override'];
                    $base_price = ($ovr !== null) ? floatval($ovr) : $base_price;
                }
                
                // تحويل السعر إلى العملة المطلوبة
                if ($order_currency === 'SYP') {
                    $base_price = $base_price * $exchange_rate; // تحويل الدولار إلى ليرة
                }

                $final_item_price = $base_price;
                if (in_array($item['id'], $eligible_product_ids)) {
                    $final_item_price = $base_price * (1 - $discount_value / 100);
                }

                // إدخال العنصر
                if ($variant_id) {
                    $itm_stmt = $mysqli->prepare("INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)");
                    $itm_stmt->bind_param("iiiid", $order_id, $item['id'], $variant_id, $qty, $final_item_price);
                } else {
                    $itm_stmt = $mysqli->prepare("INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, NULL, ?, ?)");
                    $itm_stmt->bind_param("iiid", $order_id, $item['id'], $qty, $final_item_price);
                }
                $itm_stmt->execute();
                $itm_stmt->close();

                // حجز الكمية
                if ($variant_id) {
                    $res_stmt = $mysqli->prepare("UPDATE product_variants SET reserved_stock = reserved_stock + ? WHERE id = ?");
                    $res_stmt->bind_param("ii", $qty, $variant_id);
                } else {
                    $res_stmt = $mysqli->prepare("UPDATE products SET reserved_stock = reserved_stock + ? WHERE id = ?");
                    $res_stmt->bind_param("ii", $qty, $item['id']);
                }
                $res_stmt->execute();
                $res_stmt->close();
            }

            // 8. إضافة الهدية للفاتورة (إن وجدت)
            if ($gift_item_to_add) {
                $g_pid = $gift_item_to_add['product_id'];
                $g_vid = $gift_item_to_add['variant_id'];
                
                if ($g_vid) {
                    $g_stmt = $mysqli->prepare("INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, is_gift) VALUES (?, ?, ?, 1, 0.00, 1)");
                    $g_stmt->bind_param("iii", $order_id, $g_pid, $g_vid);
                    // حجز
                    $g_res_stmt = $mysqli->prepare("UPDATE product_variants SET reserved_stock = reserved_stock + 1 WHERE id = ?");
                    $g_res_stmt->bind_param("i", $g_vid);
                } else {
                    $g_stmt = $mysqli->prepare("INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, is_gift) VALUES (?, ?, NULL, 1, 0.00, 1)");
                    $g_stmt->bind_param("ii", $order_id, $g_pid);
                    // حجز
                    $g_res_stmt = $mysqli->prepare("UPDATE products SET reserved_stock = reserved_stock + 1 WHERE id = ?");
                    $g_res_stmt->bind_param("i", $g_pid);
                }
                $g_stmt->execute(); $g_stmt->close();
                $g_res_stmt->execute(); $g_res_stmt->close();
            }

            // 9. تسجيل سجل المكافأة
            if ($qualified_rule) {
                $desc = ($qualified_rule['reward_type'] == 'coupon') ? "خصم ولاء بقيمة $reward_discount_amount" : "هدية: " . ($gift_item_to_add['name'] ?? '');
                $l_stmt = $mysqli->prepare("INSERT INTO reward_log (customer_id, rule_id, order_id, reward_type, reward_description, reward_date) VALUES (?, ?, ?, ?, ?, NOW())");
                $l_stmt->bind_param("iiiss", $customer_id, $qualified_rule['rule_id'], $order_id, $qualified_rule['reward_type'], $desc);
                $l_stmt->execute();
                $l_stmt->close();
            }

            // 10. زيادة عداد استخدام الكوبون
            if ($coupon_code) {
                $c_upd = $mysqli->prepare("UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?");
                $c_upd->bind_param("s", $coupon_code);
                $c_upd->execute();
                $c_upd->close();
            }

            $mysqli->commit();
            
            echo json_encode([
                'success' => true, 
                'order_id' => $order_id, 
                'reward_message' => $reward_message,
                'added_gift' => $gift_item_to_add ?? null
            ]);

        } catch (Exception $e) {
            $mysqli->rollback();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;


case 'get_reserved_products_report':
    $stmt = $mysqli->prepare("
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            pv.id AS variant_id,
            pv.name AS variant_name,
            oi.quantity,
            o.customer_name,
            o.customer_phone,
            o.created_at
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE o.status = 'Pending'
        ORDER BY o.created_at DESC
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $reserved_list = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    echo json_encode(['success' => true, 'data' => $reserved_list]);
    break;

// 🚀 [ميزة جديدة]: فحص أهلية العميل للمكافأة
    case 'check_customer_reward':
        $phone = $_GET['phone'] ?? '';
        if (empty($phone)) {
            echo json_encode(['success' => true, 'reward_message' => null]);
            break;
        }

        // 1. البحث عن العميل
        $cust_stmt = $mysqli->prepare("SELECT customer_id FROM customers WHERE phone = ?");
        $cust_stmt->bind_param("s", $phone);
        $cust_stmt->execute();
        $cust_result = $cust_stmt->get_result();
        
        if ($cust_result->num_rows == 0) {
            // عميل جديد، لا يوجد سجل إنفاق
            $cust_stmt->close();
            echo json_encode(['success' => true, 'reward_message' => null]);
            break;
        }
        
        $customer_id = $cust_result->fetch_assoc()['customer_id'];
        $cust_stmt->close();

        // 2. نسخ منطق التحقق من المكافآت (بدون اختيار الهدية)
        $qualified_rule = null;
        $rules_stmt = $mysqli->prepare("SELECT * FROM reward_rules WHERE is_active = 1 ORDER BY priority DESC");
        $rules_stmt->execute();
        $rules_result = $rules_stmt->get_result();

        while ($rule = $rules_result->fetch_assoc()) {
            $period_days = intval($rule['period_days']);
            $threshold = floatval($rule['spend_threshold']);
            $rule_id = intval($rule['rule_id']);

            // 2.1 احسب إنفاق العميل
            $spend_stmt = $mysqli->prepare("
                SELECT SUM(total_amount) as total_spent
                FROM orders 
                WHERE customer_id = ? 
                AND status = 'Completed' 
                AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ");
            $spend_stmt->bind_param("ii", $customer_id, $period_days);
            $spend_stmt->execute();
            $total_spent = floatval($spend_stmt->get_result()->fetch_assoc()['total_spent']);
            $spend_stmt->close();

            // 2.2 تحقق إذا كان مؤهلاً
            if ($total_spent >= $threshold) {
                // 2.3 تحقق إذا كان قد حصل عليها مسبقاً
                $log_stmt = $mysqli->prepare("
                    SELECT log_id 
                    FROM reward_log 
                    WHERE customer_id = ? AND rule_id = ? AND reward_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    LIMIT 1
                ");
                $log_stmt->bind_param("iii", $customer_id, $rule_id, $period_days);
                $log_stmt->execute();
                $already_rewarded = $log_stmt->get_result()->num_rows > 0;
                $log_stmt->close();

                if (!$already_rewarded) {
                    $qualified_rule = $rule; // العميل مؤهل!
                    break;
                }
            }
        }
        $rules_stmt->close();

        if ($qualified_rule) {
            // 3. أرسل رسالة التهنئة
            echo json_encode(['success' => true, 'reward_message' => $qualified_rule['reward_note']]);
        } else {
            // غير مؤهل
            echo json_encode(['success' => true, 'reward_message' => null]);
        }
        break;



    case 'complete_sale':
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['items'])) {
        echo json_encode(['success' => false, 'message' => 'الفاتورة فارغة.']);
        exit;
    }

    $mysqli->begin_transaction();
    try {
        // 1. جلب بيانات المنتجات مع القفل
        $item_ids = array_column($data['items'], 'id');
        $placeholders = implode(',', array_fill(0, count($item_ids), '?'));
        $stmt = $mysqli->prepare("SELECT id, price, stock, reserved_stock FROM products WHERE id IN ($placeholders) FOR UPDATE");
        $stmt->bind_param(str_repeat('i', count($item_ids)), ...$item_ids);
        $stmt->execute();
        $result = $stmt->get_result();
        $db_products = [];
        while($row = $result->fetch_assoc()) {
            $db_products[$row['id']] = $row;
        }
        $stmt->close();

        // 2. جلب بيانات الدرجات مع القفل
        $variant_ids = array_values(array_unique(array_filter(array_map(fn($i) => isset($i['variant_id']) && $i['variant_id'] !== null ? (int)$i['variant_id'] : null, $data['items']))));
        $db_variants = [];
        if (!empty($variant_ids)) {
            $place_v = implode(',', array_fill(0, count($variant_ids), '?'));
            $stmtv = $mysqli->prepare("SELECT id, product_id, price_override, stock, reserved_stock FROM product_variants WHERE id IN ($place_v) FOR UPDATE");
            $stmtv->bind_param(str_repeat('i', count($variant_ids)), ...$variant_ids);
            $stmtv->execute();
            $resv = $stmtv->get_result();
            while($row = $resv->fetch_assoc()) { 
                $db_variants[$row['id']] = $row; 
            }
            $stmtv->close();
        }

        // 3. التحقق من الكميات المتاحة (المخزون - المحجوز)
        $subtotal = 0;
        foreach($data['items'] as $item) {
            if(!isset($db_products[$item['id']])) {
                throw new Exception("المنتج غير موجود");
            }

            $variant_id = isset($item['variant_id']) && $item['variant_id'] !== null ? (int)$item['variant_id'] : null;
            $requested_qty = intval($item['quantity']);

            if ($variant_id !== null) {
                $variant = $db_variants[$variant_id] ?? null;
                if (!$variant || $variant['product_id'] != $item['id']) {
                    throw new Exception("درجة المنتج غير صالحة");
                }
                
                // ✅ التحقق من الكمية المتاحة (المخزون - المحجوز)
                $available_stock = intval($variant['stock']) - intval($variant['reserved_stock']);
                if ($requested_qty > $available_stock) {
                    throw new Exception("الكمية المطلوبة للدرجة '{$variant['name']}' غير متوفرة. المتاح: {$available_stock} (المحجوز: {$variant['reserved_stock']})");
                }
                
                $unit_price = $variant['price_override'] !== null ? floatval($variant['price_override']) : floatval($db_products[$item['id']]['price']);
            } else {
                // التحقق من وجود درجات
                $has_variants_stmt = $mysqli->prepare("SELECT 1 FROM product_variants WHERE product_id=? LIMIT 1");
                $has_variants_stmt->bind_param("i", $item['id']);
                $has_variants_stmt->execute();
                $has_variants = $has_variants_stmt->get_result()->num_rows > 0;
                $has_variants_stmt->close();
                
                if ($has_variants) {
                    throw new Exception("يجب اختيار درجة للمنتج");
                }

                // ✅ التحقق من الكمية المتاحة (المخزون - المحجوز)
                $product = $db_products[$item['id']];
                $available_stock = intval($product['stock']) - intval($product['reserved_stock']);
                if ($requested_qty > $available_stock) {
                    throw new Exception("الكمية المطلوبة للمنتج '{$product['name']}' غير متوفرة. المتاح: {$available_stock} (المحجوز: {$product['reserved_stock']})");
                }
                
                $unit_price = floatval($product['price']);
            }
            
            $subtotal += $unit_price * $requested_qty;
        }

        // 4. حساب الإجمالي
        $discount_amount = $data['discount_type'] == 'percentage' 
            ? $subtotal * (floatval($data['discount_value']) / 100) 
            : floatval($data['discount_value']);
        $total_amount = ($subtotal - $discount_amount) + floatval($data['delivery_fee']);

        // 5. إدخال الفاتورة
        $stmt = $mysqli->prepare("INSERT INTO sales (total_amount, seller_name, delivery_fee, discount_type, discount_value) VALUES (?, ?, ?, ?, ?)");
        $seller_name = $data['seller_name'] ?? '';
        $stmt->bind_param("dsdsd", $total_amount, $seller_name, $data['delivery_fee'], $data['discount_type'], $data['discount_value']);
        $stmt->execute();
        $sale_id = $mysqli->insert_id;
        $stmt->close();

        // 6. إدخال العناصر وخصم الكمية
        foreach ($data['items'] as $item) {
            $variant_id = isset($item['variant_id']) && $item['variant_id'] !== null ? (int)$item['variant_id'] : null;
            $quantity = intval($item['quantity']);
            
            // تحديد السعر
            $item_price = floatval($db_products[$item['id']]['price']);
            if ($variant_id !== null && isset($db_variants[$variant_id]) && $db_variants[$variant_id]['product_id'] == $item['id']) {
                $item_price = $db_variants[$variant_id]['price_override'] !== null 
                    ? floatval($db_variants[$variant_id]['price_override']) 
                    : $item_price;
            }

            // إدخال العنصر
            if ($variant_id === null) {
                $item_stmt = $mysqli->prepare("INSERT INTO sale_items (sale_id, product_id, variant_id, quantity, price) VALUES (?, ?, NULL, ?, ?)");
                $item_stmt->bind_param("iiid", $sale_id, $item['id'], $quantity, $item_price);
            } else {
                $item_stmt = $mysqli->prepare("INSERT INTO sale_items (sale_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)");
                $item_stmt->bind_param("iiiid", $sale_id, $item['id'], $variant_id, $quantity, $item_price);
            }
            $item_stmt->execute();
            $item_stmt->close();

            // ✅ خصم الكمية من المخزون (وليس من المحجوز)
            if ($variant_id !== null) {
                $stock_stmt = $mysqli->prepare("UPDATE product_variants SET stock = stock - ? WHERE id = ?");
                $stock_stmt->bind_param("ii", $quantity, $variant_id);
                $stock_stmt->execute();
                $stock_stmt->close();
            } else {
                $stock_stmt = $mysqli->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
                $stock_stmt->bind_param("ii", $quantity, $item['id']);
                $stock_stmt->execute();
                $stock_stmt->close();
            }
        }

        $mysqli->commit();
        echo json_encode(['success' => true, 'sale_id' => $sale_id]);
    } catch (Exception $e) {
        $mysqli->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    break;

case 'process_return':
    $data = json_decode(file_get_contents('php://input'), true);
    
    // تسجيل البيانات المستلمة
    error_log("📥 Return Data Received: " . json_encode($data));
    
    if (empty($data['items'])) {
        echo json_encode(['success' => false, 'message' => 'قائمة الإرجاع فارغة.']);
        exit;
    }
    
    $mysqli->begin_transaction();
    try {
        $reason = $data['reason'] ?? '';
        $return_stmt = $mysqli->prepare("INSERT INTO returns (reason) VALUES (?)");
        $return_stmt->bind_param("s", $reason);
        $return_stmt->execute();
        $return_id = $mysqli->insert_id;
        $return_stmt->close();
        
        $item_stmt = $mysqli->prepare("INSERT INTO return_items (return_id, product_id, variant_id, quantity, price_at_return) VALUES (?, ?, ?, ?, ?)");
        $stock_stmt_product = $mysqli->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
        $stock_stmt_variant = $mysqli->prepare("UPDATE product_variants SET stock = stock + ? WHERE id = ?");
        
        foreach ($data['items'] as $index => $item) {
            // ✅ التحقق الشامل من البيانات
            if (!isset($item['id']) || intval($item['id']) <= 0) {
                throw new Exception("العنصر #{$index}: معرف المنتج غير صالح");
            }
            
            $product_id = intval($item['id']);
            $variant_id = isset($item['variant_id']) && $item['variant_id'] !== null && intval($item['variant_id']) > 0
                ? intval($item['variant_id'])
                : null;
            $quantity = isset($item['quantity']) && intval($item['quantity']) > 0
                ? intval($item['quantity'])
                : 1;
            $price_at_return = isset($item['price_at_return']) && floatval($item['price_at_return']) >= 0
                ? floatval($item['price_at_return'])
                : 0.00;
            
            // إدخال العنصر
            $item_stmt->bind_param("iiiid", $return_id, $product_id, $variant_id, $quantity, $price_at_return);
            if (!$item_stmt->execute()) {
                throw new Exception("فشل إدخال العنصر #{$index}: " . $item_stmt->error);
            }
            
            // تحديث المخزون
            if ($variant_id !== null && $variant_id > 0) {
                $stock_stmt_variant->bind_param("ii", $quantity, $variant_id);
                if (!$stock_stmt_variant->execute()) {
                    throw new Exception("فشل تحديث مخزون الدرجة #{$index}");
                }
            } else {
                $stock_stmt_product->bind_param("ii", $quantity, $product_id);
                if (!$stock_stmt_product->execute()) {
                    throw new Exception("فشل تحديث مخزون المنتج #{$index}");
                }
            }
        }
        
        $item_stmt->close();
        $stock_stmt_product->close();
        $stock_stmt_variant->close();
        
        $mysqli->commit();
        error_log("✅ Return processed successfully: ID {$return_id}");
        echo json_encode(['success' => true, 'return_id' => $return_id]);
    } catch (Exception $e) {
        $mysqli->rollback();
        error_log("❌ Return Error: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    break;

case 'get_top_products_this_week':
    // تحديد بداية ونهاية الأسبوع (الاثنين لهذا الأسبوع إلى الأحد القادم)
    $start_of_week = date('Y-m-d H:i:s', strtotime('monday this week 00:00:00'));
    $end_of_week = date('Y-m-d H:i:s', strtotime('sunday this week 23:59:59'));

    // استعلام موحد لجمع الكميات من order_items و sale_items حسب product_id فقط
    $sql = "
    SELECT 
        product_id,
        SUM(total_quantity) as total_quantity
    FROM (
        -- الكميات من الطلبات (orders)
        SELECT 
            oi.product_id,
            SUM(oi.quantity) as total_quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN ? AND ?
        GROUP BY oi.product_id

        UNION ALL

        -- الكميات من فواتير المبيعات (sales)
        SELECT 
            si.product_id,
            SUM(si.quantity) as total_quantity
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE s.sale_date BETWEEN ? AND ?
        GROUP BY si.product_id
    ) AS combined_sales
    GROUP BY product_id
    ORDER BY total_quantity DESC
    LIMIT 6
    ";

    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'خطأ في تحضير الاستعلام: ' . $mysqli->error]);
        exit;
    }

    // ربط معاملات التاريخ أربع مرات (مرتين لكل جزء من الـ UNION)
    $stmt->bind_param("ssss", $start_of_week, $end_of_week, $start_of_week, $end_of_week);
    $stmt->execute();
    $result = $stmt->get_result();

    $top_product_ids = [];
    while ($row = $result->fetch_assoc()) {
        $top_product_ids[] = (int)$row['product_id'];
    }
    $stmt->close();

    // جلب تفاصيل المنتجات الأساسية فقط
    $products_data = [];
    if (!empty($top_product_ids)) {
        $placeholders = implode(',', array_fill(0, count($top_product_ids), '?'));
        $stmt_p = $mysqli->prepare("SELECT id, name, price, image, stock, reserved_stock FROM products WHERE id IN ($placeholders)");
        $stmt_p->bind_param(str_repeat('i', count($top_product_ids)), ...$top_product_ids);
        $stmt_p->execute();
        $result_p = $stmt_p->get_result();
        while ($row = $result_p->fetch_assoc()) {
            $products_data[$row['id']] = $row;
        }
        $stmt_p->close();
    }

    // بناء النتيجة النهائية
    $top_products = [];
    foreach ($top_product_ids as $pid) {
        if (isset($products_data[$pid])) {
            $product = $products_data[$pid];
            $top_products[] = [
                'id' => $product['id'],
                'name' => $product['name'],
                'price' => floatval($product['price']),
                'image' => $product['image'],
                'stock' => intval($product['stock']),
                'reserved_stock' => intval($product['reserved_stock']),
                'variant_id' => null, // لا نستخدم درجة محددة
                'variant_name' => null
            ];
        }
    }

    echo json_encode(['success' => true, 'data' => $top_products]);
    break;

    case 'get_negative_stock':
        // جلب المنتجات الأساسية ذات الكمية السالبة
        $negative_items = [];
        
        // المنتجات الأساسية
        $stmt_products = $mysqli->prepare("
            SELECT 
                'product' as type,
                p.id,
                p.name as product_name,
                NULL as variant_name,
                p.barcode,
                p.stock,
                c.name as category_name,
                c.parent_section
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.stock < 0
            ORDER BY p.stock ASC
        ");
        $stmt_products->execute();
        $result_products = $stmt_products->get_result();
        while ($row = $result_products->fetch_assoc()) {
            $negative_items[] = $row;
        }
        $stmt_products->close();

        // درجات المنتجات
        $stmt_variants = $mysqli->prepare("
            SELECT 
                'variant' as type,
                p.id as product_id,
                p.name as product_name,
                pv.name as variant_name,
                pv.barcode,
                pv.stock,
                c.name as category_name,
                c.parent_section
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE pv.stock < 0
            ORDER BY pv.stock ASC
        ");
        $stmt_variants->execute();
        $result_variants = $stmt_variants->get_result();
        while ($row = $result_variants->fetch_assoc()) {
            $negative_items[] = $row;
        }
        $stmt_variants->close();

        echo json_encode(['success' => true, 'data' => $negative_items]);
        break;

// إضافة هذا الكود في switch statement
case 'get_low_stock_products':
    $threshold = isset($_GET['threshold']) ? intval($_GET['threshold']) : 10;
    
    $query = "
        SELECT 
            'product' as type,
            p.id,
            p.name as product_name,
            NULL as variant_name,
            p.barcode,
            p.stock,
            p.price,
            p.description,
            p.category_id,
            c.name as category_name,
            c.parent_section,
            p.image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.stock < ?
          AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id)
        
        UNION ALL
        
        SELECT 
            'variant' as type,
            p.id as product_id,
            p.name as product_name,
            pv.name as variant_name,
            pv.barcode,
            pv.stock,
            COALESCE(pv.price_override, p.price) as price,
            p.description,
            p.category_id,
            c.name as category_name,
            c.parent_section,
            COALESCE(pv.image, p.image) as image
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE pv.stock < ?
        
        ORDER BY stock ASC
    ";
    
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param('ii', $threshold, $threshold);
    $stmt->execute();
    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $products,
        'threshold' => $threshold
    ]);
    break;

        case 'get_low_stock':
    $threshold = 5; // عتبة "المخزون المنخفض" - يمكن جعلها قابلة للضبط من الإعدادات لاحقًا
    $low_stock_items = [];

    // 1. المنتجات الأساسية (بدون درجات) ذات الكمية ≤ العتبة
    $stmt_products = $mysqli->prepare("
        SELECT 
            'product' as type,
            p.id,
            p.name as product_name,
            NULL as variant_name,
            p.barcode,
            p.stock,
            c.name as category_name,
            c.parent_section
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.stock <= ? 
          AND p.stock >= 0
          AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id)
        ORDER BY p.stock ASC
    ");
    $stmt_products->bind_param("i", $threshold);
    $stmt_products->execute();
    $result_products = $stmt_products->get_result();
    while ($row = $result_products->fetch_assoc()) {
        $low_stock_items[] = $row;
    }
    $stmt_products->close();

    // 2. الدرجات (variants) ذات الكمية ≤ العتبة
    $stmt_variants = $mysqli->prepare("
        SELECT 
            'variant' as type,
            p.id as product_id,
            p.name as product_name,
            pv.name as variant_name,
            pv.barcode,
            pv.stock,
            c.name as category_name,
            c.parent_section
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE pv.stock <= ? 
          AND pv.stock >= 0
        ORDER BY pv.stock ASC
    ");
    $stmt_variants->bind_param("i", $threshold);
    $stmt_variants->execute();
    $result_variants = $stmt_variants->get_result();
    while ($row = $result_variants->fetch_assoc()) {
        $low_stock_items[] = $row;
    }
    $stmt_variants->close();

    echo json_encode(['success' => true, 'data' => $low_stock_items]);
    break;

case 'get_new_products':
    // جلب أحدث 5 منتجات مع التحقق من صلاحية التاريخ
    $stmt = $mysqli->prepare("
        SELECT 
            p.*,
            c.parent_section,
            IF((SELECT COUNT(pv.id) FROM product_variants pv WHERE pv.product_id = p.id) > 0, 
               (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id), 
               p.stock) as display_stock
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_new = 1 
        AND (p.new_until IS NULL OR p.new_until >= CURDATE())
        ORDER BY p.id DESC
        LIMIT 6
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $new_products = [];
    while ($row = $result->fetch_assoc()) {
        $new_products[] = $row;
    }
    $stmt->close();
    echo json_encode(['success' => true, 'data' => $new_products]);
    break;


    // --- Admin Actions ---
    case 'add_product':
    // ✅ التصحيح: استخدام $_POST بدلاً من $item
    $name = $_POST['name'];
    $desc = $_POST['description'];
    $price = $_POST['price'];
    $stock = intval($_POST['stock'] ?? 0); // ✅ التصحيح هنا
    $cat_id = $_POST['category_id'];
    $barcode = $_POST['barcode'] ?? null;
    $has_variants = isset($_POST['has_variants']) && $_POST['has_variants'] == '1';
    $is_new = isset($_POST['is_new']) && $_POST['is_new'] == '1' ? 1 : 0;
    $new_until = !empty($_POST['new_until']) ? $_POST['new_until'] : null;
    
    // ✅ التصحيح: إضافة سجلات للتشخيص
    error_log("📦 بيانات المنتج المستلمة:");
    error_log("الاسم: " . $name);
    error_log("السعر: " . $price);
    error_log("المخزون: " . $stock);
    error_log("القسم: " . $cat_id);
    error_log("الباركود: " . $barcode);
    error_log("has_variants: " . $has_variants);
    
    if ($has_variants) {
        $barcode = null;
        $stock = 0; // إذا كان له درجات، المخزون الأساسي = 0
        error_log("🔄 المنتج له درجات، تم تعيين المخزون الأساسي إلى 0");
    }
    
    $image_path = 'uploads/placeholder.jpg';
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $target_dir = "uploads/";
        $image_name = uniqid() . basename($_FILES["image"]["name"]);
        $target_file = $target_dir . $image_name;
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image_path = $target_file;
        }
    }
    
    // ✅ التصحيح: التحقق من البيانات قبل الإدخال
    if (empty($name) || empty($price) || empty($cat_id)) {
        echo json_encode(['success' => false, 'message' => 'بيانات ناقصة']);
        exit;
    }
    
    $stmt = $mysqli->prepare("INSERT INTO products (name, description, price, stock, category_id, barcode, image, is_new, new_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        error_log("❌ خطأ في إعداد الاستعلام: " . $mysqli->error);
        echo json_encode(['success' => false, 'message' => 'خطأ في إعداد الاستعلام: ' . $mysqli->error]);
        exit;
    }
    
    $stmt->bind_param("ssdiissis", $name, $desc, $price, $stock, $cat_id, $barcode, $image_path, $is_new, $new_until);
    
    if ($stmt->execute()) {
        $new_id = $mysqli->insert_id;
        error_log("✅ تم إضافة المنتج بنجاح - المعرف: " . $new_id . "، المخزون: " . $stock);
        $stmt->close();
        echo json_encode(['success' => true, 'product_id' => $new_id]);
    } else {
        error_log("❌ خطأ في تنفيذ الاستعلام: " . $stmt->error);
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }
    break;

    case 'add_variants':
        $product_id = intval($_POST['product_id'] ?? 0);
        $variants_json = $_POST['variants'] ?? '[]';
        if ($product_id <= 0) { echo json_encode(['success' => false, 'message' => 'product_id required']); break; }
        $variants = json_decode($variants_json, true);
        if (!is_array($variants)) { echo json_encode(['success' => false, 'message' => 'invalid variants']); break; }
        $stmt = $mysqli->prepare("INSERT INTO product_variants (product_id, name, barcode, stock, price_override, image) VALUES (?, ?, ?, ?, ?, ?)");
        $default_image = 'uploads/placeholder.jpg';
        if (!is_dir('uploads')) { @mkdir('uploads', 0777, true); }
        foreach ($variants as $i => $v) {
            $name = $v['name'] ?? '';
            $barcode = $v['barcode'] ?? null;
            $stock = intval($v['stock'] ?? 0);
            $price_override = isset($v['price_override']) && $v['price_override'] !== '' ? floatval($v['price_override']) : null;
            if (!$barcode) { continue; }
            $image_to_use = $default_image;
            if (isset($_FILES['variant_images']) && isset($_FILES['variant_images']['name'][$i]) && $_FILES['variant_images']['error'][$i] === 0) {
                $target_dir = 'uploads/';
                $filename = uniqid() . basename($_FILES['variant_images']['name'][$i]);
                $target_file = $target_dir . $filename;
                if (move_uploaded_file($_FILES['variant_images']['tmp_name'][$i], $target_file)) {
                    $image_to_use = $target_file;
                }
            }
            $stmt->bind_param("issids", $product_id, $name, $barcode, $stock, $price_override, $image_to_use);
            $stmt->execute();
        }
        $stmt->close();
        echo json_encode(['success' => true]);
        break;

    case 'update_variant':
        $id = intval($_POST['id'] ?? 0);
        $name = $_POST['name'] ?? '';
        $barcode = $_POST['barcode'] ?? null;
        $stock = intval($_POST['stock'] ?? 0);
        $price_override = isset($_POST['price_override']) && $_POST['price_override'] !== '' ? floatval($_POST['price_override']) : null;
        if ($id <= 0) { echo json_encode(['success' => false, 'message' => 'id required']); break; }
        $stmt = $mysqli->prepare("UPDATE product_variants SET name=?, barcode=?, stock=?, price_override=? WHERE id=?");
        $stmt->bind_param("ssidi", $name, $barcode, $stock, $price_override, $id);
        if ($stmt->execute()) { echo json_encode(['success' => true]); } else { echo json_encode(['success' => false, 'message' => $mysqli->error]); }
        $stmt->close();
        break;

    case 'delete_variant':
        $id = intval($_POST['id'] ?? 0);
        if ($id <= 0) { echo json_encode(['success' => false, 'message' => 'id required']); break; }
        $stmt = $mysqli->prepare("DELETE FROM product_variants WHERE id=?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) { echo json_encode(['success' => true]); } else { echo json_encode(['success' => false, 'message' => $mysqli->error]); }
        $stmt->close();
        break;

    case 'update_product':
    $mysqli->begin_transaction();
    try {
        // جلب البيانات الأساسية
        $id = intval($_POST['id']);
        $name = $_POST['name'];
        $desc = $_POST['description'];
        $price = floatval($_POST['price']);
        $stock = intval($_POST['stock']);
        $cat_id = intval($_POST['category_id']);
        $barcode = $_POST['barcode'] ?? null;
        $has_variants = isset($_POST['has_variants']) && $_POST['has_variants'] == '1';
        $is_new = isset($_POST['is_new']) && $_POST['is_new'] == '1' ? 1 : 0;
        $new_until = !empty($_POST['new_until']) ? $_POST['new_until'] : null;
        
        // إذا كان المنتج يحتوي على درجات، نجعل المخزون والباركود فارغين
        if ($has_variants) {
            $stock = 0;
            $barcode = null;
        }
        
        // تسجيل للتشخيص
        error_log("🔄 Updating product ID: $id");
        error_log("Has variants: " . ($has_variants ? 'Yes' : 'No'));
        
        // تحديث المنتج الأساسي
        $sql = "UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, barcode=?, is_new=?, new_until=? WHERE id=?";
        $params = [$name, $desc, $price, $stock, $cat_id, $barcode, $is_new, $new_until, $id];
        $types = "ssdiisisi";
        
        // معالجة الصورة الجديدة إن وجدت
        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            if (!is_dir('uploads')) { @mkdir('uploads', 0777, true); }
            $image_path = 'uploads/' . time() . '_' . basename($_FILES['image']['name']);
            if (move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
                $sql = "UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, barcode=?, is_new=?, new_until=?, image=? WHERE id=?";
                $params = [$name, $desc, $price, $stock, $cat_id, $barcode, $is_new, $new_until, $image_path, $id];
                $types = "ssdiisissi";
                error_log("✅ Product image updated");
            }
        }
        
        $stmt = $mysqli->prepare($sql);
        if (!$stmt) {
            throw new Exception("Error preparing product update: " . $mysqli->error);
        }
        
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
            throw new Exception("Error updating product: " . $stmt->error);
        }
        $stmt->close();
        
        error_log("✅ Product basic info updated");
        
        // معالجة الدرجات
        if ($has_variants) {
            error_log("📦 Processing variants...");
            
            $variants = json_decode($_POST['variants'] ?? '[]', true);
            $deleted_variants = json_decode($_POST['deleted_variants'] ?? '[]', true);
            
            error_log("Variants to process: " . count($variants));
            error_log("Variants to delete: " . count($deleted_variants));
            
            // حذف الدرجات المحذوفة
            if (!empty($deleted_variants)) {
                $deleted_variants = array_map('intval', array_filter($deleted_variants));
                if (!empty($deleted_variants)) {
                    $placeholders = str_repeat('?,', count($deleted_variants) - 1) . '?';
                    $delete_stmt = $mysqli->prepare("DELETE FROM product_variants WHERE id IN ($placeholders)");
                    $types = str_repeat('i', count($deleted_variants));
                    $delete_stmt->bind_param($types, ...$deleted_variants);
                    
                    if ($delete_stmt->execute()) {
                        error_log("✅ Deleted " . $delete_stmt->affected_rows . " variants");
                    }
                    $delete_stmt->close();
                }
            }
            
            // معالجة الدرجات الحالية والجديدة
            $update_stmt = $mysqli->prepare(
                "UPDATE product_variants 
                 SET name=?, barcode=?, stock=?, price_override=?, image=? 
                 WHERE id=?"
            );
            
            $insert_stmt = $mysqli->prepare(
                "INSERT INTO product_variants (product_id, name, barcode, stock, price_override, image) 
                 VALUES (?, ?, ?, ?, ?, ?)"
            );
            
            foreach ($variants as $variant) {
                $v_id = $variant['id'];
                $v_name = $variant['name'] ?? '';
                $v_barcode = $variant['barcode'] ?? null;
                $v_stock = intval($variant['stock'] ?? 0);
                $v_price = isset($variant['price_override']) && $variant['price_override'] !== '' 
                    ? floatval($variant['price_override']) 
                    : null;
                
                // معالجة الصورة
                $v_image = $variant['image'] ?? 'uploads/placeholder.jpg';
                $file_key = "variant_image_{$v_id}";
                
                if (isset($_FILES[$file_key]) && $_FILES[$file_key]['error'] === UPLOAD_ERR_OK) {
                    error_log("📸 Processing image for variant $v_id");
                    
                    if (!is_dir('uploads')) { mkdir('uploads', 0777, true); }
                    $filename = uniqid() . '_' . basename($_FILES[$file_key]['name']);
                    $target = "uploads/" . $filename;
                    
                    if (move_uploaded_file($_FILES[$file_key]['tmp_name'], $target)) {
                        $v_image = $target;
                        error_log("✅ Image uploaded: $target");
                    } else {
                        error_log("❌ Failed to upload image for variant $v_id");
                    }
                } else {
                    // إذا لم يتم رفع صورة جديدة، نحتفظ بالصورة الحالية
                    if (strpos($v_id, 'new_') !== 0) {
                        $img_check = $mysqli->prepare("SELECT image FROM product_variants WHERE id = ?");
                        $img_check->bind_param("i", $v_id);
                        $img_check->execute();
                        $img_res = $img_check->get_result();
                        if ($img_row = $img_res->fetch_assoc()) {
                            $v_image = $img_row['image'];
                        }
                        $img_check->close();
                    }
                }
                
                // إذا كانت الدرجة جديدة (تبدأ بـ new_)
                if (strpos($v_id, 'new_') === 0) {
                    error_log("➕ Inserting new variant: $v_name");
                    
                    $insert_stmt->bind_param("issids", 
                        $id, $v_name, $v_barcode, $v_stock, $v_price, $v_image
                    );
                    
                    if (!$insert_stmt->execute()) {
                        error_log("❌ Failed to insert variant: " . $insert_stmt->error);
                        throw new Exception("Failed to insert variant: " . $insert_stmt->error);
                    }
                    
                    error_log("✅ New variant inserted with ID: " . $mysqli->insert_id);
                } else {
                    // تحديث درجة موجودة
                    error_log("🔄 Updating existing variant ID: $v_id");
                    
                    $numeric_id = intval($v_id);
                    $update_stmt->bind_param("ssidsi", 
                        $v_name, $v_barcode, $v_stock, $v_price, $v_image, $numeric_id
                    );
                    
                    if (!$update_stmt->execute()) {
                        error_log("❌ Failed to update variant: " . $update_stmt->error);
                        throw new Exception("Failed to update variant: " . $update_stmt->error);
                    }
                    
                    error_log("✅ Variant updated, affected rows: " . $update_stmt->affected_rows);
                }
            }
            
            $update_stmt->close();
            $insert_stmt->close();
            
            error_log("✅ All variants processed successfully");
        } else {
            // إذا لم يعد المنتج يحتوي على درجات، احذف جميع الدرجات
            error_log("🗑️ Removing all variants (product no longer has variants)");
            
            $delete_all_stmt = $mysqli->prepare("DELETE FROM product_variants WHERE product_id = ?");
            $delete_all_stmt->bind_param("i", $id);
            $delete_all_stmt->execute();
            error_log("✅ Deleted " . $delete_all_stmt->affected_rows . " variants");
            $delete_all_stmt->close();
        }
        
        $mysqli->commit();
        error_log("✅ Transaction committed successfully");
        
        echo json_encode(['success' => true, 'message' => 'تم تحديث المنتج بنجاح']);
        
    } catch (Exception $e) {
        $mysqli->rollback();
        error_log("❌ Error in update_product: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    break;

    case 'delete_product':
        $id = $_POST['id'];
        $stmt = $mysqli->prepare("DELETE FROM products WHERE id=?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            $stmt->close();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $mysqli->error]);
        }
        break;

    case 'add_category':
        $name = $_POST['name'];
        $section = $_POST['parent_section'];
        $check_stmt = $mysqli->prepare("SELECT id FROM categories WHERE name = ? AND parent_section = ?");
        $check_stmt->bind_param("ss", $name, $section);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows > 0) {
            $check_stmt->close();
            echo json_encode(['success' => false, 'message' => 'القسم موجود بالفعل']);
            break;
        }
        $check_stmt->close();
        $stmt = $mysqli->prepare("INSERT INTO categories (name, parent_section) VALUES (?, ?)");
        $stmt->bind_param("ss", $name, $section);
        if ($stmt->execute()) {
            $stmt->close();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $mysqli->error]);
        }
        break;

    case 'update_category':
        $id = intval($_POST['id']);
        $name = $_POST['name'];
        $section = $_POST['parent_section'];
        $check_stmt = $mysqli->prepare("SELECT id FROM categories WHERE name = ? AND parent_section = ? AND id != ?");
        $check_stmt->bind_param("ssi", $name, $section, $id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows > 0) {
            $check_stmt->close();
            echo json_encode(['success' => false, 'message' => 'يوجد قسم آخر بنفس الاسم']);
            break;
        }
        $check_stmt->close();
        $stmt = $mysqli->prepare("UPDATE categories SET name = ?, parent_section = ? WHERE id = ?");
        $stmt->bind_param("ssi", $name, $section, $id);
        if ($stmt->execute()) {
            $stmt->close();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $mysqli->error]);
        }
        break;

    case 'delete_category':
        $id = intval($_POST['id']);
        $mysqli->begin_transaction();
        try {
            $check_stmt = $mysqli->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
            $check_stmt->bind_param("i", $id);
            $check_stmt->execute();
            $result = $check_stmt->get_result();
            $count = $result->fetch_assoc()['count'];
            $check_stmt->close();
            if ($count > 0) {
                $default_category = $mysqli->query("SELECT id FROM categories WHERE id != $id LIMIT 1")->fetch_assoc();
                if (!$default_category) {
                    throw new Exception("لا يمكن حذف القسم الوحيد المتبقي");
                }
                $update_stmt = $mysqli->prepare("UPDATE products SET category_id = ? WHERE category_id = ?");
                $update_stmt->bind_param("ii", $default_category['id'], $id);
                $update_stmt->execute();
                $update_stmt->close();
            }
            $delete_stmt = $mysqli->prepare("DELETE FROM categories WHERE id = ?");
            $delete_stmt->bind_param("i", $id);
            $delete_stmt->execute();
            $delete_stmt->close();
            $mysqli->commit();
            if ($count > 0) {
                echo json_encode(['success' => true, 'message' => "تم حذف القسم ونقل {$count} منتج إلى قسم آخر"]);
            } else {
                echo json_encode(['success' => true, 'message' => 'تم حذف القسم بنجاح']);
            }
        } catch (Exception $e) {
            $mysqli->rollback();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'update_settings':
        $mysqli->query("TRUNCATE TABLE settings");
        $stmt = $mysqli->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)");
        foreach($_POST as $key => $value) {
            if($key == 'action') continue;
            $stmt->bind_param("ss", $key, $value);
            $stmt->execute();
        }
        $stmt->close();
        echo json_encode(['success' => true]);
        break;

    case 'check_new_orders':
    $result = $mysqli->query("SELECT id FROM orders WHERE is_new = 1 LIMIT 1");
    if ($result->num_rows > 0) {
        $order_id = $result->fetch_assoc()['id'];
        $result->close();
        echo json_encode(['success' => true, 'new_order' => true, 'order_id' => $order_id]);
        
    }elseif (isset($_GET['action']) && $_GET['action'] == 'mark_all_orders_seen') {
    try {
        // نقوم بتحديث كل الطلبات التي تحمل علامة "جديد"
        $mysqli->query("UPDATE orders SET is_new = 0 WHERE is_new = 1");

        // التحقق من عدد الصفوف التي تأثرت (اختياري)
        $affected_rows = $mysqli->affected_rows;

        echo json_encode(['success' => true, 'message' => "All orders marked as seen. Affected: $affected_rows"]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
} else {
        $result->close();
        echo json_encode(['success' => true, 'new_order' => false]);
    }
    break;

case 'mark_order_seen':
    $id = intval($_GET['id'] ?? 0);
    if ($id > 0) {
        // ✅ التأكد من تحديث is_new إلى 0
        $stmt = $mysqli->prepare("UPDATE orders SET is_new = 0 WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            $affected = $stmt->affected_rows;
            $stmt->close();
            
            // ✅ إرجاع معلومات إضافية للتأكد
            echo json_encode([
                'success' => true, 
                'message' => 'تم تحديث الطلب',
                'affected_rows' => $affected
            ]);
        }elseif (isset($_GET['action']) && $_GET['action'] == 'mark_all_orders_seen') {
    try {
        // نقوم بتحديث كل الطلبات التي تحمل علامة "جديد"
        $mysqli->query("UPDATE orders SET is_new = 0 WHERE is_new = 1");

        // التحقق من عدد الصفوف التي تأثرت (اختياري)
        $affected_rows = $mysqli->affected_rows;

        echo json_encode(['success' => true, 'message' => "All orders marked as seen. Affected: $affected_rows"]);

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
} else {
            $stmt->close();
            echo json_encode(['success' => false, 'message' => $mysqli->error]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'معرف الطلب غير صالح']);
    }
    break;

    case 'bulk_price_update':
        $category_id = intval($_POST['category_id']);
        $percentage = floatval($_POST['percentage'] ?? 0);
        $fixed_amount = floatval($_POST['fixed_amount'] ?? 0);
        $adjustment_type = $_POST['adjustment_type'];
        if ($category_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'يرجى اختيار قسم صحيح']);
            exit;
        }
        if ($percentage == 0 && $fixed_amount == 0) {
            echo json_encode(['success' => false, 'message' => 'يرجى إدخال نسبة أو مبلغ للتعديل']);
            exit;
        }
        $mysqli->begin_transaction();
        try {
            $stmt = $mysqli->prepare("SELECT id, price FROM products WHERE category_id = ?");
            $stmt->bind_param("i", $category_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $products = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            if (empty($products)) {
                throw new Exception("لا توجد منتجات في هذا القسم");
            }
            $update_stmt = $mysqli->prepare("UPDATE products SET price = ? WHERE id = ?");
            $updated_count = 0;
            foreach ($products as $product) {
                $current_price = floatval($product['price']);
                $new_price = $current_price;
                if ($percentage != 0) {
                    $adjustment = $current_price * ($percentage / 100);
                    if ($adjustment_type == 'increase') {
                        $new_price = $current_price + $adjustment;
                    } else {
                        $new_price = $current_price - $adjustment;
                    }
                }
                if ($fixed_amount != 0) {
                    if ($adjustment_type == 'increase') {
                        $new_price += $fixed_amount;
                    } else {
                        $new_price -= $fixed_amount;
                    }
                }
                $new_price = max(0.01, round($new_price, 2));
                $update_stmt->bind_param("di", $new_price, $product['id']);
                if ($update_stmt->execute()) {
                    $updated_count++;
                }
            }
            $update_stmt->close();
            $mysqli->commit();
            echo json_encode([
                'success' => true, 
                'message' => "تم تحديث أسعار {$updated_count} منتج بنجاح"
            ]);
        } catch (Exception $e) {
            $mysqli->rollback();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    // === Parent Sections Management (مع دعم رفع ملفات الأيقونات) ===
    case 'add_parent_section':
        $name = $_POST['name'];
        $slug = $_POST['slug'];
        $icon = $_POST['icon'] ?? 'fa-box'; // Font Awesome fallback
        $description = $_POST['description'] ?? null;
        $display_order = intval($_POST['display_order'] ?? 0);

        // Check slug uniqueness
        $check_stmt = $mysqli->prepare("SELECT id FROM parent_sections WHERE slug = ?");
        $check_stmt->bind_param("s", $slug);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        if ($check_result->num_rows > 0) {
            $check_stmt->close();
            echo json_encode(['success' => false, 'message' => 'الرمز (Slug) موجود بالفعل. يرجى اختيار رمز آخر.']);
            break;
        }
        $check_stmt->close();

        // Handle icon file upload
        $icon_file = null;
        if (isset($_FILES['icon_file']) && $_FILES['icon_file']['error'] === UPLOAD_ERR_OK) {
            $allowed_types = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $_FILES['icon_file']['tmp_name']);
            finfo_close($finfo);
            if (in_array($mime, $allowed_types)) {
                if (!is_dir('uploads')) mkdir('uploads', 0777, true);
                $filename = 'icon_' . uniqid() . '_' . basename($_FILES['icon_file']['name']);
                $target = 'uploads/' . $filename;
                if (move_uploaded_file($_FILES['icon_file']['tmp_name'], $target)) {
                    $icon_file = $target;
                }
            }
        }

        $stmt = $mysqli->prepare("INSERT INTO parent_sections (name, slug, icon, icon_file, description, display_order) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssi", $name, $slug, $icon, $icon_file, $description, $display_order);
        if ($stmt->execute()) {
            $stmt->close();
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $mysqli->error]);
        }
        break;

    case 'update_parent_section':
    $id = intval($_POST['id']);
    $name = $_POST['name'];
    $slug = $_POST['slug'];
    $icon = $_POST['icon'] ?? 'fa-box';
    $description = $_POST['description'] ?? null;
    $display_order = intval($_POST['display_order'] ?? 0);
    $is_active = isset($_POST['is_active']) && $_POST['is_active'] == '1' ? 1 : 0;

    // Check slug uniqueness (excluding self)
    $check_stmt = $mysqli->prepare("SELECT id FROM parent_sections WHERE slug = ? AND id != ?");
    $check_stmt->bind_param("si", $slug, $id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    if ($check_result->num_rows > 0) {
        $check_stmt->close();
        echo json_encode(['success' => false, 'message' => 'يوجد قسم رئيسي آخر بنفس الرمز']);
        break;
    }
    $check_stmt->close();

    // Get old slug and icon_file for categories update and file deletion
    $old_slug_stmt = $mysqli->prepare("SELECT slug, icon_file FROM parent_sections WHERE id = ?");
    $old_slug_stmt->bind_param("i", $id);
    $old_slug_stmt->execute();
    $old_slug_result = $old_slug_stmt->get_result();
    $old_data = $old_slug_result->fetch_assoc();
    $old_slug = $old_data['slug'];
    $old_icon_file = $old_data['icon_file'];
    $old_slug_stmt->close();

    // Handle new icon file upload
    $icon_file = $old_icon_file; // Keep old file by default
    
    if (isset($_FILES['icon_file']) && $_FILES['icon_file']['error'] === UPLOAD_ERR_OK) {
        $allowed_types = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $_FILES['icon_file']['tmp_name']);
        finfo_close($finfo);
        
        if (in_array($mime, $allowed_types)) {
            if (!is_dir('uploads')) mkdir('uploads', 0777, true);
            $filename = 'icon_' . uniqid() . '_' . basename($_FILES['icon_file']['name']);
            $target = 'uploads/' . $filename;
            
            if (move_uploaded_file($_FILES['icon_file']['tmp_name'], $target)) {
                $icon_file = $target;
                // Delete old icon file if exists and is different from new one
                if ($old_icon_file && file_exists($old_icon_file) && $old_icon_file !== $icon_file) {
                    unlink($old_icon_file);
                }
            }
        }
    }

    $mysqli->begin_transaction();
    try {
        // Always update with the icon_file variable
        $stmt = $mysqli->prepare("UPDATE parent_sections SET name = ?, slug = ?, icon = ?, icon_file = ?, description = ?, display_order = ?, is_active = ? WHERE id = ?");
        $stmt->bind_param("sssssiii", $name, $slug, $icon, $icon_file, $description, $display_order, $is_active, $id);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception("لم يتم تحديث أي سجل - قد يكون القسم غير موجود");
        }
        $stmt->close();

        // Update categories if slug changed
        if ($old_slug !== $slug) {
            $update_categories_stmt = $mysqli->prepare("UPDATE categories SET parent_section = ? WHERE parent_section = ?");
            $update_categories_stmt->bind_param("ss", $slug, $old_slug);
            $update_categories_stmt->execute();
            $update_categories_stmt->close();
        }

        $mysqli->commit();
        echo json_encode(['success' => true, 'message' => 'تم تحديث القسم الرئيسي بنجاح']);
    } catch (Exception $e) {
        $mysqli->rollback();
        // Delete the new uploaded file if transaction failed
        if (isset($target) && file_exists($target)) {
            unlink($target);
        }
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    break;

    case 'delete_parent_section':
        $id = intval($_POST['id']);
        $mysqli->begin_transaction();
        try {
            $check_stmt = $mysqli->prepare("SELECT slug, icon_file FROM parent_sections WHERE id = ?");
            $check_stmt->bind_param("i", $id);
            $check_stmt->execute();
            $result = $check_stmt->get_result();
            if ($result->num_rows === 0) {
                throw new Exception("القسم الرئيسي غير موجود");
            }
            $section_to_delete = $result->fetch_assoc();
            $slug_to_delete = $section_to_delete['slug'];
            $icon_file_to_delete = $section_to_delete['icon_file'];
            $check_stmt->close();

            $count_stmt = $mysqli->query("SELECT COUNT(*) as count FROM parent_sections WHERE id != $id");
            $count = $count_stmt->fetch_assoc()['count'];
            if ($count === 0) {
                throw new Exception("لا يمكن حذف القسم الرئيسي الوحيد المتبقي");
            }

            $default_section = $mysqli->query("SELECT slug FROM parent_sections WHERE id != $id ORDER BY display_order ASC, id ASC LIMIT 1")->fetch_assoc();
            if (!$default_section) {
                throw new Exception("لا يوجد قسم رئيسي بديل");
            }
            $default_slug = $default_section['slug'];

            $categories_count_stmt = $mysqli->prepare("SELECT COUNT(*) as count FROM categories WHERE parent_section = ?");
            $categories_count_stmt->bind_param("s", $slug_to_delete);
            $categories_count_stmt->execute();
            $categories_count = $categories_count_stmt->get_result()->fetch_assoc()['count'];
            $categories_count_stmt->close();

            if ($categories_count > 0) {
                $update_categories_stmt = $mysqli->prepare("UPDATE categories SET parent_section = ? WHERE parent_section = ?");
                $update_categories_stmt->bind_param("ss", $default_slug, $slug_to_delete);
                $update_categories_stmt->execute();
                $update_categories_stmt->close();
            }

            $delete_stmt = $mysqli->prepare("DELETE FROM parent_sections WHERE id = ?");
            $delete_stmt->bind_param("i", $id);
            $delete_stmt->execute();
            $delete_stmt->close();

            // Delete icon file if exists
            if ($icon_file_to_delete && file_exists($icon_file_to_delete)) {
                unlink($icon_file_to_delete);
            }

            $mysqli->commit();
            if ($categories_count > 0) {
                echo json_encode(['success' => true, 'message' => "تم حذف القسم الرئيسي ونقل {$categories_count} قسم فرعي إلى قسم آخر"]);
            } else {
                echo json_encode(['success' => true, 'message' => 'تم حذف القسم الرئيسي بنجاح']);
            }
        } catch (Exception $e) {
            $mysqli->rollback();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'get_parent_sections':
        $stmt = $mysqli->query("SELECT * FROM parent_sections ORDER BY display_order ASC, name ASC");
        $sections = [];
        while ($row = $stmt->fetch_assoc()) {
            $sections[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $sections]);
        break;

    // === Purchase Invoices ===
case 'create_purchase_invoice':
    $mysqli->begin_transaction();
    try {
        if (!isset($_POST['items']) || !isset($_POST['invoice_date'])) {
            throw new Exception('بيانات الفاتورة غير مكتملة');
        }

        $supplier_name = $_POST['supplier_name'] ?? null;
        $invoice_date = $_POST['invoice_date'];
        $notes = $_POST['notes'] ?? null;
        
        // ✅ استقبال العملة وسعر الصرف من النموذج
        $currency = $_POST['currency'] ?? 'USD'; // USD or SYP
        $exchange_rate = floatval($_POST['exchange_rate'] ?? 1);
        
        // حماية منطقية: سعر الصرف لا يمكن أن يكون 0
        if ($exchange_rate <= 0) $exchange_rate = 1;

        $items = json_decode($_POST['items'], true);
        if (!is_array($items) || empty($items)) {
            throw new Exception('يجب إضافة مواد إلى الفاتورة');
        }

        // حساب التكلفة الإجمالية (يتم حسابها بالعملة المختارة ثم تحويلها للتخزين إن لزم الأمر)
        // سنخزن في الجدول القيم كما أدخلها المستخدم، لكن سنحول تكلفة المنتج الفردي للدولار
        $total_cost_input = floatval($_POST['total_cost'] ?? 0);

        // 3. إدخال رأس الفاتورة
        $stmt = $mysqli->prepare(
            "INSERT INTO purchase_invoices (supplier_name, invoice_date, notes, total_cost, currency, exchange_rate) 
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        $stmt->bind_param("sssdsd", $supplier_name, $invoice_date, $notes, $total_cost_input, $currency, $exchange_rate);
        
        if (!$stmt->execute()) {
            throw new Exception('فشل حفظ الفاتورة: ' . $stmt->error);
        }

        $invoice_id = $mysqli->insert_id;
        $stmt->close();

        // 4. إدخال العناصر
        $item_stmt = $mysqli->prepare(
            "INSERT INTO purchase_invoice_items 
             (purchase_invoice_id, product_id, variant_id, quantity, gifts, cost_price) 
             VALUES (?, ?, ?, ?, ?, ?)"
        );

        $successful_items = 0;
        $errors = [];

        foreach ($items as $index => $item) {
            try {
                $product_id = intval($item['product_id']);
                $variant_id = !empty($item['variant_id']) ? intval($item['variant_id']) : null;
                $paid_qty = intval($item['quantity'] ?? 0);
                $gifts = intval($item['gifts'] ?? 0);
                $total_qty = $paid_qty + $gifts;
                
                // ✅ التحويل الجوهري:
                // إذا كانت العملة SYP، نحول سعر التكلفة إلى USD لتخزينه في المخزون
                $input_cost_price = floatval($item['cost_price'] ?? 0);
                $stored_cost_price_usd = ($currency == 'SYP') ? ($input_cost_price / $exchange_rate) : $input_cost_price;

                // التحقق
                if ($paid_qty <= 0 || $input_cost_price < 0) continue;

                // حفظ العنصر في الفاتورة (نخزن السعر كما هو مدخل - سواء ليرة أو دولار - للحفاظ على تاريخ الفاتورة)
                // ملاحظة: في جدول العناصر، يفضل توحيد العملة أو إضافة عمود عملة. 
                // للتبسيط هنا: سنقوم بتخزين التكلفة "بالدولار" دائماً في purchase_invoice_items لتوحيد حسابات الأرباح لاحقاً
                $item_stmt->bind_param("iiiidd", $invoice_id, $product_id, $variant_id, $paid_qty, $gifts, $stored_cost_price_usd);
                $item_stmt->execute();

                // 7. تحديث سعر التكلفة الأخير (دائماً بالدولار)
                if ($variant_id) {
                    $update_cost = $mysqli->prepare("UPDATE product_variants SET last_cost_price = ? WHERE id = ?");
                    $update_cost->bind_param("di", $stored_cost_price_usd, $variant_id);
                } else {
                    $update_cost = $mysqli->prepare("UPDATE products SET last_cost_price = ? WHERE id = ?");
                    $update_cost->bind_param("di", $stored_cost_price_usd, $product_id);
                }
                $update_cost->execute();
                $update_cost->close();

                // 8. تحديث المخزون
                if ($variant_id) {
                    $update_stock = $mysqli->prepare("UPDATE product_variants SET stock = stock + ? WHERE id = ?");
                    $update_stock->bind_param("ii", $total_qty, $variant_id);
                } else {
                    $update_stock = $mysqli->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
                    $update_stock->bind_param("ii", $total_qty, $product_id);
                }
                $update_stock->execute();
                $update_stock->close();

                $successful_items++;
            } catch (Exception $item_error) {
                $errors[] = "Error item " . ($index+1);
            }
        }
        $item_stmt->close();

        if ($successful_items === 0) throw new Exception('فشل إضافة أي عنصر');
        $mysqli->commit();
        echo json_encode(['success' => true, 'invoice_id' => $invoice_id]);

    } catch (Exception $e) {
        $mysqli->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    break;


case 'get_all_products_for_cache':
    $data = [];

    // 1. المنتجات الأساسية (التي ليس لها درجات)
    $stmt1 = $mysqli->prepare("
        SELECT p.*, (p.stock - p.reserved_stock) as available_stock
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE pv.id IS NULL
    ");
    $stmt1->execute();
    $result1 = $stmt1->get_result();
    while ($row = $result1->fetch_assoc()) {
        // جلب آخر سعر تكلفة
        $cost_stmt = $mysqli->prepare("SELECT cost_price FROM purchase_invoice_items WHERE product_id = ? AND variant_id IS NULL ORDER BY id DESC LIMIT 1");
        $cost_stmt->bind_param("i", $row['id']);
        $cost_stmt->execute();
        $cost_res = $cost_stmt->get_result();
        $last_cost = $cost_res->num_rows > 0 ? $cost_res->fetch_assoc()['cost_price'] : 0;
        $cost_stmt->close();
        $row['last_cost_price'] = $last_cost;
        $data[] = $row;
    }
    $stmt1->close();

    // 2. درجات المنتجات
    $stmt2 = $mysqli->prepare("
        SELECT 
            v.id as variant_id,
            v.name as variant_name,
            v.barcode,
            v.stock,
            v.reserved_stock,
            (v.stock - v.reserved_stock) as available_stock,
            v.price_override,
            v.image,
            p.id as id,
            p.name,
            p.description,
            p.price as base_price,
            p.image as product_image,
            p.category_id
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
    ");
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    while ($vr = $result2->fetch_assoc()) {
        $v_cost_stmt = $mysqli->prepare("SELECT cost_price FROM purchase_invoice_items WHERE product_id = ? AND variant_id = ? ORDER BY id DESC LIMIT 1");
        $v_cost_stmt->bind_param("ii", $vr['id'], $vr['variant_id']);
        $v_cost_stmt->execute();
        $v_cost_res = $v_cost_stmt->get_result();
        $v_last_cost = $v_cost_res->num_rows > 0 ? $v_cost_res->fetch_assoc()['cost_price'] : 0;
        $v_cost_stmt->close();

        $data[] = [
            'id' => intval($vr['id']),
            'name' => $vr['name'],
            'description' => $vr['description'],
            'price' => $vr['price_override'] !== null ? $vr['price_override'] : $vr['base_price'],
            'stock' => intval($vr['stock']),
            'reserved_stock' => intval($vr['reserved_stock']),
            'available_stock' => intval($vr['available_stock']),
            'image' => $vr['image'] ?: $vr['product_image'],
            'category_id' => intval($vr['category_id']),
            'barcode' => $vr['barcode'],
            'variant_id' => intval($vr['variant_id']),
            'variant_name' => $vr['variant_name'],
            'last_cost_price' => $v_last_cost
        ];
    }
    $stmt2->close();

    echo json_encode(['success' => true, 'data' => $data]);
    break;



case 'get_all_purchase_invoices':
        $from_date = $_GET['from_date'] ?? null;
        $to_date = $_GET['to_date'] ?? null;
        $supplier = $_GET['supplier'] ?? null;

        $sql = "
            SELECT 
                pi.*,
                COUNT(pii.id) as items_count,
                SUM(pii.quantity + pii.gifts) as total_quantity
            FROM purchase_invoices pi
            LEFT JOIN purchase_invoice_items pii ON pi.id = pii.purchase_invoice_id
            WHERE 1=1
        ";
        $params = [];
        $types = "";

        if ($from_date) {
            $sql .= " AND pi.invoice_date >= ?";
            $params[] = $from_date;
            $types .= "s";
        }
        if ($to_date) {
            $sql .= " AND pi.invoice_date <= ?";
            $params[] = $to_date;
            $types .= "s";
        }
        if ($supplier) {
            $sql .= " AND pi.supplier_name LIKE ?";
            $params[] = "%{$supplier}%";
            $types .= "s";
        }

        $sql .= " GROUP BY pi.id ORDER BY pi.id DESC";

        $stmt = $mysqli->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $invoices = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        echo json_encode(['success' => true, 'data' => $invoices]);
        break;



    case 'get_recent_invoices':
        $stmt = $mysqli->prepare("
            SELECT 
                pi.id,
                pi.supplier_name,
                DATE(pi.invoice_date) as invoice_date,
                COUNT(pii.id) as items_count,
                SUM(pii.quantity) as total_quantity
            FROM purchase_invoices pi
            LEFT JOIN purchase_invoice_items pii ON pi.id = pii.purchase_invoice_id
            GROUP BY pi.id
            ORDER BY pi.id DESC
            LIMIT 5
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $invoices = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode(['success' => true, 'data' => $invoices]);
        break;

    case 'get_purchase_invoice_details':
        $invoice_id = intval($_GET['invoice_id'] ?? 0);
        if ($invoice_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'معرّف الفاتورة غير صالح']);
            break;
        }
        // Get invoice header
        $invoice_stmt = $mysqli->prepare("SELECT * FROM purchase_invoices WHERE id = ?");
        $invoice_stmt->bind_param("i", $invoice_id);
        $invoice_stmt->execute();
        $invoice_result = $invoice_stmt->get_result();
        $invoice = $invoice_result->fetch_assoc();
        $invoice_stmt->close();
        if (!$invoice) {
            echo json_encode(['success' => false, 'message' => 'الفاتورة غير موجودة']);
            break;
        }
        // Get invoice items with product details (including gifts)
        $items_stmt = $mysqli->prepare("
            SELECT 
                pii.*,
                p.name as product_name,
                pv.name as variant_name
            FROM purchase_invoice_items pii
            JOIN products p ON pii.product_id = p.id
            LEFT JOIN product_variants pv ON pii.variant_id = pv.id
            WHERE pii.purchase_invoice_id = ?
        ");
        $items_stmt->bind_param("i", $invoice_id);
        $items_stmt->execute();
        $items_result = $items_stmt->get_result();
        $items = $items_result->fetch_all(MYSQLI_ASSOC);
        $items_stmt->close();

        $invoice['items'] = $items;
        // إعادة حساب التكلفة بدون الهدايا
        $invoice['total_cost'] = array_sum(array_map(function($item) {
            $paid_qty = intval($item['quantity']);
            $cost = floatval($item['cost_price']);
            return $paid_qty * $cost;
        }, $items));

        echo json_encode(['success' => true, 'data' => $invoice]);
        break;

        case 'get_active_lucky_product':
    $stmt = $mysqli->prepare("
        SELECT lp.*, p.name as product_name, p.image, p.price 
        FROM lucky_product lp 
        JOIN products p ON lp.product_id = p.id 
        WHERE lp.active_from <= NOW() AND lp.active_to >= NOW() AND lp.product_id IS NOT NULL
        ORDER BY lp.id DESC LIMIT 1
    ");
    $stmt->execute();
    $result = $stmt->get_result();
    $lucky = $result->fetch_assoc();
    $stmt->close();
    echo json_encode(['success' => true, 'data' => $lucky ?: null]);
    break;

case 'set_lucky_product':
    $selection_method = $_POST['selection_method'] ?? 'manual';
    $discount_percent = floatval($_POST['discount_percent'] ?? 0);
    $active_from = $_POST['active_from'] ?? date('Y-m-d');
    $active_to = $_POST['active_to'] ?? date('Y-m-d', strtotime('+30 days'));
    $note = $_POST['note'] ?? null;
    $created_by = 'admin';

    if ($selection_method === 'manual') {
        $product_id = intval($_POST['product_id'] ?? 0);
        if ($product_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'يرجى اختيار منتج']);
            break;
        }
    } else {
        // اختيار آلي: أقل 3 منتجات مبيعاً خلال 30 يوم
        $thirty_days_ago = date('Y-m-d H:i:s', strtotime('-30 days'));
        $sql = "
            SELECT product_id, SUM(quantity) as total_sold
            FROM (
                SELECT product_id, SUM(quantity) as quantity
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                WHERE s.sale_date >= ?
                GROUP BY product_id
                UNION ALL
                SELECT product_id, SUM(quantity) as quantity
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE o.created_at >= ?
                GROUP BY product_id
            ) combined
            GROUP BY product_id
            ORDER BY total_sold ASC
            LIMIT 3
        ";
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ss", $thirty_days_ago, $thirty_days_ago);
        $stmt->execute();
        $result = $stmt->get_result();
        $candidates = [];
        while ($row = $result->fetch_assoc()) {
            $candidates[] = $row['product_id'];
        }
        $stmt->close();
        if (empty($candidates)) {
            $stmt2 = $mysqli->query("SELECT id FROM products ORDER BY RAND() LIMIT 1");
            $row2 = $stmt2->fetch_assoc();
            $product_id = $row2 ? intval($row2['id']) : 1;
        } else {
            $product_id = intval($candidates[array_rand($candidates)]);
        }
    }

    // ✅ هنا التعديل الجوهري: حذف أو تعطيل السجل النشط الحالي
    $mysqli->query("DELETE FROM lucky_product WHERE active_from <= NOW() AND active_to >= NOW()");

    // ثم إدخال السجل الجديد
    $stmt = $mysqli->prepare("
        INSERT INTO lucky_product 
        (product_id, discount_percent, selection_method, active_from, active_to, created_by, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iddssss", $product_id, $discount_percent, $selection_method, $active_from, $active_to, $created_by, $note);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $mysqli->error]);
    }
    $stmt->close();
    break;

    
case 'disable_lucky_product':
    $id = intval($_POST['id'] ?? 0);
    if ($id > 0) {
        $stmt = $mysqli->prepare("DELETE FROM lucky_product WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $mysqli->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'معرف غير صالح']);
    }
    break;


// ... الكود لـ case 'disable_lucky_product':

    // 🚀 أضف هذا الكود الجديد
   case 'get_customers_report':
        // 1. جلب التواريخ (إن وجدت)
        $from_date = $_GET['from_date'] ?? null;
        $to_date = $_GET['to_date'] ?? null;

        // 2. بناء الاستعلام الأساسي
        $query = "
            SELECT
                c.customer_id,
                c.name,
                c.phone,
                c.location,
                COUNT(o.id) AS total_completed_orders,
                SUM(o.total_amount) AS total_spent,
                MAX(o.created_at) AS last_purchase_date
            FROM
                customers c
            JOIN
                orders o ON c.customer_id = o.customer_id
        ";

        // 3. إضافة الشروط الديناميكية
        $params = [];
        $types = "";
        $where_clauses = ["o.status = 'Completed'"]; // نبدأ دائماً بالطلبات المكتملة

        if (!empty($from_date)) {
            $where_clauses[] = "o.created_at >= ?";
            $params[] = $from_date . ' 00:00:00'; // من بداية اليوم
            $types .= "s";
        }
        if (!empty($to_date)) {
            $where_clauses[] = "o.created_at <= ?";
            $params[] = $to_date . ' 23:59:59'; // إلى نهاية اليوم
            $types .= "s";
        }

        // دمج الشروط
        $query .= " WHERE " . implode(" AND ", $where_clauses);

        // 4. إضافة التجميع والترتيب
        $query .= "
            GROUP BY
                c.customer_id, c.name, c.phone, c.location
            ORDER BY
                total_spent DESC;
        ";

        // 5. التنفيذ
        $stmt = $mysqli->prepare($query);
        if (!$stmt) {
             echo json_encode(['success' => false, 'message' => 'Query preparation failed: ' . $mysqli->error]);
             break;
        }

        if (!empty($params)) { // ربط المتغيرات (إن وجدت)
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $customers = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        echo json_encode(['success' => true, 'data' => $customers]);
        break;


        // ... الكود السابق ...
    
    // 🚀 === إدارة نظام المكافآت ===
    case 'get_reward_rules':
        $stmt = $mysqli->prepare("SELECT * FROM reward_rules WHERE is_active = 1 ORDER BY priority DESC");
        $stmt->execute();
        $rules = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode(['success' => true, 'data' => $rules]);
        break;

    case 'save_reward_rule':
        $rule_id = $_POST['rule_id'] ?? null;
        $name = $_POST['name'];
        $priority = intval($_POST['priority']);
        $period_days = intval($_POST['period_days']);
        $spend_threshold = floatval($_POST['spend_threshold']);
        $reward_type = $_POST['reward_type'];
        $reward_value = ($reward_type == 'coupon') ? floatval($_POST['reward_value']) : 0;
        $reward_note = $_POST['reward_note'];

        if (empty($name) || $priority <= 0 || $period_days <= 0 || $spend_threshold <= 0 || empty($reward_note)) {
            echo json_encode(['success' => false, 'message' => 'يرجى ملء جميع الحقول المطلوبة.']);
            break;
        }

        if ($rule_id) {
            // تحديث
            $stmt = $mysqli->prepare("UPDATE reward_rules SET name=?, priority=?, period_days=?, spend_threshold=?, reward_type=?, reward_value=?, reward_note=? WHERE rule_id=?");
            $stmt->bind_param("siidsssi", $name, $priority, $period_days, $spend_threshold, $reward_type, $reward_value, $reward_note, $rule_id);
        } else {
            // إضافة
            $stmt = $mysqli->prepare("INSERT INTO reward_rules (name, priority, period_days, spend_threshold, reward_type, reward_value, reward_note) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("siidsss", $name, $priority, $period_days, $spend_threshold, $reward_type, $reward_value, $reward_note);
        }
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'خطأ في الحفظ: ' . $stmt->error]);
        }
        $stmt->close();
        break;

    case 'delete_reward_rule':
        $rule_id = intval($_POST['rule_id'] ?? 0);
        if ($rule_id <= 0) {
            echo json_encode(['success' => false, 'message' => 'معرف القاعدة غير صالح']);
            break;
        }
        $stmt = $mysqli->prepare("DELETE FROM reward_rules WHERE rule_id = ?");
        $stmt->bind_param("i", $rule_id);
        $stmt->execute();
        $stmt->close();
        echo json_encode(['success' => true]);
        break;

    case 'get_gift_pool':
        $stmt = $mysqli->prepare("
            SELECT gp.gift_id, gp.product_id, gp.variant_id, p.name as product_name, pv.name as variant_name, 
                   COALESCE(pv.image, p.image) as image
            FROM reward_gift_pool gp
            JOIN products p ON gp.product_id = p.id
            LEFT JOIN product_variants pv ON gp.variant_id = pv.id
            WHERE gp.is_active = 1
        ");
        $stmt->execute();
        $gifts = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        echo json_encode(['success' => true, 'data' => $gifts]);
        break;

    case 'add_to_gift_pool':
        $product_id = intval($_POST['product_id']);
        $variant_id = !empty($_POST['variant_id']) ? intval($_POST['variant_id']) : null;
        
        // التحقق من عدم التكرار
        $check_stmt = $mysqli->prepare("SELECT gift_id FROM reward_gift_pool WHERE product_id = ? AND (variant_id = ? OR (? IS NULL AND variant_id IS NULL))");
        $check_stmt->bind_param("iii", $product_id, $variant_id, $variant_id);
        $check_stmt->execute();
        if ($check_stmt->get_result()->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'هذا المنتج موجود مسبقاً في سلة الهدايا']);
            $check_stmt->close();
            break;
        }
        $check_stmt->close();

        $stmt = $mysqli->prepare("INSERT INTO reward_gift_pool (product_id, variant_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $product_id, $variant_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'remove_from_gift_pool':
        $gift_id = intval($_POST['gift_id'] ?? 0);
        $stmt = $mysqli->prepare("DELETE FROM reward_gift_pool WHERE gift_id = ?");
        $stmt->bind_param("i", $gift_id);
        $stmt->execute();
        $stmt->close();
        echo json_encode(['success' => true]);
        break;



    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
        break;
}
} catch (Exception $e) {
    error_log("API Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'حدث خطأ داخلي.']);
}
$mysqli->close();
?>