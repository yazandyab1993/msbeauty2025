<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إدارة الطلبات</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&family=Marhey:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/msbeauty/assets/css/fontawesome/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="/msbeauty/public/css/orders.css">
    <link rel="icon" type="image/png" href="/msbeauty/icons/orders.png">
</head>
<body class="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-xl shadow-xl sticky top-0 z-40 border-b-2 border-pink-200">
        <div class="container mx-auto px-4 md:px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                        <i class="fas fa-shopping-bag text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold logo-font bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">إدارة الطلبات</h1>
                        <p class="text-xs text-gray-500 hidden md:block">متابعة وإدارة طلبات العملاء</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-3 md:gap-4">
                    <a href="accounting.php" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-md transition-all transform hover:scale-105 text-sm">
                        <i class="fas fa-calculator mr-2"></i>
                        <span class="hidden md:inline">المحاسبة</span>
                    </a>
                    <a href="invoice_history.php" class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-md transition-all transform hover:scale-105 text-sm">
                        <i class="fas fa-file-invoice mr-2"></i>
                        <span class="hidden md:inline">الفواتير</span>
                    </a>
                    <a href="admin.php" class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md transition-all transform hover:scale-105 text-sm">
                        <i class="fas fa-cog mr-2"></i>
                        <span class="hidden md:inline">لوحة التحكم</span>
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-4 md:px-6 py-6 md:py-10">

        <!-- New Order Alert -->
        <div id="new-order-alert" class="hidden mb-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-6 rounded-3xl shadow-2xl new-order-animation cursor-pointer" onclick="location.reload()">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                    <i class="fas fa-bell text-white text-2xl"></i>
                </div>
                <div class="flex-grow">
                    <p class="text-xl font-bold">طلب جديد وصل! 🎉</p>
                    <p class="text-sm opacity-90">لقد استلمت طلباً جديداً. الرجاء تحديث الصفحة لرؤيته.</p>
                </div>
                <i class="fas fa-times cursor-pointer hover:bg-white/20 p-2 rounded-lg transition" onclick="event.stopPropagation(); document.getElementById('new-order-alert').classList.add('hidden')"></i>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            <div class="stat-card p-6 rounded-2xl shadow-lg order-card border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold mb-1">إجمالي الطلبات</p>
                        <h3 class="text-3xl font-bold text-gray-800"><?= $total_orders ?></h3>
                    </div>
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-clipboard-list text-white text-2xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="stat-card p-6 rounded-2xl shadow-lg order-card border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold mb-1">قيد الانتظار</p>
                        <h3 class="text-3xl font-bold text-yellow-600"><?= $pending_orders ?></h3>
                    </div>
                    <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-clock text-white text-2xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="stat-card p-6 rounded-2xl shadow-lg order-card border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold mb-1">مكتمل</p>
                        <h3 class="text-3xl font-bold text-green-600"><?= $completed_orders ?></h3>
                    </div>
                    <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-check-circle text-white text-2xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="stat-card p-6 rounded-2xl shadow-lg order-card border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold mb-1">الإيرادات</p>
                        <h3 class="text-3xl font-bold text-pink-600">$<?= number_format($total_revenue, 0) ?></h3>
                    </div>
                    <div class="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-dollar-sign text-white text-2xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Orders Grid -->
        <?php if (empty($orders)): ?>
            <div class="text-center py-20">
                <div class="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <i class="fas fa-inbox text-6xl text-gray-400"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-700 mb-2">لا توجد طلبات حالياً</h3>
                <p class="text-gray-500">سيظهر هنا جميع الطلبات الواردة من العملاء</p>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($orders as $order): ?>
                <div class="order-card bg-white rounded-3xl shadow-xl overflow-hidden border-2 <?= $order['is_new'] ? 'border-pink-500 new-order-animation' : 'border-transparent' ?>">
                    <!-- Order Header -->
                    <div class="bg-gradient-to-r <?= $order['status'] == 'Pending' ? 'from-yellow-400 to-orange-500' : 'from-green-400 to-emerald-500' ?> p-5">
                        <div class="flex justify-between items-start">
                            <div class="flex-grow">
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <i class="fas fa-user text-white"></i>
                                    </div>
                                    <div>
                                        <h3 class="text-xl font-bold text-white"><?= htmlspecialchars($order['customer_name']) ?></h3>
                                        <p class="text-sm text-white/80 flex items-center gap-1">
                                            <i class="fas fa-phone text-xs"></i>
                                            <?= htmlspecialchars($order['customer_phone']) ?>
                                        </p>
                                    </div>
                                </div>
                                <p class="text-xs text-white/70 flex items-center gap-1">
                                    <i class="fas fa-clock"></i>
                                    <?= date('Y-m-d h:i A', strtotime($order['created_at'])) ?>
                                </p>
                            </div>
                            <span class="px-4 py-2 text-sm font-bold rounded-2xl shadow-lg <?= $order['status'] == 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800' ?>">
                                <?= $order['status'] == 'Pending' ? '⏳ قيد الانتظار' : '✅ مكتمل' ?>
                            </span>
                        </div>
                    </div>

                    <!-- Order Body -->
                    <div class="p-6">
                        <!-- Products -->
                        <div class="mb-4">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i class="fas fa-box text-pink-500"></i>
                                المنتجات
                            </h4>
                            <div class="space-y-2 bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-2xl">
                                <?php foreach ($order['items'] as $item): ?>
                                    <div class="flex justify-between items-center text-sm bg-white p-3 rounded-xl shadow-sm">
                                        <span class="font-semibold text-gray-700">
                                            <i class="fas fa-tag text-pink-500 text-xs mr-2"></i>
                                            <?= htmlspecialchars($item['product_name']) ?>
                                            <?php if (!empty($item['variant_name'])): ?>
                                                <span class="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full mr-2">درجة: <?= htmlspecialchars($item['variant_name']) ?></span>
                                            <?php endif; ?>
                                            
                                            <?php if (isset($item['is_gift']) && $item['is_gift'] == 1): ?>
                                                <span class="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full mr-2 font-bold">🎁 هدية مجانية</span>
                                            <?php endif; ?>
                                        </span>
                                        
                                        <div class="flex items-center gap-3">
                                            <span class="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-bold">x<?= htmlspecialchars($item['quantity']) ?></span>
                                            
                                            <?php if (isset($item['is_gift']) && $item['is_gift'] == 1): ?>
                                                <span class="font-bold text-green-600">مجاني</span>
                                            <?php else: ?>
                                                <span class="font-bold text-pink-600">
                                                    <?php if ($order['currency'] === 'SYP'): ?>
                                                        <?= htmlspecialchars(number_format($item['price'] * $item['quantity'], 2)) ?> ل.س
                                                    <?php else: ?>
                                                        $<?= htmlspecialchars(number_format($item['price'] * $item['quantity'], 2)) ?>
                                                    <?php endif; ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        
