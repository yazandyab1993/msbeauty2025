
<div id="rewards-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all scale-95 opacity-0 max-h-[90vh] flex flex-col" id="rewards-modal-content">
        <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-medal text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">إدارة نظام المكافآت</h2>
            </div>
            <button onclick="closeRewardsModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="p-6 overflow-y-auto flex-grow">
            <div class="mb-4 border-b border-gray-200">
                <nav class="flex space-x-4" aria-label="Tabs">
                    <button id="tab-rules" onclick="switchRewardsTab('rules')" class="px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 border-orange-500 text-orange-600">
                        <i class="fas fa-tasks mr-2"></i>قواعد المكافآت
                    </button>
                    <button id="tab-gift-pool" onclick="switchRewardsTab('gift-pool')" class="px-3 py-2 font-medium text-sm rounded-t-lg border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        <i class="fas fa-gifts mr-2"></i>سلة الهدايا
                    </button>
                </nav>
            </div>

            <div id="tab-content-rules">
                <form id="reward-rule-form" class="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <input type="hidden" id="reward-rule-id" value="">
                    <h3 class="text-lg font-bold text-gray-800 mb-3" id="reward-form-title">إضافة قاعدة جديدة</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">اسم القاعدة</label>
                            <input type="text" id="reward-name" class="form-input" placeholder="مثال: مكافأة الشهر الفضية" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">الأولوية (الأعلى يفوز)</label>
                            <input type="number" id="reward-priority" class="form-input" value="10" min="1" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">الفترة (بالأيام)</label>
                            <input type="number" id="reward-period-days" class="form-input" placeholder="7 (أسبوع) أو 30 (شهر)" required>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">مبلغ الإنفاق المطلوب</label>
                            <input type="number" id="reward-spend-threshold" class="form-input" placeholder="500" step="0.01" min="1" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">نوع المكافأة</label>
                            <select id="reward-type" class="form-input" onchange="toggleRewardValueField()">
                                <option value="product">منتج (من سلة الهدايا)</option>
                                <option value="coupon">كوبون (خصم ثابت)</option>
                            </select>
                        </div>
                        <div id="reward-value-container" class="hidden">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">قيمة الخصم ($)</label>
                            <input type="number" id="reward-value" class="form-input" value="0" step="0.01">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">رسالة التهنئة للعميل</label>
                        <input type="text" id="reward-note" class="form-input" placeholder="تهانينا! لقد ربحت هدية..." required>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="clearRewardForm()" class="px-4 py-2 bg-gray-200 rounded-lg text-sm">إلغاء</button>
                        <button type="submit" class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-bold">
                            <i class="fas fa-save mr-1"></i>حفظ القاعدة
                        </button>
                    </div>
                </form>

                <h4 class="font-bold text-gray-800 mb-3">القواعد الحالية</h4>
                <div id="reward-rules-list" class="space-y-3 max-h-64 overflow-y-auto">
                    <div class="text-center py-4 text-gray-500">جاري تحميل القواعد...</div>
                </div>
            </div>

            <div id="tab-content-gift-pool" class="hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-3">إضافة منتجات للسلة</h3>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">ابحث عن منتج أو درجة</label>
                        <input type="text" id="gift-pool-search" class="form-input" placeholder="اكتب اسم المنتج أو الباركود...">
                        <div id="gift-pool-search-results" class="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg"></div>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-3">الهدايا المتاحة حالياً</h3>
                        <div id="gift-pool-list" class="space-y-2 max-h-96 overflow-y-auto">
                            <div class="text-center py-4 text-gray-500">جاري تحميل سلة الهدايا...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Reserved Products Modal -->
<div id="reserved-products-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-5xl transform transition-all scale-95 opacity-0 max-h-[90vh] flex flex-col" id="reserved-modal-content">
        <div class="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-lock text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">المنتجات المحجوزة</h2>
            </div>
            <button onclick="closeReservedProductsModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">المنتج</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">العميل</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">رقم الهاتف</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">الكمية</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">منذ</th>
                        </tr>
                    </thead>
                    <tbody id="reserved-products-body">
                        <tr>
                            <td colspan="5" class="text-center py-8">
                                <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
                                <p class="mt-2 text-gray-600">جارٍ تحميل البيانات...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

    <!-- Add Product Modal -->
