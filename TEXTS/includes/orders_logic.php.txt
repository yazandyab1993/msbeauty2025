<?php
date_default_timezone_set('Asia/Damascus');
require_once __DIR__ . '/db.php';

// =========================================================
// 1. منطق معالجة الطلبات (إكمال - حذف - تعديل)
// =========================================================

// أ) معالجة طلب الحذف (فك حجز المخزون)
if (isset($_GET['action']) && $_GET['action'] == 'delete' && isset($_GET['id'])) {
    $order_id = intval($_GET['id']);
    $mysqli->begin_transaction();
    try {
        // 1. التحقق من حالة الطلب
        $status_stmt = $mysqli->prepare("SELECT status FROM orders WHERE id = ?");
        $status_stmt->bind_param("i", $order_id);
        $status_stmt->execute();
        $status_res = $status_stmt->get_result();
        $order_status = $status_res->fetch_assoc()['status'] ?? '';
        $status_stmt->close();

        // 2. إذا كان الطلب "قيد الانتظار"، يجب تحرير المخزون المحجوز (Reserved Stock)
        // ملاحظة: إذا كان مكتمل، لا نعدل المخزون لأن الكمية خُصمت بالفعل من الـ Stock الكلي
        if ($order_status == 'Pending') {
            $items_stmt = $mysqli->prepare("SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?");
            $items_stmt->bind_param("i", $order_id);
            $items_stmt->execute();
            $items_result = $items_stmt->get_result();

            while ($item = $items_result->fetch_assoc()) {
                if (!empty($item['variant_id'])) {
                    // تقليل المحجوز للدرجة
                    $update_variant = $mysqli->prepare("UPDATE product_variants SET reserved_stock = GREATEST(0, reserved_stock - ?) WHERE id = ?");
                    $update_variant->bind_param("ii", $item['quantity'], $item['variant_id']);
                    $update_variant->execute();
                    $update_variant->close();
                } else {
                    // تقليل المحجوز للمنتج الأساسي
                    $update_prod = $mysqli->prepare("UPDATE products SET reserved_stock = GREATEST(0, reserved_stock - ?) WHERE id = ?");
                    $update_prod->bind_param("ii", $item['quantity'], $item['product_id']);
                    $update_prod->execute();
                    $update_prod->close();
                }
            }
            $items_stmt->close();
        }

        // 3. حذف العناصر والطلب
        // (Foreign Key Cascade سيحذف العناصر، لكن للأمان نحذف الطلب مباشرة)
        $del_stmt = $mysqli->prepare("DELETE FROM orders WHERE id = ?");
        $del_stmt->bind_param("i", $order_id);
        $del_stmt->execute();
        $del_stmt->close();

        $mysqli->commit();
        header("Location: " . strtok($_SERVER["REQUEST_URI"], '?') . "?msg=deleted");
        exit();

    } catch (Exception $e) {
        $mysqli->rollback();
        $error_message = "خطأ في الحذف: " . $e->getMessage();
    }
}

// ب) معالجة طلب الإكمال (نقل من المحجوز إلى المباع)
if (isset($_GET['action']) && $_GET['action'] == 'complete' && isset($_GET['id'])) {
    $order_id = intval($_GET['id']);
    $mysqli->begin_transaction();
    try {
        // جلب العناصر
        $items_stmt = $mysqli->prepare("SELECT product_id, variant_id, quantity FROM order_items WHERE order_id = ?");
        $items_stmt->bind_param("i", $order_id);
        $items_stmt->execute();
        $items_result = $items_stmt->get_result();
        
        while ($item = $items_result->fetch_assoc()) {
            if (!empty($item['variant_id'])) {
                // خصم من المخزون الكلي وخصم من المحجوز
                $update_variant_stmt = $mysqli->prepare("UPDATE product_variants SET stock = stock - ?, reserved_stock = GREATEST(0, reserved_stock - ?) WHERE id = ?");
                $update_variant_stmt->bind_param("iii", $item['quantity'], $item['quantity'], $item['variant_id']);
                $update_variant_stmt->execute();
                $update_variant_stmt->close();
            } else {
                $update_stock_stmt = $mysqli->prepare("UPDATE products SET stock = stock - ?, reserved_stock = GREATEST(0, reserved_stock - ?) WHERE id = ?");
                $update_stock_stmt->bind_param("iii", $item['quantity'], $item['quantity'], $item['product_id']);
                $update_stock_stmt->execute();
                $update_stock_stmt->close();
            }
        }
        $items_stmt->close();

        $update_order_stmt = $mysqli->prepare("UPDATE orders SET status = 'Completed' WHERE id = ?");
        $update_order_stmt->bind_param("i", $order_id);
        $update_order_stmt->execute();
        $update_order_stmt->close();
        
        $mysqli->commit();
        header("Location: " . strtok($_SERVER["REQUEST_URI"], '?') . "?msg=completed");
        exit();
    } catch (Exception $exception) {
        $mysqli->rollback();
        $error_message = "خطأ في المعالجة: " . $exception->getMessage();
    }
}

// ج) معالجة نموذج تعديل بيانات العميل
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_order_info'])) {
    $order_id = intval($_POST['order_id']);
    $name = $_POST['customer_name'];
    $phone = $_POST['customer_phone'];
    $location = $_POST['customer_location'];
    
    $stmt = $mysqli->prepare("UPDATE orders SET customer_name=?, customer_phone=?, customer_location=? WHERE id=?");
    $stmt->bind_param("sssi", $name, $phone, $location, $order_id);
    
    if ($stmt->execute()) {
        header("Location: " . strtok($_SERVER["REQUEST_URI"], '?') . "?msg=updated");
        exit();
    } else {
        $error_message = "فشل التحديث: " . $mysqli->error;
    }
}

// =========================================================
// 2. جلب البيانات للعرض
// =========================================================

// Fetch all orders
$orders_result = $mysqli->query("
    SELECT 
        id, 
        customer_name, 
        customer_phone, 
        customer_location, 
        total_amount, 
        discount_percentage, 
        delivery_fee, 
        contains_lucky_product, 
        lucky_product_id, 
        lucky_discount_percent, 
        lucky_discount_amount,
        coupon_code,
        coupon_discount_amount,
        reward_discount_amount, 
        reward_message, 
        status, 
        is_new, 
        created_at,
        exchange_rate 
    FROM orders 
    ORDER BY created_at DESC
");

$orders = [];
while ($order = $orders_result->fetch_assoc()) {
    // جلب العناصر لكل طلب
    $order_items_result = $mysqli->query("
        SELECT oi.*, p.name as product_name, v.name as variant_name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        LEFT JOIN product_variants v ON oi.variant_id = v.id 
        WHERE oi.order_id = {$order['id']}
    ");
    $order['items'] = [];
    while ($item = $order_items_result->fetch_assoc()) {
        $order['items'][] = $item;
    }
    $orders[] = $order;
}

// Statistics
$total_orders = count($orders);
$pending_orders = count(array_filter($orders, fn($o) => $o['status'] == 'Pending'));
$completed_orders = count(array_filter($orders, fn($o) => $o['status'] == 'Completed'));
$total_revenue = array_sum(array_column(array_filter($orders, fn($o) => $o['status'] == 'Completed'), 'total_amount'));
?>