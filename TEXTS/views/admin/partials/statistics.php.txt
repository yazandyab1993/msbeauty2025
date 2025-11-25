        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
<!-- Total Products Card - Clickable -->
<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openProductsModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">إجمالي المنتجات</p>
            <h3 class="text-3xl font-bold text-gray-800"><?= $total_products ?></h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-box text-white text-2xl"></i>
        </div>
    </div>
</div>
            <div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-semibold mb-1">الأقسام</p>
                        <h3 class="text-3xl font-bold text-gray-800"><?= $total_categories ?></h3>
                    </div>
                    <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <i class="fas fa-layer-group text-white text-2xl"></i>
                    </div>
                </div>
            </div>
           <!-- Low Stock Card - Clickable -->
<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openLowStockModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">مخزون منخفض</p>
            <h3 class="text-3xl font-bold text-gray-800"><?= $low_stock ?></h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
        </div>
    </div>
</div>

            
<!-- Negative Stock Card - Enhanced UI -->
<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openNegativeStockModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">المخزون السالب</p>
            <h3 class="text-3xl font-bold text-gray-800"><?= $negative_stock_count ?></h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
        </div>
    </div>
</div>



<!-- Reserved Products Card -->
<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openReservedProductsModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">المنتجات المحجوزة</p>
            <h3 class="text-3xl font-bold text-gray-800" id="reserved-products-count"><?= $reserved_products_count ?? 0 ?></h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-lock text-white text-2xl"></i>
        </div>
    </div>
</div>

                   <!-- Coupons Card -->
<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openCouponsModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">كوبونات الخصم</p>
            <h3 class="text-3xl font-bold text-gray-800" id="coupons-count"><?= $coupons_count ?></h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-percentage text-white text-2xl"></i>
        </div>
    </div>
</div>


<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openCustomersModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">إدارة العملاء</p>
            <h3 class="text-3xl font-bold text-gray-800"><?= $total_customers ?? 0 ?></h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-users text-white text-2xl"></i>
        </div>
    </div>
</div>

<div class="stat-card p-6 rounded-2xl shadow-lg card-hover border border-gray-100 cursor-pointer" onclick="openRewardsModal()">
    <div class="flex items-center justify-between">
        <div>
            <p class="text-gray-500 text-sm font-semibold mb-1">إدارة المكافآت</p>
            <h3 class="text-3xl font-bold text-gray-800" id="reward-rules-count">0</h3>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <i class="fas fa-medal text-white text-2xl"></i>
        </div>
    </div>
</div>

</div>