<div id="add-product-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all scale-95 opacity-0 max-h-[90vh] flex flex-col" id="add-modal-content">
        <div class="bg-gradient-to-r from-pink-500 to-rose-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-plus text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">إضافة منتج جديد</h2>
            </div>
            <button onclick="closeAddProductModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <form id="add-product-form" enctype="multipart/form-data">
                <input type="hidden" name="action" value="add_product">

                <!-- القسم 1: المعلومات الأساسية -->
                <div class="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fas fa-info-circle text-blue-600"></i>
                        المعلومات الأساسية
                    </h3>
                    <div class="space-y-4">
                         <!-- اسم المنتج والوصف جنبًا إلى جنب -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label for="product-name" class="block mb-2 text-sm font-semibold text-gray-700">
                <i class="fas fa-tag text-pink-500 ml-2"></i>اسم المنتج <span class="text-red-500">*</span>
            </label>
            <input type="text" id="product-name" name="name"
            class="w-full px-3 py-1 bg-white-100 border-2 border-transparent rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            placeholder="مثال: كريم تفتيح" required>
        </div>
        <div>
            <label for="product-description" class="block mb-2 text-sm font-semibold text-gray-700">
                <i class="fas fa-align-right text-pink-500 ml-2"></i>الوصف (اختياري)
            </label>
            <textarea id="product-description" name="description"
            class="w-full px-3 py-1 bg-white-100 border-2 border-transparent rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            rows="1" placeholder="وصف مختصر للمنتج..."></textarea>
        </div>
    </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="product-price" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-dollar-sign text-green-500 ml-2"></i>السعر ($) <span class="text-red-500">*</span>
                                </label>
                                <input type="number" id="product-price" name="price"
                                class="w-full px-3 py-1 bg-white-100 border-2 border-transparent rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                step="0.01" min="0" placeholder="0.00" required>
                            </div>
                            <div>
                                <label for="product-category" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-folder text-yellow-500 ml-2"></i>القسم <span class="text-red-500">*</span>
                                </label>
                                <select id="product-category" name="category_id"
                                class="fw-full px-3 py-1 bg-white-100 border-2 border-transparent rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500" required>
                                    <option value="">اختر قسماً</option>
                                    <?php foreach($categories as $cat): ?>
                                    <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['parent_section'] . ' → ' . $cat['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- القسم 2: المخزون والباركود (يُعطل عند تفعيل الدرجات) -->
                <div id="basic-stock-section" class="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fas fa-cubes text-green-600"></i>
                        المخزون والباركود
                    </h3>
                    <div class="space-y-4">
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label for="product-stock" class="block mb-2 text-sm font-semibold text-gray-700">
            <i class="fas fa-boxes text-blue-500 ml-2"></i>الكمية <span class="text-red-500">*</span>
        </label>
        <input type="number" id="product-stock" name="stock"
        class="w-full px-3 py-1 bg-white-100 border-2 border-transparent rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
        min="0" placeholder="0" value="0" required>
    </div>
    <div>
        <label for="product-barcode" class="block mb-2 text-sm font-semibold text-gray-700">
            <i class="fas fa-barcode text-purple-500 ml-2"></i>الباركود (اختياري)
        </label>
        <div class="relative flex items-center">
            <input type="text" id="product-barcode" name="barcode"
            class="w-full px-3 py-1 bg-white-100 border-2 border-transparent rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            placeholder="1234567890" onchange="checkBarcodeUniqueness(this.value)">
            <button type="button" id="scan-qr-btn" class="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition md:hidden"
                    title="مسح باركود بالكاميرا">
                <i class="fas fa-qrcode text-sm"></i>
            </button>
        </div>
        <div id="barcode-error" class="mt-2 hidden"></div>
    </div>
</div>
                    </div>
                </div>

<!-- القسمان 3 و4 جنبًا إلى جنب -->
<div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- القسم 3: الصورة -->
    <div class="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-image text-indigo-600"></i>
            صورة المنتج
        </h3>
        <div>
            <input type="file" id="product-image" name="image" class="form-input" accept="image/*">
            <p class="text-xs text-gray-500 mt-2">الصيغ المدعومة: JPG, PNG. الحجم الأقصى: 5MB.</p>
        </div>
    </div>

    <!-- القسم 4: تحديد كمنتج جديد -->
    <div class="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-star text-amber-500"></i>
            تحديد كمنتج جديد
        </h3>
        
        <div class="space-y-4">
            <div class="flex items-start gap-3">
                <input type="checkbox" id="product-is-new" name="is_new" value="1" 
                       class="form-checkbox h-5 w-5 text-amber-600 mt-1"
                       onchange="toggleNewUntilField()">
                <div class="flex-1">
                    <label for="product-is-new" class="text-sm font-semibold text-gray-800 cursor-pointer">
                        منتج جديد ⭐
                    </label>
                    <p class="text-xs text-gray-600 mt-1">
                        عند التفعيل، سيظهر هذا المنتج في قسم "أحدث المنتجات" في الصفحة الرئيسية
                    </p>
                </div>
            </div>

            <div id="new-until-container" class="hidden">
                <label for="product-new-until" class="block mb-2 text-sm font-semibold text-gray-700">
                    <i class="fas fa-calendar-alt text-amber-500 ml-2"></i>
                    صالح كـ "جديد" حتى تاريخ (اختياري)
                </label>
                <input type="date" id="product-new-until" name="new_until" class="form-input">
                <p class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-info-circle text-blue-500"></i>
                    اتركه فارغاً ليبقى "جديد" للأبد، أو حدد تاريخاً للإزالة التلقائية
                </p>
            </div>
        </div>
    </div>
</div>



                <!-- القسم 4: خيار الدرجات -->
                <div class="mb-6 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
                    <div class="flex items-start gap-3">
                        <input type="checkbox" id="product-has-variants" name="has_variants" value="1" class="form-checkbox h-5 w-5 text-pink-600 mt-1">
                        <div>
                            <label for="product-has-variants" class="text-sm font-semibold text-gray-800">
                                هذا المنتج يحتوي على درجات (ألوان / مقاسات / إصدارات)
                            </label>
                            <p class="text-xs text-gray-600 mt-1">
                                عند التفعيل، سيتم إدارة الباركود والمخزون لكل درجة على حدة، وتصبح الحقول أعلاه غير نشطة.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- قسم الدرجات (يظهر عند التفعيل) -->
                <div id="add-variants-block" class="mb-6 p-5 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200 hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i class="fas fa-palette text-purple-600"></i>
                            درجات المنتج
                        </h3>
                        <button type="button" id="add-variant-btn" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-sm font-bold shadow hover:from-purple-600 hover:to-pink-700 transition">
                            <i class="fas fa-plus ml-1"></i> إضافة درجة
                        </button>
                    </div>
                    <p class="text-xs text-purple-700 mb-4">
                        ⚠️ الباركود إلزامي لكل درجة. الكمية تُدار لكل درجة على حدة.
                    </p>
                    <div id="variant-list" class="space-y-4 max-h-64 overflow-y-auto p-2 bg-white rounded-xl border border-purple-100"></div>
                    <div id="no-variants-message" class="text-center py-4 text-gray-500">
                        <i class="fas fa-inbox text-2xl opacity-50 mb-2"></i>
                        <p>لم تُضف أي درجات بعد</p>
                    </div>
                </div>

                <!-- أزرار الحفظ والإلغاء -->
                <div class="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                    <button type="button" onclick="closeAddProductModal()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all">
                        <i class="fas fa-times ml-2"></i> إلغاء
                    </button>
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                        <i class="fas fa-plus-circle ml-2"></i> إضافة المنتج
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


<!-- Negative Stock Modal -->
<div id="negative-stock-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl transform transition-all scale-95 opacity-0 max-h-[90vh] flex flex-col" id="negative-stock-modal-content">
        <div class="bg-gradient-to-r from-red-500 to-rose-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-exclamation-triangle text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">المخزون السالب</h2>
            </div>
            <button onclick="closeNegativeStockModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <div id="negative-stock-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-red-500"></i>
                    <p class="mt-4 text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Lucky Product Modal -->
<div id="lucky-product-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="bg-gradient-to-r from-yellow-500 to-amber-600 p-6 rounded-t-3xl flex justify-between items-center">
            <h2 class="text-2xl font-bold text-white">تعيين منتج الحظ</h2>
            <button onclick="closeLuckyProductModal()" class="text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <form id="lucky-product-form">
                <input type="hidden" name="action" value="set_lucky_product">
                <div class="mb-4">
                    <label class="block mb-2 font-semibold text-gray-700">طريقة الاختيار</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2">
                            <input type="radio" name="selection_method" value="manual" checked onchange="toggleLuckyProductSelection('manual')">
                            <span>يدوي</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" name="selection_method" value="auto" onchange="toggleLuckyProductSelection('auto')">
                            <span>آلي (الأقل مبيعاً)</span>
                        </label>
                    </div>
                </div>

                <!-- Manual Selection -->
                <div id="manual-selection" class="mb-4">
                    <label class="block mb-2 font-semibold text-gray-700">اختر المنتج</label>
                    <div class="relative">
                        <input type="text" id="lucky-product-search" class="form-input w-full" placeholder="ابحث باسم المنتج أو الباركود...">
                        <div id="lucky-search-results" class="absolute top-full left-0 right-0 bg-white border border-gray-200 mt-1 rounded-lg shadow-lg z-10 hidden max-h-60 overflow-y-auto"></div>
                    </div>
                    <input type="hidden" id="selected-lucky-product-id" name="product_id" required>
                    <div id="selected-lucky-product-preview" class="mt-2 text-sm text-gray-700"></div>
                </div>

                <!-- Auto Selection Info -->
                <div id="auto-selection" class="mb-4 hidden p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700">سيتم اختيار المنتج الأقل مبيعاً خلال آخر 30 يوماً من المبيعات والطلبات.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block mb-2 font-semibold text-gray-700">نسبة الخصم (%)</label>
                        <input type="number" name="discount_percent" class="form-input" min="1" max="100" step="0.01" required>
                    </div>
                    <div>
                        <label class="block mb-2 font-semibold text-gray-700">مدة الحملة</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" name="active_from" class="form-input" value="<?= date('Y-m-d') ?>" required>
                            <input type="date" name="active_to" class="form-input" value="<?= date('Y-m-d', strtotime('+30 days')) ?>" required>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block mb-2 font-semibold text-gray-700">ملاحظة (اختياري)</label>
                    <input type="text" name="note" class="form-input" placeholder="مثال: عرض نهاية الأسبوع">
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onclick="closeLuckyProductModal()" class="px-4 py-2 bg-gray-200 rounded-lg">إلغاء</button>
                    <button type="submit" class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg font-bold">حفظ</button>
                </div>
            </form>
        </div>
    </div>
</div>


<!-- Low Stock Modal -->
<div id="low-stock-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl transform transition-all scale-95 opacity-0 max-h-[90vh] flex flex-col" id="low-stock-modal-content">
        <div class="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-exclamation-triangle text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">المنتجات ذات المخزون المنخفض</h2>
            </div>
            <button onclick="closeLowStockModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <!-- إعدادات عتبة المخزون المنخفض -->
            <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <i class="fas fa-cog text-blue-600"></i>
                    إعدادات المخزون المنخفض
                </h3>
                <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div class="flex-1">
                        <label for="low-stock-threshold" class="block mb-2 text-sm font-semibold text-gray-700">
                            <i class="fas fa-boxes text-blue-500 ml-2"></i>عتبة المخزون المنخفض
                        </label>
                        <div class="flex items-center gap-3">
                            <input type="number" id="low-stock-threshold" class="form-input w-24" min="1" max="100" 
                                   value="<?= $low_stock_threshold ?>" placeholder="10" data-current-threshold="<?= $low_stock_threshold ?>">
                                   
                            <span class="text-sm text-gray-600">قطع</span>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">
                            سيتم اعتبار أي منتج أو درجة مخزونها أقل من هذه القيمة ضمن المخزون المنخفض
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button type="button" onclick="updateLowStockThreshold()" 
                                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2">
                            <i class="fas fa-save"></i>
                            <span>حفظ الإعداد</span>
                        </button>
                        <button type="button" onclick="loadLowStockProducts()" 
                                class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2">
                            <i class="fas fa-refresh"></i>
                            <span>تحديث القائمة</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div class="flex items-center gap-3">
                    <i class="fas fa-info-circle text-yellow-500 text-xl"></i>
                    <div>
                        <h3 class="font-bold text-yellow-800">تنبيه المخزون المنخفض</h3>
                        <p class="text-yellow-700 text-sm">هذه قائمة بالمنتجات والدرجات التي يقل مخزونها عن <span id="current-threshold-display" class="font-bold"><?= $low_stock_threshold ?></span> قطع</p>
                    </div>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
    <tr>
        <th class="p-4 text-right text-sm font-bold text-gray-700">الصورة</th>
        <th class="p-4 text-right text-sm font-bold text-gray-700 cursor-pointer" onclick="sortLowStockTable('type')">
            نوع المادة <span id="sort-icon-type" class="ml-1"></span>
        </th>
        <th class="p-4 text-right text-sm font-bold text-gray-700">الاسم</th>
        <th class="p-4 text-right text-sm font-bold text-gray-700">الباركود</th>
        <th class="p-4 text-right text-sm font-bold text-gray-700 cursor-pointer" onclick="sortLowStockTable('stock')">
            المخزون <span id="sort-icon-stock" class="ml-1"></span>
        </th>
        <th class="p-4 text-right text-sm font-bold text-gray-700 cursor-pointer" onclick="sortLowStockTable('category')">
            القسم <span id="sort-icon-category" class="ml-1"></span>
        </th>
    </tr>
</thead>
                    <tbody id="low-stock-products-body">
                        <?php foreach($low_stock_products as $product): ?>
<tr class="border-b border-gray-100 hover:bg-yellow-50 transition"
    data-type="<?= htmlspecialchars($product['type']) ?>"
    data-stock="<?= intval($product['stock']) ?>"
    data-category="<?= htmlspecialchars($product['category_name']) ?>"
>
                            <td class="p-4">
                                <div class="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                    <img src="<?= htmlspecialchars($product['image']) ?>" class="w-full h-full object-cover" alt="<?= htmlspecialchars($product['product_name']) ?>">
                                </div>
                            </td>
                            <td class="p-4">
                                <?php if ($product['type'] === 'variant'): ?>
                                    <span class="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">درجة منتج</span>
                                <?php else: ?>
                                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">منتج أساسي</span>
                                <?php endif; ?>
                            </td>
                            <td class="p-4">
                                <div class="font-bold text-gray-800"><?= htmlspecialchars($product['product_name']) ?></div>
                                <?php if ($product['variant_name']): ?>
                                    <div class="text-sm text-purple-600 mt-1">الدرجة: <?= htmlspecialchars($product['variant_name']) ?></div>
                                <?php endif; ?>
                            </td>
                            <td class="p-4">
                                <span class="text-gray-600 font-mono"><?= htmlspecialchars($product['barcode'] ?? '—') ?></span>
                            </td>
                            <td class="p-4">
                                <?php
                                $stock = intval($product['stock']);
                                $stock_class = $stock < 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
                                ?>
                                <span class="inline-block px-3 py-1 <?= $stock_class ?> rounded-full text-sm font-bold">
                                    <?= htmlspecialchars($stock) ?>
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    <?= htmlspecialchars($product['parent_section']) ?> / <?= htmlspecialchars($product['category_name']) ?>
                                </span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <?php if (empty($low_stock_products)): ?>
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-check-circle text-4xl mb-4 opacity-50"></i>
                    <p class="text-xl">لا توجد منتجات ذات مخزون منخفض</p>
                    <p class="text-sm mt-2">جميع المنتجات والدرجات لديها مخزون كافٍ</p>
                </div>
                <?php endif; ?>
            </div>
            
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div class="flex items-start gap-3">
                    <i class="fas fa-info-circle text-blue-500 text-lg mt-1"></i>
                    <div>
                        <h4 class="font-bold text-blue-800 mb-2">معلومات المخزون المنخفض</h4>
                        <p class="text-blue-700 text-sm">
                            هذه قائمة قراءة فقط تعرض المنتجات والدرجات التي يقل مخزونها عن <?= $low_stock_threshold ?> قطع.
                            يمكنك استخدام لوحة التحكم الرئيسية لإدارة المخزون وإضافة كميات جديدة.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="customers-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl transform transition-all scale-95 opacity-0 max-h-[90vh] flex flex-col" id="customers-modal-content">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-users text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">تقرير العملاء</h2>
            </div>
            <button onclick="closeCustomersModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <div class="mb-4 p-4 bg-gray-100 rounded-2xl border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-2 grid grid-cols-2 gap-2 items-center">
                        <div>
                            <label for="customer-from-date" class="block mb-1 text-xs font-semibold text-gray-600">من تاريخ</label>
                            <input type="date" id="customer-from-date" class="form-input text-sm">
                        </div>
                        <div>
                            <label for="customer-to-date" class="block mb-1 text-xs font-semibold text-gray-600">إلى تاريخ</label>
                            <input type="date" id="customer-to-date" class="form-input text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                        <button onclick="setCustomerDates('today')" class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">اليوم</button>
                        <button onclick="setCustomerDates('week')" class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">الأسبوع</button>
                        <button onclick="setCustomerDates('month')" class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">الشهر</button>
                        <button onclick="setCustomerDates('all')" class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300">الكل</button>
                    </div>
                </div>
                 <button id="filter-customers-btn" onclick="loadCustomersData()" class="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600">
                    <i class="fas fa-filter ml-2"></i>تطبيق الفلتر
                </button>
            </div>
            <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div class="flex items-start gap-3">
                    <i class="fas fa-info-circle text-blue-500 text-lg mt-1"></i>
                    <div>
                        <h4 class="font-bold text-blue-800 mb-1">تقرير العملاء</h4>
                        <p class="text-blue-700 text-sm">
                            هذه القائمة تعرض العملاء مرتبين حسب إجمالي قيمة فواتيرهم (التي تم تسليمها "Completed" فقط).
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="overflow-x-auto" id="customers-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                    <p class="mt-4 text-gray-600">جاري تحميل بيانات العملاء...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Coupon Management Modal -->
<div id="coupons-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-t-3xl flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-percentage text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">إدارة كوبونات الخصم</h2>
            </div>
            <button onclick="closeCouponsModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto flex-grow">
            <div class="mb-4 flex justify-between items-center">
                <h3 class="text-lg font-bold text-gray-800">قائمة الكوبونات</h3>
                <button type="button" onclick="openAddCouponForm()" 
                        class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:from-purple-600 hover:to-indigo-700 transition">
                    <i class="fas fa-plus ml-1"></i> إضافة كوبون
                </button>
            </div>

            <!-- Form to Add/Edit Coupon (Hidden by default) -->
            <div id="add-coupon-form-container" class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hidden">
                <h4 class="font-bold text-gray-800 mb-3">كوبون جديد</h4>
                <form id="add-coupon-form">
                    <input type="hidden" id="coupon-id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <label class="block mb-1 text-sm font-semibold text-gray-700">الاسم الوصفي</label>
                            <input type="text" id="coupon-name" class="form-input" placeholder="مثال: كوبون العيد" required>
                        </div>
                        <div>
                            <label class="block mb-1 text-sm font-semibold text-gray-700">الكود</label>
                            <input type="text" id="coupon-code" class="form-input" placeholder="CHR2026" required>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                            <label class="block mb-1 text-sm font-semibold text-gray-700">نوع الخصم</label>
                            <select id="coupon-discount-type" class="form-input" required>
                                <option value="percentage">نسبة مئوية</option>
                                <option value="fixed">مبلغ ثابت</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-sm font-semibold text-gray-700">قيمة الخصم</label>
                            <input type="number" id="coupon-discount-value" step="0.01" min="0" class="form-input" required>
                        </div>
                        <div>
                            <label class="block mb-1 text-sm font-semibold text-gray-700">صلاحية حتى</label>
                            <input type="date" id="coupon-expiry-date" class="form-input" required>
                        </div>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" onclick="closeAddCouponForm()" class="px-4 py-2 bg-gray-200 rounded-lg text-sm">إلغاء</button>
                        <button type="submit" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-bold">حفظ</button>
                    </div>
                </form>
            </div>

            <!-- Coupons List -->
            <div id="coupons-list" class="space-y-3">
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-xl"></i>
                    <p class="mt-2">جاري تحميل الكوبونات...</p>
                </div>
            </div>
        </div>
    </div>
</div>



<!-- زر عائم للوصول السريع لاستيراد CSV -->
<a href="csv_import.php" 
   target="_blank"
   class="fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center z-50 group"
   title="استيراد منتجات من CSV">
    <i class="fas fa-file-csv text-2xl group-hover:scale-110 transition-transform"></i>
    <span class="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        استيراد CSV
    </span>
</a>

<!-- <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl shadow-lg p-6 mb-6">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-file-csv text-white text-2xl"></i>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-800 mb-1">استيراد جماعي من CSV</h3>
                <p class="text-sm text-gray-600">أضف مئات المنتجات بضغطة واحدة</p>
            </div>
        </div>
        <a href="csv_import.php" 
           class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2">
            <i class="fas fa-upload"></i>
            <span>رفع CSV</span>
        </a>
    </div> -->
</div>

    <!-- Edit Product Modal -->
    <div id="edit-product-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl transform transition-all scale-95 opacity-0 max-h-[95vh] flex flex-col" id="modal-content">
            <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-edit text-white"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white">تعديل المنتج</h2>
                </div>
                <button onclick="closeEditModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 overflow-y-auto">
                <form id="edit-product-form" enctype="multipart/form-data">
                    <input type="hidden" name="action" value="update_product">
                    <input type="hidden" id="edit-product-id" name="id">
                    
                    <!-- Product Basic Information -->
                    <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <i class="fas fa-info-circle text-blue-600"></i>
                            المعلومات الأساسية للمنتج
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label for="edit-product-name" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-tag text-pink-500 ml-2"></i>اسم المنتج
                                </label>
                                <input type="text" id="edit-product-name" name="name" class="form-input" required>
                            </div>
                            <div class="md:col-span-2">
                                <label for="edit-product-description" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-align-right text-pink-500 ml-2"></i>الوصف
                                </label>
                                <textarea id="edit-product-description" name="description" class="form-input" rows="3"></textarea>
                            </div>
                            <div>
                                <label for="edit-product-price" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-dollar-sign text-green-500 ml-2"></i>السعر الأساسي ($)
                                </label>
                                <input type="number" id="edit-product-price" name="price" class="form-input" step="0.01" required>
                            </div>
                            <div>
                                <label for="edit-product-category" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-folder text-yellow-500 ml-2"></i>القسم
                                </label>
                                <select id="edit-product-category" name="category_id" class="form-input" required>
                                    <?php foreach($categories as $cat): ?>
                                    <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['parent_section'] . ' → ' . $cat['name']) ?></option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label for="edit-product-image" class="block mb-2 text-sm font-semibold text-gray-700">
                                    <i class="fas fa-image text-indigo-500 ml-2"></i>تغيير الصورة الرئيسية (اختياري)
                                </label>
                                <input type="file" id="edit-product-image" name="image" class="form-input">
                                <div id="edit-current-image" class="mt-2"></div>
                            </div>
                        </div>
                    </div>



