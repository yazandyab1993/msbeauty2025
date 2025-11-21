<?php
require_once __DIR__ . '/db.php';

// 1. إنشاء جدول المسؤولين
$sql = "CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($mysqli->query($sql) === TRUE) {
    echo "تم إنشاء جدول admins بنجاح.<br>";
} else {
    die("خطأ في إنشاء الجدول: " . $mysqli->error);
}

// 2. إنشاء المستخدم المسؤول (كلمة المرور: admin123)
$username = 'admin';
$password_raw = 'admin123'; // يمكنك تغييرها هنا لإنشاء حسابك الأول
// التشفير باستخدام خوارزمية قوية (BCRYPT)
$password_hash = password_hash($password_raw, PASSWORD_DEFAULT);

// التحقق مما إذا كان المستخدم موجوداً
$check = $mysqli->query("SELECT id FROM admins WHERE username = '$username'");
if ($check->num_rows == 0) {
    $stmt = $mysqli->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $password_hash);
    if ($stmt->execute()) {
        echo "تم إنشاء حساب المدير بنجاح!<br>";
        echo "اسم المستخدم: <b>$username</b><br>";
        echo "كلمة المرور: <b>$password_raw</b><br>";
        echo "تم تخزين التشفير: $password_hash<br>";
    } else {
        echo "خطأ: " . $stmt->error;
    }
} else {
    echo "المستخدم $username موجود مسبقاً.";
}

echo "<br><br><b>⚠️ هام: يرجى حذف هذا الملف (setup_security.php) بعد الانتهاء.</b>";
?>