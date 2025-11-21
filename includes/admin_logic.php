<?php
session_start();

// ✅ 1. تضمين الاتصال بقاعدة البيانات أولاً (ضروري للتحقق من المستخدم)
require_once __DIR__ . '/db.php';

date_default_timezone_set('Asia/Damascus');

// ✅ 2. منطق تسجيل الدخول الآمن
if (isset($_POST['password']) && isset($_POST['username'])) {
    $username = $_POST['username']; // استقبال اسم المستخدم
    $password = $_POST['password'];

    // جلب المستخدم من قاعدة البيانات
    $stmt = $mysqli->prepare("SELECT id, password FROM admins WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // التحقق من تطابق كلمة المرور مع التشفير
        if (password_verify($password, $row['password'])) {
            $_SESSION['loggedin'] = true;
            $_SESSION['admin_id'] = $row['id'];
            $_SESSION['admin_username'] = $username;
            // إعادة توجيه لتجنب إعادة إرسال النموذج
            header("Location: " . $_SERVER['PHP_SELF']);
            exit;
        } else {
            $error = 'كلمة المرور غير صحيحة!';
        }
    } else {
        $error = 'اسم المستخدم غير موجود!';
    }
    $stmt->close();
}

// ✅ 3. واجهة تسجيل الدخول (إذا لم يكن مسجلاً)
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    ?>
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تسجيل الدخول الآمن</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Tajawal', sans-serif; }
            .login-gradient { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); }
        </style>
        <link rel="icon" type="image/png" href="/msbeauty/icons/admin.png">
    </head>
    <body class="login-gradient flex items-center justify-center min-h-screen">
        <div class="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-sm bg-opacity-95">
            <div class="text-center mb-8">
                <div class="inline-block p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
                    <i class="fas fa-shield-alt text-white text-2xl"></i> <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
                <p class="text-gray-500 mt-2">تسجيل الدخول الآمن</p>
            </div>
            
            <?php if (isset($error)) { echo "<div class='bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-center'>$error</div>"; } ?>
            
            <form method="POST">
                <div class="mb-4">
                    <label for="username" class="block mb-2 text-gray-700 font-semibold">اسم المستخدم</label>
                    <input type="text" name="username" id="username" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="admin" required>
                </div>
                
                <div class="mb-6">
                    <label for="password" class="block mb-2 text-gray-700 font-semibold">كلمة المرور</label>
                    <input type="password" name="password" id="password" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="أدخل كلمة المرور" required>
                </div>
                
                <button type="submit" class="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition shadow-lg transform hover:scale-105">
                    دخول آمن
                </button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit; // توقف هنا إذا لم يتم تسجيل الدخول
}

// =========================================================
// ✅ بقية كود لوحة التحكم (Dashboard Logic)
// =========================================================

// Fetch categories for dropdowns
$parent_sections_result = $mysqli->query("SELECT * FROM parent_sections ORDER BY display_order ASC, name ASC");
$parent_sections = [];
while ($row = $parent_sections_result->fetch_assoc()) {
    $parent_sections[] = $row;
}

$categories_result = $mysqli->query("SELECT * FROM categories ORDER BY parent_section, name");
$categories = [];
while ($row = $categories_result->fetch_assoc()) {
    $categories[] = $row;
}

// Fetch products
$products_result = $mysqli->query("
    SELECT 
        p.*, 
        c.name as category_name, 
        c.parent_section,
        IF((SELECT COUNT(pv.id) FROM product_variants pv WHERE pv.product_id = p.id) > 0, 
           (SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id), 
           p.stock) as display_stock
    FROM 
        products p 
    JOIN 
        categories c ON p.category_id = c.id 
    ORDER BY 
        p.id DESC
");

// Fetch settings
$settings_result = $mysqli->query("SELECT * FROM settings")->fetch_all(MYSQLI_ASSOC);
$current_settings = [];
foreach ($settings_result as $row) {
    $current_settings[$row['setting_key']] = $row['setting_value'];
}
$usd_exchange_rate = isset($current_settings['usd_exchange_rate']) ? floatval($current_settings['usd_exchange_rate']) : 15000;
$low_stock_threshold = isset($current_settings['low_stock_threshold']) ? intval($current_settings['low_stock_threshold']) : 10;

// Statistics
$total_products = $mysqli->query("SELECT COUNT(*) as count FROM products")->fetch_assoc()['count'];
$total_categories = $mysqli->query("SELECT COUNT(*) as count FROM categories")->fetch_assoc()['count'];
$coupons_count = $mysqli->query("SELECT COUNT(*) as count FROM coupons")->fetch_assoc()['count'];
$customers_result = $mysqli->query("SELECT COUNT(customer_id) as count FROM customers");
$total_customers = $customers_result->fetch_assoc()['count'];

$negative_stock_count = $mysqli->query("
    SELECT COUNT(*) as count FROM (
        SELECT p.id FROM products p WHERE p.stock < 0
        UNION ALL
        SELECT pv.id FROM product_variants pv WHERE pv.stock < 0
    ) AS negative_items
")->fetch_assoc()['count'];

// Fetch low stock
$low_stock_products_result = $mysqli->query("
    SELECT 'product' as type, p.id, p.name as product_name, NULL as variant_name, p.barcode, p.stock, p.price, p.description, p.category_id, c.name as category_name, c.parent_section, p.image
    FROM products p JOIN categories c ON p.category_id = c.id
    WHERE p.stock < $low_stock_threshold AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id)
    UNION ALL
    SELECT 'variant' as type, p.id as product_id, p.name as product_name, pv.name as variant_name, pv.barcode, pv.stock, COALESCE(pv.price_override, p.price) as price, p.description, p.category_id, c.name as category_name, c.parent_section, COALESCE(pv.image, p.image) as image
    FROM product_variants pv JOIN products p ON pv.product_id = p.id JOIN categories c ON p.category_id = c.id
    WHERE pv.stock < $low_stock_threshold
    ORDER BY stock ASC
");
$low_stock_products = [];
while ($row = $low_stock_products_result->fetch_assoc()) {
    $low_stock_products[] = $row;
}

$low_stock_result = $mysqli->query("
    SELECT COUNT(*) as count FROM (
        SELECT p.id FROM products p WHERE p.stock < $low_stock_threshold AND NOT EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id)
        UNION ALL
        SELECT pv.id FROM product_variants pv WHERE pv.stock < $low_stock_threshold
    ) AS low_stock_items
");
$low_stock = $low_stock_result->fetch_assoc()['count'];

$reserved_count_result = $mysqli->query("SELECT COUNT(*) as count FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.status = 'Pending'");
$reserved_products_count = $reserved_count_result->fetch_assoc()['count'];

?>