<!-- تحديد كمنتج جديد - Edit -->
<div class="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-star text-amber-500"></i>
        تحديد كمنتج جديد
    </h3>
    
    <div class="space-y-4">
        <div class="flex items-start gap-3">
            <input type="checkbox" id="edit-product-is-new" name="is_new" value="1" 
                   class="form-checkbox h-5 w-5 text-amber-600 mt-1"
                   onchange="toggleEditNewUntilField()">
            <div class="flex-1">
                <label for="edit-product-is-new" class="text-sm font-semibold text-gray-800 cursor-pointer">
                    منتج جديد ⭐
                </label>
                <p class="text-xs text-gray-600 mt-1">
                    عند التفعيل، سيظهر هذا المنتج في قسم "أحدث المنتجات"
                </p>
            </div>
        </div>

        <div id="edit-new-until-container" class="hidden">
            <label for="edit-product-new-until" class="block mb-2 text-sm font-semibold text-gray-700">
                <i class="fas fa-calendar-alt text-amber-500 ml-2"></i>
                صالح حتى تاريخ (اختياري)
            </label>
            <input type="date" id="edit-product-new-until" name="new_until" class="form-input">
        </div>
    </div>
</div>


                    <!-- Product Variants Management -->
                    <div class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <i class="fas fa-palette text-purple-600"></i>
                                إدارة درجات المنتج
                            </h3>
                            <div class="flex items-center gap-3">
                                <label class="inline-flex items-center">
                                    <input type="checkbox" id="edit-product-has-variants" name="has_variants" value="1" class="form-checkbox h-5 w-5 text-indigo-600">
                                    <span class="mr-2 text-sm font-medium">هذا المنتج يحتوي على درجات</span>
                                </label>
                            </div>
                        </div>
                        
                        <div id="edit-has-variants-note" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4" style="display:none;">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-info-circle text-yellow-500 text-lg mt-1"></i>
                                <div>
                                    <h4 class="font-bold text-yellow-800 mb-1">ملاحظة مهمة</h4>
                                    <p class="text-yellow-700 text-sm">لأن لهذا المنتج درجات، يتم إدارة الباركود والمخزون لكل درجة منفصلة. سيتم تعطيل الحقول الأساسية للمنتج.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Product-level fields (disabled when has variants) -->
                        <div id="edit-product-basic-fields" class="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="edit-product-stock" class="block mb-2 text-sm font-semibold text-gray-700">
                                        <i class="fas fa-cubes text-blue-500 ml-2"></i>الكمية الأساسية
                                    </label>
                                    <input type="number" id="edit-product-stock" name="stock" class="form-input" required>
                                </div>
                                <div>
                                    <label for="edit-product-barcode" class="block mb-2 text-sm font-semibold text-gray-700">
                                        <i class="fas fa-barcode text-purple-500 ml-2"></i>الباركود الأساسي
                                    </label>
                                    <input type="text" id="edit-product-barcode" name="barcode" class="form-input">
                                </div>
                            </div>
                        </div>

                        <!-- Variants Section -->
                        <div id="edit-variants-section" class="mt-4" style="display:none;">
                            <div class="flex justify-between items-center mb-4">
                                <h4 class="text-lg font-semibold text-gray-700">قائمة الدرجات</h4>
                                <button type="button" id="edit-add-variant-btn" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-bold shadow hover:from-purple-600 hover:to-pink-700 transition-all">
                                    <i class="fas fa-plus ml-2"></i>إضافة درجة جديدة
                                </button>
                            </div>
                            
                            <div id="edit-variants-list" class="space-y-4 max-h-96 overflow-y-auto p-2">
                                <!-- Variants will be loaded here dynamically -->
                            </div>
                            
                            <div id="edit-no-variants-message" class="text-center py-8 text-gray-500">
                                <i class="fas fa-inbox text-4xl mb-3 opacity-50"></i>
                                <p>لا توجد درجات مضافة بعد</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button type="button" onclick="closeEditModal()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105">
                            <i class="fas fa-times ml-2"></i>إلغاء
                        </button>
                        <button type="submit" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105">
                            <i class="fas fa-save ml-2"></i>حفظ التعديلات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>