<!-- Price Summary -->
<div class="bg-gray-50 p-4 rounded-2xl space-y-2 text-sm mb-4">
    <div class="flex justify-between text-gray-600">
        <span>المجموع الفرعي:</span>
        <span class="font-semibold">$<?= number_format(
            $order['total_amount'] 
            - $order['delivery_fee'] 
            + ($order['coupon_discount_amount'] ?? 0) 
            + ($order['lucky_discount_amount'] ?? 0), 
            2
        ) ?></span>
    </div>
    <?php if (!empty($order['discount_percentage']) && $order['discount_percentage'] > 0): ?>
    <div class="flex justify-between text-green-600">
        <span>خصم المتجر (<?= number_format($order['discount_percentage'], 0) ?>%):</span>
        <span class="font-semibold">- متضمن</span>
    </div>
    <?php endif; ?>
    
    <!-- ✅ تعديل هنا: التحقق من وجود كوبون وليس فقط قيمة الخصم -->
<?php if (!empty($order['coupon_code'])): ?>
<div class="flex justify-between text-blue-600 font-bold">
    <span>
        <i class="fas fa-ticket-alt mr-1"></i>
        كوبون: <?= htmlspecialchars($order['coupon_code']) ?>
    </span>
    <span>- $<?= number_format($order['coupon_discount_amount'], 2) ?></span>
</div>
<?php endif; ?>
    
    <?php if (!empty($order['contains_lucky_product']) && $order['contains_lucky_product']): ?>
    <div class="flex justify-between text-yellow-600 font-bold">
        <span>
            <i class="fas fa-gift mr-1"></i>
            منتج الحظ
        </span>
        <span>- $<?= number_format($order['lucky_discount_amount'], 2) ?></span>
    </div>
    <?php endif; ?>
    <?php if (isset($order['reward_discount_amount']) && $order['reward_discount_amount'] > 0): ?>
    <div class="flex justify-between text-green-600 font-bold">
        <span>
            <i class="fas fa-medal mr-1"></i>
            خصم المكافأة
        </span>
        <span>- $<?= number_format($order['reward_discount_amount'], 2) ?></span>
    </div>
    <?php endif; ?>
    <div class="flex justify-between text-gray-600">
        <span>رسوم التوصيل:</span>
        <span class="font-semibold">$<?= number_format($order['delivery_fee'], 2) ?></span>
    </div>
    <div class="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent"></div>
    <div class="flex justify-between text-lg font-bold text-gray-800">
        <span>الإجمالي النهائي:</span>
        <span class="text-pink-600">$<?= htmlspecialchars(number_format($order['total_amount'], 2)) ?></span>
    </div>
