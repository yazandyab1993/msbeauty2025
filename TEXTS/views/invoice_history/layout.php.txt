<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>سجل الفواتير - MS Store</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700&family=Marhey:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/msbeauty/assets/css/fontawesome/all.min.css">
    <link rel="stylesheet" href="/msbeauty/public/css/invoice_history.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" onerror="window._html2canvas_failed=true;"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" onerror="window._jspdf_failed=true;"></script>
    

    <link rel="icon" type="image/png" href="/msbeauty/icons/invoice.png">
</head>
<body class="bg-gray-50 font-['Tajawal'] min-h-screen">

<script id="initial-data" type="application/json">
<?= json_encode([
    'transactions' => $transactions,
    'total_sales_amount' => $total_sales_amount,
    'total_returns_amount' => $total_returns_amount,
    'net_total' => $net_total,
    'page_error' => $page_error,
    'filter_type' => $filter_type,
    'start_date' => $start_date,
    'end_date' => $end_date
], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>
</script>

    <header class="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <div class="container mx-auto px-4 md:px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <a href="index.php" class="flex items-center gap-3 hover:opacity-90 transition">
                        <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-chart-line text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MS Store</h1>
                            <p class="text-xs text-gray-400 hidden md:block">سجل الفواتير والتقارير</p>
                        </div>
                    </a>
                </div>
                
                <div class="flex items-center gap-3 md:gap-4">
                    <a href="admin.php" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-sm md:text-base">
                        <i class="fas fa-tachometer-alt"></i>
                        <span class="hidden md:inline">لوحة التحكم</span>
                    </a>
                    <a href="orders.php" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:shadow-md transition-all transform hover:scale-105 flex items-center gap-2 text-sm md:text-base">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="hidden md:inline">الطلبات</span>
                    </a>
                </div>
            </div>
        </div>
    </header>
    
    <main class="container mx-auto px-4 md:px-6 py-8 md:py-12">
        
        <section class="text-center mb-16">
            <div class="hero-gradient text-white p-10 md:p-16 rounded-3xl shadow-2xl shadow-purple-300/50 mb-8 relative overflow-hidden">
                <div class="absolute inset-0 shimmer opacity-50"></div>
                <div class="relative z-10">
                    <h2 class="text-3xl md:text-5xl font-bold mb-4">📈 سجل الفواتير</h2>
                    <p class="text-lg md:text-xl font-light opacity-90">تتبع جميع عمليات البيع والمرتجعات في مكان واحد</p>
                </div>
            </div>
        </section>

        <?php if ($page_error): ?>
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-xl mb-8 shadow-md" role="alert">
                <div class="flex items-center gap-3">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                    <div>
                        <p class="font-bold text-lg">حدث خطأ</p>
                        <p><?= htmlspecialchars($page_error) ?></p>
                    </div>
                </div>
            </div>
        <?php else: ?>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="stat-card p-6 rounded-3xl shadow-xl shadow-blue-200/50">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm font-light">إجمالي المبيعات</p>
                        <h3 class="text-4xl font-bold mt-2 text-blue-600">$<?= number_format($total_sales_amount, 2) ?></h3>
                    </div>
                    <div class="stat-icon w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-arrow-up text-xl text-blue-500"></i>
                    </div>
                </div>
                <div class="mt-4 flex items-center gap-2 text-gray-500">
                    <i class="fas fa-chart-line text-sm"></i>
                    <span class="text-sm font-light">إيرادات إيجابية</span>
                </div>
            </div>

            <div class="stat-card p-6 rounded-3xl shadow-xl shadow-pink-200/50">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm font-light">إجمالي المرتجعات</p>
                        <h3 class="text-4xl font-bold mt-2 text-pink-600">$<?= number_format($total_returns_amount, 2) ?></h3>
                    </div>
                    <div class="stat-icon w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-arrow-down text-xl text-pink-500"></i>
                    </div>
                </div>
                <div class="mt-4 flex items-center gap-2 text-gray-500">
                    <i class="fas fa-exchange-alt text-sm"></i>
                    <span class="text-sm font-light">مرتجعات العملاء</span>
                </div>
            </div>

            <div class="stat-card p-6 rounded-3xl shadow-xl shadow-purple-200/50">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm font-light">صافي الدخل</p>
                        <h3 class="text-4xl font-bold mt-2 text-purple-600">$<?= number_format($net_total, 2) ?></h3>
                    </div>
                    <div class="stat-icon w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-dollar-sign text-xl text-purple-500"></i>
                    </div>
                </div>
                <div class="mt-4 flex items-center gap-2 text-gray-500">
                    <i class="fas fa-balance-scale text-sm"></i>
                    <span class="text-sm font-light">صافي الأرباح</span>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-3xl shadow-xl p-6 border-t-4 border-purple-200 mb-10">
            <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <i class="fas fa-chart-pie text-white"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800">📊 إحصائيات مرئية</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                    <h4 class="text-sm font-semibold text-gray-500 mb-2">المنتجات الأكثر مبيعاً (بالكمية)</h4>
                    <canvas id="chartTopProducts" height="180"></canvas>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                    <h4 class="text-sm font-semibold text-gray-500 mb-2">المبيعات مقابل المرتجعات (بالمبلغ)</h4>
                    <canvas id="chartSalesVsReturns" height="180"></canvas>
                </div>
            </div>
        </section>

        <section class="bg-white rounded-3xl shadow-xl p-6 mb-12 border-t-4 border-blue-200">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="flex-grow">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                            <i class="fas fa-filter text-white"></i>
                        </div>
                        فلترة النتائج
                    </h3>
                    
                    <div class="flex flex-wrap gap-3 mb-4">
                        <a href="?filter=day" class="filter-tab px-5 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all <?= $filter_type == 'day' ? 'active border-blue-500 text-blue-600' : 'text-gray-700' ?>">
                            <i class="fas fa-calendar-day ml-2"></i>
                            اليوم
                        </a>
                        <a href="?filter=week" class="filter-tab px-5 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all <?= $filter_type == 'week' ? 'active border-blue-500 text-blue-600' : 'text-gray-700' ?>">
                            <i class="fas fa-calendar-week ml-2"></i>
                            هذا الأسبوع
                        </a>
                        <a href="?filter=month" class="filter-tab px-5 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all <?= $filter_type == 'month' ? 'active border-blue-500 text-blue-600' : 'text-gray-700' ?>">
                            <i class="fas fa-calendar-alt ml-2"></i>
                            هذا الشهر
                        </a>
                    </div>
                </div>
                
                <form action="invoice_history.php" method="GET" class="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100 flex-grow">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">من تاريخ</label>
                            <input type="date" name="start_date" value="<?= htmlspecialchars($start_date) ?>" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white">
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">إلى تاريخ</label>
                            <input type="date" name="end_date" value="<?= htmlspecialchars($end_date) ?>" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white">
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-400/50 hover:shadow-xl transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2">
                            <i class="fas fa-search"></i>
                            تطبيق الفلتر
                        </button>
                        <a href="invoice_history.php" class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </a>
                    </div>
                </form>
            </div>
        </section>

        <section class="mb-12">
            <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i class="fas fa-receipt text-white text-xl"></i>
                </div>
                <h2 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    جميع الحركات
                </h2>
                <div class="flex-grow h-1 bg-gradient-to-r from-purple-300 to-transparent"></div>
                <span class="bg-white px-4 py-2 rounded-xl shadow-md text-gray-600 font-semibold border border-gray-200">
                    <?= count($transactions) ?> حركة
                </span>
            </div>

            <div class="space-y-8">
                <?php if(empty($transactions)): ?>
                    <div class="text-center py-16 bg-white rounded-3xl shadow-xl border border-gray-200">
                        <div class="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <i class="fas fa-file-invoice text-5xl text-gray-400"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-600 mb-4">لا توجد حركات</h3>
                        <p class="text-gray-500 text-lg mb-6">لم يتم العثور على أي فواتير للفترة المحددة</p>
                        <a href="invoice_history.php" class="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2">
                            <i class="fas fa-sync"></i>
                            عرض الكل
                        </a>
                    </div>
                <?php else: ?>
                    <?php foreach($transactions as $trans): ?>
                    
                    <?php if($trans['type'] == 'sale'): ?>
                    <div class="invoice-card bg-white rounded-3xl shadow-xl border-l-4 border-green-500">
                        <div id="invoice-sale-<?= $trans['id'] ?>" class="p-8">
                            <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b pb-4 border-gray-100">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                        <i class="fas fa-shopping-cart text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-bold text-gray-800">فاتورة بيع #<?= $trans['id'] ?></h3>
                                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                                            <span class="bg-green-100 text-green-700 px-3 py-0.5 rounded-lg font-semibold">
                                                <i class="fas fa-check-circle ml-1"></i>
                                                بيع
                                            </span>
                                            <span class="text-gray-500">
                                                <i class="far fa-clock ml-1"></i>
                                                <?= date('Y-m-d h:i A', strtotime($trans['date'])) ?>
                                            </span>
                                            <?php if(isset($trans['seller_name']) && $trans['seller_name']): ?>
                                            <span class="text-gray-500">
                                                <i class="fas fa-user ml-1"></i>
                                                البائع: <?= htmlspecialchars($trans['seller_name']) ?>
                                            </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-green-500 font-semibold text-lg">الإجمالي</p>
                                    <h2 class="text-4xl font-bold text-green-600">$<?= number_format($trans['total_amount'], 2) ?></h2>
                                </div>
                            </div>

                            <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200">
                                    <i class="fas fa-list text-green-500"></i>
                                    المنتجات المباعة
                                </h4>
                                <div class="overflow-x-auto">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="text-right text-gray-600 border-b border-gray-200 text-sm">
                                                <th class="py-2 font-bold pr-2">المنتج</th>
                                                <th class="py-2 font-bold text-center">الكمية</th>
                                                <th class="py-2 font-bold text-center">سعر الوحدة</th>
                                                <th class="py-2 font-bold text-left pl-2">الإجمالي</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach($trans['items'] as $item): ?>
                                            <tr class="border-b border-gray-100 last:border-b-0 hover:bg-white transition">
                                                <td class="py-3 font-medium text-gray-800 pr-2"><?= htmlspecialchars($item['product_name']) ?><?php if(!empty($item['variant_name'])): ?> <span class="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg mr-2">الدرجة: <?= htmlspecialchars($item['variant_name']) ?></span><?php endif; ?></td>
                                                <td class="py-3 text-center">
                                                    <span class="bg-green-50 text-green-700 px-3 py-0.5 rounded-lg text-sm font-bold">
                                                        <?= $item['quantity'] ?>
                                                    </span>
                                                </td>
                                                <td class="py-3 text-center text-green-600 font-bold">$<?= number_format($item['price'], 2) ?></td>
                                                <td class="py-3 text-left text-green-700 font-bold pl-2">$<?= number_format($item['price'] * $item['quantity'], 2) ?></td>
                                            </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="flex justify-end">
                                <div class="w-full md:w-96 space-y-3 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                    <?php
                                    $subtotal = 0;
                                    foreach($trans['items'] as $item) $subtotal += $item['price'] * $item['quantity'];
                                    $discount_amount = 0;
                                    if (isset($trans['discount_type']) && isset($trans['discount_value']) && !empty($trans['discount_type']) && !empty($trans['discount_value'])) {
                                        if ($trans['discount_type'] == 'percentage') {
                                            $discount_amount = $subtotal * ($trans['discount_value'] / 100);
                                        } else {
                                            $discount_amount = $trans['discount_value'];
                                        }
                                    }
                                    ?>
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span class="text-gray-600 font-light">المجموع الفرعي:</span>
                                        <span class="font-bold text-gray-800">$<?= number_format($subtotal, 2) ?></span>
                                    </div>
                                    <?php if($discount_amount > 0): ?>
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span class="text-red-500 font-semibold">الخصم (<?= $trans['discount_type'] == 'percentage' ? $trans['discount_value'] . '%' : '$' . $trans['discount_value'] ?>):</span>
                                        <span class="text-red-500 font-bold">-$<?= number_format($discount_amount, 2) ?></span>
                                    </div>
                                    <?php endif; ?>
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span class="text-gray-600 font-light">رسوم التوصيل:</span>
                                        <span class="font-bold text-gray-800">$<?= number_format($trans['delivery_fee'] ?? 0, 2) ?></span>
                                    </div>
                                    <div class="flex justify-between items-center pt-2">
                                        <span class="text-xl font-bold text-gray-800">الإجمالي النهائي:</span>
                                        <span class="text-2xl font-bold text-green-600">$<?= number_format($trans['total_amount'], 2) ?></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-b-3xl border-t border-gray-200 flex justify-between items-center">
                            <button onclick="printInvoiceDirect('sale', <?= $trans['id'] ?>, this)" 
                                    class="print-btn px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-400/50 transition-all flex items-center gap-2">
                                <i class="fas fa-print"></i>
                                طباعة / PDF
                            </button>
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <i class="fas fa-hashtag"></i>
                                <span>رقم الفاتورة: <?= $trans['id'] ?></span>
                            </div>
                        </div>
                    </div>
                    
                    <?php else: // Return Invoice ?>
                    <div class="invoice-card bg-white rounded-3xl shadow-xl border-l-4 border-red-500">
                        <div id="invoice-return-<?= $trans['id'] ?>" class="p-8">
                            <div class="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b pb-4 border-gray-100">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                                        <i class="fas fa-undo text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-2xl font-bold text-gray-800">فاتورة إرجاع #<?= $trans['id'] ?></h3>
                                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                                            <span class="bg-red-100 text-red-700 px-3 py-0.5 rounded-lg font-semibold">
                                                <i class="fas fa-exchange-alt ml-1"></i>
                                                مرتجع
                                            </span>
                                            <span class="text-gray-500">
                                                <i class="far fa-clock ml-1"></i>
                                                <?= date('Y-m-d h:i A', strtotime($trans['date'])) ?>
                                            </span>
                                            <?php if(isset($trans['reason']) && $trans['reason']): ?>
                                            <span class="text-gray-500">
                                                <i class="fas fa-info-circle ml-1"></i>
                                                السبب: <?= htmlspecialchars($trans['reason']) ?>
                                            </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-red-500 font-semibold text-lg">الإجمالي</p>
                                    <h2 class="text-4xl font-bold text-red-600">-$<?= number_format($trans['total_amount'], 2) ?></h2>
                                </div>
                            </div>

                            <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 border-gray-200">
                                    <i class="fas fa-undo text-red-500"></i>
                                    المنتجات المرتجعة
                                </h4>
                                <div class="overflow-x-auto">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="text-right text-gray-600 border-b border-gray-200 text-sm">
                                                <th class="py-2 font-bold pr-2">المنتج</th>
                                                <th class="py-2 font-bold text-center">الكمية</th>
                                                <th class="py-2 font-bold text-center">سعر الوحدة</th>
                                                <th class="py-2 font-bold text-left pl-2">الإجمالي</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach($trans['items'] as $item): ?>
                                            <tr class="border-b border-gray-100 last:border-b-0 hover:bg-white transition">
                                                <td class="py-3 font-medium text-gray-800 pr-2"><?= htmlspecialchars($item['product_name']) ?><?php if(!empty($item['variant_name'])): ?> <span class="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg mr-2">الدرجة: <?= htmlspecialchars($item['variant_name']) ?></span><?php endif; ?></td>
                                                <td class="py-3 text-center">
                                                    <span class="bg-red-50 text-red-700 px-3 py-0.5 rounded-lg text-sm font-bold">
                                                        <?= $item['quantity'] ?>
                                                    </span>
                                                </td>
                                                <td class="py-3 text-center text-red-600 font-bold">$<?= number_format($item['price_at_return'], 2) ?></td>
                                                <td class="py-3 text-left text-red-700 font-bold pl-2">$<?= number_format($item['price_at_return'] * $item['quantity'], 2) ?></td>
                                            </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-b-3xl border-t border-gray-200 flex justify-between items-center">
                            <button onclick="printInvoiceDirect('return', <?= $trans['id'] ?>, this)" 
                                    class="print-btn px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-400/50 transition-all flex items-center gap-2">
                                <i class="fas fa-print"></i>
                                طباعة / PDF
                            </button>
                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                <i class="fas fa-hashtag"></i>
                                <span>رقم الفاتورة: <?= $trans['id'] ?></span>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>

                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </section>
        <?php endif; ?>
    </main>

    <div class="fixed bottom-8 left-8 z-30">
        <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
                class="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center floating-action">
            <i class="fas fa-arrow-up text-xl"></i>
        </button>
    </div>

    <div id="custom-notification" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 hidden">
        <div class="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-80 max-w-md notification border-t-4 border-blue-400">
            <div id="notification-icon" class="w-12 h-12 rounded-full flex items-center justify-center"></div>
            <div class="flex-grow">
                <p id="notification-title" class="font-bold text-lg text-gray-800"></p>
                <p id="notification-message" class="text-gray-600 text-sm"></p>
            </div>
            <button onclick="hideNotification()" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center justify-center">
                <i class="fas fa-times text-gray-600"></i>
            </button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="/msbeauty/public/js/invoice_history.js"></script>

</body>