<!-- Products Modal -->
<div id="products-modal" class="fixed inset-0 bg-black bg-opacity-60 z-[80] hidden flex items-center justify-center p-4">
    <div id="products-modal-content" class="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden scale-95 opacity-0 transition-transform duration-300">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 class="text-xl font-bold text-gray-800">جميع المنتجات</h2>
            <button onclick="closeProductsModal()" class="text-gray-500 hover:text-gray-800">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>
        <div class="overflow-y-auto max-h-[70vh] p-4">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="p-4 text-right text-sm font-bold text-gray-700"><i class="fas fa-image text-gray-400 ml-2"></i>الصورة</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700"><i class="fas fa-box text-gray-400 ml-2"></i>المنتج</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700"><i class="fas fa-folder text-gray-400 ml-2"></i>القسم</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700"><i class="fas fa-dollar-sign text-gray-400 ml-2"></i>السعر</th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700"><i class="fas fa-cubes text-gray-400 ml-2"></i>المخزون</th>
                            <th class="p-4 text-center text-sm font-bold text-gray-700"><i class="fas fa-cogs text-gray-400 ml-2"></i>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="products-modal-table-body">
                        <!-- سيتم ملؤه ديناميكياً -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>




    <!-- Edit Category Modal -->
    <div id="edit-category-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all scale-95 opacity-0" id="category-modal-content">
            <div class="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-t-3xl flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-edit text-white"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white">تعديل القسم</h2>
                </div>
                <button onclick="closeEditCategoryModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="edit-category-form" class="p-6">
                <input type="hidden" name="action" value="update_category">
                <input type="hidden" id="edit-category-id" name="id">
                <div class="mb-4">
                    <label for="edit-category-name" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-tag text-purple-500 ml-2"></i>اسم القسم
                    </label>
                    <input type="text" id="edit-category-name" name="name" class="form-input" required>
                </div>
                <div class="mb-6">
                    <label for="edit-parent-section" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-sitemap text-purple-500 ml-2"></i>القسم الرئيسي
                    </label>
                    <select id="edit-parent-section" name="parent_section" class="form-input" required>
    <?php foreach($parent_sections as $ps): ?>
        <?php if ($ps['is_active']): ?>
        <option value="<?= htmlspecialchars($ps['slug']) ?>">
            <?= htmlspecialchars($ps['name']) ?>
        </option>
        <?php endif; ?>
    <?php endforeach; ?>