</div>
<?php if (!empty($order['reward_message'])): ?>
<div class="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-2xl text-sm mb-4">
    <strong class="font-bold flex items-center gap-2 mb-1">
        <i class="fas fa-gift text-yellow-600"></i>
        رسالة المكافأة للعميل
    </strong>
    <p><?= htmlspecialchars($order['reward_message']) ?></p>
</div>
<?php endif; ?>
                        <!-- Location -->
                        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl">
                            <strong class="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                                <i class="fas fa-map-marker-alt text-blue-600"></i>
                                عنوان التوصيل
                            </strong>
                             <?php
                                $location = $order['customer_location'];
                                if (filter_var($location, FILTER_VALIDATE_URL) && (strpos($location, 'google.com/maps') !== false || strpos($location, 'maps.apple.com') !== false)) {
                                    echo '<a href="' . htmlspecialchars($location) . '" target="_blank" class="block text-blue-600 hover:underline text-xs break-all mb-2">' . htmlspecialchars($location) . '</a>';
                                    echo '<button onclick="toggleMap(' . $order['id'] . ', \'' . htmlspecialchars($location) . '\')" class="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2">';
                                    echo '<i class="fas fa-map-location-dot"></i> عرض الخريطة';
                                    echo '</button>';
                                    echo '<div id="map-' . $order['id'] . '" class="mt-3 rounded-2xl shadow-lg overflow-hidden" style="height: 250px; display: none;"></div>';
                                } else {
                                    echo '<p class="text-sm text-gray-700">' . nl2br(htmlspecialchars($location)) . '</p>';
                                }
                            ?>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2 mt-4">
                        <?php if ($order['status'] == 'Pending'): ?>
                            <a href="?action=complete&id=<?= $order['id'] ?>" 
                               onclick="return confirm('هل أنت متأكد من إكمال هذا الطلب؟ سيتم خصم الكميات من المخزون الفعلي.')" 
                               class="col-span-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center text-xs gap-1 shadow-md">
                                <i class="fas fa-check-circle text-lg"></i>
                            </a>
                        <?php else: ?>
                            <div class="col-span-1 bg-gray-400 text-white font-bold rounded-xl flex flex-col items-center justify-center text-xs gap-1 opacity-70 cursor-not-allowed">
                                <i class="fas fa-check-double text-lg"></i>
                                    </div>
                        <?php endif; ?>

                        <button onclick="openEditModal(<?= htmlspecialchars(json_encode($order)) ?>)" 
                                class="col-span-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center text-xs gap-1 shadow-md">
                            <i class="fas fa-edit text-lg"></i>
                        </button>

                        <a href="?action=delete&id=<?= $order['id'] ?>" 
                           onclick="return confirm('تحذير: هل أنت متأكد من حذف الطلب؟ \nإذا كان الطلب (قيد الانتظار) سيتم إعادة الكميات المحجوزة إلى المخزون المتاح.')" 
                           class="col-span-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center text-xs gap-1 shadow-md">
                            <i class="fas fa-trash-alt text-lg"></i>
                        </a>
                    </div>


                </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>

  <div id="editOrderModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm hidden z-50 flex items-center justify-center opacity-0 transition-opacity duration-300">
        <div class="bg-white w-full max-w-md mx-4 rounded-3xl shadow-2xl transform scale-95 transition-transform duration-300 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                <h3 class="text-xl font-bold flex items-center gap-2">
                    <i class="fas fa-edit"></i>
                    تعديل بيانات الطلب
                </h3>
                <button onclick="closeEditModal()" class="hover:bg-white/20 p-2 rounded-full transition">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <form method="POST" action="" class="p-6 space-y-4">
                <input type="hidden" name="update_order_info" value="1">
                <input type="hidden" id="edit_order_id" name="order_id">
                
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">اسم العميل</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                            <i class="fas fa-user"></i>
                        </span>
                        <input type="text" id="edit_customer_name" name="customer_name" required
                               class="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                            <i class="fas fa-phone"></i>
                        </span>
                        <input type="text" id="edit_customer_phone" name="customer_phone" required
                               class="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">الموقع / العنوان</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                            <i class="fas fa-map-marker-alt"></i>
                        </span>
                        <textarea id="edit_customer_location" name="customer_location" rows="3" required
                                  class="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"></textarea>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-xs text-yellow-800">
                    <i class="fas fa-info-circle ml-1"></i>
                    ملاحظة: لتعديل <b>المنتجات</b> في الطلب، يفضل حذف الطلب (لإستعادة المخزون) وإنشاء طلب جديد لضمان دقة حسابات الكوبونات والخصومات.
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    حفظ التغييرات
                </button>
            </form>
        </div>
    </div>  

<script src="/msbeauty/public/js/orders.js"></script>
</body>
</html>