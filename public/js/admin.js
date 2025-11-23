// Existing JS code...
    const addProductForm = document.getElementById('add-product-form');
    const addCategoryForm = document.getElementById('add-category-form');
    const settingsForm = document.getElementById('settings-form');
    const editProductForm = document.getElementById('edit-product-form');
    const editCategoryForm = document.getElementById('edit-category-form');
    
    const addModal = document.getElementById('add-product-modal');
    const addModalContent = document.getElementById('add-modal-content');
    const editModal = document.getElementById('edit-product-modal');
    const modalContent = document.getElementById('modal-content');
    const editCategoryModal = document.getElementById('edit-category-modal');
    const categoryModalContent = document.getElementById('category-modal-content');
    let invoiceItems = [];

// === Lucky Product JS ===
let selectedLuckyProduct = null;

function openLuckyProductModal(currentData = null) {
    const modal = document.getElementById('lucky-product-modal');
    const form = document.getElementById('lucky-product-form');

    // 1. إعادة تعيين النموذج إلى حالته الافتراضية
    form.reset();
    document.getElementById('lucky-search-results').classList.add('hidden');
    document.getElementById('lucky-product-search').value = '';
    document.getElementById('selected-lucky-product-id').value = '';
    document.getElementById('selected-lucky-product-preview').innerHTML = '';
    selectedLuckyProduct = null;
    toggleLuckyProductSelection('manual'); // الافتراضي هو يدوي

    // 2. تعيين التواريخ الافتراضية (لإضافة جديد)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    form.querySelector('input[name="active_from"]').value = today;
    form.querySelector('input[name="active_to"]').value = thirtyDays;

    // 3. إذا تم تمرير بيانات (من زر "تغيير")، قم بتعبئة الحقول
    if (currentData) {
        // فرض الاختيار اليدوي عند التعديل
        form.querySelector('input[name="selection_method"][value="manual"]').checked = true;
        toggleLuckyProductSelection('manual');

        // تعبئة المنتج المختار
        document.getElementById('selected-lucky-product-id').value = currentData.product_id;
        const previewHTML = `<strong>المنتج المختار:</strong> ${escapeHtml(currentData.product_name)}`;
        document.getElementById('selected-lucky-product-preview').innerHTML = previewHTML;
        selectedLuckyProduct = { id: currentData.product_id, name: currentData.product_name };

        // تعبئة باقي الحقول
        form.querySelector('input[name="discount_percent"]').value = currentData.discount_percent;
        // تنسيق التاريخ (البيانات تأتي كـ Y-m-d H:i:s ونحن بحاجة لـ Y-m-d)
        form.querySelector('input[name="active_from"]').value = currentData.active_from.split(' ')[0];
        form.querySelector('input[name="active_to"]').value = currentData.active_to.split(' ')[0];
        form.querySelector('input[name="note"]').value = currentData.note || '';
    }

    // 4. إظهار النافذة
    modal.classList.remove('hidden');
    document.getElementById('lucky-product-search').focus();
}






// === SEARCH & ADD LOGIC (Mimics accounting.php) ===
const productSearchInput = document.getElementById('product-search');
const searchResultsContainer = document.getElementById('search-results');

// دالة للتحقق إذا كان الإدخال باركود (أرقام فقط)
function isBarcodeInput(input) {
    return /^\d+$/.test(input) && input.length >= 3;
}

// عند الضغط على Enter → إذا كان باركود، أضف مباشرة
productSearchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const term = productSearchInput.value.trim();
        if (term.length >= 3) {
            await handleBarcodeSearch(term);
        }
    }
});

// عند الكتابة → بحث نصي فوري
productSearchInput.addEventListener('input', async () => {
    const term = productSearchInput.value.trim();
    if (term.length < 1) {
        searchResultsContainer.classList.add('hidden');
        return;
    }
    if (!isBarcodeInput(term)) {
        await handleTextSearch(term);
    }
});

// إغلاق نتائج البحث عند النقر خارجها
document.addEventListener('click', (e) => {
    if (!productSearchInput.parentElement.contains(e.target)) {
        searchResultsContainer.classList.add('hidden');
    }
});











function closeLuckyProductModal() {
    document.getElementById('lucky-product-modal').classList.add('hidden');
    document.getElementById('lucky-search-results').classList.add('hidden');
    document.getElementById('lucky-product-search').value = '';
    document.getElementById('selected-lucky-product-id').value = '';
    document.getElementById('selected-lucky-product-preview').innerHTML = '';
    selectedLuckyProduct = null;
}

function toggleLuckyProductSelection(method) {
    const manual = document.getElementById('manual-selection');
    const auto = document.getElementById('auto-selection');
    if (method === 'manual') {
        manual.classList.remove('hidden');
        auto.classList.add('hidden');
    } else {
        manual.classList.add('hidden');
        auto.classList.remove('hidden');
    }
}

// Search for products in lucky modal
document.getElementById('lucky-product-search').addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    if (term.length < 2) {
        document.getElementById('lucky-search-results').classList.add('hidden');
        return;
    }
    try {
        const res = await fetch(`api.php?action=search_products&term=${encodeURIComponent(term)}`);
        const data = await res.json();
        const container = document.getElementById('lucky-search-results');
        container.innerHTML = '';
        if (data.success && data.data.length > 0) {
            data.data.forEach(p => {
                const div = document.createElement('div');
                div.className = 'p-2 hover:bg-yellow-50 cursor-pointer flex items-center gap-2';
                div.innerHTML = `
                    <img src="${p.image}" class="w-8 h-8 rounded object-cover">
                    <span>${p.name} ${p.variant_name ? ' - ' + p.variant_name : ''}</span>
                `;
                div.onclick = () => {
                    selectedLuckyProduct = p;
                    document.getElementById('selected-lucky-product-id').value = p.id;
                    document.getElementById('selected-lucky-product-preview').innerHTML = `
                        <strong>المنتج المختار:</strong> ${p.name} ${p.variant_name ? ' - ' + p.variant_name : ''}
                    `;
                    container.classList.add('hidden');
                };
                container.appendChild(div);
            });
            container.classList.remove('hidden');
        } else {
            container.innerHTML = '<div class="p-2 text-gray-500 text-sm">لا توجد نتائج</div>';
            container.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
    }
});