</select>
                </div>
                <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button type="button" onclick="closeEditCategoryModal()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all">
                        <i class="fas fa-times ml-2"></i>إلغاء
                    </button>
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                        <i class="fas fa-save ml-2"></i>حفظ التعديلات
                    </button>
                </div>
            </form>
        </div>
    </div>

<!-- Edit Parent Section Modal -->
<div id="edit-parent-section-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all scale-95 opacity-0" id="parent-section-modal-content">
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-3xl flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-edit text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">تعديل القسم الرئيسي</h2>
            </div>
            <button onclick="closeEditParentSectionModal()" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <form id="edit-parent-section-form" class="p-6" enctype="multipart/form-data">
            <input type="hidden" name="action" value="update_parent_section">
            <input type="hidden" id="edit-parent-section-id" name="id">
            <input type="hidden" id="edit-parent-section-icon" name="icon" value="fa-box">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="edit-parent-section-name" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-tag text-indigo-500 ml-2"></i>اسم القسم الرئيسي
                    </label>
                    <input type="text" id="edit-parent-section-name" name="name" class="form-input" required>
                </div>
                <div>
                    <label for="edit-parent-section-slug" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-link text-indigo-500 ml-2"></i>الرمز (Slug)
                    </label>
                    <input type="text" id="edit-parent-section-slug" name="slug" class="form-input" required>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
    <label class="block mb-2 text-sm font-semibold text-gray-700">
        <i class="fas fa-image text-indigo-500 ml-2"></i>تغيير الأيقونة (SVG/PNG)
    </label>
    <input type="file" id="edit-parent-section-icon-file" name="icon_file" class="form-input" accept=".svg,.png,.jpg,.jpeg">
    <div id="edit-current-icon-preview" class="mt-2"></div>
