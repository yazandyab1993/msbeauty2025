<?php
// db.php
// جلب الإعدادات من الملف المنفصل
$config = require __DIR__ . '/env.php';

define('DB_HOST', $config['DB_HOST']);
define('DB_USERNAME', $config['DB_USERNAME']);
define('DB_PASSWORD', $config['DB_PASSWORD']);
define('DB_NAME', $config['DB_NAME']);

// Create a new mysqli object
$mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check for connection errors
if ($mysqli->connect_errno) {
    // في بيئة الإنتاج، لا تظهر تفاصيل الخطأ للمستخدم
    error_log("Failed to connect to MySQL: " . $mysqli->connect_error);
    die("حدث خطأ في الاتصال بقاعدة البيانات.");
}

// Set the character set
if (!$mysqli->set_charset("utf8mb4")) {
    error_log("Error loading character set utf8mb4: " . $mysqli->error);
    exit();
}

// ضبط التوقيت
$mysqli->query("SET time_zone = '+03:00'");
?>