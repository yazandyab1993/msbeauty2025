<?php
date_default_timezone_set('Asia/Damascus');
// تأكد من أن مسار ملف db_config.php صحيح
require_once __DIR__ . '/db.php';

// --- Date Filtering Logic ---
$where_clauses_sales = [];
$where_clauses_returns = [];
$start_date = $_GET['start_date'] ?? '';
$end_date = $_GET['end_date'] ?? '';
$filter_type = $_GET['filter'] ?? '';

if ($filter_type == 'day') {
    $start_date = date('Y-m-d');
    $end_date = date('Y-m-d');
} elseif ($filter_type == 'week') {
    $start_date = date('Y-m-d', strtotime('monday this week'));
    $end_date = date('Y-m-d', strtotime('sunday this week'));
} elseif ($filter_type == 'month') {
    $start_date = date('Y-m-01');
    $end_date = date('Y-m-t');
}

if ($start_date && $end_date) {
    $where_clauses_sales[] = "s.sale_date BETWEEN '" . $mysqli->real_escape_string($start_date) . " 00:00:00' AND '" . $mysqli->real_escape_string($end_date) . " 23:59:59'";
    $where_clauses_returns[] = "r.return_date BETWEEN '" . $mysqli->real_escape_string($start_date) . " 00:00:00' AND '" . $mysqli->real_escape_string($end_date) . " 23:59:59'";
}

$where_sql_sales = count($where_clauses_sales) > 0 ? "WHERE " . implode(' AND ', $where_clauses_sales) : "";
$where_sql_returns = count($where_clauses_returns) > 0 ? "WHERE " . implode(' AND ', $where_clauses_returns) : "";

// --- Fetch and Merge Transactions ---
$transactions = [];
$total_sales_amount = 0;
$total_returns_amount = 0;
$page_error = null;

// Prepare statements for fetching items (using prepared statements for security and efficiency)
$sale_items_stmt = $mysqli->prepare("SELECT si.*, p.name as product_name, v.name as variant_name FROM sale_items si JOIN products p ON si.product_id = p.id LEFT JOIN product_variants v ON si.variant_id = v.id WHERE si.sale_id = ?");

// 🌟 الإصلاح: تم تعديل v ON si.variant_id إلى v ON ri.variant_id في استعلام المرتجعات
$return_items_stmt = $mysqli->prepare("SELECT ri.*, p.name as product_name, v.name as variant_name FROM return_items ri JOIN products p ON ri.product_id = p.id LEFT JOIN product_variants v ON ri.variant_id = v.id WHERE ri.return_id = ?");

if ($sale_items_stmt === false || $return_items_stmt === false) {
    $page_error = "فشل في إعداد الاستعلامات. يرجى التأكد من أن جميع جداول قاعدة البيانات (sale_items, return_items) موجودة وصحيحة.";
    error_log("Prepare statement failed: " . $mysqli->error);
} else {
    // Fetch Sales
    $sales_result = $mysqli->query("SELECT s.* FROM sales s {$where_sql_sales}");
    if ($sales_result) {
        while($sale = $sales_result->fetch_assoc()) {
            $total_sales_amount += $sale['total_amount'];
            
            $sale_items_stmt->bind_param("i", $sale['id']);
            $sale_items_stmt->execute();
            $items_result = $sale_items_stmt->get_result();
            $sale['items'] = $items_result->fetch_all(MYSQLI_ASSOC);

            $sale['type'] = 'sale';
            $sale['date'] = $sale['sale_date'];
            $transactions[] = $sale;
        }
    } else {
        error_log("Failed to fetch sales: " . $mysqli->error);
        $page_error = "حدث خطأ أثناء جلب بيانات المبيعات: " . $mysqli->error;
    }

    // Fetch Returns
    $returns_result = $mysqli->query("SELECT r.* FROM returns r {$where_sql_returns}");
    if($returns_result) {
        while($return = $returns_result->fetch_assoc()) {
            $return_items_stmt->bind_param("i", $return['id']);
            $return_items_stmt->execute();
            $items_result = $return_items_stmt->get_result();
            $return['items'] = $items_result->fetch_all(MYSQLI_ASSOC);

            $return_total = 0;
            // يجب حساب الإجمالي للمرتجع بناءً على الكمية والسعر عند الإرجاع
            foreach($return['items'] as $item) {
                $return_total += $item['price_at_return'] * $item['quantity'];
            }
            $total_returns_amount += $return_total;
            $return['total_amount'] = $return_total;
            $return['type'] = 'return';
            $return['date'] = $return['return_date'];
            $transactions[] = $return;
        }
    } else {
         error_log("Failed to fetch returns: " . $mysqli->error);
         $page_error = "حدث خطأ أثناء جلب بيانات المرتجعات: " . $mysqli->error;
    }

    // Sort transactions by date descending
    if (!empty($transactions)) {
        usort($transactions, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
    }
}

$net_total = $total_sales_amount - $total_returns_amount;

// Close prepared statements if they were created
if (isset($sale_items_stmt)) $sale_items_stmt->close();
if (isset($return_items_stmt)) $return_items_stmt->close();
$mysqli->close();
?>