</div>
                <div>
                    <label for="edit-parent-section-order" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-sort-numeric-down text-indigo-500 ml-2"></i>ترتيب العرض
                    </label>
                    <input type="number" id="edit-parent-section-order" name="display_order" class="form-input" min="0">
                </div>
            </div>
            
            <div class="mb-4">
                <label for="edit-parent-section-description" class="block mb-2 text-sm font-semibold text-gray-700">
                    <i class="fas fa-align-right text-indigo-500 ml-2"></i>الوصف
                </label>
                <textarea id="edit-parent-section-description" name="description" class="form-input" rows="2"></textarea>
            </div>
            
            <div class="mb-6">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="edit-parent-section-active" name="is_active" value="1" class="form-checkbox h-5 w-5 text-indigo-600">
                    <span class="text-sm font-semibold text-gray-700">القسم نشط</span>
                </label>
            </div>
            
            <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button type="button" onclick="closeEditParentSectionModal()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all">
                    <i class="fas fa-times ml-2"></i>إلغاء
                </button>
                <button type="submit" class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                    <i class="fas fa-save ml-2"></i>حفظ التعديلات
                </button>
            </div>
        </form>
    </div>
</div>







<!-- Purchase Invoice Modal -->
<div id="purchase-invoice-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl transform transition-all scale-95 opacity-0 max-h-[95vh] flex flex-col" id="purchase-invoice-modal-content">
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <i class="fas fa-file-invoice-dollar text-white"></i>
                </div>
                <h2 class="text-2xl font-bold text-white">فاتورة مشتريات جديدة</h2>
            </div>
            <button onclick="closePurchaseInvoiceModal()" class="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-xl transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-6 overflow-y-auto">
            <form id="purchase-invoice-form">
                <input type="hidden" name="action" value="create_purchase_invoice">
                
                <!-- Invoice Header -->
                <div class="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i class="fas fa-info-circle text-green-600"></i>
                        معلومات الفاتورة
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="supplier-name" class="block mb-2 text-sm font-semibold text-gray-700">
                                <i class="fas fa-truck text-green-500 ml-2"></i>اسم المورد
                            </label>
                            <input type="text" id="supplier-name" name="supplier_name" class="form-input" placeholder="اسم المورد (اختياري)">
                        </div>
                        <div>
                            <label for="invoice-date" class="block mb-2 text-sm font-semibold text-gray-700">
                                <i class="fas fa-calendar text-green-500 ml-2"></i>تاريخ الفاتورة
                            </label>
                            <input type="date" id="invoice-date" name="invoice_date" class="form-input" value="<?= date('Y-m-d') ?>" required>
                        </div>
                    </div>
                    <div class="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-2 text-sm font-semibold text-gray-700">
                                <i class="fas fa-coins text-blue-500 ml-2"></i>عملة الفاتورة
                            </label>
                            <select name="currency" id="invoice-currency" class="form-input" onchange="updateInvoiceCurrencyDisplay()">
                                <option value="USD">دولار أمريكي ($)</option>
                                <option value="SYP">ليرة سورية (SYP)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-2 text-sm font-semibold text-gray-700">
                                <i class="fas fa-exchange-alt text-blue-500 ml-2"></i>سعر الصرف للفاتورة
                            </label>
                            <input type="number" name="exchange_rate" id="invoice-exchange-rate" class="form-input" 
                                   value="<?= htmlspecialchars($usd_exchange_rate ?? 15000) ?>" step="1" min="1">
                            <p class="text-xs text-gray-500 mt-1">سيتم تحويل الأسعار المدخلة إلى دولار بناءً على هذا السعر.</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <label for="invoice-notes" class="block mb-2 text-sm font-semibold text-gray-700">
                            <i class="fas fa-sticky-note text-green-500 ml-2"></i>ملاحظات
                        </label>
                        <textarea id="invoice-notes" name="notes" class="form-input" rows="2" placeholder="ملاحظات إضافية..."></textarea>
                    </div>
                </div>



                <!-- Variant Selection Modal -->
                <div id="variant-selection-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-95 opacity-0" id="variant-modal-content">
                        <div class="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 rounded-t-2xl flex justify-between items-center">
                            <h2 class="text-xl font-bold text-white">اختر درجة المنتج</h2>
                            <button onclick="closeVariantSelectionModal()" class="text-white hover:text-gray-200">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="p-5 max-h-96 overflow-y-auto" id="variant-options-list">
                            <!-- سيتم تعبئته ديناميكيًا -->
                        </div>
                    </div>
                </div>

                <!-- Add Items Section -->
                <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-cart-plus text-blue-600"></i>
                        إضافة المواد
                    </h3>
                    <div class="flex gap-2">
                        <button type="button" onclick="clearInvoice()"
                                class="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2">
                            <i class="fas fa-trash"></i>
                            <span>مسح الفاتورة</span>
                        </button>
                        <button type="button" onclick="openAddProductModal(true)" 
                                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2">
                            <i class="fas fa-plus-circle"></i>
                            <span>إضافة منتج</span>
                        </button>
                    </div>
                </div>
                <!-- Search Input -->
                <div class="mb-4">
                    <label class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-search text-blue-500 ml-2"></i>ابحث بالاسم أو الباركود
                    </label>
                    <div class="relative">
                        <div class="relative flex items-center">
                <input type="text" id="product-search" class="form-input flex-1 pr-10" placeholder="اكتب اسم المنتج أو امسح الباركود...">
                    </div>
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"></i>
                        <div id="search-results" class="absolute top-full left-0 right-0 bg-white border border-blue-200 mt-1 rounded-xl shadow-lg z-10 hidden max-h-60 overflow-y-auto"></div>
                    </div>
                </div>
                <!-- Items List with Header -->
                <div id="invoice-items-section" class="mt-4">
                    <!-- Header Row -->
                <div class="hidden sm:grid grid-cols-[2fr_40px_40px_40px_60px_60px_60px_60px_40px] gap-2 text-xs font-bold text-gray-600 mb-2 px-2">
                    <div class="text-right">المنتج</div>
                    <div class="text-center" title="الباركود"><i class="fas fa-barcode text-xs"></i></div>
                    <div class="text-center">المخزون الحالي</div>
                    <div class="text-center">المخزون بعد</div>
                    <div class="text-center">الكمية</div>
                    <div class="text-center">الهدايا</div>
                    <div class="text-center">السعر السابق</div>
                    <div class="text-center">السعر الحالي</div>
                    <div class="text-center"></div> <!-- delete -->
                </div>
                <div id="invoice-items-list" class="space-y-1 max-h-64 overflow-y-auto mb-3">
                    <!-- سيتم تعبئته ديناميكيًا -->
                </div>
                <div id="no-items-message" class="text-center py-3 text-gray-500 text-sm">
                    <i class="fas fa-shopping-cart text-lg opacity-50 mr-1"></i>
                    لم تُضف أي مواد بعد
                </div>
                </div>

                <!-- Summary (Compact & Visually Coherent) -->
                <div class="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm">
                <h3 class="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-calculator text-purple-600 text-xs"></i>
                    ملخص الفاتورة
                </h3>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div class="flex justify-between">
                    <span class="text-gray-600">المواد:</span>
                    <span class="font-bold text-purple-700" id="items-count">0</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">الكمية:</span>
                    <span class="font-bold text-purple-700" id="total-quantity">0</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">التكلفة:</span>
                    <span class="font-bold text-green-700" id="total-cost">$0.00</span>
                    </div>
                </div>
                </div>

                <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button type="button" onclick="closePurchaseInvoiceModal()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105">
                        <i class="fas fa-times ml-2"></i>إلغاء
                    </button>
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105">
                        <i class="fas fa-save ml-2"></i>حفظ الفاتورة
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>