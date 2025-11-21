function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '<',
                '>': '>',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }    
    
    
    let cart = JSON.parse(localStorage.getItem('ms_shop_cart')) || {};
    // --- كوبون الخصم ---
let appliedCoupon = null; // { code, discount_type, discount_value, name }

// 1. تعريف المتغيرات وسعر الصرف
const initialDataScript = document.getElementById('initial-data');
const initialData = initialDataScript ? JSON.parse(initialDataScript.textContent) : {};
const exchangeRate = parseFloat(initialData.usd_exchange_rate) || 15000;

// قراءة العملة المفضلة من الذاكرة أو افتراضياً الدولار
let currentCurrency = localStorage.getItem('shop_currency') || 'USD';

const allProducts = initialData.products || [];
let shopSettings = initialData.settings || {};
const discountType = initialData.discount_type || 'global';
const discountValue = parseFloat(initialData.discount_value) || 0;
const discountTargetId = initialData.discount_target_id || null;


function formatPrice(usdPrice) {
    const price = parseFloat(usdPrice);
    if (currentCurrency === 'USD') {
        return `$${price.toFixed(2)}`;
    } else {
        const sypPrice = Math.round(price * exchangeRate);
        return `${sypPrice.toLocaleString()} ل.س`;
    }
}

// 3. دالة تبديل العملة (يتم استدعاؤها عند ضغط الزر)
function toggleCurrency() {
    // 1. عكس العملة الحالية
    currentCurrency = currentCurrency === 'USD' ? 'SYP' : 'USD';
    localStorage.setItem('shop_currency', currentCurrency);
    
    // 2. تحديث شكل الزر العائم
    updateCurrencyButtonUI();
    
    // 3. تحديث الأسعار الثابتة في الصفحة (الأقسام العادية)
    updateAllPagePrices(); 
    
    // 4. تحديث سلة التسوق فوراً
    updateCartUI(); 
    
    // 5. ✅✅ إعادة تحميل الأقسام الديناميكية فوراً (هذا هو الحل)
    // نقوم بإعادة استدعاء الدوال لتقوم برسم المنتجات من جديد بناءً على العملة المختارة
    loadTopProducts();
    loadNewProducts();
    
    // 6. إشعار المستخدم
    const currencyName = currentCurrency === 'USD' ? 'الدولار' : 'الليرة السورية';
    showNotification('success', 'تم تغيير العملة', `يتم الآن عرض الأسعار بـ ${currencyName}`);
}

// تحديث شكل الزر
function updateCurrencyButtonUI() {
    const icon = document.getElementById('currency-icon');
    if (icon) {
        icon.textContent = currentCurrency === 'USD' ? '$' : 'ل.س';
    }
}

