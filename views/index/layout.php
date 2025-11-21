<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MS-Beauty</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&family=Marhey:wght@400;700&display=swap" rel="stylesheet">
    <!-- بدلاً من cdnjs.cloudflare.com -->
    <link rel="stylesheet" href="/msbeauty/assets/css/fontawesome/all.min.css">
    <!-- Leaflet Map Library -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <link rel="stylesheet" href="/msbeauty/public/css/style.css">
    <link rel="icon" type="image/png" href="/msbeauty/icons/msbeauty.png">
</head>
<body class="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

<script id="initial-data" type="application/json">
<?= json_encode([
    'products' => $products,
    'settings' => $settings ?? [],
    'usd_exchange_rate' => $usd_exchange_rate ?? 15000,
    'discount_type' => $discount_type ?? 'global',
    'discount_value' => $discount_value ?? 0,
    'discount_target_id' => $discount_target_id ?? null,
    'parent_sections' => $parent_sections ?? []
], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>
</script>

<?php include __DIR__ . '/partials/header.php'; ?>
<main class="container mx-auto px-4 md:px-6 py-4 md:py-8">

    <?php include __DIR__ . '/partials/discount-banner.php'; ?>
    <?php include __DIR__ . '/partials/section-nav.php'; ?>
    <?php include __DIR__ . '/partials/top-products-section.php'; ?>
    <?php include __DIR__ . '/partials/new-products-section.php'; ?>
    <?php include __DIR__ . '/partials/view-toggle.php'; ?>
    <?php include __DIR__ . '/partials/product-sections.php'; ?>

</main>

<?php include __DIR__ . '/partials/cart-modal.php'; ?>
<?php include __DIR__ . '/partials/map-modal.php'; ?>
<?php include __DIR__ . '/partials/other-modals.php'; ?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="/msbeauty/public/js/main.js"></script>

<button id="currency-toggle-btn" onclick="toggleCurrency()" 
   class="fixed bottom-24 left-6 w-14 h-14 bg-white text-indigo-600 border-2 border-indigo-100 rounded-full shadow-xl hover:shadow-2xl hover:bg-indigo-50 transition-all transform hover:scale-110 flex items-center justify-center z-40 group"
   title="تبديل العملة">
    <span id="currency-icon" class="font-bold text-lg">$</span>
    <span class="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        تغيير العملة
    </span>
</button>

</body>
</html>