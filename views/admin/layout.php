<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم المتقدمة</title>
    <link rel="icon" type="image/png" href="/msbeauty/icons/admin.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/msbeauty/assets/css/fontawesome/all.min.css">
    <link rel="stylesheet" href="/msbeauty/style.css">
    <link rel="stylesheet" href="/msbeauty/public/css/admin.css">
</head>
<body class="bg-gray-50">
   <?php include __DIR__ . '/partials/header.php'; ?>
    <main class="container mx-auto px-4 md:px-6 py-8">
    <?php include __DIR__ . '/partials/statistics.php'; ?>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <!-- Add Product Button -->
<div class="lg:col-span-1">
  <button onclick="openAddProductModal()" class="w-full h-full bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col items-start justify-center card-hover">
    <div class="flex flex-row items-center w-full gap-3">
      <div class="mr-3 w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
        <i class="fas fa-plus text-xl"></i>
      </div>
      <h2 class="text-xl font-bold">إضافة منتج جديد</h2>
    </div>
   <!-- <p class="text-sm text-pink-100 pr-16">انقر هنا لإضافة منتج للمخزون</p> --> 
  </button>
</div>



<!-- Manage Parent Sections Card (NEW) -->
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div class="flex items-center justify-between p-6 collapsible-header" onclick="toggleSection('manage-parent-sections')">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-layer-group text-white"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800">إدارة الأقسام الرئيسية</h2>
        </div>
        <i class="fas fa-chevron-down text-gray-500 transition-transform" id="manage-parent-sections-icon"></i>
    </div>
    <div id="manage-parent-sections-content" class="transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0; overflow: hidden;">
        <div class="p-6">
            <!-- Add Parent Section Form -->
            <form id="add-parent-section-form" class="mb-6" enctype="multipart/form-data">
                <input type="hidden" name="action" value="add_parent_section">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="parent-section-name" class="block mb-2 text-sm font-semibold text-gray-700">
                            <i class="fas fa-tag text-indigo-500 ml-2"></i>اسم القسم الرئيسي
                        </label>
                        <input type="text" id="parent-section-name" name="name" class="form-input" placeholder="مثال: MS-Electronics" required>
                    </div>
                    <div>
                        <label for="parent-section-slug" class="block mb-2 text-sm font-semibold text-gray-700">
                            <i class="fas fa-link text-indigo-500 ml-2"></i>الرمز (Slug)
                        </label>
                        <input type="text" id="parent-section-slug" name="slug" class="form-input" placeholder="ms-electronics" required>
                        <p class="text-xs text-gray-500 mt-1">يستخدم في الروابط (حروف صغيرة وشرطات فقط)</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
    <label for="parent-section-icon-file" class="block mb-2 text-sm font-semibold text-gray-700">
        <i class="fas fa-image text-indigo-500 ml-2"></i>أيقونة مخصصة (SVG/PNG)
    </label>
    <input type="file" id="parent-section-icon-file" name="icon_file" class="form-input" accept=".svg,.png,.jpg,.jpeg">
    <p class="text-xs text-gray-500 mt-1">الصيغ المدعومة: SVG, PNG, JPG (يُفضّل SVG للوضوح)</p>
</div>
                    <div>
                        <label for="parent-section-order" class="block mb-2 text-sm font-semibold text-gray-700">
                            <i class="fas fa-sort-numeric-down text-indigo-500 ml-2"></i>ترتيب العرض
                        </label>
                        <input type="number" id="parent-section-order" name="display_order" class="form-input" value="0" min="0">
                    </div>
                </div>
                <div class="mb-4">
                    <label for="parent-section-description" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-align-right text-indigo-500 ml-2"></i>الوصف (اختياري)
                    </label>
                    <textarea id="parent-section-description" name="description" class="form-input" rows="2" placeholder="وصف مختصر للقسم..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-full py-3 text-lg">
                    <i class="fas fa-plus-circle ml-2"></i>إضافة القسم الرئيسي
                </button>
            </form>

            <!-- Current Parent Sections List -->
            <div class="pt-6 border-t border-gray-200">
                <h3 class="text-sm font-bold text-gray-700 mb-3">الأقسام الرئيسية الحالية:</h3>
                <div class="max-h-96 overflow-y-auto space-y-2">
                    <?php foreach($parent_sections as $ps): ?>
                    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100" id="parent-section-item-<?= $ps['id'] ?>">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
    <?php if (!empty($ps['icon_file']) && file_exists($ps['icon_file'])): ?>
        <img src="<?= htmlspecialchars($ps['icon_file']) ?>" class="w-6 h-6 object-contain" alt="Icon">
    <?php else: ?>
        <i class="fas fa-folder text-gray-500 text-sm"></i>
    <?php endif; ?>