// 4. دالة لتحديث جميع الأسعار الثابتة في الصفحة (Product Sections)
function updateAllPagePrices() {
    // تحديث الأسعار الأساسية
    document.querySelectorAll('.dynamic-price').forEach(el => {
        const usd = el.getAttribute('data-usd');
        if (usd) el.textContent = formatPrice(usd);
    });
    
    // تحديث الأسعار المشطوبة (الخصومات)
    document.querySelectorAll('.dynamic-price-old').forEach(el => {
        const usd = el.getAttribute('data-usd');
        if (usd) el.textContent = formatPrice(usd);
    });
}

        let map;
        let marker;
        let pendingStockAdjustment = null;

        const notificationLayer = document.getElementById('notification-layer');
        // Variant selection modal (simple prompt-style overlay)
        function openVariantSelector(product, variants) {
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4';
            overlay.id = 'variant-selector-overlay';
            const inner = document.createElement('div');
            inner.className = 'bg-white rounded-3xl shadow-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto';
            inner.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-lg font-bold text-gray-800">اختر الدرجة</h3>
                    <button class="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl" onclick="document.getElementById('variant-selector-overlay').remove()"><i class="fas fa-times"></i></button>
                </div>
                <div class="space-y-2" id="variant-buttons"></div>
            `;
            overlay.appendChild(inner);
            document.body.appendChild(overlay);
            const list = inner.querySelector('#variant-buttons');
            variants.forEach(v => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-right flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-xl border border-pink-100';
                btn.onclick = () => {
                    addToCart(product, v);
                    document.getElementById('variant-selector-overlay').remove();
                };
                const left = document.createElement('div');
                left.className = 'flex items-center gap-3';
                const imgWrap = document.createElement('div');
                imgWrap.className = 'w-10 h-10 rounded-lg overflow-hidden bg-white shadow';
                const img = document.createElement('img');
                img.src = v.image || product.image;
                img.className = 'w-full h-full object-cover';
                imgWrap.appendChild(img);
                const nameSpan = document.createElement('span');
                nameSpan.className = 'font-semibold text-gray-800';
                nameSpan.textContent = v.name;
                left.appendChild(imgWrap);
                left.appendChild(nameSpan);
                const right = document.createElement('div');
                right.className = 'flex items-center gap-2 text-xs';
                if (v.price_override !== null && v.price_override !== undefined && v.price_override !== '') {
                    const priceTag = document.createElement('span');
                    priceTag.className = 'px-2 py-0.5 bg-green-100 text-green-700 rounded-full';
                    priceTag.textContent = '$' + parseFloat(v.price_override).toFixed(2);
                    right.appendChild(priceTag);
                }
                const stockTag = document.createElement('span');
                const inStock = parseInt(v.stock) > 0;
                stockTag.className = 'px-2 py-0.5 rounded-full ' + (inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700');
                stockTag.textContent = 'المتوفر: ' + v.stock;
                right.appendChild(stockTag);
                btn.appendChild(left);
                btn.appendChild(right);
                list.appendChild(btn);
            });
        }

        function showNotification(type, title, message) {
            // إنشاء عنصر الإشعار ديناميكيًا إذا لم يكن موجودًا
            let notification = document.getElementById('dynamic-notification');
            if (!notification) {
                notification = document.createElement('div');
                notification.id = 'dynamic-notification';
                notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-md w-full px-4';
                document.body.appendChild(notification);
            }

            // تحديد الألوان والرمز حسب النوع
            let iconClass = '',
                bgClass = '',
                borderClass = '',
                textClass = '';
            if (type === 'success') {
                iconClass = 'fa-check-circle text-green-500';
                bgClass = 'bg-green-50';
                borderClass = 'border-green-200';
                textClass = 'text-green-800';
            } else if (type === 'error') {
                iconClass = 'fa-times-circle text-red-500';
                bgClass = 'bg-red-50';
                borderClass = 'border-red-200';
                textClass = 'text-red-800';
            } else if (type === 'warning') {
                iconClass = 'fa-exclamation-triangle text-yellow-500';
                bgClass = 'bg-yellow-50';
                borderClass = 'border-yellow-200';
                textClass = 'text-yellow-800';
            }

            // محتوى الإشعار
            notification.innerHTML = `
        <div class="flex items-start gap-3 p-4 rounded-2xl shadow-lg border ${bgClass} ${borderClass} animate-fade-in-up">
            <i class="fas ${iconClass} text-2xl mt-0.5"></i>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold ${textClass} text-sm mb-1">${title}</h4>
                <p class="text-sm ${textClass} opacity-90">${message}</p>
            </div>
            <button onclick="this.closest('#dynamic-notification').remove()" 
                    class="text-gray-500 hover:text-gray-700 transition self-start mt-1">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>
    `;

            // إغلاق تلقائي بعد 4 ثوانٍ
            setTimeout(() => {
                const notif = document.getElementById('dynamic-notification');
                if (notif) {
                    notif.style.opacity = '0';
                    notif.style.transform = 'translate(-50%, -20px)';
                    setTimeout(() => notif.remove(), 300);
                }
            }, 4000);
        }

        function hideNotification() {
            notificationLayer.classList.remove('active');
        }
        async function handleAddToCart(product) {
            // Check if product has variants
            try {
                const resp = await fetch(`api.php?action=get_variants&product_id=${product.id}`);
                const result = await resp.json();
                if (result.success && result.data && result.data.length > 0) {
                    openVariantSelector(product, result.data);
                    return;
                }
            } catch (e) {
                console.error("Error fetching variants:", e);
            }

            // If no variants or error, add product directly
            addToCart(product);
        }

        function addToCart(product, selectedVariant) {
            const productInStock = allProducts.find(p => p.id == product.id);

            // Use display_stock for the overall product stock check
if (!productInStock || parseInt(productInStock.display_stock) <= 0) {
    showNotification('error', 'نفدت الكمية', `عذراً، المنتج "${product.name}" غير متوفر حالياً.`);
    return;
}

            // Build cart key: product-only or product-variant
            const key = selectedVariant ? `${product.id}:${selectedVariant.id}` : `${product.id}`;

            // Determine available stock: variant's own stock or product's display_stock
            // Determine available stock: variant's own stock or product's display_stock
const availableStock = selectedVariant ? parseInt(selectedVariant.stock) : parseInt(productInStock.display_stock);

// التحقق من أن الكمية المتاحة أكبر من 0
if (availableStock <= 0) {
    showNotification('error', 'نفدت الكمية', `عذراً، المنتج "${product.name}" غير متوفر حالياً.`);
    return;
}

if (cart[key] && cart[key].quantity >= availableStock) {
    showNotification('warning', 'الكمية محدودة', 'لقد وصلت للحد الأقصى في المخزون.');
    return;
}

            if (cart[key]) {
                cart[key].quantity++;
            } else {
                const base = {
                    ...product,
                    quantity: 1
                };
                if (selectedVariant) {
                    base.variant_id = selectedVariant.id;
                    base.variant_name = selectedVariant.name;
                    base.variant_stock = parseInt(selectedVariant.stock); // Store variant stock
                    const override = selectedVariant.price_override;
                    base.price = (override !== null && override !== undefined && override !== '') ? parseFloat(override) : parseFloat(product.price);
                    base.image = selectedVariant.image || base.image;
                }
                cart[key] = base;
            }
            updateCart();
            showNotification('success', 'تمت الإضافة', `تمت إضافة "${product.name}" إلى السلة بنجاح!`);
        }

        function changeQuantity(keyOrId, amount) {
            const key = String(keyOrId);
            if (!cart[key]) return;

            const originalId = parseInt(key.split(':')[0]);
            const productInStock = allProducts.find(p => p.id == originalId);
            const currentQuantity = parseInt(cart[key].quantity) || 0;
            const newQuantity = currentQuantity + parseInt(amount);

            if (newQuantity <= 0) {
                delete cart[key];
                updateCart();
                return;
            }

            // Determine available stock: variant's own stock (stored in cart) or product's display_stock
            let availableStock;
            if (cart[key].variant_id && cart[key].variant_stock !== undefined) {
                availableStock = cart[key].variant_stock;
            } else {
                availableStock = productInStock ? parseInt(productInStock.display_stock) : 0;
            }

            if (newQuantity > availableStock) {
                showStockWarning(key, newQuantity, availableStock, cart[key].name);
                return;
            }

            cart[key].quantity = newQuantity;
            updateCart();
        }

        function showStockWarning(key, requestedQty, availableQty, productName) {
            pendingStockAdjustment = {
                key,
                availableQty
            };
            document.getElementById('stock-warning-product-name').textContent = productName;
            document.getElementById('stock-warning-requested').textContent = requestedQty;
            document.getElementById('stock-warning-available').textContent = availableQty;
            const modal = document.getElementById('stock-warning-modal');
            const content = document.getElementById('stock-warning-content');
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function adjustToMaxStock() {
            if (pendingStockAdjustment) {
                const {
                    key,
                    availableQty
                } = pendingStockAdjustment;
                if (cart[key]) {
                    cart[key].quantity = parseInt(availableQty);
                }
                updateCart();
                closeStockWarning();
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 z-[80] animate-bounce';
                notification.innerHTML = `
                    <i class="fas fa-check-circle text-green-500 text-2xl"></i>
                    <span class="font-semibold text-gray-800">تم تعديل الكمية بنجاح!</span>
                `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.style.transition = 'all 0.3s ease';
                    notification.style.opacity = '0';
                    notification.style.transform = 'translate(-50%, -20px)';
                    setTimeout(() => notification.remove(), 300);
                }, 2500);
            }
        }

        function closeStockWarning() {
            const modal = document.getElementById('stock-warning-modal');
            const content = document.getElementById('stock-warning-content');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                pendingStockAdjustment = null;
            }, 300);
        }

        function updateCart() {
            localStorage.setItem('ms_shop_cart', JSON.stringify(cart));
            updateCartUI();
        }

function isProductEligibleForDiscount(product) {
    if (discountValue <= 0) return false;
    if (discountType === 'global') return true;
    if (discountType === 'parent_section') {
        console.log('🔍 فحص parent_section:', {
            productParentSection: product.parent_section,
            discountTargetId: discountTargetId,
            areEqual: String(product.parent_section) === String(discountTargetId)
        });
        return String(product.parent_section) === String(discountTargetId);
    }
    if (discountType === 'category') {
        return String(product.category_id) === String(discountTargetId);
    }
    return false;
}

       function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartFooter = document.getElementById('cart-footer');

    const items = Object.entries(cart).map(([key, item]) => ({ key, ...item }));
    if(cartCount) cartCount.textContent = items.reduce((sum, item) => sum + item.quantity, 0);

    if (items.length === 0) {
        if(cartItemsContainer) cartItemsContainer.innerHTML = `
            <div class="text-center py-10 px-2">
                <div class="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <i class="fas fa-shopping-cart text-3xl text-gray-400"></i>
                </div>
                <p class="text-base font-semibold text-gray-600 mb-1">سلة التسوق فارغة</p>
                <p class="text-xs text-gray-500">أضف منتجاتك المفضلة الآن!</p>
            </div>`;
        if(cartFooter) cartFooter.classList.add('hidden');
    } else {
        if(cartItemsContainer) cartItemsContainer.innerHTML = items.map(item => {
            const price = parseFloat(item.price);
            const originalProduct = allProducts.find(p => p.id == item.id);
            const hasDiscount = originalProduct && isProductEligibleForDiscount(originalProduct);
            const discountedPrice = hasDiscount ? price - (price * discountValue / 100) : price;
            const itemTotal = discountedPrice * item.quantity;

            return `
            <div class="flex items-center gap-2 p-2.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl mb-2 hover:shadow transition cart-item-card">
                <div class="w-14 h-14 rounded-lg bg-white flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                    <img src="${escapeHtml(item.image)}" class="w-full h-full object-contain p-0.5">
                </div>
                <div class="flex-grow min-w-0">
                    <h4 class="font-bold text-gray-800 text-xs truncate">${escapeHtml(item.name)}${item.variant_name ? ' — ' + escapeHtml(item.variant_name) : ''}</h4>
                    <div class="flex items-center gap-1 mt-0.5">
                        <span class="text-pink-600 font-bold text-xs">${formatPrice(discountedPrice)}</span>
                        <span class="text-[10px] text-gray-500">× ${item.quantity}</span>
                    </div>
                    <div class="text-[10px] font-semibold text-purple-600 mt-0.5">
                        الإجمالي: ${formatPrice(itemTotal)}
                    </div>
                </div>
                <div class="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm flex-shrink-0">
                    <button onclick="changeQuantity('${item.key}', -1)" class="w-7 h-7 bg-red-100 text-red-600 hover:bg-red-200 rounded-md font-bold flex items-center justify-center text-xs">-</button>
                    <span class="w-7 text-center font-bold text-gray-800 text-xs">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.key}', 1)" class="w-7 h-7 bg-green-100 text-green-600 hover:bg-green-200 rounded-md font-bold flex items-center justify-center text-xs">+</button>
                </div>
            </div>`;
        }).join('');
        if(cartFooter) cartFooter.classList.remove('hidden');
    }

    // تحديث ملخص السلة
    calculateCartTotals();
}


// دالة مساعدة لحساب وتحديث ملخص السلة
// دالة حساب وتحديث ملخص السلة (نظام المراحل المنفصلة - Distinct Stages)
// دالة حساب وتحديث ملخص السلة (نموذج الشلال المتطابق مع السيرفر)
function calculateCartTotals() {
    // 1. حساب المجموع الكلي (Gross Total)
    let grossTotal = 0;
    let discountableAmount = 0;

    Object.values(cart).forEach(item => {
        // نستخدم parseFloat لضمان أننا نتعامل مع أرقام وليس نصوص
        const price = parseFloat(item.price);
        const qty = parseInt(item.quantity);
        const itemTotal = price * qty;
        
        grossTotal += itemTotal;

        // التحقق من أهلية الخصم (مطابق للـ API)
        const originalProduct = allProducts.find(p => p.id == item.id);
        if (originalProduct && isProductEligibleForDiscount(originalProduct)) {
            discountableAmount += itemTotal;
        }
    });

    // 2. حساب خصم المتجر (Store Discount)
    // discountValue هي النسبة (10)
    const storeDiscountAmount = discountableAmount * (discountValue / 100);
    
    // 3. الصافي الأول (بعد خصم المتجر)
    const subtotalStage1 = Math.max(0, grossTotal - storeDiscountAmount);

    // 4. حساب الكوبون (يطبق على الصافي الأول)
    let couponDiscountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            couponDiscountAmount = subtotalStage1 * (appliedCoupon.discount_value / 100);
        } else {
            couponDiscountAmount = Math.min(appliedCoupon.discount_value, subtotalStage1);
        }
    }
    
    // 5. الصافي الثاني (بعد الكوبون)
    const subtotalStage2 = Math.max(0, subtotalStage1 - couponDiscountAmount);

    // 6. حساب منتج الحظ (يطبق على الصافي الثاني)
    let luckyDiscountAmount = 0;
    if (hasLuckyProductInCart() && activeLuckyProduct) {
        luckyDiscountAmount = subtotalStage2 * (activeLuckyProduct.discount_percent / 100);
    }

    // 7. صافي قيمة البضاعة (Net Goods Total)
    const netGoodsTotal = Math.max(0, subtotalStage2 - luckyDiscountAmount);

    // 8. حساب التوصيل
    // هام: التوصيل يضاف في النهاية ولا يخضع للخصومات
    const feeType = shopSettings.delivery_fee_type || 'fixed';
    const feeValue = parseFloat(shopSettings.delivery_fee_value || 0);
    
    const deliveryFee = feeType === 'percentage' 
        ? netGoodsTotal * (feeValue / 100) 
        : feeValue;

    // 9. الإجمالي النهائي
    const total = netGoodsTotal + deliveryFee;

    // === تحديث الواجهة (UI Update) ===
    const setText = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

    // المجموع قبل الخصم
    setText('cart-subtotal-before-discount', formatPrice(grossTotal));
    
    // خصم المتجر (بالسالب)
    const discountText = storeDiscountAmount > 0 ? '-' + formatPrice(storeDiscountAmount) : formatPrice(0);
    setText('cart-discount', discountText);

    // سطر الكوبون
    const couponRow = document.getElementById('coupon-discount-row');
    if (appliedCoupon && couponRow) {
        couponRow.innerHTML = `<span>خصم الكوبون (${appliedCoupon.code})</span><span>-${formatPrice(couponDiscountAmount)}</span>`;
        couponRow.classList.remove('hidden');
        // تحديث الشارة العلوية إن وجدت
        const savedAmountEl = document.getElementById('coupon-saved-amount');
        if(savedAmountEl) savedAmountEl.textContent = formatPrice(couponDiscountAmount);
    } else if(couponRow) {
        couponRow.classList.add('hidden');
    }

    // سطر منتج الحظ
    let luckyRow = document.getElementById('lucky-discount-row');
    if (luckyDiscountAmount > 0) {
        if (!luckyRow) {
            luckyRow = document.createElement('div');
            luckyRow.id = 'lucky-discount-row';
            luckyRow.className = 'flex justify-between text-green-600 font-bold';
            const summaryDiv = document.getElementById('cart-summary');
            if(summaryDiv) summaryDiv.insertBefore(luckyRow, document.getElementById('cart-delivery-fee').parentElement);
        }
        luckyRow.innerHTML = `<span>خصم منتج الحظ (${activeLuckyProduct.discount_percent}%)</span><span>-${formatPrice(luckyDiscountAmount)}</span>`;
    } else if (luckyRow) {
        luckyRow.remove();
    }

    // التوصيل والإجمالي
    setText('cart-delivery-fee', formatPrice(deliveryFee));
    setText('cart-total', formatPrice(total));

    // 🚀 هام جداً: تخزين القيم الخام لاستخدامها في PDF لاحقاً
    // سنخزنها في كائن window لسهولة الوصول إليها عند طلب processOrder
    window.currentOrderCalculations = {
        grossTotal: grossTotal,
        storeDiscountAmount: storeDiscountAmount,
        couponDiscountAmount: couponDiscountAmount,
        luckyDiscountAmount: luckyDiscountAmount,
        deliveryFee: deliveryFee,
        total: total
    };
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}


        function confirmOrder() {
            const name = document.getElementById('customer-name').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const location = document.getElementById('customer-location').value.trim();
            document.getElementById('name-error').classList.add('hidden');
            document.getElementById('phone-error').classList.add('hidden');
            document.getElementById('location-error').classList.add('hidden');
            document.getElementById('customer-name').classList.remove('border-red-500');
            document.getElementById('customer-phone').classList.remove('border-red-500');
            document.getElementById('customer-location').classList.remove('border-red-500');
            let hasError = false;
            if (!name) {
                document.getElementById('name-error').classList.remove('hidden');
                document.getElementById('customer-name').classList.add('border-red-500');
                document.getElementById('customer-name').focus();
                hasError = true;
            }
            if (!phone) {
                document.getElementById('phone-error').classList.remove('hidden');
                document.getElementById('customer-phone').classList.add('border-red-500');
                if (!hasError) document.getElementById('customer-phone').focus();
                hasError = true;
            }
            if (!location) {
                document.getElementById('location-error').classList.remove('hidden');
                document.getElementById('customer-location').classList.add('border-red-500');
                if (!hasError) {
                    const mapBtn = document.getElementById('get-location-btn');
                    mapBtn.classList.add('animate-bounce');
                    setTimeout(() => mapBtn.classList.remove('animate-bounce'), 1000);
                }
                hasError = true;
            }
            if (hasError) {
                const notification = document.createElement('div');
                notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 z-[80] border-r-4 border-red-500';
                notification.innerHTML = `
                    <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800">يرجى تعبئة جميع الحقول</p>
                        <p class="text-sm text-gray-600">الاسم، الهاتف، والموقع مطلوبة</p>
                    </div>
                `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.style.transition = 'all 0.3s ease';
                    notification.style.opacity = '0';
                    notification.style.transform = 'translate(-50%, -20px)';
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
                return;
            }
            if (Object.keys(cart).length === 0) {
                showNotification('error', 'السلة فارغة', 'الرجاء إضافة منتجات إلى السلة أولاً.');
                return;
            }
            processOrder();
        }


        // إعادة تعيين واجهة الكوبون
function resetCouponUI() {
    appliedCoupon = null;
    const input = document.getElementById('coupon-code-input');
    if (input) {
        input.value = '';
        input.disabled = false;
        input.classList.remove('border-green-400', 'bg-green-50');
        input.classList.add('border-pink-200');
    }
    const btn = document.getElementById('apply-coupon-btn');
    if (btn) {
        btn.innerHTML = 'تطبيق';
        btn.classList.remove('bg-green-500');
        btn.classList.add('bg-pink-500');
    }
    const badge = document.getElementById('coupon-applied-badge');
    if (badge) badge.classList.add('hidden');
    const messageEl = document.getElementById('coupon-message');
    if (messageEl) {
        messageEl.classList.add('hidden');
        messageEl.innerHTML = '';
    }
}

// === كوبونات الخصم ===
async function applyCoupon() {
    const input = document.getElementById('coupon-code-input');
    const messageEl = document.getElementById('coupon-message');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('error', 'كود الخصم فارغ', 'الرجاء إدخال كود الخصم');
        return;
    }

    // عرض حالة التحميل
    messageEl.innerHTML = '<i class="fas fa-spinner fa-spin text-pink-500"></i> جاري التحقق...';
    messageEl.className = 'mt-1 text-xs text-center min-h-[1.2rem] text-pink-600';
    messageEl.classList.remove('hidden');

    try {
        const fd = new FormData();
        fd.append('action', 'validate_coupon');
        fd.append('code', code);
        const res = await fetch('api.php', { method: 'POST', body: fd });
        const result = await res.json();

        // === عرض شارة الكوبون وتحديث أسلوب الحقل ===
if (result.success) {
    appliedCoupon = {
        code: code,
        name: result.data.name,
        discount_type: result.data.discount_type,
        discount_value: result.data.discount_value
    };

    // === حساب قيمة الخصم فورًا بناءً على المحتوى الحالي للسلة ===
    let subtotalBeforeAnyDiscount = 0;
    let discountableAmount = 0;
    Object.values(cart).forEach(item => {
        const price = parseFloat(item.price);
        const itemTotal = price * item.quantity;
        subtotalBeforeAnyDiscount += itemTotal;
        const originalProduct = allProducts.find(p => p.id == item.id);
        if (originalProduct && isProductEligibleForDiscount(originalProduct)) {
            discountableAmount += itemTotal;
        }
    });
    const storeDiscountAmount = discountableAmount * (discountValue / 100);
    const subtotalAfterStoreDiscount = subtotalBeforeAnyDiscount - storeDiscountAmount;

    // حساب خصم الكوبون
    let couponDiscountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percentage') {
            couponDiscountAmount = subtotalAfterStoreDiscount * (appliedCoupon.discount_value / 100);
        } else {
            couponDiscountAmount = Math.min(appliedCoupon.discount_value, subtotalAfterStoreDiscount);
        }
    }

    // === عرض شارة الكوبون وتحديث أسلوب الحقل ===
    document.getElementById('coupon-badge-code').textContent = appliedCoupon.code;
    document.getElementById('coupon-saved-amount').textContent = couponDiscountAmount.toFixed(2);
    document.getElementById('coupon-applied-badge').classList.remove('hidden');

    const input = document.getElementById('coupon-code-input');
    input.classList.remove('border-pink-200', 'focus:ring-pink-400');
    input.classList.add('border-green-400', 'bg-green-50');
    input.disabled = true;

    const btn = document.getElementById('apply-coupon-btn');
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.classList.remove('bg-pink-500');
    btn.classList.add('bg-green-500');

    messageEl.innerHTML = '';
    messageEl.classList.add('hidden');

    updateCartUI(); // إعادة حساب الإجماليات فورًا
} else {
            appliedCoupon = null;
            messageEl.innerHTML = `<span class="text-red-500">${result.message}</span>`;
        }
    } catch (err) {
        console.error('Coupon error:', err);
        appliedCoupon = null;
        messageEl.innerHTML = `<span class="text-red-500">فشل الاتصال بالخادم</span>`;
    }
}

        async function loadTopProducts() {
    const container = document.getElementById('top-products-container');
    if (!container) return;

    // الاحتفاظ بالمحتوى الحالي إذا كنا نعيد التحميل لتغيير العملة فقط، لتجنب الوميض القوي
    // أو عرض مؤشر تحميل بسيط
    container.innerHTML = '<div class="text-center text-gray-500 col-span-full py-10">جاري التحديث...</div>';

    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=get_top_products_this_week'
        });

        const result = await response.json();

        if (result.success && result.data.length > 0) {
            container.innerHTML = ''; 

            result.data.forEach(item => {
                // حساب السعر
                const originalProduct = allProducts.find(p => p.id == item.id);
                const hasDiscount = originalProduct && isProductEligibleForDiscount(originalProduct);
                const displayedPrice = hasDiscount 
                    ? parseFloat(item.price) * (1 - discountValue / 100)
                    : parseFloat(item.price);

                const productCard = document.createElement('div');
                productCard.className = 'bg-white rounded-2xl shadow-md p-3 flex flex-col items-center transition-transform duration-300 hover:shadow-lg hover:scale-105 relative';

                // شارة الخصم
                let discountBadge = '';
                if (hasDiscount) {
                    discountBadge = `<div class="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">-${discountValue}%</div>`;
                }

                productCard.innerHTML = `
                    ${discountBadge}
                    <img src="${escapeHtml(item.image || 'uploads/placeholder.jpg')}" alt="${escapeHtml(item.name)}" class="w-16 h-16 md:w-20 md:h-20 object-contain mb-2 bg-gray-50 rounded-lg p-1">
                    
                    <div class="text-center mb-1 w-full">
                        <h4 class="text-xs md:text-sm font-bold text-gray-800 truncate block">${escapeHtml(item.name)}</h4>
                        ${item.variant_name ? `<span class="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">درجة: ${escapeHtml(item.variant_name)}</span>` : ''}
                    </div>

                    <div class="text-center mb-2">
                        <span class="text-sm font-bold text-pink-600">${formatPrice(displayedPrice)}</span>
                    </div>

                    <button class="w-full py-1.5 text-[10px] md:text-xs font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-1 
                        ${(item.stock - item.reserved_stock) <= 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'}">
                        <i class="fas fa-cart-plus"></i>
                        ${(item.stock - item.reserved_stock) <= 0 ? 'نفذت' : 'أضف'}
                    </button>
                `;

                // إضافة حدث النقر للزر
                const btn = productCard.querySelector('button');
                if (!(item.stock - item.reserved_stock <= 0)) {
                    btn.onclick = () => {
                        const fullProduct = allProducts.find(p => p.id == item.id) || item;
                        handleAddToCart(fullProduct);
                    };
                }

                container.appendChild(productCard);
            });
        } else {
            container.innerHTML = '<div class="text-center text-gray-500 col-span-full py-10">لا توجد بيانات.</div>';
        }
    } catch (error) {
        console.error('Error loading top products:', error);
    }
}


        async function processOrder() {
            const confirmOrderBtn = document.getElementById('confirm-order-button');
            confirmOrderBtn.disabled = true;
            confirmOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري إرسال الطلب...';
           
           // ... (الكود الخاص بحساب الخصومات يبقى كما هو) ...
            let subtotalBeforeAnyDiscount = 0;
            let discountableAmount = 0;
            Object.values(cart).forEach(item => {
                const price = parseFloat(item.price);
                const itemTotal = price * item.quantity;
                subtotalBeforeAnyDiscount += itemTotal;
                const originalProduct = allProducts.find(p => p.id == item.id);
                if (originalProduct && isProductEligibleForDiscount(originalProduct)) {
                    discountableAmount += itemTotal;
                }
            });
            // 1. خصم المتجر
            const storeDiscountAmount = discountableAmount * (discountValue / 100);
            const subtotalAfterStoreDiscount = subtotalBeforeAnyDiscount - storeDiscountAmount;

            // 2. خصم كوبون الخصم
            let couponDiscountAmount = 0;
            if (appliedCoupon) {
                if (appliedCoupon.discount_type === 'percentage') {
                    couponDiscountAmount = subtotalAfterStoreDiscount * (appliedCoupon.discount_value / 100);
                } else {
                    couponDiscountAmount = Math.min(appliedCoupon.discount_value, subtotalAfterStoreDiscount);
                }
            }

const subtotalAfterCoupon = subtotalAfterStoreDiscount - couponDiscountAmount;

            // ⬇️ ⬇️ ⬇️ ابدأ التعديل هنا (أضف حساب خصم منتج الحظ) ⬇️ ⬇️ ⬇️
            // 3. خصم منتج الحظ
            let luckyDiscountAmount = 0;
            if (hasLuckyProductInCart() && activeLuckyProduct) {
                luckyDiscountAmount = subtotalAfterCoupon * (activeLuckyProduct.discount_percent / 100);
            }
            // ⬆️ ⬆️ ⬆️ انتهى التعديل ⬆️ ⬆️ ⬆️

            const orderData = {
                customer_name: document.getElementById('customer-name').value.trim(),
                customer_phone: document.getElementById('customer-phone').value.trim(),
                customer_location: document.getElementById('customer-location').value.trim(),
                items: Object.values(cart).map(item => ({
                    id: item.id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity
                })),
                coupon_code: appliedCoupon ? appliedCoupon.code : null,
                coupon_discount_amount: couponDiscountAmount // نرسل القيمة المحسوبة
            };

            try {
                const response = await fetch('api.php?action=create_order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    
                    // ⬇️ ⬇️ ⬇️ ابدأ التعديل هنا (تمرير كل شيء للفاتورة) ⬇️ ⬇️ ⬇️
                    try {
                        // نمرر الأرقام النظيفة + الهدية (result.added_gift)
                        await generateAndDownloadInvoice(
                            result.order_id, 
                            orderData,
                            storeDiscountAmount,
                            couponDiscountAmount,
                            luckyDiscountAmount,
                            result.added_gift // <-- الهدية القادمة من الـ API
                        );
                    } catch (invoiceError) {
                        console.error("فشل إنشاء الفاتورة:", invoiceError);
                        showNotification('warning', 'خطأ في الفاتورة', 'تم الطلب، لكن فشل إنشاء الفاتورة PDF.');
                    }
                    // ⬆️ ⬆️ ⬆️ نهاية الخطوة الجديدة ⬆️ ⬆️ ⬆️


                    // 1. أغلق السلة
                    closeCart();

                    // 2. حضّر رسالة النجاح
                    let successTitle = 'تم الطلب بنجاح!';
                    let successMsg = `تم إرسال طلبك. رقم الطلب: #${result.order_id}`;

                    // 3. 🚀 تحقق من وجود رسالة مكافأة
                    if (result.reward_message && result.reward_message.length > 0) {
                        successTitle = '🎉 تهانينا!';
                        successMsg = `تم الطلب بنجاح! ${result.reward_message}`;
                    }

                    // 4. أظهر الإشعار للعميل
                    showNotification('success', successTitle, successMsg);

                    // 5. امسح السلة والمدخلات
                    cart = {};
                    localStorage.removeItem('ms_shop_cart');
                    updateCartUI(); // سيقوم هذا بتحديث updateCart() أيضاً
                    
                    document.getElementById('customer-name').value = '';
                    document.getElementById('customer-phone').value = '';
                    document.getElementById('customer-location').value = '';

                } else {
                    showNotification('error', 'خطأ في الطلب', result.message || 'حدث خطأ غير متوقع.');
                }

            } catch (error) {
                console.error('Order error:', error);
                showNotification('error', 'خطأ في الشبكة', 'تعذر الاتصال بالخادم. الرجاء المحاولة مرة أخرى.');
            } finally {
                confirmOrderBtn.disabled = false;
                confirmOrderBtn.innerHTML = '<i class="fas fa-check-circle ml-2"></i>تأكيد الطلب';
            }
        }

        function closeCartAfterSuccess() {
            document.getElementById('order-success-message').classList.add('hidden');
            document.getElementById('cart-items').classList.remove('hidden');
            document.getElementById('cart-footer').classList.remove('hidden');
            closeCart();
        }

        function openCart() {
            const modal = document.getElementById('cart-modal');
            const content = document.getElementById('cart-modal-content');
            modal.classList.remove('hidden');
            // منع التمرير في الخلفية
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeCart() {
             resetCouponUI();
            const modal = document.getElementById('cart-modal');
            const content = document.getElementById('cart-modal-content');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                // إعادة التمرير للخلفية
                document.body.style.overflow = '';
            }, 300);
        }

        function openMapModal() {
            document.getElementById('map-modal').classList.remove('hidden');
            const initializeMap = (lat, lng) => {
                if (!map) {
                    map = L.map('map').setView([lat, lng], 15);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                    marker = L.marker([lat, lng], {
                        draggable: true
                    }).addTo(map);
                    map.on('click', (e) => marker.setLatLng(e.latlng));
                } else {
                    map.setView([lat, lng], 15);
                    marker.setLatLng([lat, lng]);
                }
                setTimeout(() => map.invalidateSize(), 100);
            };
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => initializeMap(pos.coords.latitude, pos.coords.longitude),
                    () => initializeMap(24.7136, 46.6753)
                );
            } else {
                initializeMap(24.7136, 46.6753);
            }
        }

        function closeMapModal() {
            document.getElementById('map-modal').classList.add('hidden');
        }

        function setLocationFromMap() {
            const latlng = marker.getLatLng();
            const locationInput = document.getElementById('customer-location');
            locationInput.value = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;
            locationInput.classList.remove('border-red-500');
            document.getElementById('location-error').classList.add('hidden');
            locationInput.classList.add('border-green-500');
            setTimeout(() => {
                locationInput.classList.remove('border-green-500');
            }, 2000);
            closeMapModal();
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 z-[80] border-r-4 border-green-500 animate-bounce';
            notification.innerHTML = `
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-check-circle text-green-500 text-xl"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-800">تم تحديد الموقع بنجاح!</p>
                    <p class="text-sm text-gray-600">موقعك جاهز للتوصيل</p>
                </div>
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.transition = 'all 0.3s ease';
                notification.style.opacity = '0';
                notification.style.transform = 'translate(-50%, -20px)';
                setTimeout(() => notification.remove(), 300);
            }, 2500);
        }
        const mainSearchBar = document.getElementById('main-search-bar');
        const mainSearchResults = document.getElementById('main-search-results');
        mainSearchBar.addEventListener('keyup', async (e) => {
            const term = e.target.value.trim();
            if (term.length < 1) {
                mainSearchResults.classList.add('hidden');
                return;
            }
            try {
                const response = await fetch(`api.php?action=search_products&term=${encodeURIComponent(term)}`);
                const result = await response.json();
                mainSearchResults.innerHTML = '';
                if (result.success && result.data.length > 0) {
                    result.data.forEach(product => {
                        const price = parseFloat(product.price);
const originalProduct = allProducts.find(p => p.id == product.id);
const hasDiscount = originalProduct && isProductEligibleForDiscount(originalProduct);
const discountedPrice = hasDiscount ? price - (price * discountValue / 100) : price;
                        const div = document.createElement('div');
                        div.className = 'p-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 cursor-pointer border-b border-pink-100 flex items-center gap-4 transition';
                        div.innerHTML = `
                    <img src="${escapeHtml(product.image)}" class="w-16 h-16 rounded-xl object-cover shadow-md">
                    <div class="flex-grow">
                        <div class="font-bold text-gray-800">${escapeHtml(product.name)}</div>
                        <div class="text-sm text-pink-600 font-semibold">${discountedPrice.toFixed(2)}</div>
                        ${product.variant_id ? '<div class="text-xs text-purple-600 mt-1">✔️ له درجات</div>' : ''}
                    </div>
                    <button class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition transform hover:scale-105">
                        <i class="fas fa-plus"></i>
                    </button>
                `;

                        div.querySelector('button').onclick = (e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                        };
                        div.onclick = () => {
                            handleAddToCart(product); // تغيير هنا أيضاً
                            mainSearchBar.value = '';
                            mainSearchResults.classList.add('hidden');
                        };
                        mainSearchResults.appendChild(div);
                    });
                    mainSearchResults.classList.remove('hidden');
                } else {
                    mainSearchResults.innerHTML = '<div class="p-4 text-center text-gray-500">لا توجد نتائج</div>';
                    mainSearchResults.classList.remove('hidden');
                }
            } catch (err) {
                console.error("Search error", err);
                mainSearchResults.innerHTML = '<div class="p-4 text-center text-red-500">خطأ في البحث</div>';
                mainSearchResults.classList.remove('hidden');
            }
        });
        document.addEventListener('click', (e) => {
            if (!mainSearchBar.parentElement.contains(e.target)) {
                mainSearchResults.classList.add('hidden');
            }
        });

      
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    document.querySelectorAll('.category-tab').forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.getAttribute('href') === `#${id}`) {
                            tab.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3
        });
        sections.forEach(section => observer.observe(section));

        