// Submit lucky product form
document.getElementById('lucky-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const method = formData.get('selection_method');
    if (method === 'manual' && !selectedLuckyProduct) {
        showNotification('يرجى اختيار منتج', 'error');
        return;
    }
    try {
        const res = await fetch('api.php', { method: 'POST', body: formData });
        const result = await res.json();
        if (result.success) {
            showNotification('تم تعيين منتج الحظ بنجاح!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
});

// Disable current lucky product
async function disableLuckyProduct(id) {
    if (!confirm('هل تريد تعطيل منتج الحظ الحالي؟')) return;
    const fd = new FormData();
    fd.append('action', 'disable_lucky_product');
    fd.append('id', id);
    try {
        const res = await fetch('api.php', { method: 'POST', body: fd });
        const result = await res.json();
        if (result.success) {
            showNotification('تم تعطيل منتج الحظ', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
}


    // Handle Add Product
addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const barcodeInput = document.getElementById('product-barcode');
    const barcode = barcodeInput.value.trim();
    if (barcode && !isBarcodeUnique) {
        showNotification('الباركود مستخدم مسبقاً. يرجى استخدام باركود فريد.', 'error');
        barcodeInput.focus();
        return;
    }

    const hasVariantsCheckbox = document.getElementById('product-has-variants');
    const hasVariants = hasVariantsCheckbox && hasVariantsCheckbox.checked;
    const variants = collectVariants();

    // جمع البيانات يدويًا لضمان تضمين stock حتى لو كان الحقل معطّلًا
    const formData = new FormData();
    formData.append('action', 'add_product');
    formData.append('name', document.getElementById('product-name').value.trim());
    formData.append('description', document.getElementById('product-description').value.trim() || '');
    formData.append('price', document.getElementById('product-price').value.trim());
    formData.append('category_id', document.getElementById('product-category').value);
    
    // ✅ التصحيح هنا: نضمن إرسال الكمية من الحقل الرئيسي دائمًا إذا لم تكن هناك درجات
    const stockInput = document.getElementById('product-stock');
    const stockValue = stockInput ? stockInput.value.trim() : '0';
    const barcodeValue = barcodeInput ? barcodeInput.value.trim() : '';

    // ✅ التصحيح: إرسال المخزون والباركود فقط عندما لا توجد درجات
    if (!hasVariants || variants.length === 0) {
        formData.append('stock', stockValue || '0');
        formData.append('barcode', barcodeValue);
        formData.append('has_variants', '0'); // لأن الدرجات غير مضافة فعليًا
    } else {
        formData.append('has_variants', '1');
        // لا نرسل stock أو barcode من الحقل الرئيسي لأن الدرجات ستُدار بشكل منفصل
        // ولكن نرسل قيم افتراضية لتجنب الأخطاء
        formData.append('stock', '0');
        formData.append('barcode', '');
    }

    // إرسال الصورة
    const imageInput = document.getElementById('product-image');
    if (imageInput && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    // معالجة "منتج جديد"
    const isNew = document.getElementById('product-is-new').checked;
    formData.append('is_new', isNew ? '1' : '0');
    if (isNew) {
        const newUntil = document.getElementById('product-new-until').value;
        if (newUntil) formData.append('new_until', newUntil);
    }

    // --- إرسال المنتج أولاً ---
    const response = await fetch('api.php', { method: 'POST', body: formData });
    const result = await response.json();

    if (result.success) {
        // --- إذا كان هناك درجات مضافة فعليًا، نُرسلها الآن ---
        if (hasVariants && variants.length > 0 && result.product_id) {
            try {
                const vForm = new FormData();
                vForm.append('action', 'add_variants');
                vForm.append('product_id', result.product_id);
                const cleanVariants = variants.map(v => {
                    const vv = { ...v };
                    if (vv.image && vv.image.startsWith('__FILE__')) {
                        vv.image = null;
                    }
                    return vv;
                });
                vForm.append('variants', JSON.stringify(cleanVariants));
                const fileInputs = Array.from(document.querySelectorAll('#variant-list [data-variant-field="image"]'));
                fileInputs.forEach(input => {
                    if (input.files[0]) {
                        vForm.append('variant_images[]', input.files[0]);
                    }
                });
                const vResp = await fetch('api.php', { method: 'POST', body: vForm });
                const vRes = await vResp.json();
                if (!vRes.success) {
                    showNotification('تم إنشاء المنتج لكن حدث خطأ بإضافة الدرجات', 'warning');
                }
            } catch (err) {
                console.error(err);
                showNotification('تم إنشاء المنتج لكن تعذر حفظ الدرجات', 'warning');
            }
        }

        showNotification('تمت إضافة المنتج بنجاح!', 'success');

        if (shouldPreserveInvoiceData) {
            closeAddProductModal();
            setTimeout(() => {
                const searchInput = document.getElementById('product-search');
                if (searchInput) searchInput.focus();
            }, 400);
        } else {
            setTimeout(() => location.reload(), 1500);
        }
    } else {
        showNotification('خطأ: ' + result.message, 'error');
    }
});

    // Handle Add Category
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addCategoryForm);
        const response = await fetch('api.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
            showNotification('تمت إضافة القسم بنجاح!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    });

    // Handle Settings Update
    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(settingsForm);
        const response = await fetch('api.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
            showNotification('تم حفظ الإعدادات بنجاح!', 'success');
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    });

    // Variants Management for Edit Modal
    let currentVariants = [];
    let deletedVariants = [];

    // Toggle variants section in edit modal
    document.getElementById('edit-product-has-variants').addEventListener('change', function(e) {
        const variantsSection = document.getElementById('edit-variants-section');
        const basicFields = document.getElementById('edit-product-basic-fields');
        const note = document.getElementById('edit-has-variants-note');
        const barcodeInput = document.getElementById('edit-product-barcode');
        const stockInput = document.getElementById('edit-product-stock');

        if (e.target.checked) {
            variantsSection.style.display = 'block';
            note.style.display = 'block';
            // Disable basic fields when variants are enabled
            if (barcodeInput) barcodeInput.disabled = true;
            if (stockInput) stockInput.disabled = true;
            loadProductVariants();
        } else {
            variantsSection.style.display = 'none';
            note.style.display = 'none';
            // Enable basic fields when variants are disabled
            if (barcodeInput) barcodeInput.disabled = false;
            if (stockInput) stockInput.disabled = false;
            currentVariants = [];
            renderEditVariants();
        }
    });

    // Load product variants
    function loadProductVariants() {
        const productId = document.getElementById('edit-product-id').value;
        if (!productId) return;

        fetch(`api.php?action=get_variants&product_id=${productId}`)
            .then(r => r.json())
            .then(res => {
                if (res.success && Array.isArray(res.data)) {
                    currentVariants = res.data.map(v => ({
                        ...v,
                        isNew: false
                    }));
                    renderEditVariants();
                }
            })
            .catch(err => console.error('Error loading variants:', err));
    }

    // Render variants in edit modal
    function renderEditVariants() {
    const container = document.getElementById('edit-variants-list');
    const noVariantsMsg = document.getElementById('edit-no-variants-message');
    
    if (!container) {
        console.error('❌ Container not found');
        return;
    }

    if (currentVariants.length === 0) {
        container.innerHTML = '';
        if (noVariantsMsg) noVariantsMsg.style.display = 'block';
        return;
    }

    if (noVariantsMsg) noVariantsMsg.style.display = 'none';
    
    container.innerHTML = currentVariants.map((variant, index) => {
        const isNew = String(variant.id).startsWith('new_');
        const displayId = isNew ? 'جديد' : variant.id;
        
        return `
            <div class="variant-edit-item bg-white p-4 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all" data-variant-id="${variant.id}">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                            ${index + 1}
                        </span>
                        الدرجة #${displayId}
                        ${isNew ? '<span class="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">⬤ جديد</span>' : ''}
                    </h5>
                    <button type="button" onclick="removeEditVariant('${variant.id}')" 
                            class="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs transition-colors">
                        <i class="fas fa-trash mr-1"></i> حذف
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                        <label class="text-xs font-semibold text-gray-600 block mb-1">اسم الدرجة</label>
                        <input type="text" 
                               value="${escapeHtml(variant.name || '')}" 
                               onchange="updateVariantField('${variant.id}', 'name', this.value)"
                               class="form-input text-sm" 
                               placeholder="اسم الدرجة">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 block mb-1">الباركود *</label>
                        <input type="text" 
                               value="${escapeHtml(variant.barcode || '')}" 
                               onchange="updateVariantField('${variant.id}', 'barcode', this.value)"
                               class="form-input text-sm" 
                               placeholder="رقم الباركود" 
                               required>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 block mb-1">الكمية</label>
                        <input type="number" 
                               value="${variant.stock || 0}" 
                               onchange="updateVariantField('${variant.id}', 'stock', this.value)"
                               class="form-input text-sm" 
                               min="0">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-gray-600 block mb-1">سعر خاص</label>
                        <input type="number" 
                               step="0.01" 
                               value="${variant.price_override !== null ? variant.price_override : ''}" 
                               onchange="updateVariantField('${variant.id}', 'price_override', this.value)"
                               class="form-input text-sm" 
                               placeholder="اتركه فارغاً للسعر الأساسي">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-semibold text-gray-600 block mb-1">صورة الدرجة</label>
                        <input type="file" 
                               id="variant_image_${variant.id}"
                               onchange="handleVariantImageChange('${variant.id}', this)"
                               class="form-input text-sm" 
                               accept="image/*">
                        ${variant.image && variant.image !== 'uploads/placeholder.jpg' && !variant.hasNewImage ? `
                            <div class="mt-2 flex items-center gap-2">
                                <img src="${variant.image}" class="w-12 h-12 rounded-lg object-cover border">
                                <span class="text-xs text-gray-500">الصورة الحالية</span>
                            </div>
                        ` : ''}
                        ${variant.hasNewImage ? `
                            <div class="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <i class="fas fa-check-circle"></i>
                                <span>تم اختيار صورة جديدة</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

    // Add new variant in edit modal
    document.getElementById('edit-add-variant-btn').addEventListener('click', function() {
        const newVariant = {
            id: 'new_' + Date.now(),
            name: '',
            barcode: '',
            stock: 0,
            price_override: null,
            image: null,
            isNew: true
        };
        
        currentVariants.push(newVariant);
        renderEditVariants();
    });

    // Remove variant
    function removeEditVariant(variantId) {
    if (!confirm('هل أنت متأكد من حذف هذه الدرجة؟')) return;
    
    console.log('🗑️ Removing variant:', variantId);
    
    // إذا كانت الدرجة موجودة (ليست جديدة)
    const variantIdStr = String(variantId);
    if (!variantIdStr.startsWith('new_')) {
        const numericId = parseInt(variantId);
        if (!isNaN(numericId) && numericId > 0) {
            if (!deletedVariants.includes(numericId)) {
                deletedVariants.push(numericId);
                console.log('✅ Added to deleted list:', numericId);
            }
        }
    }
    
    // إزالة من القائمة الحالية
    currentVariants = currentVariants.filter(v => String(v.id) !== variantIdStr);
    renderEditVariants();
    console.log('✅ Variant removed from display');
}

    // Update variant field
function updateVariantField(variantId, field, value) {
    console.log('🔄 Updating variant field:', { variantId, field, value });
    
    const variant = currentVariants.find(v => String(v.id) === String(variantId));
    if (!variant) {
        console.error('❌ Variant not found:', variantId);
        return;
    }
    
    // تحديث القيمة بناءً على نوع الحقل
    if (field === 'stock') {
        variant[field] = parseInt(value) || 0;
    } else if (field === 'price_override') {
        variant[field] = value === '' ? null : parseFloat(value);
    } else {
        variant[field] = value;
    }
    
    console.log('✅ Variant updated:', variant);
}

    // Handle variant image change
function handleVariantImageChange(variantId, input) {
    console.log('🖼️ Handling image change for variant:', variantId);
    
    const variant = currentVariants.find(v => String(v.id) === String(variantId));
    if (!variant) {
        console.error('❌ Variant not found:', variantId);
        return;
    }
    
    if (input.files && input.files[0]) {
        // تخزين الملف مباشرة في كائن الدرجة
        variant.imageFile = input.files[0];
        variant.hasNewImage = true;
        console.log('✅ Image file stored:', {
            variantId: variant.id,
            fileName: input.files[0].name,
            fileSize: input.files[0].size
        });
    }
}


document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.group('📝 Submitting Product Edit');
    console.log('Current variants:', currentVariants);
    console.log('Deleted variants:', deletedVariants);
    
    const formData = new FormData(e.target);
    const hasVariants = document.getElementById('edit-product-has-variants').checked;
    
    // إضافة بيانات الدرجات
    formData.set('has_variants', hasVariants ? '1' : '0');
    formData.set('variants', JSON.stringify(currentVariants));
    formData.set('deleted_variants', JSON.stringify(deletedVariants));

    // إضافة ملفات الصور للدرجات
    let imageCount = 0;
    currentVariants.forEach(variant => {
        if (variant.imageFile) {
            const key = `variant_image_${variant.id}`;
            formData.append(key, variant.imageFile);
            imageCount++;
            console.log(`✅ Added image file for variant ${variant.id}:`, variant.imageFile.name);
        }
    });
    
    console.log(`📎 Total images attached: ${imageCount}`);

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...';
    submitButton.disabled = true;

    try {
        console.log('🚀 Sending request to server...');
        
        const response = await fetch('api.php', { 
            method: 'POST', 
            body: formData 
        });
        
        const result = await response.json();
        console.log('📥 Server response:', result);
        
        if (result.success) {
            console.log('✅ Update successful');
            showNotification('تم تعديل المنتج ودرجاته بنجاح!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            throw new Error(result.message || 'حدث خطأ غير متوقع');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('خطأ في الاتصال: ' + error.message, 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
    
    console.groupEnd();
});



    // Enhanced openEditModal function
    function openEditModal(product) {
    console.group('🔧 Opening Edit Modal');
    console.log('Product:', product);
    
    // إعادة تعيين البيانات
    currentVariants = [];
    deletedVariants = [];
    
    // ملء الحقول الأساسية
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-description').value = product.description;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-stock').value = product.stock;
    document.getElementById('edit-product-barcode').value = product.barcode || '';
    document.getElementById('edit-product-category').value = product.category_id;
    
    // معالجة "منتج جديد"
    document.getElementById('edit-product-is-new').checked = product.is_new == 1;
    document.getElementById('edit-product-new-until').value = product.new_until || '';
    
    const editNewUntilContainer = document.getElementById('edit-new-until-container');
    if (product.is_new == 1) {
        editNewUntilContainer.classList.remove('hidden');
    } else {
        editNewUntilContainer.classList.add('hidden');
    }

    // عرض الصورة الحالية
    const currentImageDiv = document.getElementById('edit-current-image');
    if (product.image && product.image !== 'uploads/placeholder.jpg') {
        currentImageDiv.innerHTML = `
            <div class="flex items-center gap-3 mt-2">
                <img src="${product.image}" class="w-16 h-16 rounded-lg object-cover border-2 border-gray-200">
                <span class="text-sm text-gray-600">الصورة الحالية</span>
            </div>
        `;
    } else {
        currentImageDiv.innerHTML = '';
    }
    
    // تحميل الدرجات
    fetch(`api.php?action=get_variants&product_id=${product.id}`)
        .then(r => r.json())
        .then(res => {
            const hasVariants = res.success && Array.isArray(res.data) && res.data.length > 0;
            const hasVariantsCheckbox = document.getElementById('edit-product-has-variants');
            const variantsSection = document.getElementById('edit-variants-section');
            const note = document.getElementById('edit-has-variants-note');
            const barcodeInput = document.getElementById('edit-product-barcode');
            const stockInput = document.getElementById('edit-product-stock');
            
            console.log('📦 Has variants:', hasVariants);
            
            if (hasVariants) {
                hasVariantsCheckbox.checked = true;
                variantsSection.style.display = 'block';
                note.style.display = 'block';
                if (barcodeInput) barcodeInput.disabled = true;
                if (stockInput) stockInput.disabled = true;
                
                // تحميل الدرجات
                currentVariants = res.data.map(v => ({
                    ...v,
                    isNew: false,
                    hasNewImage: false
                }));
                
                console.log('✅ Loaded variants:', currentVariants);
                renderEditVariants();
            } else {
                hasVariantsCheckbox.checked = false;
                variantsSection.style.display = 'none';
                note.style.display = 'none';
                if (barcodeInput) barcodeInput.disabled = false;
                if (stockInput) stockInput.disabled = false;
            }
            
            console.groupEnd();
        })
        .catch(err => {
            console.error('❌ Error loading variants:', err);
            console.groupEnd();
        });
    
    // فتح النافذة
    const editModal = document.getElementById('edit-product-modal');
    const modalContent = document.getElementById('modal-content');
    
    editModal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

    // Enhanced edit product form submission
    editProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(editProductForm);
    const hasVariants = document.getElementById('edit-product-has-variants').checked;
    
    // Add variants data to form
    formData.set('has_variants', hasVariants ? '1' : '0');
    formData.set('variants', JSON.stringify(currentVariants));
    formData.set('deleted_variants', JSON.stringify(deletedVariants));

    // Append variant images as separate files with keys like variant_image_<id>
    currentVariants.forEach(variant => {
        if (variant.imageFile) {
            formData.append(`variant_image_${variant.id}`, variant.imageFile);
        }
    });

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...';
    submitButton.disabled = true;

    try {
        const response = await fetch('api.php', { 
            method: 'POST', 
            body: formData 
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم تعديل المنتج ودرجاته بنجاح!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

    // Handle Edit Category
    editCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editCategoryForm);
        const response = await fetch('api.php', { 
            method: 'POST', 
            body: formData 
        });
        const result = await response.json();
        if (result.success) {
            showNotification('تم تعديل القسم بنجاح!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    });

    // Handle Delete Product
    async function deleteProduct(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        const formData = new FormData();
        formData.append('action', 'delete_product');
        formData.append('id', id);
        const response = await fetch('api.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
            document.getElementById(`product-row-${id}`).remove();
            showNotification('تم حذف المنتج بنجاح', 'success');
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    }

    // Handle Delete Category
    async function deleteCategory(id) {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم نقل جميع المنتجات المرتبطة به إلى قسم افتراضي.')) return;
        const formData = new FormData();
        formData.append('action', 'delete_category');
        formData.append('id', id);
        const response = await fetch('api.php', { method: 'POST', body: formData });
        const result = await response.json();
        if (result.success) {
            document.getElementById(`category-item-${id}`).remove();
            showNotification('تم حذف القسم بنجاح', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    }

    // Modal Controls - Add Product
    //let preservedInvoiceItems = [];
let shouldPreserveInvoiceData = false;

function openAddProductModal(fromInvoice = false) {
    if (fromInvoice) {
        shouldPreserveInvoiceData = true;
        // أغلق الفاتورة أولًا، ثم افتح نافذة الإضافة بعد انتهاء الإغلاق
        closePurchaseInvoiceModal(() => {
            // هذا الكولباك يُنفَّذ بعد إغلاق الفاتورة تمامًا
            addModal.classList.remove('hidden');
            setTimeout(() => {
                addModalContent.classList.remove('scale-95', 'opacity-0');
                addModalContent.classList.add('scale-100', 'opacity-100');
                 const barcodeInput = document.getElementById('product-barcode');
        if (barcodeInput) {
            // تأكد من عدم إضافة الـ listener أكثر من مرة
            barcodeInput.removeEventListener('keypress', preventEnterSubmit);
            barcodeInput.addEventListener('keypress', preventEnterSubmit);
        }
            }, 10);
        });
        return;
    }
    // إذا لم تكن من فاتورة، افتح مباشرة
    addModal.classList.remove('hidden');
    setTimeout(() => {
        addModalContent.classList.remove('scale-95', 'opacity-0');
        addModalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}
// عرّف الدالة بشكل منفصل لتجنب التكرار
function preventEnterSubmit(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
}

    function closeAddProductModal() {
    addModalContent.classList.remove('scale-100', 'opacity-100');
    addModalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        addModal.classList.add('hidden');
        if (shouldPreserveInvoiceData) {
            shouldPreserveInvoiceData = false; // إعادة التعيين
            // ✅ إعادة فتح نافذة فاتورة المشتريات مباشرة
            openPurchaseInvoiceModal();
        }
    }, 300);
}

    // Modal Controls - Edit Product
    function closeEditModal() {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            editModal.classList.add('hidden');
        }, 300);
    }

    // Modal Controls - Category
    function openEditCategoryModal(category) {
        document.getElementById('edit-category-id').value = category.id;
        document.getElementById('edit-category-name').value = category.name;
        document.getElementById('edit-parent-section').value = category.parent_section;
        editCategoryModal.classList.remove('hidden');
        setTimeout(() => {
            categoryModalContent.classList.remove('scale-95', 'opacity-0');
            categoryModalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }
    function closeEditCategoryModal() {
        categoryModalContent.classList.remove('scale-100', 'opacity-100');
        categoryModalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            editCategoryModal.classList.add('hidden');
        }, 300);
    }

    // Handle Bulk Price Update
    document.getElementById('price-adjustment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const categorySelect = formData.get('category_id');
        const categoryText = e.target.querySelector(`option[value="${categorySelect}"]`).textContent;
        const adjustmentType = formData.get('adjustment_type');
        const percentage = formData.get('percentage');
        const fixedAmount = formData.get('fixed_amount');
        const actionText = adjustmentType === 'increase' ? 'زيادة' : 'تخفيض';
        let confirmMessage = `هل أنت متأكد من ${actionText} أسعار جميع المنتجات في "${categoryText}"`;
        if (percentage && parseFloat(percentage) !== 0) {
            confirmMessage += ` بنسبة ${percentage}%`;
        }
        if (fixedAmount && parseFloat(fixedAmount) !== 0) {
            confirmMessage += ` بمبلغ ${fixedAmount}`;
        }
        confirmMessage += '؟';
        if (!confirm(confirmMessage)) {
            return;
        }
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري التطبيق...';
        submitButton.disabled = true;
        try {
            const response = await fetch('api.php', { 
                method: 'POST', 
                body: formData 
            });
            const result = await response.json();
            if (result.success) {
                showNotification(result.message, 'success');
                setTimeout(() => location.reload(), 2000);
            } else {
                showNotification('خطأ: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('حدث خطأ في الاتصال', 'error');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });

    // Price Adjustment Toggle Functionality
    const priceAdjustmentToggle = document.getElementById('price-adjustment-toggle');
const priceAdjustmentContent = document.getElementById('price-adjustment-content');

if (priceAdjustmentToggle && priceAdjustmentContent) {
    let isPriceAdjustmentExpanded = false;
    priceAdjustmentToggle.addEventListener('click', () => {
        isPriceAdjustmentExpanded = !isPriceAdjustmentExpanded;
        if (isPriceAdjustmentExpanded) {
            priceAdjustmentContent.style.maxHeight = '800px';
            priceAdjustmentContent.style.opacity = '1';
            priceAdjustmentToggle.querySelector('i').classList.remove('fa-chevron-up');
            priceAdjustmentToggle.querySelector('i').classList.add('fa-chevron-down');
            priceAdjustmentToggle.classList.remove('bg-gray-200');
            priceAdjustmentToggle.classList.add('bg-gray-100');
            const preview = document.getElementById('price-adjustment-preview');
            if (preview) preview.style.display = 'none';
        } else {
            priceAdjustmentContent.style.maxHeight = '0';
            priceAdjustmentContent.style.opacity = '0';
            priceAdjustmentToggle.querySelector('i').classList.remove('fa-chevron-down');
            priceAdjustmentToggle.querySelector('i').classList.add('fa-chevron-up');
            priceAdjustmentToggle.classList.remove('bg-gray-100');
            priceAdjustmentToggle.classList.add('bg-gray-200');
            setTimeout(() => {
                const preview = document.getElementById('price-adjustment-preview');
                if (preview) preview.style.display = 'block';
            }, 300);
        }
    });
}

    // Notification System
    function showNotification(message, type = 'success') {
        const icons = {
            success: 'fa-check-circle text-green-500',
            error: 'fa-times-circle text-red-500',
            warning: 'fa-exclamation-circle text-yellow-500'
        };
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 z-[60] animate-bounce';
        notification.innerHTML = `
            <i class="fas ${icons[type]} text-2xl"></i>
            <span class="font-semibold text-gray-800">${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Close modal on outside click
    addModal.addEventListener('click', (e) => {
        if (e.target === addModal) {
            closeAddProductModal();
        }
    });
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    editCategoryModal.addEventListener('click', (e) => {
        if (e.target === editCategoryModal) {
            closeEditCategoryModal();
        }
    });

    // === Variants UI for Add Product ===
    const variantList = document.getElementById('variant-list');
    const addVariantBtn = document.getElementById('add-variant-btn');
    function renderVariantRow() {
        const row = document.createElement('div');
        row.className = 'variant-row bg-white p-4 rounded-xl border border-pink-100 space-y-4';
        row.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="text-xs font-semibold text-gray-600 block mb-1">اسم الدرجة</label>
                    <input type="text" placeholder="مثال: أحمر" class="form-input text-sm" data-variant-field="name">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-600 block mb-1">باركود (إلزامي)</label>
                    <input type="text" placeholder="رقم الباركود" class="form-input text-sm" data-variant-field="barcode" required>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="text-xs font-semibold text-gray-600 block mb-1">الكمية</label>
                    <input type="number" placeholder="0" class="form-input text-sm" data-variant-field="stock" value="0">
                </div>
                <div>
                    <label class="text-xs font-semibold text-gray-600 block mb-1">سعر خاص (اختياري)</label>
                    <input type="number" step="0.01" placeholder="اتركه فارغاً للسعر الأساسي" class="form-input text-sm" data-variant-field="price_override">
                </div>
                 <div>
                    <label class="text-xs font-semibold text-gray-600 block mb-1">صورة خاصة (اختياري)</label>
                    <input type="file" class="form-input text-sm" data-variant-field="image">
                </div>
            </div>
            <div class="text-left border-t border-gray-100 pt-3">
                 <button type="button" class="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm transition-colors" onclick="this.closest('.variant-row').remove()">
                    <i class="fas fa-trash-alt mr-1"></i> إزالة الدرجة
                </button>
            </div>
        `;
        variantList.appendChild(row);
    }
    function collectVariants() {
        const rows = Array.from(variantList.querySelectorAll('.variant-row'));
        const variants = rows.map((row, idx) => {
            const get = sel => row.querySelector(`[data-variant-field="${sel}"]`).value.trim();
            const imageInput = row.querySelector('[data-variant-field="image"]');
            const priceRaw = get('price_override');
            return {
                name: get('name'),
                barcode: get('barcode') || null,
                stock: parseInt(get('stock') || '0'),
                price_override: priceRaw === '' ? null : parseFloat(priceRaw),
                image: imageInput && imageInput.files && imageInput.files[0] ? `__FILE__${idx}` : null
            };
        }).filter(v => v.name);
        return variants;
    }
    addVariantBtn.addEventListener('click', renderVariantRow);

    // Toggle add-variants block and disable product barcode/stock when has_variants is checked
    const hasVariantsCheckbox = document.getElementById('product-has-variants');
    const addVariantsBlock = document.getElementById('add-variants-block');
    const productBarcodeInput = document.getElementById('product-barcode');
    const productStockInput = document.getElementById('product-stock');
    if (hasVariantsCheckbox) {
        hasVariantsCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                addVariantsBlock.style.display = 'block';
                // clear and disable product-level barcode/stock
                if (productBarcodeInput) { productBarcodeInput.value = ''; productBarcodeInput.disabled = true; }
                if (productStockInput) { productStockInput.value = ''; productStockInput.disabled = true; }
            } else {
                addVariantsBlock.style.display = 'none';
                if (productBarcodeInput) { productBarcodeInput.disabled = false; }
                if (productStockInput) { productStockInput.disabled = false; }
            }
        });
    }

    // === NEW: Collapsible Sections Functionality ===
    function toggleSection(sectionId) {
        const content = document.getElementById(sectionId + '-content');
        const icon = document.getElementById(sectionId + '-icon');
        const isExpanded = content.style.maxHeight && content.style.maxHeight !== '0px';

        if (isExpanded) {
            content.style.maxHeight = '0';
            content.style.opacity = '0';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }





// Purchase Invoices Management


// Open Purchase Invoice Modal
function openPurchaseInvoiceModal() {
    renderInvoiceItems();
    updateInvoiceSummary();
    document.getElementById('purchase-invoice-modal').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('purchase-invoice-modal-content').classList.remove('scale-95', 'opacity-0');
        document.getElementById('purchase-invoice-modal-content').classList.add('scale-100', 'opacity-100');
        // تركيز المؤشر على حقل البحث
        setTimeout(() => {
            const searchInput = document.getElementById('product-search');
            if (searchInput) searchInput.focus();
        }, 200);
    }, 10);
}

// Close Purchase Invoice Modal
function closePurchaseInvoiceModal(callback = null) {
    const modal = document.getElementById('purchase-invoice-modal');
    const content = document.getElementById('purchase-invoice-modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        if (callback && typeof callback === 'function') {
            callback(); // ← ننفّذ الكولباك هنا
        }
    }, 300);
}

// Search Product
async function searchProduct() {
    const searchTerm = document.getElementById('product-search').value.trim();
    if (!searchTerm) {
        showNotification('يرجى إدخال مصطلح البحث', 'warning');
        return;
    }

    try {
        const response = await fetch(`api.php?action=search_products&term=${encodeURIComponent(searchTerm)}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            displaySearchResults(result.data);
        } else {
            document.getElementById('search-results').classList.add('hidden');
            showNotification('لم يتم العثور على منتجات', 'warning');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('حدث خطأ في البحث', 'error');
    }
}





async function handleBarcodeSearch(barcode) {
    try {
        const response = await fetch(`api.php?action=search_products&term=${encodeURIComponent(barcode)}`);
        const result = await response.json();
        if (result.success && result.data.length > 0) {
            const products = result.data;
            if (products.length === 1) {
                const product = products[0];
                // تحقق مما إذا كان له درجات
                if (product.variant_id) {
                    addProductToInvoice(product);
                } else {
                    // تحقق من وجود درجات
                    const vRes = await fetch(`api.php?action=get_variants&product_id=${product.id}`);
                    const vData = await vRes.json();
                    if (vData.success && vData.data && vData.data.length > 0) {
                        showVariantSelectionForAdmin(product);
                    } else {
                        addProductToInvoice(product);
                    }
                }
                productSearchInput.value = '';
                searchResultsContainer.classList.add('hidden');
            } else {
                displaySearchResults(products);
            }
        } else {
            showNotification('المنتج غير موجود', 'warning');
        }
    } catch (err) {
        console.error("Barcode search failed", err);
        showNotification('خطأ في البحث', 'error');
    }
}


// بحث نصي (عرض اقتراحات)
async function handleTextSearch(term) {
    try {
        const response = await fetch(`api.php?action=search_products&term=${encodeURIComponent(term)}`);
        const result = await response.json();
        searchResultsContainer.innerHTML = '';
        if (result.success && result.data.length > 0) {
            displaySearchResults(result.data);
        } else {
            searchResultsContainer.innerHTML = '<div class="p-3 text-center text-gray-500 text-sm">لا توجد نتائج</div>';
            searchResultsContainer.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Search failed", err);
        searchResultsContainer.innerHTML = '<div class="p-3 text-center text-red-500 text-sm">خطأ في الاتصال</div>';
        searchResultsContainer.classList.remove('hidden');
    }
}




// عرض نتائج البحث
function displaySearchResults(products) {
    searchResultsContainer.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'p-3 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-0 flex items-center gap-3';
        const hasVariant = product.variant_id;
        const hasVariants = product.has_variants || false;
        div.innerHTML = `
    <img src="${escapeHtml(product.image)}" class="w-10 h-10 rounded-lg object-cover">
    <div class="flex-1 min-w-0">
        <div class="font-medium text-gray-800 text-sm truncate">${escapeHtml(product.name)}</div>
        ${hasVariant ? `<div class="text-xs text-purple-600">الدرجة: ${escapeHtml(product.variant_name)}</div>` : ''}
        ${hasVariants && !hasVariant ? `<div class="text-xs text-purple-600"><i class="fas fa-layer-group mr-1"></i>له درجات - اختر عند الإضافة</div>` : ''}
        <div class="text-xs text-gray-500">${product.stock} متوفر | $${product.price}</div>
    </div>
    <button type="button" class="add-product-btn text-green-600 hover:text-green-800">
        <i class="fas fa-plus"></i>
    </button>
`;
        // --- النقر على الزر + ---
        div.querySelector('.add-product-btn').onclick = (e) => {
            e.stopPropagation();
            if (product.variant_id) {
                doAddProductToInvoice(product);
                productSearchInput.value = '';
                searchResultsContainer.classList.add('hidden');
            } else {
                fetch(`api.php?action=get_variants&product_id=${product.id}`)
                    .then(r => r.json())
                    .then(res => {
                        if (res.success && res.data && res.data.length > 0) {
                            showVariantSelectionForAdmin(product);
                            searchResultsContainer.classList.add('hidden');
                        } else {
                            doAddProductToInvoice(product);
                            productSearchInput.value = '';
                            searchResultsContainer.classList.add('hidden');
                        }
                    })
                    .catch(() => {
                        doAddProductToInvoice(product);
                        productSearchInput.value = '';
                        searchResultsContainer.classList.add('hidden');
                    });
            }
        };

        // --- النقر على المنتج ككل ---
        div.onclick = () => {
            if (product.variant_id) {
                doAddProductToInvoice(product);
                productSearchInput.value = '';
                searchResultsContainer.classList.add('hidden');
            } else {
                fetch(`api.php?action=get_variants&product_id=${product.id}`)
                    .then(r => r.json())
                    .then(res => {
                        if (res.success && res.data && res.data.length > 0) {
                            showVariantSelectionForAdmin(product);
                            searchResultsContainer.classList.add('hidden');
                        } else {
                            doAddProductToInvoice(product);
                            productSearchInput.value = '';
                            searchResultsContainer.classList.add('hidden');
                        }
                    })
                    .catch(() => {
                        doAddProductToInvoice(product);
                        productSearchInput.value = '';
                        searchResultsContainer.classList.add('hidden');
                    });
            }
        };

        searchResultsContainer.appendChild(div);
    });
    searchResultsContainer.classList.remove('hidden');
}

// Add Product to Invoice
function addProductToInvoice(product) {
    const existingItemIndex = invoiceItems.findIndex(item => 
        item.id === product.id && 
        item.variant_id === (product.variant_id || null)
    );
    if (existingItemIndex > -1) {
        showNotification('هذا المنتج مضاف مسبقاً', 'warning');
        return;
    }

    const lastCost = parseFloat(product.last_cost_price) || 0;
    const newItem = {
        id: product.id,
        name: product.name,
        variant_id: product.variant_id || null,
        variant_name: product.variant_name || null,
        barcode: product.barcode || '',
        current_stock: product.stock || 0,
        quantity: 1,
        gifts: 0,
        last_cost_price: lastCost,
        cost_price: lastCost
    };
    invoiceItems.unshift(newItem);
    renderInvoiceItems();
    updateInvoiceSummary();
    document.getElementById('product-search').value = '';
    document.getElementById('search-results').classList.add('hidden');
    showNotification('تم إضافة المنتج إلى الفاتورة', 'success');
}




// دالة لعرض نافذة اختيار الدرجات
function showVariantSelectionForAdmin(product) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 variant-selection-modal';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-3xl shadow-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto';
    
    modal.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">اختر الدرجة</h3>
            <button class="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl close-variant-modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="space-y-2" id="admin-variant-buttons"></div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // إغلاق النافذة
    overlay.querySelector('.close-variant-modal').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    
    // جلب الدرجات وعرضها
    const list = modal.querySelector('#admin-variant-buttons');
    
    fetch(`api.php?action=get_variants&product_id=${product.id}`)
        .then(r => r.json())
        .then(result => {
            if (result.success && result.data && result.data.length > 0) {
                result.data.forEach(variant => {
                    const btn = document.createElement('button');
                    btn.className = 'w-full text-right flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-xl border border-pink-100 transition-all';
                    
                    btn.onclick = () => {
    const variantProduct = {
        id: product.id,
        name: product.name,
        variant_id: variant.id,
        variant_name: variant.name,
        barcode: variant.barcode,
        stock: variant.stock,
        last_cost_price: variant.last_cost_price || 0,
        price: variant.price_override !== null ? parseFloat(variant.price_override) : parseFloat(product.price)
    };
    addProductToInvoice(variantProduct); // ← استخدام الدالة الموحّدة
    overlay.remove();
    showNotification('تمت إضافة الدرجة إلى الفاتورة', 'success');
};
                    
                    btn.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg overflow-hidden bg-white shadow">
                                <img src="${variant.image || product.image}" class="w-full h-full object-cover">
                            </div>
                            <span class="font-semibold text-gray-800">${variant.name}</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            ${variant.price_override !== null ? `<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">$${parseFloat(variant.price_override).toFixed(2)}</span>` : ''}
                            <span class="px-2 py-0.5 ${parseInt(variant.stock) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full">المتوفر: ${variant.stock}</span>
                        </div>
                    `;
                    
                    list.appendChild(btn);
                });
            } else {
                list.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-exclamation-circle text-3xl mb-3 opacity-50"></i>
                        <p>لا توجد درجات لهذا المنتج</p>
                        <button class="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm add-without-variant">
                            إضافة كمنتج عادي
                        </button>
                    </div>
                `;
                
                list.querySelector('.add-without-variant').onclick = () => {
                    doAddProductToInvoice(product);
                    overlay.remove();
                };
            }
        })
        .catch(err => {
            console.error('Error loading variants:', err);
            list.innerHTML = '<div class="text-center py-4 text-red-500">خطأ في تحميل الدرجات</div>';
        });
}






// === RENDER INVOICE ITEMS (ENHANCED WITH ORDER NUMBERS) ===
function renderInvoiceItems() {
    const itemsList = document.getElementById('invoice-items-list');
    const noItemsMessage = document.getElementById('no-items-message');
    if (invoiceItems.length === 0) {
        itemsList.innerHTML = '';
        noItemsMessage.style.display = 'block';
        return;
    }
    noItemsMessage.style.display = 'none';
    itemsList.innerHTML = invoiceItems.map((item, index) => {
        const stockAfter = item.current_stock + item.quantity + item.gifts;
        const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-blue-50';
        const borderColor = index % 2 === 0 ? 'border-gray-200' : 'border-blue-200';
        return `
            <div class="sm:grid grid-cols-[2fr_40px_40px_40px_60px_60px_60px_60px_40px] gap-2 items-center p-2 ${bgColor} rounded border ${borderColor} text-xs">
                <div class="flex items-center gap-2 min-w-0">
                    <div class="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                        ${index + 1}
                    </div>
                    <div class="font-medium text-gray-800 truncate">
                        ${escapeHtml(item.name)}${item.variant_name ? ` — <span class="text-purple-600">${escapeHtml(item.variant_name)}</span>` : ''}
                    </div>
                </div>
                <div class="text-center" title="${item.barcode || 'لا يوجد باركود'}">
                    ${item.barcode ? '<i class="fas fa-barcode text-gray-600 text-xs"></i>' : '—'}
                </div>
                <div class="text-center text-gray-600">${item.current_stock}</div>
                <div class="text-center font-bold text-green-600">${stockAfter}</div>
                <div class="flex flex-col items-center">
                    <input type="number" value="${item.quantity}" min="0"
                           onchange="updateInvoiceItemField(${index}, 'quantity', this.value)"
                           class="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-blue-400 focus:border-transparent">
                </div>
                <div class="flex flex-col items-center">
                    <input type="number" value="${item.gifts}" min="0"
                           onchange="updateInvoiceItemField(${index}, 'gifts', this.value)"
                           class="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-blue-400 focus:border-transparent">
                </div>
                <div class="text-center text-gray-800">$${item.last_cost_price ? parseFloat(item.last_cost_price).toFixed(2) : '—'}</div>
                <div class="flex flex-col items-center">
                    <input type="number" step="0.01" value="${item.cost_price || ''}"
                           onchange="updateInvoiceItemField(${index}, 'cost_price', this.value)"
                           class="w-12 text-center border border-gray-300 rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-blue-400 focus:border-transparent">
                </div>
                <div class="text-center">
                    <button type="button" onclick="removeInvoiceItem(${index})"
                            class="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full"
                            title="حذف">
                        <i class="fas fa-trash text-[10px]"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


function updateInvoiceItemField(index, field, value) {
    try {
        if (!invoiceItems[index]) {
            console.error('Item not found at index:', index);
            return;
        }

        if (field === 'quantity' || field === 'gifts') {
            const intValue = parseInt(value) || 0;
            if (intValue < 0) {
                showNotification('القيمة لا يمكن أن تكون سالبة', 'warning');
                return;
            }
            invoiceItems[index][field] = intValue;
        } else if (field === 'cost_price') {
            const floatValue = parseFloat(value) || 0;
            if (floatValue < 0) {
                showNotification('السعر لا يمكن أن يكون سالباً', 'warning');
                return;
            }
            invoiceItems[index][field] = floatValue;
        } else {
            invoiceItems[index][field] = value;
        }

        renderInvoiceItems();
        updateInvoiceSummary();
    } catch (error) {
        console.error('Error updating item field:', error);
        showNotification('خطأ في تحديث البيانات', 'error');
    }
}



function debugInvoiceData() {
    console.group('🔍 تشخيص بيانات الفاتورة');
    
    // 1. فحص عدد العناصر
    console.log('📦 عدد العناصر:', invoiceItems.length);
    
    if (invoiceItems.length === 0) {
        console.error('❌ الفاتورة فارغة!');
        console.groupEnd();
        return false;
    }

    // 2. فحص كل عنصر
    console.log('📋 فحص العناصر:');
    const issues = [];
    
    invoiceItems.forEach((item, index) => {
        console.group(`العنصر ${index + 1}: ${item.name || 'بدون اسم'}`);
        
        // فحص ID
        const id = parseInt(item.id);
        console.log('🆔 معرف المنتج:', item.id, '→', id);
        if (!id || id <= 0) {
            issues.push(`العنصر ${index + 1}: معرف غير صالح (${item.id})`);
            console.error('❌ معرف غير صالح');
        } else {
            console.log('✅ المعرف صحيح');
        }

        // فحص variant_id
        if (item.variant_id !== null && item.variant_id !== undefined) {
            const variantId = parseInt(item.variant_id);
            console.log('🎨 معرف الدرجة:', item.variant_id, '→', variantId);
            if (variantId > 0) {
                console.log('✅ درجة صحيحة');
            }
        }

        // فحص الكمية
        const quantity = parseInt(item.quantity);
        console.log('📊 الكمية:', item.quantity, '→', quantity);
        if (!quantity || quantity <= 0) {
            issues.push(`العنصر ${index + 1}: كمية غير صالحة (${item.quantity})`);
            console.error('❌ كمية غير صالحة');
        } else {
            console.log('✅ الكمية صحيحة');
        }

        // فحص الهدايا
        const gifts = parseInt(item.gifts) || 0;
        console.log('🎁 الهدايا:', item.gifts, '→', gifts);
        if (gifts < 0) {
            issues.push(`العنصر ${index + 1}: عدد هدايا سالب (${item.gifts})`);
            console.error('❌ هدايا سالبة');
        }

        // فحص السعر
        const costPrice = parseFloat(item.cost_price);
        console.log('💰 سعر التكلفة:', item.cost_price, '→', costPrice);
        if (isNaN(costPrice) || costPrice < 0) {
            issues.push(`العنصر ${index + 1}: سعر غير صالح (${item.cost_price})`);
            console.error('❌ سعر غير صالح');
        } else {
            console.log('✅ السعر صحيح');
        }

        console.groupEnd();
    });

    // 3. عرض النتائج
    console.log('\n📊 ملخص التشخيص:');
    if (issues.length === 0) {
        console.log('✅ جميع البيانات صحيحة');
    } else {
        console.error('❌ تم اكتشاف', issues.length, 'مشكلة:');
        issues.forEach(issue => console.error('  •', issue));
    }

    // 4. فحص بيانات النموذج
    const form = document.getElementById('purchase-invoice-form');
    if (form) {
        const formData = new FormData(form);
        console.log('\n📝 بيانات النموذج:');
        console.log('  • المورد:', formData.get('supplier_name') || 'غير محدد');
        console.log('  • التاريخ:', formData.get('invoice_date'));
        console.log('  • ملاحظات:', formData.get('notes') || 'لا توجد');
    }

    console.groupEnd();
    return issues.length === 0;
}



async function testAPIConnection() {
    console.group('🌐 اختبار الاتصال بـ API');
    
    try {
        console.log('📡 جاري إرسال طلب اختبار...');
        
        const response = await fetch('api.php?action=get_settings', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('📊 حالة الاستجابة:', response.status, response.statusText);

        const contentType = response.headers.get('content-type');
        console.log('📄 نوع المحتوى:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ الاستجابة ليست JSON!');
            const text = await response.text();
            console.error('محتوى الاستجابة:', text.substring(0, 500));
            console.groupEnd();
            return false;
        }

        const data = await response.json();
        console.log('✅ الاتصال ناجح');
        console.log('البيانات المستلمة:', data);
        console.groupEnd();
        return true;

    } catch (error) {
        console.error('❌ فشل الاتصال:', error);
        console.groupEnd();
        return false;
    }
}

// دالة لتصدير بيانات الفاتورة للتشخيص
function exportInvoiceDebugData() {
    const debugData = {
        timestamp: new Date().toISOString(),
        itemsCount: invoiceItems.length,
        items: invoiceItems.map((item, index) => ({
            index: index + 1,
            raw_id: item.id,
            parsed_id: parseInt(item.id),
            name: item.name,
            variant_id: item.variant_id,
            quantity: item.quantity,
            gifts: item.gifts,
            cost_price: item.cost_price,
            barcode: item.barcode
        })),
        validation: validateInvoiceItems(),
        form_data: (() => {
            const form = document.getElementById('purchase-invoice-form');
            if (!form) return null;
            const fd = new FormData(form);
            return {
                supplier_name: fd.get('supplier_name'),
                invoice_date: fd.get('invoice_date'),
                notes: fd.get('notes')
            };
        })()
    };

    console.log('📋 بيانات التشخيص الكاملة:');
    console.log(JSON.stringify(debugData, null, 2));
    
    // نسخ إلى الحافظة للمشاركة
    const debugText = JSON.stringify(debugData, null, 2);
    navigator.clipboard.writeText(debugText).then(() => {
        console.log('✅ تم نسخ بيانات التشخيص إلى الحافظة');
    }).catch(err => {
        console.error('فشل النسخ:', err);
    });

    return debugData;
}


// إضافة أزرار التشخيص في Console
console.log('%c🔧 أدوات التشخيص متاحة:', 'color: blue; font-weight: bold');
console.log('  • debugInvoiceData() - فحص بيانات الفاتورة');
console.log('  • testAPIConnection() - اختبار الاتصال');
console.log('  • exportInvoiceDebugData() - تصدير بيانات التشخيص');
console.log('  • validateInvoiceItems() - التحقق من صحة العناصر');

// Remove Invoice Item
function removeInvoiceItem(index) {
    if (confirm('هل تريد حذف هذا المنتج من الفاتورة؟')) {
        invoiceItems.splice(index, 1);
        renderInvoiceItems();
        updateInvoiceSummary();
        showNotification('تم حذف المنتج من الفاتورة', 'success');
    }
}

// Update Item Quantity
function updateInvoiceItemQuantity(index, quantity) {
    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
        showNotification('الكمية يجب أن تكون 1 على الأقل', 'warning');
        return;
    }
    
    invoiceItems[index].quantity = qty;
    renderInvoiceItems();
    updateInvoiceSummary();
}


// Update Invoice Summary (Updated for Currency)
function updateInvoiceSummary() {
    const itemsCount = invoiceItems.length;
    const totalQuantity = invoiceItems.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    const totalCost = invoiceItems.reduce((sum, item) => {
        const qty = parseInt(item.quantity) || 0; 
        const cost = parseFloat(item.cost_price) || 0;
        return sum + (qty * cost);
    }, 0);

    // تحديد الرمز بناءً على القائمة المنسدلة
    const currencySelect = document.getElementById('invoice-currency');
    const currency = currencySelect ? currencySelect.value : 'USD';
    const symbol = currency === 'USD' ? '$' : 'ل.س ';

    const itemsCountEl = document.getElementById('items-count');
    const totalQuantityEl = document.getElementById('total-quantity');
    const totalCostEl = document.getElementById('total-cost');

    if (itemsCountEl) itemsCountEl.textContent = itemsCount;
    if (totalQuantityEl) totalQuantityEl.textContent = totalQuantity;
    
    // تنسيق الرقم
    if (totalCostEl) {
        totalCostEl.textContent = currency === 'USD' 
            ? `$${totalCost.toFixed(2)}` 
            : `${totalCost.toLocaleString()} ل.س`;
    }
}

// Handle Purchase Invoice Form Submission
document.getElementById('purchase-invoice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. التحقق من وجود عناصر
    if (invoiceItems.length === 0) {
        showNotification('يرجى إضافة مواد إلى الفاتورة', 'warning');
        return;
    }
    
    try {
        // 2. التحقق من صحة البيانات وتحضير العناصر للإرسال
        const itemsToSend = [];
        const invalidItems = [];
        
        invoiceItems.forEach((item, index) => {
            // التحقق من معرّف المنتج
            const productId = parseInt(item.id);
            if (!productId || productId <= 0) {
                invalidItems.push(`العنصر ${index + 1}: معرّف المنتج غير صالح (${item.id})`);
                return;
            }

            // التحقق من الكمية
            const quantity = parseInt(item.quantity);
            if (!quantity || quantity <= 0) {
                invalidItems.push(`العنصر ${index + 1}: الكمية غير صالحة (${item.quantity})`);
                return;
            }

            // التحقق من سعر التكلفة
            const costPrice = parseFloat(item.cost_price);
            if (isNaN(costPrice) || costPrice < 0) {
                invalidItems.push(`العنصر ${index + 1}: سعر التكلفة غير صالح (${item.cost_price})`);
                return;
            }

            // إضافة العنصر الصحيح
            const itemData = {
                product_id: productId,
                variant_id: item.variant_id !== null && item.variant_id !== undefined && parseInt(item.variant_id) > 0
                    ? parseInt(item.variant_id)
                    : null,
                quantity: quantity,
                gifts: parseInt(item.gifts) || 0,
                cost_price: costPrice
            };

            itemsToSend.push(itemData);
        });

        // 3. عرض الأخطاء إن وجدت
        if (invalidItems.length > 0) {
            showNotification('هناك أخطاء في البيانات:\n' + invalidItems.join('\n'), 'error');
            console.error('Invalid items:', invalidItems);
            return;
        }

        if (itemsToSend.length === 0) {
            showNotification('لا توجد عناصر صحيحة للإضافة', 'error');
            return;
        }

        // 4. حساب التكلفة الإجمالية (بدون الهدايا)
        const totalCost = itemsToSend.reduce((sum, item) => {
            return sum + (item.quantity * item.cost_price);
        }, 0);

        // 5. إعداد البيانات للإرسال
        const formData = new FormData(e.target);
        formData.set('items', JSON.stringify(itemsToSend));
        formData.set('total_cost', totalCost.toFixed(2));

        // 6. إظهار حالة التحميل
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...';
        submitButton.disabled = true;

        console.log('Sending invoice data:', {
            itemsCount: itemsToSend.length,
            totalCost: totalCost,
            supplier: formData.get('supplier_name'),
            date: formData.get('invoice_date')
        });

        // 7. إرسال البيانات
        const response = await fetch('api.php', {
            method: 'POST',
            body: formData
        });

        // 8. معالجة الاستجابة
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            throw new Error('الاستجابة من الخادم غير صحيحة. يرجى التحقق من سجلات الخطأ.');
        }

        const result = await response.json();
        
        console.log('Server response:', result);

        if (result.success) {
            let message = result.message || 'تم حفظ فاتورة المشتريات بنجاح!';
            
            if (result.warnings && result.warnings.length > 0) {
                message += '\n\nتحذيرات:\n' + result.warnings.join('\n');
            }

            if (result.successful_items && result.total_items) {
                message += `\n\nتم حفظ ${result.successful_items} من ${result.total_items} عنصر`;
            }

            showNotification(message, 'success');
            
            // إعادة تعيين النموذج والبيانات
            invoiceItems = [];
            renderInvoiceItems();
            updateInvoiceSummary();
            closePurchaseInvoiceModal();
            
            // إعادة تحميل الصفحة بعد ثانيتين
            setTimeout(() => location.reload(), 2000);
        } else {
            throw new Error(result.message || 'حدث خطأ غير متوقع');
        }

    } catch (error) {
        console.error('Error submitting invoice:', error);
        showNotification('حدث خطأ في الاتصال: ' + error.message, 'error');
        
        // إعادة تمكين الزر
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-save ml-2"></i>حفظ الفاتورة';
            submitButton.disabled = false;
        }
    }
});

// Load Recent Invoices
// async function loadRecentInvoices() {
//     try {
//         const response = await fetch('api.php?action=get_recent_invoices');
//         const result = await response.json();
        
//         if (result.success) {
//             displayRecentInvoices(result.data);
//         }
//     } catch (error) {
//         console.error('Error loading invoices:', error);
//     }
// }

// Display Recent Invoices
function displayRecentInvoices(invoices) {
    const container = document.getElementById('recent-invoices-list');
    
    if (!invoices || invoices.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-receipt text-3xl mb-2 opacity-50"></i>
                <p>لا توجد فواتير حديثة</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = invoices.map(invoice => `
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div class="flex justify-between items-center">
                <div class="flex-1">
                    <div class="font-semibold text-gray-800">فاتورة #${invoice.id}</div>
                    <div class="text-sm text-gray-600">
                        ${invoice.supplier_name ? `المورد: ${invoice.supplier_name}` : 'بدون مورد'}
                    </div>
                    <div class="text-xs text-gray-500">
                        ${invoice.invoice_date} | ${invoice.items_count} مادة
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-green-600">${invoice.total_quantity}</div>
                    <div class="text-xs text-gray-500">إجمالي الكمية</div>
                </div>
            </div>
        </div>
    `).join('');
}


// Close modal on outside click — but DO NOT clear invoice

document.getElementById('purchase-invoice-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('purchase-invoice-modal')) {
        closePurchaseInvoiceModal();
        // ملاحظة: لا نمسح invoiceItems هنا، لأننا نريد الحفاظ على المحتوى
    }
});

// Load recent invoices on page load
document.addEventListener('DOMContentLoaded', function() {
  //  loadRecentInvoices();
});




// إضافة قسم رئيسي جديد
document.getElementById('add-parent-section-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('api.php', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
        showNotification('تمت إضافة القسم الرئيسي بنجاح!', 'success');
        setTimeout(() => location.reload(), 1500);
    } else {
        showNotification('خطأ: ' + result.message, 'error');
    }
});

// فتح نافذة تعديل القسم الرئيسي
function openEditParentSectionModal(section) {
    document.getElementById('edit-parent-section-id').value = section.id;
    document.getElementById('edit-parent-section-name').value = section.name;
    document.getElementById('edit-parent-section-slug').value = section.slug;
    document.getElementById('edit-parent-section-order').value = section.display_order;
    document.getElementById('edit-parent-section-description').value = section.description || '';
    document.getElementById('edit-parent-section-active').checked = section.is_active == 1;
    document.getElementById('edit-parent-section-icon').value = section.icon || 'fa-box';
    // عرض معاينة الأيقونة الحالية
    const iconPreview = document.getElementById('edit-current-icon-preview');
    if (section.icon_file && section.icon_file !== 'null' && section.icon_file !== null) {
        iconPreview.innerHTML = `
            <div class="flex items-center gap-2 mt-2">
                <img src="${section.icon_file}" class="w-10 h-10 object-contain border rounded">
                <span class="text-xs text-gray-600">الأيقونة الحالية</span>
            </div>
        `;
    } else {
        iconPreview.innerHTML = '<span class="text-xs text-gray-500">لم يتم رفع أيقونة بعد</span>';
    }
    
    const modal = document.getElementById('edit-parent-section-modal');
    const content = document.getElementById('parent-section-modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// إغلاق نافذة تعديل القسم الرئيسي
function closeEditParentSectionModal() {
    const modal = document.getElementById('edit-parent-section-modal');
    const content = document.getElementById('parent-section-modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// إغلاق النافذة عند النقر خارجها
document.getElementById('edit-parent-section-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-parent-section-modal')) {
        closeEditParentSectionModal();
    }
});

// تعديل قسم رئيسي
document.getElementById('edit-parent-section-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData(e.target);
        const response = await fetch('api.php', { 
            method: 'POST', 
            body: formData 
        });
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم تعديل القسم الرئيسي بنجاح!', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showNotification('خطأ: ' + result.message, 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
});

// حذف قسم رئيسي
async function deleteParentSection(id) {
    if (!confirm('هل أنت متأكد من حذف هذا القسم الرئيسي؟\n\nسيتم نقل جميع الأقسام الفرعية والمنتجات المرتبطة به إلى قسم رئيسي آخر.')) return;
    
    const formData = new FormData();
    formData.append('action', 'delete_parent_section');
    formData.append('id', id);
    
    const response = await fetch('api.php', { method: 'POST', body: formData });
    const result = await response.json();
    
    if (result.success) {
        document.getElementById(`parent-section-item-${id}`).remove();
        showNotification('تم حذف القسم الرئيسي بنجاح', 'success');
        setTimeout(() => location.reload(), 1500);
    } else {
        showNotification('خطأ: ' + result.message, 'error');
    }
}




let barcodeCheckTimeout = null;
let isBarcodeUnique = true;

function checkBarcodeUniqueness(barcode) {
    if (!barcode.trim()) {
        isBarcodeUnique = true;
        document.getElementById('barcode-error').remove();
        return;
    }

    // إلغاء الطلب السابق إذا كان لا يزال قيد الانتظار
    if (barcodeCheckTimeout) clearTimeout(barcodeCheckTimeout);

    barcodeCheckTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`api.php?action=search_products&term=${encodeURIComponent(barcode)}`);
            const result = await response.json();
            const exists = result.success && Array.isArray(result.data) && result.data.length > 0;

            const errorDiv = document.getElementById('barcode-error');
            if (exists) {
                isBarcodeUnique = false;
                if (!errorDiv) {
                    const err = document.createElement('div');
                    err.id = 'barcode-error';
                    err.className = 'text-red-500 text-sm mt-2 flex items-center gap-1';
                    err.innerHTML = '<i class="fas fa-exclamation-circle"></i> هذا الباركود مستخدم مسبقاً! لا يمكن تكراره.';
                    document.getElementById('product-barcode').parentElement.appendChild(err);
                }
            } else {
                isBarcodeUnique = true;
                if (errorDiv) errorDiv.remove();
            }
        } catch (err) {
            console.error("Barcode check failed:", err);
        }
    }, 400);
}




function clearInvoice() {
    if (invoiceItems.length === 0) return;
    if (confirm('هل أنت متأكد من مسح جميع المواد من الفاتورة؟')) {
        invoiceItems = [];
        renderInvoiceItems();
        updateInvoiceSummary();
        showNotification('تم مسح الفاتورة بنجاح', 'success');
    }
}




let productForVariantSelection = null;

async function showVariantSelection(product) {
    productForVariantSelection = product;
    const response = await fetch(`api.php?action=get_variants&product_id=${product.id}`);
    const result = await response.json();
    const modal = document.getElementById('variant-selection-modal');
    const list = document.getElementById('variant-options-list');
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        list.innerHTML = result.data.map(variant => `
            <div class="p-3 border-b border-gray-100 last:border-0 hover:bg-purple-50 cursor-pointer rounded flex justify-between items-center"
                 onclick="selectVariant(${JSON.stringify(variant).replace(/"/g, '&quot;')})">
                <div>
                    <div class="font-medium text-gray-800">${escapeHtml(variant.name)}</div>
                    <div class="text-xs text-gray-500">الباركود: ${variant.barcode} | المخزون: ${variant.stock}</div>
                </div>
                <i class="fas fa-chevron-right text-purple-500"></i>
            </div>
        `).join('');
        modal.classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('variant-modal-content').classList.remove('scale-95', 'opacity-0');
            document.getElementById('variant-modal-content').classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        // إذا لم توجد درجات (نادر)، أضف كمنتج عادي
        addProductToInvoice(product);
    }
}

function selectVariant(variant) {
    const product = productForVariantSelection;
    const newItem = {
        id: product.id,
        name: product.name,
        variant_id: variant.id,
        variant_name: variant.name,
        barcode: variant.barcode || '',
        current_stock: variant.stock || 0,
        quantity: 1,
        price: product.price || 0
    };
    invoiceItems.push(newItem);
    renderInvoiceItems();
    updateInvoiceSummary();
    closeVariantSelectionModal();
    showNotification('تمت إضافة الدرجة إلى الفاتورة', 'success');
}

function closeVariantSelectionModal() {
    document.getElementById('variant-modal-content').classList.remove('scale-100', 'opacity-100');
    document.getElementById('variant-modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        document.getElementById('variant-selection-modal').classList.add('hidden');
    }, 300);
}

// تعديل دالة addProductToInvoice لتتعامل مع المنتجات ذات الدرجات
// دالة محسّنة لإضافة المنتج إلى الفاتورة مع التحقق الكامل
function addProductToInvoice(product) {
    try {
        // 1. التحقق من صحة بيانات المنتج الأساسية
        if (!product || typeof product !== 'object') {
            throw new Error('بيانات المنتج غير صحيحة');
        }

        const productId = parseInt(product.id);
        if (!productId || productId <= 0) {
            throw new Error('معرّف المنتج غير صالح: ' + product.id);
        }

        // 2. التحقق من عدم تكرار المنتج
        const variantId = product.variant_id !== null && product.variant_id !== undefined
            ? parseInt(product.variant_id)
            : null;

        const existingItemIndex = invoiceItems.findIndex(item => 
            parseInt(item.id) === productId && 
            (item.variant_id === null ? variantId === null : parseInt(item.variant_id) === variantId)
        );

        if (existingItemIndex > -1) {
            showNotification('هذا المنتج مضاف مسبقاً', 'warning');
            return false;
        }

        // 3. جلب آخر سعر تكلفة
        const lastCost = parseFloat(product.last_cost_price) || 0;

        // 4. إنشاء العنصر الجديد
        const newItem = {
            id: productId, // هذا هو product_id
            name: product.name || 'منتج غير معروف',
            variant_id: variantId,
            variant_name: product.variant_name || null,
            barcode: product.barcode || '',
            current_stock: parseInt(product.stock) || 0,
            quantity: 1,
            gifts: 0,
            last_cost_price: lastCost,
            cost_price: lastCost
        };

        // 5. التحقق النهائي من البيانات
        if (isNaN(newItem.id) || newItem.id <= 0) {
            throw new Error('فشل التحقق من معرّف المنتج');
        }

        // 6. إضافة العنصر
        invoiceItems.unshift(newItem);

        // 7. تحديث الواجهة
        renderInvoiceItems();
        updateInvoiceSummary();

        // 8. مسح حقل البحث
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }

        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.classList.add('hidden');
        }

        showNotification('تم إضافة المنتج إلى الفاتورة', 'success');
        return true;

    } catch (error) {
        console.error('Error in addProductToInvoice:', error);
        showNotification('خطأ في إضافة المنتج: ' + error.message, 'error');
        return false;
    }
}

// دالة مساعدة للتحقق من صحة invoiceItems قبل الإرسال
function validateInvoiceItems() {
    const errors = [];
    
    invoiceItems.forEach((item, index) => {
        const itemNumber = index + 1;
        
        // التحقق من معرّف المنتج
        const productId = parseInt(item.id);
        if (!productId || productId <= 0) {
            errors.push(`العنصر ${itemNumber}: معرّف المنتج غير صالح (${item.id})`);
        }

        // التحقق من الكمية
        const quantity = parseInt(item.quantity);
        if (!quantity || quantity <= 0) {
            errors.push(`العنصر ${itemNumber} (${item.name}): الكمية يجب أن تكون أكبر من صفر`);
        }

        // التحقق من سعر التكلفة
        const costPrice = parseFloat(item.cost_price);
        if (isNaN(costPrice) || costPrice < 0) {
            errors.push(`العنصر ${itemNumber} (${item.name}): سعر التكلفة غير صالح (${item.cost_price})`);
        }

        // التحقق من الهدايا
        const gifts = parseInt(item.gifts) || 0;
        if (gifts < 0) {
            errors.push(`العنصر ${itemNumber} (${item.name}): عدد الهدايا لا يمكن أن يكون سالباً`);
        }
    });

    return errors;
}

// إضافة معالج للتحقق عند تغيير الحقول
function updateInvoiceItemField(index, field, value) {
    try {
        if (!invoiceItems[index]) {
            console.error('Item not found at index:', index);
            return;
        }

        if (field === 'quantity' || field === 'gifts') {
            const intValue = parseInt(value) || 0;
            if (intValue < 0) {
                showNotification('القيمة لا يمكن أن تكون سالبة', 'warning');
                return;
            }
            invoiceItems[index][field] = intValue;
        } else if (field === 'cost_price') {
            const floatValue = parseFloat(value) || 0;
            if (floatValue < 0) {
                showNotification('السعر لا يمكن أن يكون سالباً', 'warning');
                return;
            }
            invoiceItems[index][field] = floatValue;
        } else {
            invoiceItems[index][field] = value;
        }

        renderInvoiceItems();
        updateInvoiceSummary();
    } catch (error) {
        console.error('Error updating item field:', error);
        showNotification('خطأ في تحديث البيانات', 'error');
    }
}



function validateInvoiceItems() {
    const errors = [];
    
    invoiceItems.forEach((item, index) => {
        const itemNumber = index + 1;
        
        // التحقق من معرّف المنتج
        const productId = parseInt(item.id);
        if (!productId || productId <= 0) {
            errors.push(`العنصر ${itemNumber}: معرّف المنتج غير صالح (${item.id})`);
        }

        // التحقق من الكمية
        const quantity = parseInt(item.quantity);
        if (!quantity || quantity <= 0) {
            errors.push(`العنصر ${itemNumber} (${item.name}): الكمية يجب أن تكون أكبر من صفر`);
        }

        // التحقق من سعر التكلفة
        const costPrice = parseFloat(item.cost_price);
        if (isNaN(costPrice) || costPrice < 0) {
            errors.push(`العنصر ${itemNumber} (${item.name}): سعر التكلفة غير صالح (${item.cost_price})`);
        }

        // التحقق من الهدايا
        const gifts = parseInt(item.gifts) || 0;
        if (gifts < 0) {
            errors.push(`العنصر ${itemNumber} (${item.name}): عدد الهدايا لا يمكن أن يكون سالباً`);
        }
    });

    return errors;
}




function doAddProductToInvoice(product) {
    const existingItemIndex = invoiceItems.findIndex(item => 
        item.id === product.id && 
        item.variant_id === (product.variant_id || null)
    );
    
    if (existingItemIndex > -1) {
        showNotification('هذا المنتج مضاف مسبقاً', 'warning');
        return;
    }
    
    const newItem = {
        id: product.id,
        name: product.name,
        variant_id: product.variant_id || null,
        variant_name: product.variant_name || null,
        barcode: product.barcode || '',
        current_stock: product.stock || 0,
        quantity: 1,
        gifts: 0,
        last_cost_price: product.last_cost_price || 0,
        cost_price: product.last_cost_price || 0
    };
    
    invoiceItems.unshift(newItem);
    renderInvoiceItems();
    updateInvoiceSummary();
    document.getElementById('product-search').value = '';
    document.getElementById('search-results').classList.add('hidden');
    showNotification('تم إضافة المنتج إلى الفاتورة', 'success');
}





// Auto-generate slug من الاسم
document.getElementById('parent-section-name').addEventListener('input', function() {
    const slug = this.value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
    document.getElementById('parent-section-slug').value = slug;
});





// Negative Stock Modal Functions
function openNegativeStockModal() {
    const modal = document.getElementById('negative-stock-modal');
    const content = document.getElementById('negative-stock-modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    loadNegativeStock();
}

function closeNegativeStockModal() {
    const modal = document.getElementById('negative-stock-modal');
    const content = document.getElementById('negative-stock-modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

async function loadNegativeStock() {
    try {
        const response = await fetch('api.php?action=get_negative_stock');
        const result = await response.json();
        const container = document.getElementById('negative-stock-content');
        
        if (result.success) {
            const items = result.data;
            if (items.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-check-circle text-4xl mb-4 opacity-50"></i>
                        <p class="text-xl">لا توجد مواد ذات كمية سالبة</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-exclamation-circle text-red-500 text-xl"></i>
                            <div>
                                <h3 class="font-bold text-red-800">تنبيه مهم</h3>
                                <p class="text-red-700 text-sm">يوجد ${items.length} مادة ذات كمية سالبة في المخزون</p>
                            </div>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th class="p-4 text-right text-sm font-bold text-gray-700">نوع المادة</th>
                                    <th class="p-4 text-right text-sm font-bold text-gray-700">الاسم</th>
                                    <th class="p-4 text-right text-sm font-bold text-gray-700">الباركود</th>
                                    <th class="p-4 text-right text-sm font-bold text-gray-700">الكمية السالبة</th>
                                    <th class="p-4 text-right text-sm font-bold text-gray-700">القسم</th>
                                    <th class="p-4 text-right text-sm font-bold text-gray-700">القسم الرئيسي</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr class="border-b border-gray-100 hover:bg-red-50 transition">
                                        <td class="p-4">
                                            ${item.type === 'variant' ? 
                                                '<span class="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">درجة منتج</span>' : 
                                                '<span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">منتج أساسي</span>'
                                            }
                                        </td>
                                        <td class="p-4">
                                            <div class="font-bold text-gray-800">${escapeHtml(item.product_name)}</div>
                                            ${item.variant_name ? `<div class="text-sm text-purple-600 mt-1">الدرجة: ${escapeHtml(item.variant_name)}</div>` : ''}
                                        </td>
                                        <td class="p-4">
                                            <span class="text-gray-600 font-mono">${item.barcode || '—'}</span>
                                        </td>
                                        <td class="p-4">
                                            <span class="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                                                ${item.stock}
                                            </span>
                                        </td>
                                        <td class="p-4">
                                            <span class="text-gray-600">${escapeHtml(item.category_name)}</span>
                                        </td>
                                        <td class="p-4">
                                            <span class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                ${escapeHtml(item.parent_section)}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-lightbulb text-yellow-500 text-lg mt-1"></i>
                            <div>
                                <h4 class="font-bold text-yellow-800 mb-2">حل المشكلة</h4>
                                <p class="text-yellow-700 text-sm">
                                    لتصحيح الكميات السالبة، يمكنك استخدام خاصية <strong>"فواتير المشتريات"</strong> لإضافة الكميات المطلوبة، 
                                    أو تعديل الكميات يدوياً من خلال <strong>"تعديل المنتج"</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            container.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                    <p>${result.message || 'حدث خطأ في تحميل البيانات'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('negative-stock-content').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                <p>حدث خطأ في الاتصال</p>
            </div>
        `;
    }
}

// إغلاق النافذة عند النقر خارجها
document.getElementById('negative-stock-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('negative-stock-modal')) {
        closeNegativeStockModal();
    }
});

document.getElementById('scan-qr-btn')?.addEventListener('click', async () => {
    if (!('mediaDevices' in navigator)) {
        showNotification('المتصفح لا يدعم الكاميرا', 'error');
        return;
    }

    let modal = document.getElementById('barcode-scan-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'barcode-scan-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl p-4 w-full max-w-md">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-gray-800">مسح الباركود / QR</h3>
                    <button id="close-scan-modal" class="text-gray-500 hover:text-gray-800">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <video id="barcode-video" autoplay playsinline class="w-full rounded-lg" style="aspect-ratio: 1/1; object-fit: cover; background: #000;"></video>
                <p class="text-center text-sm text-gray-600 mt-2">وجّه الكاميرا نحو الباركود أو QR</p>
                <div id="scan-status" class="text-center text-xs text-gray-500 mt-1">جارٍ المسح...</div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#close-scan-modal').onclick = stopScan;
        modal.onclick = (e) => { if (e.target === modal) stopScan(); };
    } else {
        modal.classList.remove('hidden');
    }

    let codeReader = null;
    let stream = null;

    try {
        // استخدام ZXing Browser
        const { BrowserMultiFormatReader } = ZXing;
        codeReader = new BrowserMultiFormatReader();

        const video = document.getElementById('barcode-video');
        const constraints = { video: { facingMode: 'environment' } };

        // ابدأ المسح مباشرة على عنصر الفيديو
        const result = await codeReader.decodeFromConstraints(constraints, video, (result, err) => {
            if (result) {
                handleScanResult(result.getText());
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.warn('ZXing error:', err);
            }
        });

    } catch (err) {
        if (err.name !== 'NotFoundException') {
            console.error('Scan error:', err);
            showNotification('فشل الوصول إلى الكاميرا أو حدث خطأ في المسح', 'error');
        }
    }

    function handleScanResult(text) {
        if (text) {
            document.getElementById('product-barcode').value = text.trim();
            checkBarcodeUniqueness(text.trim());
            showNotification('تم مسح الرمز بنجاح!', 'success');
            stopScan();
        }
    }

    function stopScan() {
        if (codeReader) {
            codeReader.reset(); // يوقف الكاميرا ويُحرر الموارد
            codeReader = null;
        }
        if (modal) modal.remove();
    }
});

// Low Stock Modal Functions
// function openLowStockModal() {
//     const modal = document.getElementById('low-stock-modal');
//     const content = document.getElementById('low-stock-modal-content');
//     modal.classList.remove('hidden');
//     setTimeout(() => {
//         content.classList.remove('scale-95', 'opacity-0');
//         content.classList.add('scale-100', 'opacity-100');
//     }, 10);
// }

function closeLowStockModal() {
    const modal = document.getElementById('low-stock-modal');
    const content = document.getElementById('low-stock-modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// إغلاق النافذة عند النقر خارجها
document.getElementById('low-stock-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('low-stock-modal')) {
        closeLowStockModal();
    }
});



// Toggle new_until field - Add Modal
function toggleNewUntilField() {
    const checkbox = document.getElementById('product-is-new');
    const container = document.getElementById('new-until-container');
    if (checkbox && container) {
        if (checkbox.checked) {
            container.classList.remove('hidden');
            const dateInput = document.getElementById('product-new-until');
            if (dateInput && !dateInput.value) {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 30);
                dateInput.value = futureDate.toISOString().split('T')[0];
            }
        } else {
            container.classList.add('hidden');
        }
    }
}

// Toggle new_until field - Edit Modal
function toggleEditNewUntilField() {
    const checkbox = document.getElementById('edit-product-is-new');
    const container = document.getElementById('edit-new-until-container');
    if (checkbox && container) {
        container.classList.toggle('hidden', !checkbox.checked);
    }
}



let currentSortColumn = null;
let currentSortDirection = 'asc'; // 'asc' أو 'desc'

function sortLowStockTable(column) {
    const tbody = document.querySelector('#low-stock-modal tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // تبديل الاتجاه إذا تم النقر على نفس العمود
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }

    // تحديث أيقونات الفرز
    ['type', 'stock', 'category'].forEach(col => {
        const icon = document.getElementById(`sort-icon-${col}`);
        if (icon) {
            icon.textContent = col === column 
                ? (currentSortDirection === 'asc' ? '↑' : '↓') 
                : '';
        }
    });

    // الفرز
    rows.sort((a, b) => {
        let valA = a.dataset[column];
        let valB = b.dataset[column];

        // تحويل المخزون إلى رقم
        if (column === 'stock') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        } else {
            // مقارنة نصية
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }

        let comparison = 0;
        if (valA > valB) comparison = 1;
        if (valA < valB) comparison = -1;

        return currentSortDirection === 'desc' ? -comparison : comparison;
    });

    // إعادة إدخال الصفوف بالترتيب الجديد
    rows.forEach(row => tbody.appendChild(row));
}

// Toggle discount target fields based on selected type
// --- الكود الجديد (الصحيح) ---
document.getElementById('discount-type')?.addEventListener('change', function() {
    const type = this.value;
    const parentField = document.getElementById('discount-parent-section-field');
    const categoryField = document.getElementById('discount-category-field');
    
    // نحصل على عناصر <select> بداخل الـ div
    const parentSelect = parentField.querySelector('select');
    const categorySelect = categoryField.querySelector('select');

    if (type === 'parent_section') {
        parentField.style.display = 'block';
        if (parentSelect) parentSelect.disabled = false;
        
        categoryField.style.display = 'none';
        if (categorySelect) categorySelect.disabled = true;
        
    } else if (type === 'category') {
        parentField.style.display = 'none';
        if (parentSelect) parentSelect.disabled = true;
        
        categoryField.style.display = 'block';
        if (categorySelect) categorySelect.disabled = false;
        
    } else { // في حالة "خصم شامل" أو غيره
        parentField.style.display = 'none';
        if (parentSelect) parentSelect.disabled = true;
        
        categoryField.style.display = 'none';
        if (categorySelect) categorySelect.disabled = true;
    }
});

// قم بإضافة هذا السطر مباشرة بعد الكود أعلاه
// هذا السطر لتشغيل الكود عند تحميل الصفحة وضبط الحالة الأولية
document.getElementById('discount-type')?.dispatchEvent(new Event('change'));


// تحديث عتبة المخزون المنخفض
// تحديث عتبة المخزون المنخفض وحفظها في قاعدة البيانات
async function updateLowStockThreshold() {
    const thresholdInput = document.getElementById('low-stock-threshold');
    const threshold = parseInt(thresholdInput.value);
    
    if (!threshold || threshold < 1 || threshold > 100) {
        showNotification('يرجى إدخال قيمة صحيحة بين 1 و 100', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('action', 'update_settings');
        formData.append('low_stock_threshold', threshold);

        const response = await fetch('api.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('تم حفظ عتبة المخزون المنخفض بنجاح!', 'success');
            // تحديث العرض
            document.getElementById('current-threshold-display').textContent = threshold;
            // إعادة تحميل قائمة المنتجات
            loadLowStockProducts();
        } else {
            showNotification('خطأ في حفظ الإعدادات', 'error');
        }
    } catch (error) {
        console.error('Error updating threshold:', error);
        showNotification('حدث خطأ في الاتصال', 'error');
    }
}

// تحميل قائمة المنتجات ذات المخزون المنخفض
// تحميل قائمة المنتجات ذات المخزون المنخفض
async function loadLowStockProducts() {
    const tbody = document.getElementById('low-stock-products-body');
    const threshold = document.getElementById('low-stock-threshold').value;
    
    try {
        // إظهار حالة التحميل
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i>
                    <p class="text-gray-600">جاري تحميل البيانات...</p>
                </td>
            </tr>
        `;

        const response = await fetch(`api.php?action=get_low_stock_products&threshold=${threshold}`);
        const result = await response.json();
        
        if (result.success) {
            if (result.data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-8 text-gray-500">
                            <i class="fas fa-check-circle text-4xl mb-4 opacity-50"></i>
                            <p class="text-xl">لا توجد منتجات ذات مخزون منخفض</p>
                            <p class="text-sm mt-2">جميع المنتجات والدرجات لديها مخزون كافٍ</p>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = result.data.map(product => `
                    <tr class="border-b border-gray-100 hover:bg-yellow-50 transition"
                        data-type="${escapeHtml(product.type)}"
                        data-stock="${parseInt(product.stock)}"
                        data-category="${escapeHtml(product.category_name)}">
                        <td class="p-4">
                            <div class="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                <img src="${escapeHtml(product.image)}" class="w-full h-full object-cover" alt="${escapeHtml(product.product_name)}">
                            </div>
                        </td>
                        <td class="p-4">
                            ${product.type === 'variant' ? 
                                '<span class="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">درجة منتج</span>' : 
                                '<span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">منتج أساسي</span>'
                            }
                        </td>
                        <td class="p-4">
                            <div class="font-bold text-gray-800">${escapeHtml(product.product_name)}</div>
                            ${product.variant_name ? `<div class="text-sm text-purple-600 mt-1">الدرجة: ${escapeHtml(product.variant_name)}</div>` : ''}
                        </td>
                        <td class="p-4">
                            <span class="text-gray-600 font-mono">${escapeHtml(product.barcode || '—')}</span>
                        </td>
                        <td class="p-4">
                            ${(() => {
                                const stock = parseInt(product.stock);
                                const stockClass = stock < 5 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
                                return `<span class="inline-block px-3 py-1 ${stockClass} rounded-full text-sm font-bold">${stock}</span>`;
                            })()}
                        </td>
                        <td class="p-4">
                            <span class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                ${escapeHtml(product.parent_section)} / ${escapeHtml(product.category_name)}
                            </span>
                        </td>
                    </tr>
                `).join('');
            }
        } else {
            throw new Error(result.message || 'خطأ في تحميل البيانات');
        }
    } catch (error) {
        console.error('Error loading low stock products:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                    <p>حدث خطأ في تحميل البيانات</p>
                </td>
            </tr>
        `;
    }
}

// فتح نافذة المخزون المنخفض مع تحميل الإعدادات الحالية
// فتح نافذة المخزون المنخفض مع جلب الإعدادات من قاعدة البيانات
async function openLowStockModal() {
    const modal = document.getElementById('low-stock-modal');
    const content = document.getElementById('low-stock-modal-content');
    
    try {
        // جلب القيمة الحالية من قاعدة البيانات
        const response = await fetch('api.php?action=get_settings');
        const result = await response.json();
        
        let currentThreshold = 10; // قيمة افتراضية
        
        if (result.success && result.data && result.data.low_stock_threshold) {
            currentThreshold = parseInt(result.data.low_stock_threshold);
        }
        
        // تحديث الحقول بالقيمة من قاعدة البيانات
        document.getElementById('low-stock-threshold').value = currentThreshold;
        document.getElementById('current-threshold-display').textContent = currentThreshold;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        // تحميل البيانات الحالية
        loadLowStockProducts();
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('حدث خطأ في تحميل الإعدادات', 'error');
    }
}


// === Coupon Management ===
let coupons = [];

// Open coupons modal and load data
function openCouponsModal() {
    const modal = document.getElementById('coupons-modal');
    modal.classList.remove('hidden');
    loadCoupons();
}

function closeCouponsModal() {
    document.getElementById('coupons-modal').classList.add('hidden');
    closeAddCouponForm();
}

function openAddCouponForm() {
    document.getElementById('add-coupon-form-container').classList.remove('hidden');
    // Reset form
    document.getElementById('add-coupon-form').reset();
    document.getElementById('coupon-id').value = '';
      const container = document.getElementById('add-coupon-form-container');
    if (!container) {
        console.error('نافذة تعديل الكوبون غير موجودة في DOM');
        return;
    }
    container.classList.remove('hidden');
}

function closeAddCouponForm() {
    document.getElementById('add-coupon-form-container').classList.add('hidden');
        document.getElementById('add-coupon-form').reset();
    document.getElementById('coupon-id').value = ''; // تأكد من مسح المعرف
}

// Load coupons from API
async function loadCoupons() {
    try {
        const res = await fetch('api.php?action=get_coupons');
        const data = await res.json();
        if (data.success) {
            coupons = data.data;
            renderCouponsList();
            document.getElementById('coupons-count').textContent = coupons.length;
        } else {
            showNotification('خطأ في التحميل: ' + data.message, 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification('فشل الاتصال', 'error');
    }
}

// Render coupons list
function renderCouponsList() {
    const container = document.getElementById('coupons-list');
    if (coupons.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-ticket-alt text-4xl mb-3 opacity-50"></i>
                <p>لا توجد كوبونات مُضافة بعد</p>
            </div>
        `;
        return;
    }

    container.innerHTML = coupons.map(c => {
        const isExpired = new Date(c.expiry_date) < new Date();
        const discountText = c.discount_type === 'percentage' 
            ? `${c.discount_value}%` 
            : `$${c.discount_value}`;
        return `
            <div class="p-4 border rounded-xl ${isExpired ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-bold text-gray-800">${escapeHtml(c.name)}</div>
                        <div class="text-sm text-purple-600 font-mono bg-purple-100 px-2 py-0.5 rounded inline-block mt-1">
                            ${escapeHtml(c.code)}
                        </div>
                        <div class="text-xs text-gray-500 mt-2">
                            الخصم: <span class="font-bold">${discountText}</span> |
                            ينتهي: <span class="${isExpired ? 'text-red-600' : 'text-green-600'}">${c.expiry_date}</span> |
                            استخدامات: <span class="font-bold">${c.usage_count}</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button type="button" onclick="editCoupon(${c.id})" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" onclick="deleteCoupon(${c.id})" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Edit coupon
function editCoupon(id) {
    // أولاً: افتح نافذة النموذج (لضمان وجود العناصر في DOM)
    openAddCouponForm();
    
    const coupon = coupons.find(c => c.id == id);
    if (!coupon) {
        showNotification('لم يتم العثور على الكوبون', 'error');
        return;
    }

    // الآن املأ الحقول (بعد التأكد أن النموذج ظاهر)
    document.getElementById('coupon-id').value = coupon.id;
    document.getElementById('coupon-name').value = coupon.name;
    document.getElementById('coupon-code').value = coupon.code;
    document.getElementById('coupon-discount-type').value = coupon.discount_type;
    document.getElementById('coupon-discount-value').value = coupon.discount_value;
    document.getElementById('coupon-expiry-date').value = coupon.expiry_date;
}

// Delete coupon
async function deleteCoupon(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    try {
        const fd = new FormData();
        fd.append('action', 'delete_coupon');
        fd.append('id', id);
        const res = await fetch('api.php', { method: 'POST', body: fd });
        const result = await res.json();
        if (result.success) {
            showNotification('تم حذف الكوبون بنجاح', 'success');
            loadCoupons();
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
}

// Submit coupon form
document.getElementById('add-coupon-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', 'save_coupon');
    formData.append('id', document.getElementById('coupon-id').value);
    formData.append('name', document.getElementById('coupon-name').value.trim());
    formData.append('code', document.getElementById('coupon-code').value.trim());
    formData.append('discount_type', document.getElementById('coupon-discount-type').value);
    formData.append('discount_value', document.getElementById('coupon-discount-value').value);
    formData.append('expiry_date', document.getElementById('coupon-expiry-date').value);

    try {
        const res = await fetch('api.php', { method: 'POST', body: formData });
        const result = await res.json();
        if (result.success) {
            showNotification('تم حفظ الكوبون بنجاح!', 'success');
            closeAddCouponForm();
            loadCoupons();
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
});

// إغلاق النافذة عند النقر خارجها
document.getElementById('coupons-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('coupons-modal')) {
        closeCouponsModal();
    }
});

// === Customers Modal Functions ===

// 1. فتح نافذة العملاء
function openCustomersModal() {
    const modal = document.getElementById('customers-modal');
    const content = document.getElementById('customers-modal-content');
    
    // 🚀 مسح فلاتر التاريخ عند الفتح
    const fromDateInput = document.getElementById('customer-from-date');
    const toDateInput = document.getElementById('customer-to-date');
    if (fromDateInput) fromDateInput.value = '';
    if (toDateInput) toDateInput.value = '';

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    // 2. تحميل البيانات (سيتم تحميل "الكل" لأن الحقول فارغة)
    loadCustomersData();
}

// 3. إغلاق نافذة العملاء
function closeCustomersModal() {
    const modal = document.getElementById('customers-modal');
    const content = document.getElementById('customers-modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// 4. تحميل بيانات العملاء (Async)
async function loadCustomersData() {
    const container = document.getElementById('customers-content');
    
    // 🚀 جلب قيم التواريخ من الحقول
    const from_date = document.getElementById('customer-from-date').value;
    const to_date = document.getElementById('customer-to-date').value;

    // إظهار التحميل
    container.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
            <p class="mt-4 text-gray-600">جاري تحميل بيانات العملاء...</p>
        </div>
    `;

    try {
        // 🚀 بناء الرابط ديناميكياً
        let url = 'api.php?action=get_customers_report';
        if (from_date && to_date) {
            url += `&from_date=${from_date}&to_date=${to_date}`;
        } else if (from_date) {
            url += `&from_date=${from_date}`;
        } else if (to_date) {
            url += `&to_date=${to_date}`;
        }

        const response = await fetch(url); // استخدام الرابط الجديد
        if (!response.ok) {
            throw new Error('Network error or server error.');
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            renderCustomersTable(result.data);
        } else {
            throw new Error(result.message || 'Failed to load data.');
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                <p>حدث خطأ في تحميل البيانات: ${error.message}</p>
            </div>
        `;
    }
}

// 6. 🚀 دالة جديدة لضبط التواريخ السريعة
function setCustomerDates(period) {
    const fromDateInput = document.getElementById('customer-from-date');
    const toDateInput = document.getElementById('customer-to-date');
    const today = new Date().toISOString().split('T')[0];

    switch (period) {
        case 'today':
            fromDateInput.value = today;
            toDateInput.value = today;
            break;
        case 'week':
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // بداية الأسبوع (الأحد)
            fromDateInput.value = weekStart.toISOString().split('T')[0];
            toDateInput.value = today;
            break;
        case 'month':
            const monthStart = new Date();
            monthStart.setDate(1);
            fromDateInput.value = monthStart.toISOString().split('T')[0];
            toDateInput.value = today;
            break;
        case 'all':
            fromDateInput.value = '';
            toDateInput.value = '';
            break;
    }
    
    // 🚀 إعادة تحميل البيانات مباشرة بعد ضبط التواريخ
    loadCustomersData();
}

// 5. عرض جدول العملاء
function renderCustomersTable(customers) {
    const container = document.getElementById('customers-content');

    if (customers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users-slash text-4xl mb-4 opacity-50"></i>
                <p class="text-xl">لا يوجد عملاء حتى الآن</p>
                <p class="text-sm mt-2">لم يتم إكمال أي طلبات بعد.</p>
            </div>
        `;
        return;
    }

    // بناء الجدول
    let tableHTML = `
        <table class="w-full">
            <thead class="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">#</th>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">الاسم</th>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">رقم الهاتف</th>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">آخر موقع</th>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">الطلبات المكتملة</th>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">إجمالي الفواتير</th>
                    <th class="p-4 text-right text-sm font-bold text-gray-700">آخر طلب</th>
                </tr>
            </thead>
            <tbody>
    `;

    customers.forEach((customer, index) => {
        tableHTML += `
            <tr class="border-b border-gray-100 hover:bg-blue-50 transition">
                <td class="p-4">
                    <span class="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        ${index + 1}
                    </span>
                </td>
                <td class="p-4">
                    <div class="font-bold text-gray-800">${escapeHtml(customer.name)}</div>
                </td>
                <td class="p-4">
                    <span class="text-gray-600 font-mono">${escapeHtml(customer.phone)}</span>
                </td>
                <td class="p-4">
                    <span class="text-gray-600 text-xs">${escapeHtml(customer.location || 'N/A')}</span>
                </td>
                <td class="p-4">
                    <span class="font-bold text-gray-700">${customer.total_completed_orders}</span>
                </td>
                <td class="p-4">
                    <span class="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        $${parseFloat(customer.total_spent).toFixed(2)}
                    </span>
                </td>
                <td class="p-4">
                    <span class="text-gray-600 text-xs">${new Date(customer.last_purchase_date).toLocaleDateString()}</span>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// دالة مساعدة (أضفها إذا لم تكن موجودة)
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// إغلاق النافذة عند النقر خارجها
document.getElementById('customers-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('customers-modal')) {
        closeCustomersModal();
    }
});


// فتح نافذة عرض جميع المنتجات
async function openProductsModal() {
    const modal = document.getElementById('products-modal');
    const content = document.getElementById('products-modal-content');
    const tbody = document.getElementById('products-modal-table-body');

    // عرض مؤشر تحميل
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
                <p class="mt-2 text-gray-600">جارٍ تحميل المنتجات...</p>
            </td>
        </tr>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);

    try {
        const res = await fetch('api.php?action=get_all_products_for_modal');
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
            tbody.innerHTML = data.products.map(product => {
                const stock = product.display_stock;
                const stockClass = stock < 10 ? 'bg-red-100 text-red-700' :
                                   stock < 50 ? 'bg-yellow-100 text-yellow-700' :
                                   'bg-green-100 text-green-700';

                const isNewBadge = product.is_new == 1 ? 
                    '<span class="new-badge-admin"><i class="fas fa-star"></i> جديد</span>' : '';

                return `
                    <tr class="border-b border-gray-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all">
                        <td class="p-4">
                            <div class="w-16 h-16 rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
                                <img src="${escapeHtml(product.image)}" class="w-full h-full object-cover" alt="${escapeHtml(product.name)}">
                            </div>
                        </td>
                        <td class="p-4">
                            <div class="font-bold text-gray-800">${escapeHtml(product.name)}</div>
                            ${isNewBadge}
                            <div class="text-xs text-gray-500 mt-1">${escapeHtml(product.barcode || 'لا يوجد باركود')}</div>
                        </td>
                        <td class="p-4">
                            <span class="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold">
                                ${escapeHtml(product.parent_section)} / ${escapeHtml(product.category_name)}
                            </span>
                        </td>
                        <td class="p-4">
                            <span class="text-lg font-bold text-green-600">$${escapeHtml(product.price)}</span>
                        </td>
                        <td class="p-4">
                            <span class="inline-block px-3 py-1 ${stockClass} rounded-full text-sm font-bold">
                                ${escapeHtml(stock)}
                            </span>
                        </td>
                        <td class="p-4">
                            <div class="flex justify-center gap-2">
                                <button onclick='openEditModal(${JSON.stringify(product)})' class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteProduct(${product.id})" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all transform hover:scale-105 shadow-md">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">لا توجد منتجات</td></tr>`;
        }
    } catch (err) {
        console.error('فشل تحميل المنتجات:', err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">حدث خطأ في الاتصال</td></tr>`;
    }
}

// إغلاق نافذة المنتجات
function closeProductsModal() {
    const content = document.getElementById('products-modal-content');
    const modal = document.getElementById('products-modal');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// إغلاق النافذة بالنقر خارجها
document.getElementById('products-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('products-modal')) {
        closeProductsModal();
    }
});


// === Loyalty Rewards Management ===

let rewardRules = [];
let giftPool = [];

// --- Tab Switching ---
function switchRewardsTab(tab) {
    if (tab === 'rules') {
        document.getElementById('tab-rules').classList.add('border-orange-500', 'text-orange-600');
        document.getElementById('tab-rules').classList.remove('border-transparent', 'text-gray-500');
        document.getElementById('tab-content-rules').classList.remove('hidden');

        document.getElementById('tab-gift-pool').classList.add('border-transparent', 'text-gray-500');
        document.getElementById('tab-gift-pool').classList.remove('border-orange-500', 'text-orange-600');
        document.getElementById('tab-content-gift-pool').classList.add('hidden');
    } else {
        document.getElementById('tab-gift-pool').classList.add('border-orange-500', 'text-orange-600');
        document.getElementById('tab-gift-pool').classList.remove('border-transparent', 'text-gray-500');
        document.getElementById('tab-content-gift-pool').classList.remove('hidden');

        document.getElementById('tab-rules').classList.add('border-transparent', 'text-gray-500');
        document.getElementById('tab-rules').classList.remove('border-orange-500', 'text-orange-600');
        document.getElementById('tab-content-rules').classList.add('hidden');
    }
}

// --- Modal Controls ---
function openRewardsModal() {
    const modal = document.getElementById('rewards-modal');
    const content = document.getElementById('rewards-modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    
    // Load data
    loadRewardRules();
    loadGiftPool();
    switchRewardsTab('rules'); // Start on first tab
}

function closeRewardsModal() {
    const modal = document.getElementById('rewards-modal');
    const content = document.getElementById('rewards-modal-content');
    
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

document.getElementById('rewards-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('rewards-modal')) {
        closeRewardsModal();
    }
});

// --- Reward Rules Logic ---
async function loadRewardRules() {
    try {
        const res = await fetch('api.php?action=get_reward_rules');
        const data = await res.json();
        if (data.success) {
            rewardRules = data.data;
            renderRewardRules();
            document.getElementById('reward-rules-count').textContent = rewardRules.length;
        } else {
            document.getElementById('reward-rules-list').innerHTML = `<div class="text-center py-4 text-red-500">${data.message}</div>`;
        }
    } catch (err) {
        console.error(err);
        showNotification('فشل تحميل القواعد', 'error');
    }
}

function renderRewardRules() {
    const container = document.getElementById('reward-rules-list');
    if (rewardRules.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-gray-500">لا توجد قواعد مُضافة بعد.</div>`;
        return;
    }

    container.innerHTML = rewardRules.map(r => {
        const rewardText = r.reward_type === 'product'
            ? `🎁 <b>منتج هدية</b>`
            : `💰 <b>خصم $${r.reward_value}</b>`;
        
        return `
            <div class="p-3 border rounded-xl bg-white shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-bold text-gray-800">${escapeHtml(r.name)} (الأولوية: ${r.priority})</div>
                        <div class="text-sm text-gray-600 mt-1">
                            إذا أنفق العميل <b>$${r.spend_threshold}</b> خلال آخر <b>${r.period_days}</b> يوم/أيام، يحصل على: ${rewardText}.
                        </div>
                        <div class="text-xs text-gray-500 mt-1 italic">رسالة: "${escapeHtml(r.reward_note)}"</div>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button type="button" onclick="editRewardRule(${r.rule_id})" class="text-blue-600 hover:text-blue-800" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button type="button" onclick="deleteRewardRule(${r.rule_id})" class="text-red-600 hover:text-red-800" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

document.getElementById('reward-rule-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', 'save_reward_rule');
    formData.append('rule_id', document.getElementById('reward-rule-id').value);
    formData.append('name', document.getElementById('reward-name').value);
    formData.append('priority', document.getElementById('reward-priority').value);
    formData.append('period_days', document.getElementById('reward-period-days').value);
    formData.append('spend_threshold', document.getElementById('reward-spend-threshold').value);
    formData.append('reward_type', document.getElementById('reward-type').value);
    formData.append('reward_value', document.getElementById('reward-value').value);
    formData.append('reward_note', document.getElementById('reward-note').value);

    try {
        const res = await fetch('api.php', { method: 'POST', body: formData });
        const result = await res.json();
        if (result.success) {
            showNotification('تم حفظ القاعدة بنجاح!', 'success');
            clearRewardForm();
            loadRewardRules();
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
});

function toggleRewardValueField() {
    const type = document.getElementById('reward-type').value;
    const container = document.getElementById('reward-value-container');
    if (type === 'coupon') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
        document.getElementById('reward-value').value = '0';
    }
}

function clearRewardForm() {
    document.getElementById('reward-rule-form').reset();
    document.getElementById('reward-rule-id').value = '';
    document.getElementById('reward-form-title').textContent = 'إضافة قاعدة جديدة';
    toggleRewardValueField();
}

function editRewardRule(id) {
    const rule = rewardRules.find(r => r.rule_id == id);
    if (!rule) return;
    document.getElementById('reward-rule-id').value = rule.rule_id;
    document.getElementById('reward-name').value = rule.name;
    document.getElementById('reward-priority').value = rule.priority;
    document.getElementById('reward-period-days').value = rule.period_days;
    document.getElementById('reward-spend-threshold').value = rule.spend_threshold;
    document.getElementById('reward-type').value = rule.reward_type;
    document.getElementById('reward-value').value = rule.reward_value;
    document.getElementById('reward-note').value = rule.reward_note;
    document.getElementById('reward-form-title').textContent = 'تعديل القاعدة';
    toggleRewardValueField();
    window.scrollTo(0, 0); // Scroll to top of modal
}

async function deleteRewardRule(id) {
    if (!confirm('هل أنت متأكد من حذف هذه القاعدة؟')) return;
    const fd = new FormData();
    fd.append('action', 'delete_reward_rule');
    fd.append('rule_id', id);
    try {
        const res = await fetch('api.php', { method: 'POST', body: fd });
        const result = await res.json();
        if (result.success) {
            showNotification('تم حذف القاعدة', 'success');
            loadRewardRules();
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
}

// --- Gift Pool Logic ---
document.getElementById('gift-pool-search')?.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    const resultsContainer = document.getElementById('gift-pool-search-results');
    if (term.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    try {
        const res = await fetch(`api.php?action=search_products&term=${encodeURIComponent(term)}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
            resultsContainer.innerHTML = data.data.map(p => `
                <div class="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between gap-2"
                     onclick="addProductToGiftPool(${p.id}, ${p.variant_id || null})">
                    <div class="flex items-center gap-2 min-w-0">
                        <img src="${p.image}" class="w-8 h-8 rounded object-cover flex-shrink-0">
                        <span class="truncate text-sm">${p.name} ${p.variant_name ? `(${p.variant_name})` : ''}</span>
                    </div>
                    <button class="px-2 py-1 bg-green-500 text-white rounded text-xs">إضافة</button>
                </div>
            `).join('');
        } else {
            resultsContainer.innerHTML = '<div class="p-2 text-gray-500 text-sm">لا توجد نتائج</div>';
        }
    } catch (err) {
        console.error(err);
    }
});

async function addProductToGiftPool(productId, variantId) {
    const fd = new FormData();
    fd.append('action', 'add_to_gift_pool');
    fd.append('product_id', productId);
    if (variantId) {
        fd.append('variant_id', variantId);
    }
    try {
        const res = await fetch('api.php', { method: 'POST', body: fd });
        const result = await res.json();
        if (result.success) {
            showNotification('تمت إضافة المنتج لسلة الهدايا!', 'success');
            document.getElementById('gift-pool-search').value = '';
            document.getElementById('gift-pool-search-results').innerHTML = '';
            loadGiftPool();
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
}

async function loadGiftPool() {
    try {
        const res = await fetch('api.php?action=get_gift_pool');
        const data = await res.json();
        if (data.success) {
            giftPool = data.data;
            renderGiftPool();
        } else {
            document.getElementById('gift-pool-list').innerHTML = `<div class="text-center py-4 text-red-500">${data.message}</div>`;
        }
    } catch (err) {
        console.error(err);
    }
}

function renderGiftPool() {
    const container = document.getElementById('gift-pool-list');
    if (giftPool.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-gray-500">سلة الهدايا فارغة.</div>`;
        return;
    }
    container.innerHTML = giftPool.map(g => `
        <div class="p-2 bg-white border rounded-lg flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
                <img src="${g.image}" class="w-8 h-8 rounded object-cover flex-shrink-0">
                <span class="truncate text-sm">${g.product_name} ${g.variant_name ? `(${g.variant_name})` : ''}</span>
            </div>
            <button type="button" onclick="removeProductFromGiftPool(${g.gift_id})" class="text-red-500 hover:text-red-700" title="إزالة">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

async function removeProductFromGiftPool(giftId) {
    if (!confirm('هل أنت متأكد من إزالة هذا المنتج من سلة الهدايا؟')) return;
    const fd = new FormData();
    fd.append('action', 'remove_from_gift_pool');
    fd.append('gift_id', giftId);
    try {
        const res = await fetch('api.php', { method: 'POST', body: fd });
        const result = await res.json();
        if (result.success) {
            showNotification('تمت إزالة الهدية', 'success');
            loadGiftPool();
        } else {
            showNotification('خطأ: ' + result.message, 'error');
        }
    } catch (err) {
        showNotification('فشل الاتصال', 'error');
    }
}

// قم بتشغيل هذا عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // جلب عدد القواعد لعرضه في البطاقة
    fetch('api.php?action=get_reward_rules')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('reward-rules-count').textContent = data.data.length;
            }
        });
});




///// المنتجات المحجوزة

// Reserved Products Modal
function openReservedProductsModal() {
    const modal = document.getElementById('reserved-products-modal');
    const content = document.getElementById('reserved-modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
    loadReservedProducts();
}

function closeReservedProductsModal() {
    const modal = document.getElementById('reserved-products-modal');
    const content = document.getElementById('reserved-modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

async function loadReservedProducts() {
    const tbody = document.getElementById('reserved-products-body');
    try {
        const res = await fetch('api.php?action=get_reserved_products_report');
        const data = await res.json();
        if (data.success) {
            const items = data.data;
            document.getElementById('reserved-products-count').textContent = items.length;
            if (items.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-8 text-gray-500">
                            <i class="fas fa-check-circle text-4xl mb-4 opacity-50"></i>
                            <p>لا توجد منتجات محجوزة حالياً</p>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = items.map(item => `
                    <tr class="border-b border-gray-100 hover:bg-indigo-50">
                        <td class="p-4">
                            <div class="font-bold text-gray-800">${escapeHtml(item.product_name)}</div>
                            ${item.variant_name ? `<div class="text-sm text-purple-600">الدرجة: ${escapeHtml(item.variant_name)}</div>` : ''}
                        </td>
                        <td class="p-4">${escapeHtml(item.customer_name)}</td>
                        <td class="p-4 font-mono text-gray-700">${escapeHtml(item.customer_phone)}</td>
                        <td class="p-4">
                            <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                                ${item.quantity}
                            </span>
                        </td>
                        <td class="p-4 text-sm text-gray-600">
                            ${new Date(item.created_at).toLocaleDateString('en-SY')}
                        </td>
                    </tr>
                `).join('');
            }
        } else {
            throw new Error(data.message || 'فشل التحميل');
        }
    } catch (err) {
        console.error('Error loading reserved products:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">خطأ في التحميل</td></tr>`;
    }
}

// إغلاق عند النقر خارج النافذة
document.getElementById('reserved-products-modal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('reserved-products-modal')) {
        closeReservedProductsModal();
    }
});

//// نهاية كود الالمنتجات المحجوزة



// تحديث رمز العملة في واجهة الفاتورة
function updateInvoiceCurrencyDisplay() {
    const currencySelect = document.getElementById('invoice-currency');
    const exchangeRateInput = document.getElementById('invoice-exchange-rate');
    const currency = currencySelect.value;
    
    // إذا كانت العملة هي الليرة السورية، نظهر حقل سعر الصرف
    // إذا كانت العملة دولار، نخفي حقل سعر الصرف أو نجعله 1
    if (currency === 'SYP') {
        // لا نخفي حقل سعر الصرف، نتركه مرئيًا للسماح بتحديد السعر
        exchangeRateInput.disabled = false;
        // نقوم بتحديث الأسعار المعروضة في عناصر الفاتورة
        updateInvoiceItemsPrices();
    } else {
        // للدولار، نجعل سعر الصرف 1
        exchangeRateInput.disabled = false;
        // نترك سعر الصرف كما هو مدخل من قبل المستخدم
    }
    
    // تحديث الرمز في الملخص
    updateInvoiceSummary();
}
// دالة لتحويل السعر من العملة الحالية إلى العملة المحددة
function convertPrice(price, fromCurrency, toCurrency, exchangeRate) {
    if (fromCurrency === toCurrency) {
        return price;
    }
    
    if (fromCurrency === 'USD' && toCurrency === 'SYP') {
        // من دولار إلى ليرة
        return price * exchangeRate;
    } else if (fromCurrency === 'SYP' && toCurrency === 'USD') {
        // من ليرة إلى دولار
        return price / exchangeRate;
    }
    
    return price;
}

// دالة لتحديث أسعار العناصر حسب العملة المحددة
function updateInvoiceItemsPrices() {
    const currencySelect = document.getElementById('invoice-currency');
    const exchangeRateInput = document.getElementById('invoice-exchange-rate');
    const currency = currencySelect.value;
    const exchangeRate = parseFloat(exchangeRateInput.value) || 1;
    
    // تحديث أسعار العناصر المعروضة
    invoiceItems = invoiceItems.map(item => {
        // نحتفظ بالسعر الأصلي بالدولار
            item.original_cost_price = item.cost_price; // السعر الأصلي بالدولار
        }
        
        // تحويل السعر بناءً على العملة المحددة
        if (currency === 'SYP') {
            // إذا كانت العملة هي الليرة، نعرض السعر المحوّل
            item.display_cost_price = item.original_cost_price * exchangeRate;
        } else {
            // إذا كانت العملة دولار، نعرض السعر الأصلي
            item.display_cost_price = item.original_cost_price;
        }
        
        return item;
    });
    
    // إعادة عرض العناصر
    renderInvoiceItems();
    updateInvoiceSummary();
}