</div>
                                <div>
                                    <span class="font-bold text-indigo-700 text-base" id="ps-name-<?= $ps['id'] ?>"><?= htmlspecialchars($ps['name']) ?></span>
                                    <div class="text-xs text-gray-500 mt-1">
                                        <span class="bg-gray-100 px-2 py-0.5 rounded">Slug: <?= htmlspecialchars($ps['slug']) ?></span>
                                        <span class="bg-gray-100 px-2 py-0.5 rounded ml-2">ترتيب: <?= $ps['display_order'] ?></span>
                                        <?php if ($ps['is_active']): ?>
                                        <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">نشط</span>
                                        <?php else: ?>
                                        <span class="bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2">معطل</span>
                                        <?php endif; ?>
                                    </div>
                                    <?php if ($ps['description']): ?>
                                    <p class="text-xs text-gray-600 mt-1"><?= htmlspecialchars($ps['description']) ?></p>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button onclick='openEditParentSectionModal(<?= json_encode($ps) ?>)' class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition-all">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteParentSection(<?= $ps['id'] ?>)" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition-all">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>


<!-- Lucky Product Card -->
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div class="flex items-center justify-between p-6 collapsible-header" onclick="toggleSection('lucky-product')">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-gift text-white"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800">منتج الحظ</h2>
        </div>
        <i class="fas fa-chevron-down text-gray-500 transition-transform" id="lucky-product-icon"></i>
    </div>
    <div id="lucky-product-content" class="transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0; overflow: hidden;">
        <div class="p-6">
            <?php
            // جلب منتج الحظ النشط
            $lucky_stmt = $mysqli->prepare("
                SELECT lp.*, p.name as product_name 
                FROM lucky_product lp 
                JOIN products p ON lp.product_id = p.id 
                WHERE lp.active_from <= NOW() AND lp.active_to >= NOW()
                ORDER BY lp.id DESC LIMIT 1
            ");
            $lucky_stmt->execute();
            $lucky_result = $lucky_stmt->get_result();
            $current_lucky = $lucky_result->fetch_assoc();
            $lucky_stmt->close();
            ?>

            <?php if ($current_lucky): ?>
                <div class="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                    <h3 class="font-bold text-gray-800 mb-2">المنتج الحالي:</h3>
                    <p class="text-sm"><strong><?= htmlspecialchars($current_lucky['product_name']) ?></strong></p>
                    <p class="text-sm">خصم: <?= $current_lucky['discount_percent'] ?>%</p>
                    <p class="text-xs text-gray-600">من <?= date('Y-m-d', strtotime($current_lucky['active_from'])) ?> إلى <?= date('Y-m-d', strtotime($current_lucky['active_to'])) ?></p>
                    <div class="mt-3 flex gap-2">
                        <button onclick="disableLuckyProduct(<?= $current_lucky['id'] ?>)" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs">
                            تعطيل
                        </button>
                        <button onclick='openLuckyProductModal(<?= json_encode($current_lucky) ?>)' class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs">
    تغيير
</button>
                    </div>
                </div>
            <?php else: ?>
                <div class="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                    <p class="text-gray-600">لا يوجد منتج حظ نشط حاليًا.</p>
                </div>
            <?php endif; ?>

            <button onclick="openLuckyProductModal()" class="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-bold shadow">
                <?= $current_lucky ? 'تعيين منتج حظ جديد' : 'تعيين منتج الحظ' ?>
            </button>
        </div>
    </div>
</div>


            <!-- تحديث Manage Categories Card - استخدام الأقسام الرئيسية الديناميكية -->
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div class="flex items-center justify-between p-6 collapsible-header" onclick="toggleSection('manage-categories')">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-folder-tree text-white"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800">إدارة الأقسام الفرعية</h2>
        </div>
        <i class="fas fa-chevron-down text-gray-500 transition-transform" id="manage-categories-icon"></i>
    </div>
    <div id="manage-categories-content" class="transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0; overflow: hidden;">
        <div class="p-6">
            <form id="add-category-form" class="mb-6">
                <input type="hidden" name="action" value="add_category">
                <div class="mb-4">
                    <label for="category-name" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-tag text-purple-500 ml-2"></i>اسم القسم الفرعي
                    </label>
                    <input type="text" id="category-name" name="name" class="form-input" placeholder="أدخل اسم القسم" required>
                </div>
                <div class="mb-4">
                    <label for="parent-section" class="block mb-2 text-sm font-semibold text-gray-700">
                        <i class="fas fa-sitemap text-purple-500 ml-2"></i>القسم الرئيسي
                    </label>
                    <select id="parent-section" name="parent_section" class="form-input" required>
                        <?php foreach($parent_sections as $ps): ?>
                            <?php if ($ps['is_active']): ?>
                            <option value="<?= htmlspecialchars($ps['slug']) ?>">
                                <?= htmlspecialchars($ps['name']) ?>
                            </option>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-full py-3 text-lg">
                    <i class="fas fa-folder-plus ml-2"></i>إضافة القسم
                </button>
            </form>
            
            <!-- الأقسام الحالية مجمعة حسب القسم الرئيسي -->
            <div class="pt-6 border-t border-gray-200">
                <h3 class="text-sm font-bold text-gray-700 mb-3">الأقسام الفرعية الحالية:</h3>
                <div class="max-h-96 overflow-y-auto space-y-3">
                    <?php 
                    // تجميع الأقسام حسب القسم الرئيسي
                    $grouped_categories = [];
                    foreach($categories as $cat) {
                        $grouped_categories[$cat['parent_section']][] = $cat;
                    }
                    
                    foreach($parent_sections as $ps):
                        if (isset($grouped_categories[$ps['slug']])):
                    ?>
                    <div class="bg-gray-50 p-3 rounded-xl">
                        <h4 class="font-bold text-indigo-700 mb-2 flex items-center gap-2">
    <?php if (!empty($ps['icon_file']) && file_exists($ps['icon_file'])): ?>
        <img src="<?= htmlspecialchars($ps['icon_file']) ?>" class="w-5 h-5 object-contain" alt="Icon">
    <?php else: ?>
        <i class="fas <?= htmlspecialchars($ps['icon'] ?? 'fa-folder') ?>"></i>
    <?php endif; ?>
    <?= htmlspecialchars($ps['name']) ?>
</h4>
                        <div class="space-y-2">
                            <?php foreach($grouped_categories[$ps['slug']] as $cat): ?>
                            <div class="bg-white p-3 rounded-lg" id="category-item-<?= $cat['id'] ?>">
                                <div class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <span class="text-gray-700 font-medium text-sm" id="cat-name-<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></span>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick='openEditCategoryModal(<?= json_encode($cat) ?>)' class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition-all">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteCategory(<?= $cat['id'] ?>)" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition-all">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php 
                        endif;
                    endforeach; 
                    ?>
                </div>
            </div>
        </div>
    </div>
</div>


            <!-- Shop Settings Card (Collapsible) -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div class="flex items-center justify-between p-6 collapsible-header" onclick="toggleSection('shop-settings')">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <i class="fas fa-cog text-white"></i>
                        </div>
                        <h2 class="text-xl font-bold text-gray-800">إعدادات المتجر</h2>
                    </div>
                    <i class="fas fa-chevron-down text-gray-500 transition-transform" id="shop-settings-icon"></i>
                </div>
                <div id="shop-settings-content" class="transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0; overflow: hidden;">
                    <div class="p-6">
                        <form id="settings-form">
                            <input type="hidden" name="action" value="update_settings">

<div class="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 shadow-sm">
                                <label class="block mb-3 font-bold text-gray-800 flex items-center gap-2">
                                    <i class="fas fa-money-bill-wave text-yellow-600"></i>
                                    سعر الصرف اليومي (للعرض)
                                </label>
                                <div class="flex-1 items-center gap-4">
                                    <div class="flex-1">
                                        <label class="block text-sm font-semibold text-gray-700 mb-1">1 دولار أمريكي = </label>
                                        <div class="relative">
                                            <input type="number" name="usd_exchange_rate" class="form-input pl-16" 
                                                   value="<?= htmlspecialchars($usd_exchange_rate ?? 15000) ?>" 
                                                   step="50" min="1" required>
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span class="text-gray-500 font-bold text-sm">ل.س</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600 bg-white p-3 rounded-lg border border-yellow-100 flex-1 mt-3">
                                        <i class="fas fa-info-circle text-yellow-500 ml-1"></i>
                                        سيتم استخدام هذا السعر لعرض الأسعار بالليرة السورية للزبائن في واجهة المتجر.
                                    </div>
                                </div>
                            </div>

                            <!-- Discount Settings (Enhanced) -->
<div class="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
    <label class="block mb-3 font-bold text-gray-800">
        <i class="fas fa-percent text-green-600 ml-2"></i>إعدادات الخصم
    </label>

    <!-- نوع الخصم -->
    <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">نوع الخصم</label>
        <select id="discount-type" name="discount_type" class="form-input">
            <option value="global" <?= ($current_settings['discount_type'] ?? 'global') == 'global' ? 'selected' : '' ?>>شامل على المتجر</option>
            <option value="parent_section" <?= ($current_settings['discount_type'] ?? '') == 'parent_section' ? 'selected' : '' ?>>على قسم رئيسي</option>
            <option value="category" <?= ($current_settings['discount_type'] ?? '') == 'category' ? 'selected' : '' ?>>على قسم فرعي</option>
        </select>
    </div>

    <!-- قيمة الخصم -->
    <div class="mb-3">
        <label class="block text-sm font-semibold text-gray-700 mb-1">نسبة الخصم (%)</label>
        <input type="number" name="discount_value" class="form-input" value="<?= htmlspecialchars($current_settings['discount_value'] ?? '0') ?>" min="0" max="100" step="1">
    </div>

    <!-- القسم الرئيسي (يظهر عند الاختيار) -->
    <div id="discount-parent-section-field" class="mb-3" style="display: <?= ($current_settings['discount_type'] ?? 'global') == 'parent_section' ? 'block' : 'none' ?>;">
        <label class="block text-sm font-semibold text-gray-700 mb-1">اختر القسم الرئيسي</label>
        <select name="discount_target_id" class="form-input">
            <?php foreach($parent_sections as $ps): ?>
                <?php if ($ps['is_active']): ?>
                <option value="<?= htmlspecialchars($ps['slug']) ?>" <?= ($current_settings['discount_target_id'] ?? '') == $ps['slug'] ? 'selected' : '' ?>>
                    <?= htmlspecialchars($ps['name']) ?>
                </option>
                <?php endif; ?>
            <?php endforeach; ?>
        </select>
    </div>


<!-- القسم الفرعي (يظهر عند الاختيار) -->
<div id="discount-category-field" class="mb-3" style="display: <?= ($current_settings['discount_type'] ?? 'global') == 'category' ? 'block' : 'none' ?>;">
    <select name="discount_target_id" class="form-input">
        <?php foreach($categories as $cat): ?>
            <?php
            $parent_name = '';
            foreach ($parent_sections as $ps) {
                if ($ps['slug'] === $cat['parent_section']) {
                    $parent_name = $ps['name'];
                    break;
                }
            }
            ?>
            <option value="<?= (int)$cat['id'] ?>" <?= ((int)($current_settings['discount_target_id'] ?? -1)) === (int)$cat['id'] ? 'selected' : '' ?>>
                <?= htmlspecialchars($parent_name . ' → ' . $cat['name']) ?>
            </option>
        <?php endforeach; ?>
    </select>
</div>

    <p class="text-xs text-gray-600 mt-2 flex items-start gap-2">
        <i class="fas fa-info-circle text-blue-500 mt-1"></i>
        <span>سيتم تطبيق هذا الخصم على المنتجات المؤهلة في صفحة الزبون</span>
    </p>
</div>
                            <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                <label class="block mb-3 font-bold text-gray-800">
                                    <i class="fas fa-truck text-blue-600 ml-2"></i>رسوم التوصيل
                                </label>
                                <select name="delivery_fee_type" class="form-input mb-3">
                                    <option value="fixed" <?= ($current_settings['delivery_fee_type'] ?? 'fixed') == 'fixed' ? 'selected' : '' ?>>مبلغ ثابت ($)</option>
                                    <option value="percentage" <?= ($current_settings['delivery_fee_type'] ?? '') == 'percentage' ? 'selected' : '' ?>>نسبة مئوية (%)</option>
                                </select>
                                <input type="number" name="delivery_fee_value" class="form-input" value="<?= htmlspecialchars($current_settings['delivery_fee_value'] ?? '0') ?>" min="0" step="0.01" placeholder="0.00">
                            </div>
                            <button type="submit" class="btn btn-primary w-full py-3 text-lg">
                                <i class="fas fa-save ml-2"></i>حفظ الإعدادات
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>




<!-- Purchase Invoices Card (Collapsible) -->
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
    <div class="flex items-center justify-between p-6 collapsible-header" onclick="toggleSection('purchase-invoices')">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-file-invoice-dollar text-white"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800">فواتير المشتريات</h2>
        </div>
        <i class="fas fa-chevron-down text-gray-500 transition-transform" id="purchase-invoices-icon"></i>
    </div>
    <div id="purchase-invoices-content" class="transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0; overflow: hidden;">
        <div class="p-6 space-y-4">
            <button onclick="openPurchaseInvoiceModal()" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 px-6 font-bold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all">
                <i class="fas fa-plus-circle ml-2"></i>إدخال فاتورة مشتريات جديدة
            </button>
            <a href="purchase_invoices.php" target="_blank" class="block w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl py-3 px-6 font-bold text-lg text-center shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all">
                <i class="fas fa-list ml-2"></i>عرض فواتير المشتريات
            </a>
        </div>
    </div>
</div>

<!-- Price Adjustment Card (Now Collapsible like Purchase Invoices) -->
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
    <div class="flex items-center justify-between p-6 collapsible-header" onclick="toggleSection('price-adjustment')">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-chart-line text-white"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-800">تعديل الأسعار حسب القسم</h2>
        </div>
        <i class="fas fa-chevron-down text-gray-500 transition-transform" id="price-adjustment-icon"></i>
    </div>
    <div id="price-adjustment-content" class="transition-all duration-300 ease-in-out" style="max-height: 0; opacity: 0; overflow: hidden;">
        <div class="p-6">
            <form id="price-adjustment-form">
                <input type="hidden" name="action" value="bulk_price_update">
                <div class="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                    <label class="block mb-3 font-bold text-gray-800">
                        <i class="fas fa-filter text-orange-600 ml-2"></i>اختر القسم
                    </label>
                    <select id="bulk-category" name="category_id" class="form-input mb-3" required>
                        <option value="">اختر القسم</option>
                        <?php foreach($categories as $cat): ?>
                        <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['parent_section'] . ' → ' . $cat['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <label class="block mb-3 font-bold text-gray-800">
                            <i class="fas fa-percent text-blue-600 ml-2"></i>نسبة التعديل (%)
                        </label>
                        <input type="number" name="percentage" class="form-input" step="0.01" placeholder="0.00">
                        <p class="text-xs text-gray-600 mt-2">أدخل النسبة المئوية للتعديل (موجب للزيادة، سالب للخصم)</p>
                    </div>
                    <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <label class="block mb-3 font-bold text-gray-800">
                            <i class="fas fa-dollar-sign text-green-600 ml-2"></i>مبلغ ثابت ($)
                        </label>
                        <input type="number" name="fixed_amount" class="form-input" step="0.01" placeholder="0.00">
                        <p class="text-xs text-gray-600 mt-2">أدخل المبلغ الثابت للتعديل (موجب للزيادة، سالب للخصم)</p>
                    </div>
                </div>
                <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <label class="block mb-3 font-bold text-gray-800">
                        <i class="fas fa-calculator text-purple-600 ml-2"></i>طريقة التعديل
                    </label>
                    <select name="adjustment_type" class="form-input" required>
                        <option value="increase">زيادة السعر</option>
                        <option value="decrease">تخفيض السعر</option>
                    </select>
                    <p class="text-xs text-gray-600 mt-2 flex items-start gap-2">
                        <i class="fas fa-info-circle text-blue-500 mt-1"></i>
                        <span>سيتم تطبيق التعديل على جميع المنتجات في القسم المحدد</span>
                    </p>
                </div>
                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-exclamation-triangle text-yellow-500 text-lg mt-1"></i>
                        <div>
                            <h4 class="font-bold text-yellow-800 mb-1">تنبيه مهم</h4>
                            <p class="text-yellow-700 text-sm">هذا الإجراء سيغير أسعار جميع المنتجات في القسم المحدد ولا يمكن التراجع عنه.</p>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary w-full py-3 text-lg">
                    <i class="fas fa-sync-alt ml-2"></i>تطبيق تعديل الأسعار
                </button>
            </form>
        </div>
    </div>
</div>

        <!-- Products Table -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                            <i class="fas fa-boxes text-white text-xl"></i>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-white">قائمة المنتجات</h2>
                            <p class="text-pink-100 text-sm">إدارة وتعديل جميع المنتجات</p>
                        </div>
                    </div>
                    <div class="text-white text-right hidden md:block">
                        <p class="text-3xl font-bold"><?= $total_products ?></p>
                        <p class="text-sm text-pink-100">منتج متاح</p>
                    </div>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">
                                <i class="fas fa-image text-gray-400 ml-2"></i>الصورة
                            </th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">
                                <i class="fas fa-box text-gray-400 ml-2"></i>المنتج
                            </th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">
                                <i class="fas fa-folder text-gray-400 ml-2"></i>القسم
                            </th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">
                                <i class="fas fa-dollar-sign text-gray-400 ml-2"></i>السعر
                            </th>
                            <th class="p-4 text-right text-sm font-bold text-gray-700">
                                <i class="fas fa-cubes text-gray-400 ml-2"></i>المخزون
                            </th>
                            <th class="p-4 text-center text-sm font-bold text-gray-700">
                                <i class="fas fa-cogs text-gray-400 ml-2"></i>الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody id="products-table-body">
                        <?php while($product = $products_result->fetch_assoc()): ?>
                        <tr class="border-b border-gray-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all" id="product-row-<?= $product['id'] ?>">
                            <td class="p-4">
                                <div class="w-16 h-16 rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
                                    <img src="<?= htmlspecialchars($product['image']) ?>" class="w-full h-full object-cover" alt="<?= htmlspecialchars($product['name']) ?>">
                                </div>
                            </td>
                            <td class="p-4">
                                <div class="font-bold text-gray-800"><?= htmlspecialchars($product['name']) ?></div>
                                <?php if ($product['is_new'] == 1): ?>
<span class="new-badge-admin">
    <i class="fas fa-star"></i>
    جديد
</span>
<?php endif; ?>
                                <div class="text-xs text-gray-500 mt-1"><?= htmlspecialchars($product['barcode'] ?? 'لا يوجد باركود') ?></div>
                            </td>
                            <td class="p-4">
                                <span class="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold">
                                    <?= htmlspecialchars($product['parent_section']) ?> / <?= htmlspecialchars($product['category_name']) ?>
                                </span>
                            </td>
                            <td class="p-4">
                                <span class="text-lg font-bold text-green-600">$<?= htmlspecialchars($product['price']) ?></span>
                            </td>
                            <td class="p-4">
                                <?php 
                                $stock = $product['display_stock'];
                                $stock_class = $stock < 10 ? 'bg-red-100 text-red-700' : ($stock < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700');
                                ?>
                                <span class="inline-block px-3 py-1 <?= $stock_class ?> rounded-full text-sm font-bold">
                                    <?= htmlspecialchars($stock) ?>
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex justify-center gap-2">
                                    <button onclick='openEditModal(<?= json_encode($product) ?>)' class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md">
                                        <i class="fas fa-edit"></i>
                                        
                                    </button>
                                    <button onclick="deleteProduct(<?= $product['id'] ?>)" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md">
                                        <i class="fas fa-trash"></i>
                                        
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

<?php include __DIR__ . '/partials/modals.php'; ?>


<script src="/msbeauty/assets/js/zxing/index.min.js"></script>

<script src="/msbeauty/public/js/admin.js"></script>


</body>
</html>