document.addEventListener('DOMContentLoaded', async function() {

            loadActiveLuckyProduct();
            loadTopProducts(); // استدعاء دالة تحميل المنتجات عند تحميل الصفحة
            loadNewProducts(); // إضافة هذا السطر
            updateCurrencyButtonUI();
            updateAllPagePrices(); // تحديث أسعار الصفحة الثابتة فوراً

    try {
        const response = await fetch('api.php?action=get_settings');
        const result = await response.json();
        if (result.success) {
            shopSettings = result.data;
        }
    } catch (e) {
        console.error("Could not fetch shop settings", e);
    } finally {
        updateCart();
    }

    // --- ربط مباشر لـ category-header بدون clone ---
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryId = this.getAttribute('data-category');
            const container = document.querySelector(`.products-container[data-category="${categoryId}"]`);
            const icon = this.querySelector('i.fa-chevron-down');

            if (!container || !icon) return;

            // إغلاق جميع الأقسام الأخرى
            document.querySelectorAll('.products-container').forEach(other => {
                if (other !== container) {
                    other.classList.add('hidden');
                    const otherId = other.getAttribute('data-category');
                    const otherIcon = document.querySelector(`.category-header[data-category="${otherId}"] i.fa-chevron-down`);
                    if (otherIcon) otherIcon.classList.remove('rotate-180');
                }
            });

            // تبديل حالة القسم الحالي
            const isHidden = container.classList.contains('hidden');
            container.classList.toggle('hidden', !isHidden);
            icon.classList.toggle('rotate-180', isHidden);
        });
    });

        console.log('🔍 تهيئة نظام Image Zoom...');
    
    // إنشاء الـ Modal
    createImageZoomModal();
    
    // تفعيل خاصية الزوم على الصور الموجودة
    initializeProductImageZoom();
    
    // مراقبة التغييرات لتفعيل الزوم على المنتجات الجديدة
    observeProductChanges();
    
    console.log('✅ نظام Image Zoom جاهز للعمل');
});


        // تفعيل زرّ واحد فقط في المرة + تحديث لون الشبكة
        function setActiveView(activeButtonId) {
            // إعادة تعيين كلا الزرّين
            ['view-6-cols', 'view-8-cols'].forEach(id => {
                const btn = document.getElementById(id);
                const cells = btn.querySelectorAll('div:not(.grid)');
                // تغيير لون الشبكة إلى رمادي
                cells.forEach(cell => cell.classList.replace('bg-pink-500', 'bg-gray-300'));
                // تنسيق الزر غير النشط
                btn.classList.replace('border-pink-500', 'border-gray-300');
                btn.classList.replace('text-pink-600', 'text-gray-500');
            });

            // تفعيل الزر المطلوب
            const activeBtn = document.getElementById(activeButtonId);
            const activeCells = activeBtn.querySelectorAll('div:not(.grid)');
            activeCells.forEach(cell => cell.classList.replace('bg-gray-300', 'bg-pink-500'));
            activeBtn.classList.replace('border-gray-300', 'border-pink-500');
            activeBtn.classList.replace('text-gray-500', 'text-pink-600');
        }

        // تطبيق عدد الأعمدة على جميع الأقسام
        function applyColumns(cols) {
            const clamped = Math.max(2, Math.min(cols, 10));
            document.querySelectorAll('.products-grid').forEach(grid => {
                if (window.innerWidth < 768) {
                    grid.style.gridTemplateColumns = 'repeat(2, minmax(0,1fr))';
                } else {
                    grid.style.gridTemplateColumns = `repeat(${clamped}, minmax(0,1fr))`;
                }
            });
        }

        // ربط الأحداث
        document.getElementById('view-6-cols').addEventListener('click', () => {
            setActiveView('view-6-cols');
            applyColumns(6);
        });

        document.getElementById('view-8-cols').addEventListener('click', () => {
            setActiveView('view-8-cols');
            applyColumns(8);
        });

        // التهيئة الافتراضية
        applyColumns(6);
        setActiveView('view-6-cols');

        // عند تغيير حجم النافذة
        window.addEventListener('resize', () => {
            const currentCols = document.getElementById('view-6-cols').classList.contains('border-pink-500') ? 6 : 8;
            applyColumns(currentCols);
        });




        // Customer Add Product Modal Logic (responsive & scalable variants)
        function openCustomerAddProduct() {
            const m = document.getElementById('customer-add-product-modal');
            m.classList.remove('hidden');
            m.classList.add('flex');
        }

        function closeCustomerAddProduct() {
            const m = document.getElementById('customer-add-product-modal');
            m.classList.add('hidden');
            m.classList.remove('flex');
            document.getElementById('cust-variant-list').innerHTML = '';
            document.getElementById('cust-prod-name').value = '';
            document.getElementById('cust-prod-barcode').value = '';
            document.getElementById('cust-prod-price').value = '';
            document.getElementById('cust-prod-stock').value = '';
        }

        function addCustVariantRow() {
            const list = document.getElementById('cust-variant-list');
            const row = document.createElement('div');
            row.className = 'grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-3 rounded-xl border border-pink-100';
            row.innerHTML = `
                <input placeholder="اسم الدرجة" class="form-input" data-cv="name">
                <input placeholder="باركود (إلزامي)" class="form-input" data-cv="barcode" required>
                <input type="number" placeholder="الكمية" class="form-input" data-cv="stock" value="0">
                <input type="number" step="0.01" placeholder="سعر خاص (اختياري)" class="form-input" data-cv="price">
                <input type="file" class="form-input" data-cv="image">
            `;
            list.appendChild(row);
        }
        async function saveCustomerProduct() {
            // Reuse admin API endpoints
            const name = document.getElementById('cust-prod-name').value.trim();
            const barcode = document.getElementById('cust-prod-barcode').value.trim();
            const price = document.getElementById('cust-prod-price').value.trim();
            const stock = document.getElementById('cust-prod-stock').value.trim();
            if (!name || !price) {
                showNotification('error', 'بيانات ناقصة', 'يرجى إدخال الاسم والسعر');
                return;
            }
            const fd = new FormData();
            fd.append('action', 'add_product');
            fd.append('name', name);
            fd.append('description', '');
            fd.append('price', price || '0');
            fd.append('stock', stock || '0');
            fd.append('category_id', '1');
            fd.append('barcode', barcode);
            try {
                const r = await fetch('api.php', {
                    method: 'POST',
                    body: fd
                });
                const j = await r.json();
                if (!j.success) {
                    showNotification('error', 'فشل الحفظ', j.message || '');
                    return;
                }
                const rows = Array.from(document.querySelectorAll('#cust-variant-list div.grid'));
                if (rows.length > 0 && j.product_id) {
                    const vForm = new FormData();
                    vForm.append('action', 'add_variants');
                    vForm.append('product_id', j.product_id);
                    const variants = rows.map((row, idx) => {
                        const get = a => row.querySelector(`[data-cv="${a}"]`).value.trim();
                        const priceRaw = get('price');
                        const imgInput = row.querySelector('[data-cv="image"]');
                        if (imgInput && imgInput.files[0]) vForm.append('variant_images[]', imgInput.files[0]);
                        return {
                            name: get('name'),
                            barcode: get('barcode') || null,
                            stock: parseInt(get('stock') || '0'),
                            price_override: priceRaw === '' ? null : parseFloat(priceRaw),
                            image: null
                        };
                    }).filter(v => v.name);
                    vForm.append('variants', JSON.stringify(variants));
                    await fetch('api.php', {
                        method: 'POST',
                        body: vForm
                    });
                }
                showNotification('success', 'تم الحفظ', 'تم إنشاء المنتج');
                setTimeout(() => location.reload(), 1000);
            } catch (e) {
                console.error(e);
                showNotification('error', 'فشل الاتصال', 'يرجى المحاولة لاحقاً');
            }
        }

        // تحديث Category tabs للأقسام الديناميكية
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const target = this.getAttribute('href');
                document.querySelector(target).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });

        async function loadNewProducts() {
    const container = document.getElementById('new-products-container');
    if (!container) return;
    
    container.innerHTML = '<div class="text-center text-gray-500 col-span-full py-10">جاري التحديث...</div>';
    
    try {
        const response = await fetch('api.php?action=get_new_products');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            container.innerHTML = '';
            result.data.forEach(item => {
                const originalProduct = allProducts.find(p => p.id == item.id);
                const hasDiscount = originalProduct && isProductEligibleForDiscount(originalProduct);
                const price = parseFloat(item.price);
                const discountedPrice = hasDiscount ? price - (price * discountValue / 100) : price;

                const productCard = document.createElement('div');
                productCard.className = 'new-product-card bg-white rounded-2xl shadow-md p-3 flex flex-col group';
                
                productCard.innerHTML = `
                    <div class="relative mb-2">
                        <div class="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                            <i class="fas fa-star text-[10px]"></i>
                            <span>جديد</span>
                        </div>
                        ${hasDiscount ? `
                        <div class="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm">
                            -${discountValue}%
                        </div>
                        ` : ''}
                        <div class="w-full h-32 bg-white rounded-xl overflow-hidden">
                            <img src="${escapeHtml(item.image)}" 
                                 alt="${escapeHtml(item.name)}" 
                                 class="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500">
                        </div>
                    </div>
                    
                    <h4 class="text-xs md:text-sm font-bold text-gray-800 truncate mb-1 text-center px-1">${escapeHtml(item.name)}</h4>
                    
                    <div class="text-center mb-2 flex flex-col items-center justify-center min-h-[2.5rem]">
                        <span class="text-sm md:text-base font-bold text-amber-600">${formatPrice(discountedPrice)}</span>
                        ${hasDiscount ? `<span class="text-[10px] text-gray-400 line-through">${formatPrice(price)}</span>` : ''}
                    </div>
                    
                    <button class="w-full py-1.5 md:py-2 text-xs font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-1
                                   ${item.display_stock <= 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg'}"
                            ${item.display_stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus text-xs"></i>
                        <span class="hidden sm:inline">أضف للسلة</span>
                        <span class="sm:hidden">أضف</span>
                    </button>
                `;

                // إضافة حدث النقر للزر بشكل منفصل (لضمان تمرير الكائن الصحيح)
                const btn = productCard.querySelector('button');
                if (!btn.disabled) {
                    btn.onclick = () => handleAddToCart(item);
                }

                container.appendChild(productCard);
            });
        } else {
            container.innerHTML = '<div class="text-center text-gray-500 col-span-full py-10">لا توجد منتجات جديدة حالياً</div>';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// === Lucky Product Integration ===
let activeLuckyProduct = null;

// جلب منتج الحظ النشط عند تحميل الصفحة
async function loadActiveLuckyProduct() {
    try {
        const res = await fetch('api.php?action=get_active_lucky_product');
        const data = await res.json();
        if (data.success && data.data) {
            activeLuckyProduct = data.data;
        }
    } catch (err) {
        console.error("Failed to load lucky product", err);
    }
}

// التحقق مما إذا كانت السلة تحتوي منتج الحظ
function hasLuckyProductInCart() {
    if (!activeLuckyProduct) return false;
    return Object.values(cart).some(item => item.id == activeLuckyProduct.product_id);
}

// تحديث واجهة السلة عند وجود منتج الحظ
function updateCartUIWithLucky() {
    const cartFooter = document.getElementById('cart-footer');
    const summary = document.getElementById('cart-summary');
    const luckyBanner = document.getElementById('lucky-product-banner');

    if (hasLuckyProductInCart() && activeLuckyProduct) {
        // إظهار بنر منتج الحظ
        if (!luckyBanner) {
            const banner = document.createElement('div');
            banner.id = 'lucky-product-banner';
            banner.className = 'mb-3 p-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl text-center animate-pulse';
            banner.innerHTML = `
                <i class="fas fa-gift mr-1"></i>
                <strong>مبروك!</strong> حصلت على خصم ${activeLuckyProduct.discount_percent}% لأنك أضفت أحد منتجات الحظ!
            `;
            cartFooter.insertBefore(banner, summary);
        }
        // تطبيق خصم منتج الحظ
        applyLuckyDiscount();
    } else {
        // إزالة البنر إذا وُجد
        if (luckyBanner) luckyBanner.remove();
        // إزالة خصم منتج الحظ
        removeLuckyDiscount();
    }
}

// تطبيق الخصم
function applyLuckyDiscount() {
    const subtotalBeforeDiscount = parseFloat(document.getElementById('cart-subtotal-before-discount').textContent.replace('$', ''));
    const regularDiscount = parseFloat(document.getElementById('cart-discount').textContent.replace('$', ''));
    const deliveryFee = parseFloat(document.getElementById('cart-delivery-fee').textContent.replace('$', ''));
    
    const subtotalAfterRegularDiscount = subtotalBeforeDiscount - regularDiscount;
    const luckyDiscountAmount = subtotalAfterRegularDiscount * (activeLuckyProduct.discount_percent / 100);
    const totalAfterLucky = subtotalAfterRegularDiscount - luckyDiscountAmount + deliveryFee;

    // عرض خصم منتج الحظ
    let luckyDiscountEl = document.getElementById('lucky-discount-row');
    if (!luckyDiscountEl) {
        luckyDiscountEl = document.createElement('div');
        luckyDiscountEl.id = 'lucky-discount-row';
        luckyDiscountEl.className = 'flex justify-between text-green-600 font-bold';
        document.getElementById('cart-summary').insertBefore(luckyDiscountEl, document.getElementById('cart-delivery-fee').parentElement);
    }
    luckyDiscountEl.innerHTML = `<span>خصم منتج الحظ (${activeLuckyProduct.discount_percent}%)</span><span>-$${luckyDiscountAmount.toFixed(2)}</span>`;

    // تحديث الإجمالي
    document.getElementById('cart-total').textContent = `$${totalAfterLucky.toFixed(2)}`;
}

// إزالة الخصم
function removeLuckyDiscount() {
    const el = document.getElementById('lucky-discount-row');
    if (el) el.remove();
}

// تعديل دالة updateCartUI لتضمين منتج الحظ
const originalUpdateCartUI = updateCartUI;
updateCartUI = function() {
    originalUpdateCartUI();
    updateCartUIWithLucky();
};


// === 🚀 [ميزة جديدة]: فحص أهلية المكافأة عند إدخال الهاتف ===

// 1. الدالة التي تقوم بالفحص
async function checkRewardEligibility() {
    const phoneInput = document.getElementById('customer-phone');
    const phone = phoneInput.value.trim();

    // يجب أن يكون الرقم طويلاً بما يكفي (مثال: 5 أرقام)
    if (phone.length < 5) {
        return;
    }

    try {
        const response = await fetch(`api.php?action=check_customer_reward&phone=${encodeURIComponent(phone)}`);
        const result = await response.json();

        if (result.success && result.reward_message) {
            // 2. اعرض إشعاراً للعميل
            showNotification('success', '🎉 تهانينا!', result.reward_message);
            
            // تغيير لون حقل الهاتف
            phoneInput.classList.add('border-green-500', 'focus:ring-green-500');
        } else {
            // (اختياري) إزالة اللون الأخضر إذا غيّر رقمه ولم يعد مؤهلاً
             phoneInput.classList.remove('border-green-500', 'focus:ring-green-500');
        }
    } catch (error) {
        console.error('Error checking reward eligibility:', error);
    }
}

// 3. ربط الدالة بحدث "الخروج من الحقل" (onblur)
const phoneField = document.getElementById('customer-phone');
if (phoneField) {
    phoneField.addEventListener('blur', checkRewardEligibility);
}



// ====================================
// 🔍 Image Zoom Feature
// ====================================

/**
 * نظام عرض الصور بحجم كبير عند الضغط عليها
 * يعمل على جميع صور المنتجات في الموقع
 */

// إنشاء عنصر الـ Modal للصور مرة واحدة عند تحميل الصفحة
function createImageZoomModal() {
    // التحقق من عدم وجود Modal مسبقاً
    if (document.getElementById('image-zoom-modal')) {
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'image-zoom-modal';
    modal.className = 'fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] hidden flex items-center justify-center p-4';
    modal.style.cursor = 'zoom-out';
    
    modal.innerHTML = `
        <div class="relative max-w-7xl max-h-[90vh] flex items-center justify-center">
            <!-- زر الإغلاق -->
            <button 
                id="close-zoom-modal" 
                class="absolute top-4 right-4 z-10 w-12 h-12 bg-neutral-200 hover:bg-neutral-100 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                title="إغلاق (ESC)">
                <i class="fas fa-times text-xl"></i>
            </button>
            
            <!-- عداد الصور (في حالة وجود عدة صور) -->
            <div id="zoom-counter" class="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold hidden">
                <span id="current-image-index">1</span> / <span id="total-images">1</span>
            </div>
            
            <!-- أزرار التنقل -->
            <button 
                id="prev-zoom-image" 
                class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg hidden"
                title="الصورة السابقة (←)">
                <i class="fas fa-chevron-right text-xl"></i>
            </button>
            
            <button 
                id="next-zoom-image" 
                class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg hidden"
                title="الصورة التالية (→)">
                <i class="fas fa-chevron-left text-xl"></i>
            </button>
            
            <!-- حاوية الصورة -->
            <div class="relative w-full h-full flex items-center justify-center">
                <img 
                    id="zoomed-image" 
                    src="" 
                    alt="صورة مكبرة" 
                    class="max-w-full max-h-full object-contain rounded-lg shadow-2xl transform transition-all duration-300"
                    style="cursor: zoom-out;">
                
                <!-- مؤشر التحميل -->
                <div id="zoom-loading" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <div class="flex flex-col items-center gap-3">
                        <i class="fas fa-spinner fa-spin text-white text-4xl"></i>
                        <span class="text-white text-sm">جاري التحميل...</span>
                    </div>
                </div>
            </div>
            
            <!-- معلومات المنتج (اختياري) -->
            <div id="zoom-product-info" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white text-sm font-semibold max-w-md text-center hidden">
                <span id="zoom-product-name"></span>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إضافة مستمعي الأحداث
    setupZoomModalEvents();
}

// إعداد أحداث الـ Modal
function setupZoomModalEvents() {
    const modal = document.getElementById('image-zoom-modal');
    const closeBtn = document.getElementById('close-zoom-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    const loadingIndicator = document.getElementById('zoom-loading');
    
    // إغلاق عند النقر على الخلفية
modal.addEventListener('click', (e) => {
    // إغلاق فقط إذا تم النقر مباشرة على خلفية الـ modal (وليس على أي عنصر داخله)
    if (e.target === modal) {
        closeImageZoom();
    }
});
    
    // إغلاق عند النقر على زر الإغلاق
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeImageZoom();
    });
    
    // إغلاق عند الضغط على ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeImageZoom();
        }
    });
    
    // إخفاء مؤشر التحميل عند اكتمال تحميل الصورة
    zoomedImage.addEventListener('load', () => {
        loadingIndicator.classList.add('hidden');
        zoomedImage.style.opacity = '1';
    });
    
    // إظهار مؤشر التحميل عند بدء تحميل صورة جديدة
    zoomedImage.addEventListener('loadstart', () => {
        loadingIndicator.classList.remove('hidden');
        zoomedImage.style.opacity = '0.5';
    });
}

// فتح الصورة المكبرة
function openImageZoom(imageSrc, productName = '') {
    const modal = document.getElementById('image-zoom-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    const productInfo = document.getElementById('zoom-product-info');
    const productNameSpan = document.getElementById('zoom-product-name');
    
    // تعيين الصورة
    zoomedImage.src = imageSrc;
    
    // عرض معلومات المنتج إن وجدت
    if (productName) {
        productNameSpan.textContent = productName;
        productInfo.classList.remove('hidden');
    } else {
        productInfo.classList.add('hidden');
    }
    
    // إظهار الـ Modal
    modal.classList.remove('hidden');
    
    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
    
    // إضافة تأثير الظهور
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// إغلاق الصورة المكبرة
function closeImageZoom() {
    const modal = document.getElementById('image-zoom-modal');
    
    // تأثير الاختفاء
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        // إعادة التمرير في الخلفية
        document.body.style.overflow = '';
    }, 300);
}

// إضافة خاصية الزوم لجميع صور المنتجات
function initializeProductImageZoom() {
    // الانتظار قليلاً للتأكد من تحميل جميع العناصر
    setTimeout(() => {
        // البحث عن جميع صور المنتجات في البطاقات الحديثة
        const productImages = document.querySelectorAll(`
    .product-card-modern img,
    .new-product-card img,
    #top-products-container img,
    #new-products-container img,
    .products-grid img,
    [data-product-image]
`);
        
        productImages.forEach(img => {
            // إزالة أي مستمع سابق لتجنب التكرار
            img.style.cursor = 'zoom-in';
            
            // إضافة حدث النقر
            img.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // منع انتشار الحدث للعناصر الأب
                
                const imageSrc = this.src;
                // محاولة الحصول على اسم المنتج من العنصر الأقرب
                const productCard = this.closest('.product-card-modern');
                const productName = productCard ? 
                    productCard.querySelector('h4, h3')?.textContent?.trim() : '';
                
                openImageZoom(imageSrc, productName);
            });
            
            // إضافة تأثير hover للإشارة إلى إمكانية التكبير
            img.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            
            img.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        console.log(`✅ تم تفعيل خاصية Zoom على ${productImages.length} صورة منتج`);
    }, 500);
}

// التحديث التلقائي عند تحميل محتوى جديد
function observeProductChanges() {
    // استخدام MutationObserver لمراقبة التغييرات في DOM
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                // تحقق إذا كان العقد الجديد أو أي من أبنائه يحتوي على صورة منتج
                if (
                    node.matches?.('[data-product-image], .product-card-modern, .new-product-card') ||
                    node.querySelector?.('[data-product-image], .product-card-modern, .new-product-card')
                ) {
                    initializeProductImageZoom();
                    return;
                }
            }
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
    
    // مراقبة جميع الحاويات الرئيسية للمنتجات
    const containersToObserve = [
        '#products-container',
        '#top-products-container',
        '#new-products-container',
        '.products-grid'
    ];
    
    containersToObserve.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    });
}

// إعادة تفعيل النظام بعد تحديث المحتوى (للاستخدام في السكريبتات الأخرى)
window.refreshImageZoom = function() {
    initializeProductImageZoom();
};

// ====================================
// نهاية نظام Image Zoom
// ====================================



/**
 * 🚀 [نسخة محدثة 2.0]
 * إنشاء فاتورة كملف PDF وتحميلها
 * تدعم: خصم المتجر، خصم الكوبون، خصم منتج الحظ، والمنتجات الهدية.
 * تستخدم html2canvas لضمان دعم اللغة العربية
 */
async function generateAndDownloadInvoice(orderId, orderData, storeDiscount, couponDiscount, luckyDiscount, addedGift) {
    // 1. جلب المكتبات (للتأكد فقط)
    const { jsPDF } = window.jspdf;
    if (typeof html2canvas === 'undefined' || typeof jsPDF === 'undefined') {
        console.error('jsPDF or html2canvas is not loaded');
        return;
    }

    // 2. جلب البيانات (من السلة الحالية DOM)
    const cartItems = Object.values(cart);
    const subtotal = document.getElementById('cart-subtotal-before-discount').textContent;
    const deliveryFee = document.getElementById('cart-delivery-fee').textContent;
    const total = document.getElementById('cart-total').textContent;
    const orderDate = new Date().toLocaleString('en-SY');

    // 3. بناء كود HTML للفاتورة (باستخدام Tailwind)
    const invoiceHTML = `
        <div id="invoice-builder" 
             style="font-family: 'Tajawal', sans-serif; width: 800px; padding: 20px; background: white; border: 1px solid #eee; margin: 0 auto; direction: rtl;"
             dir="rtl">
            
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f472b6; padding-bottom: 10px;">
                <div>
                    <h1 style="color: #d63384; font-size: 2.5rem; font-weight: bold; margin: 0;">MS-Beauty</h1>
                    <p style="font-size: 0.9rem; color: #555;">فاتورة طلب</p>
                </div>
                <div style="text-align: left;">
                    <p style="margin: 0; font-weight: bold;">رقم الطلب: #${orderId}</p>
                    <p style="margin: 0; color: #555;">التاريخ: ${orderDate}</p>
                </div>
            </div>

            <div style="margin-top: 20px; padding: 10px; background-color: #fce7f3; border-radius: 10px;">
                <h3 style="margin: 0 0 10px 0; font-weight: bold; color: #d63384; border-bottom: 1px solid #fbcfe8; padding-bottom: 5px;">معلومات العميل</h3>
                <p style="margin: 2px 0;"><strong>الاسم:</strong> ${escapeHtml(orderData.customer_name)}</p>
                <p style="margin: 2px 0;"><strong>الهاتف:</strong> ${escapeHtml(orderData.customer_phone)}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem;">
                <thead>
                    <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                        <th style="padding: 10px; text-align: right; color: #333;">المنتج</th>
                        <th style="padding: 10px; text-align: center; color: #333;">الكمية</th>
                        <th style="padding: 10px; text-align: center; color: #333;">سعر الوحدة</th>
                        <th style="padding: 10px; text-align: left; color: #333;">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${cartItems.map(item => {
                        const originalProduct = allProducts.find(p => p.id == item.id);
                        const hasDiscount = originalProduct && isProductEligibleForDiscount(originalProduct);
                        const price = parseFloat(item.price);
                        const discountedPrice = hasDiscount ? price - (price * discountValue / 100) : price;
                        const itemTotal = discountedPrice * item.quantity;
                        
                        return `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px; display: flex; align-items: center; gap: 10px;">
                                <img src="${escapeHtml(item.image)}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 5px; border: 1px solid #eee;">
                                <div>
                                    <strong style="color: #000;">${escapeHtml(item.name)}</strong>
                                    ${item.variant_name ? `<span style="display: block; font-size: 0.8rem; color: #555;">- ${escapeHtml(item.variant_name)}</span>` : ''}
                                </div>
                            </td>
                            <td style="padding: 10px; text-align: center; font-weight: bold;">${item.quantity}</td>
                            <td style="padding: 10px; text-align: center;">$${discountedPrice.toFixed(2)}</td>
                            <td style="padding: 10px; text-align: left; font-weight: bold; color: #d63384;">$${itemTotal.toFixed(2)}</td>
                        </tr>
                        `;
                    }).join('')}
                    
                    ${addedGift ? `
                    <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f0fdf4;">
                        <td style="padding: 10px; display: flex; align-items: center; gap: 10px;">
                            <img src="${escapeHtml(addedGift.image || 'uploads/placeholder.jpg')}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 5px; border: 1px solid #eee;">
                            <div>
                                <strong style="color: #166534;">${escapeHtml(addedGift.name)} (هدية 🎁)</strong>
                                ${addedGift.variant_name ? `<span style="display: block; font-size: 0.8rem; color: #15803d;">- ${escapeHtml(addedGift.variant_name)}</span>` : ''}
                            </div>
                        </td>
                        <td style="padding: 10px; text-align: center; font-weight: bold; color: #166534;">1</td>
                        <td style="padding: 10px; text-align: center; color: #166534;">$0.00</td>
                        <td style="padding: 10px; text-align: left; font-weight: bold; color: #166534;">$0.00</td>
                    </tr>
                    ` : ''}
                    </tbody>
            </table>

            <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                <div style="width: 100%; max-width: 300px; font-size: 0.95rem; color: #333;">
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                        <span>المجموع الفرعي:</span>
                        <span style="font-weight: bold;">${subtotal}</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; color: #dc3545;">
                        <span>خصم المتجر:</span>
                        <span style="font-weight: bold;">-$${storeDiscount.toFixed(2)}</span>
                    </div>
                    
                    ${(couponDiscount > 0 && appliedCoupon) ? `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; color: #0d6efd;">
                        <span>خصم الكوبون (${appliedCoupon.code}):</span>
                        <span style="font-weight: bold;">-$${couponDiscount.toFixed(2)}</span>
                    </div>
                    ` : ''}

                    ${(luckyDiscount > 0 && activeLuckyProduct) ? `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; color: #ca8a04;">
                        <span>خصم منتج الحظ (${activeLuckyProduct.discount_percent}%):</span>
                        <span style="font-weight: bold;">-$${luckyDiscount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                        <span>رسوم التوصيل:</span>
                        <span style="font-weight: bold;">${deliveryFee}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; margin-top: 5px; background: #fce7f3; border-radius: 5px; padding: 10px;">
                        <span style="font-weight: bold; font-size: 1.2rem; color: #d63384;">الإجمالي النهائي:</span>
                        <span style="font-weight: bold; font-size: 1.2rem; color: #d63384;">${total}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px; text-align: center; font-size: 0.9rem; color: #777; border-top: 1px solid #eee; padding-top: 15px;">
                <p>شكراً لطلبك من MS-Beauty!</p>
            </div>
        </div>
    `;

    // 4. إنشاء عنصر HTML مخفي
    const invoiceElement = document.createElement('div');
    invoiceElement.innerHTML = invoiceHTML;
    // إضافة العنصر خارج الشاشة ليتمكن المتصفح من رندرته
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.top = '0';
    document.body.appendChild(invoiceElement);

    // 5. استخدام html2canvas لـ "تصوير" العنصر
    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        const canvas = await html2canvas(document.getElementById('invoice-builder'), {
            scale: 2, // زيادة الدقة
            useCORS: true // للسماح بتحميل الصور
        });

        // 6. إضافة الصورة (الـ canvas) إلى jsPDF
        const imgData = canvas.toDataURL('image/jpg');
        const pdf = new jsPDF('p', 'mm', 'a6');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'jpg', 0, 0, pdfWidth, pdfHeight);

        // 7. تحميل الملف
        pdf.save(`invoice-${orderId}.pdf`);

    } catch (e) {
        console.error("Error generating PDF:", e);
        throw new Error("PDF generation failed"); // لإعلام دالة processOrder
    } finally {
        // 8. إزالة العنصر المخفي
        document.body.removeChild(invoiceElement);
    }
}