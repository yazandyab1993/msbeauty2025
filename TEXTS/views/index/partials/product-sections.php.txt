<!-- Product Sections - ديناميكي -->
<?php foreach ($parent_sections as $ps_index => $ps): ?>
    <section id="<?= strtolower(str_replace(['-', ' ', '/'], '', $ps['slug'])) ?>" class="mb-12 md:mb-16 scroll-mt-24">
        <div class="flex items-center gap-3 mb-6">
            <div class="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                <?php if (!empty($ps['icon_file']) && file_exists($ps['icon_file'])): ?>
                    <img src="<?= htmlspecialchars($ps['icon_file']) ?>" class="w-5 h-5 md:w-6 md:h-6 object-contain" alt="<?= htmlspecialchars($ps['name']) ?>">
                <?php else: ?>
                    <i class="fas <?= htmlspecialchars($ps['icon'] ?? 'fa-box') ?> text-white text-sm md:text-xl"></i>
                <?php endif; ?>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"><?= htmlspecialchars($ps['name']) ?></h2>
            <div class="flex-grow h-1 bg-gradient-to-r from-transparent to-pink-300"></div>
        </div>
        <?php
        $section_slug = $ps['slug'];
        if (isset($categories[$section_slug])):
            foreach ($categories[$section_slug] as $category):
        ?>
                <div class="mb-3 md:mb-5">
                    <!-- Category Header (Clickable) -->
                    <div class="category-header flex items-center gap-3 mb-4 bg-white/70 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-md cursor-pointer" data-category="<?= $category['id'] ?>">
                        <div class="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
                            <i class="fas fa-chevron-down text-white text-sm transition-transform"></i>
                        </div>
                        <h3 class="text-lg md:text-xl font-bold text-gray-800"><?= htmlspecialchars($category['name']) ?></h3>
                        <span class="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-1 rounded-full">
                            <?php
                            $count = count(array_filter($products, fn($p) => $p['category_id'] == $category['id']));
                            echo $count . ' منتج';
                            ?>
                        </span>
                    </div>
                    <!-- Products Container (Initially Hidden) -->
                    <div class="products-container hidden" data-category="<?= $category['id'] ?>">
                        <div class="products-grid grid gap-3 md:gap-4" style="grid-template-columns: repeat(2, minmax(0,1fr));">
                            <?php foreach ($products as $product): if ($product['category_id'] == $category['id']): ?>
                                <?php
                                $price = floatval($product['price']);
                                $is_new_product = $product['is_new'] == 1 && (empty($product['new_until']) || strtotime($product['new_until']) >= strtotime('today'));

                                // --- تحديد أهلية الخصم حسب النوع الجديد ---
                                $has_discount = false;
                                $discounted_price = $price;

                                if ($discount_type === 'global') {
                                    $has_discount = ($discount_value > 0);
                                // --- الكود الجديد (الصحيح) ---

                                } elseif ($discount_type === 'parent_section') {
                                    // $ps['id'] هو الرقم التعريفي للقسم الرئيسي الذي يُعرض المنتج ضمنه حالياً
                                    // $discount_target_id هو الرقم التعريفي للقسم الذي عليه الخصم
                                    if ((string)$ps['slug'] === (string)$discount_target_id) {
                                        $has_discount = ($discount_value > 0);
                                    }
                                } elseif ($discount_type === 'category') {
                                    if ((string)$product['category_id'] === (string)$discount_target_id) {
                                        $has_discount = ($discount_value > 0);
                                    }
                                }

                                if ($has_discount) {
                                    $discounted_price = $price - ($price * $discount_value / 100);
                                }
                                ?>
                                <div class="product-card-modern bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden group relative">
                                    <div class="relative overflow-hidden">
                                        <!-- New Product Badge -->
                                        <?php if ($is_new_product): ?>
                                            <div class="new-product-badge absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                                <i class="fas fa-star new-product-star"></i>
                                                <span>جديد</span>
                                            </div>
                                        <?php endif; ?>
                                        <img src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>" class="w-full h-36 md:h-48 object-contain bg-white p-2 group-hover:scale-105 transition-transform duration-500">
                                        <?php if ($has_discount): ?>
                                            <div class="badge-discount absolute top-2 right-2 md:top-3 md:right-3 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-xs font-bold shadow-lg">
                                                -<?= $discount_value ?>%
                                            </div>
                                        <?php endif; ?>
                                        <?php if ($product['display_stock'] > 0 && $product['display_stock'] < 10): ?>
                                            <div class="absolute top-2 left-2 md:top-3 md:left-3 bg-yellow-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-xs font-bold shadow-lg">
                                                <i class="fas fa-fire mr-1"></i>كمية محدودة
                                            </div>
                                        <?php endif; ?>
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div class="p-3 md:p-4 relative z-10">
                                        <h4 class="font-bold text-sm md:text-base mb-1 md:mb-2 text-gray-800 truncate group-hover:text-pink-600 transition"><?= htmlspecialchars($product['name']) ?></h4>
                                        <p class="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 h-10 overflow-hidden leading-tight"><?= htmlspecialchars($product['description']) ?></p>
                                        <div class="flex items-center justify-between mb-3 md:mb-4">
                                            <div class="flex flex-col">
                                                <span class="dynamic-price text-pink-600 font-bold text-lg md:text-xl" 
                                                      data-usd="<?= $discounted_price ?>">
                                                    $<?= number_format($discounted_price, 2) ?>
                                                </span>

                                                <?php if ($has_discount): ?>
                                                    <span class="dynamic-price-old text-gray-400 line-through text-xs md:text-sm" 
                                                          data-usd="<?= $price ?>">
                                                        $<?= number_format($price, 2) ?>
                                                    </span>
                                                <?php endif; ?>
                                            </div>
                                            
                                            <?php if ($product['display_stock'] > 0): ?>
                                                <div class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    <i class="fas fa-check-circle"></i> متوفر
                                                </div>
                                            <?php else: ?>
                                                <div class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                    <i class="fas fa-times-circle"></i> نفذت الكمية
                                                </div>
                                            <?php endif; ?>
                                        </div>
                                        <button
                                            onclick='handleAddToCart(<?= json_encode($product, JSON_HEX_APOS | JSON_HEX_QUOT) ?>)'
                                            class="w-full py-2 md:py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl md:rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm
                                    <?= $product['display_stock'] <= 0 ? 'opacity-50 cursor-not-allowed' : '' ?>"
                                            <?= $product['display_stock'] <= 0 ? 'disabled' : '' ?>>
                                            <i class="fas fa-cart-plus text-xs md:text-sm"></i>
                                            <span class="hidden sm:inline">إضافة للسلة</span>
                                            <span class="sm:hidden">أضف</span>
                                        </button>
                                    </div>
                                </div>
                            <?php endif; endforeach; ?>
                        </div>
                    </div>
                </div>
        <?php
            endforeach;
        endif;
        ?>
        <?php if ($ps_index < count($parent_sections) - 1): ?>
            <div class="section-divider my-10 md:my-16"></div>
        <?php endif; ?>
    </section>
<?php endforeach; ?>