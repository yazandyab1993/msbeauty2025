<?php
require_once __DIR__ . '/includes/db.php';

// Check if currency column exists in orders table
$result = $mysqli->query("SHOW COLUMNS FROM orders LIKE 'currency'");
if ($result->num_rows == 0) {
    echo "Currency column does not exist in orders table. Adding it...\n";
    $mysqli->query("ALTER TABLE orders ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' AFTER exchange_rate");
    if ($mysqli->error) {
        echo "Error adding currency column: " . $mysqli->error . "\n";
    } else {
        echo "Currency column added successfully.\n";
    }
} else {
    echo "Currency column already exists in orders table.\n";
}

// Check the current structure
$result = $mysqli->query("DESCRIBE orders");
echo "\nCurrent orders table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Null'] . " - " . $row['Key'] . " - " . $row['Default'] . " - " . $row['Extra'] . "\n";
}
?>