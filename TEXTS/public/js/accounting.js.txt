// == قاعدة بيانات Dexie (يجب أن تكون في النطاق العام) ==
const db = new Dexie('AccountingOfflineDB');
db.version(2).stores({
  products: 'id, barcode, name, price, stock, reserved_stock, image, category_id, variant_id, variant_name, lastUpdated',
  pendingSales: '++id, items, delivery_fee, seller_name, discount_type, discount_value, createdAt',
  pendingReturns: '++id, items, reason, createdAt',
  syncLog: '++id, type, localId, status, createdAt'
});

// == عنصر DOM مركزي ==
const DOM = {
  // الوضع
  modeToggle: document.getElementById('mode-toggle'),
  saleModeCard: document.getElementById('sale-mode-card'),
  returnModeCard: document.getElementById('return-mode-card'),
  invoiceModeText: document.getElementById('invoice-mode-text'),
  returnReasonSection: document.getElementById('return-reason-section'),
  scanBtn: document.getElementById('scan-accounting-qr-btn'),
  // البحث
  productSearch: document.getElementById('product-search'),
  searchResults: document.getElementById('search-results'),

  // الفاتورة
  invoiceItems: document.getElementById('invoice-items'),
  completeSaleBtn: document.getElementById('complete-sale-btn'),
  completeReturnBtn: document.getElementById('complete-return-btn'),
  discountType: document.getElementById('discount-type'),
  discountValue: document.getElementById('discount-value'),
  deliveryFee: document.getElementById('delivery-fee'),
  subtotal: document.getElementById('subtotal'),
  discountAmount: document.getElementById('discount-amount'),
  grandTotal: document.getElementById('grand-total'),
  sellerName: document.getElementById('seller-name'),
  returnReason: document.getElementById('return-reason'),

  // التبويبات
  invoiceTabs: document.getElementById('invoice-tabs'),

  // الأزرار والمؤشرات
  syncNowBtn: document.getElementById('sync-now-btn'),
  refreshBtn: document.getElementById('refresh-products-btn'),
  connectionStatus: document.getElementById('connection-status')
};

// == متغيرات الحالة ==
let tabs = [];
let activeTabId = null;
const MAX_TABS = 10;
let invoiceItems = [];
let currentMode = 'sale';

// == تهيئة النظام عند التحميل ==
(async () => {
  openNewTab();
  if (navigator.onLine) {
    await cacheAllProducts();
  }
  updateConnectionStatus();
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  if (navigator.onLine) {
    await syncPendingTransactions();
  }
  setupEventListeners();
})();

async function startBarcodeScanner() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showNotification('error', 'غير مدعوم', 'متصفحك لا يدعم الوصول إلى الكاميرا.');
    return;
  }

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div class="relative bg-white rounded-2xl p-4 w-full max-w-md">
        <button id="close-scan" class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center z-10">
          <i class="fas fa-times"></i>
        </button>
        <video id="barcode-video" class="w-full h-auto rounded-lg" autoplay playsinline></video>
        <p class="text-center mt-2 text-gray-600 text-sm">وجّه الكاميرا نحو الباركود</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const codeReader = new ZXing.BrowserMultiFormatReader();
  const videoElement = document.getElementById('barcode-video');

  try {
    await codeReader.decodeFromVideoDevice(undefined, videoElement, (result, err) => {
      if (result) {
        DOM.productSearch.value = result.getText();
        handleSearch();
        codeReader.reset();
        modal.remove();
      }
      if (err && !(err instanceof ZXing.NotFoundException)) {
        console.error('خطأ في الماسح:', err);
        showNotification('error', 'خطأ', 'فشل في تشغيل الماسح.');
        codeReader.reset();
        modal.remove();
      }
    });
  } catch (error) {
    console.error('فشل تهيئة الماسح:', error);
    showNotification('error', 'الكاميرا', 'الرجاء السماح بالوصول إلى الكاميرا.');
    modal.remove();
  }

  document.getElementById('close-scan').onclick = () => {
    codeReader.reset();
    modal.remove();
  };
}

// == ربط الأحداث ==
function setupEventListeners() {
  if (DOM.modeToggle) DOM.modeToggle.addEventListener('change', toggleMode);
  if (DOM.productSearch) {
    DOM.productSearch.addEventListener('input', handleSearch);
    DOM.productSearch.addEventListener('keypress', handleKeyPress);
  }
  if (DOM.refreshBtn) DOM.refreshBtn.addEventListener('click', handleRefreshProducts);
  if (DOM.syncNowBtn) DOM.syncNowBtn.addEventListener('click', handleSyncNow);
  if (DOM.completeSaleBtn) DOM.completeSaleBtn.addEventListener('click', completeSale);
  if (DOM.completeReturnBtn) DOM.completeReturnBtn.addEventListener('click', completeReturn);
  if (DOM.saleModeCard) DOM.saleModeCard.addEventListener('click', () => { if (DOM.modeToggle) DOM.modeToggle.checked = false; toggleMode(); });
  if (DOM.returnModeCard) DOM.returnModeCard.addEventListener('click', () => { if (DOM.modeToggle) DOM.modeToggle.checked = true; toggleMode(); });
  if (DOM.scanBtn) DOM.scanBtn.addEventListener('click', startBarcodeScanner);

  // ✅ إصلاح ربط الأحداث للخصم ورسوم التوصيل
  if (DOM.discountType) DOM.discountType.addEventListener('change', function() {
    saveTabData();
    calculateTotal();
  });
  if (DOM.discountValue) DOM.discountValue.addEventListener('input', function() {
    saveTabData();
    calculateTotal();
  });
  if (DOM.deliveryFee) DOM.deliveryFee.addEventListener('input', function() {
    saveTabData();
    calculateTotal();
  });
  if (DOM.sellerName) DOM.sellerName.addEventListener('input', saveTabData);

  // إغلاق نتائج البحث عند النقر خارجها
  document.addEventListener('click', (e) => {
    if (DOM.productSearch && !DOM.productSearch.parentElement.contains(e.target)) {
      if (DOM.searchResults) DOM.searchResults.classList.add('hidden');
    }
  });
}

// == حفظ بيانات التبويب ==
function saveTabData() {
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (activeTab) {
    activeTab.sellerName = DOM.sellerName?.value.trim() || '';
    activeTab.discountType = DOM.discountType?.value || 'fixed';
    activeTab.discountValue = parseFloat(DOM.discountValue?.value) || 0;
    activeTab.deliveryFee = parseFloat(DOM.deliveryFee?.value) || 0;
    
    // تحديث واجهة المستخدم فورًا
    calculateTotal();
  }
}

// == وظائف التبويبات ==
function createNewTab() {
  const tabId = `tab-${Date.now()}`;
  const tabNumber = tabs.length + 1;
  return {
    id: tabId,
    name: `فاتورة ${tabNumber}`,
    items: [],
    mode: 'sale',
    sellerName: '',
    discountType: 'fixed',
    discountValue: 0,
    deliveryFee: 0
  };
}

function openNewTab() {
  if (tabs.length >= MAX_TABS) {
    showNotification('warning', 'الحد الأقصى', 'لا يمكن فتح أكثر من 10 فواتير في نفس الوقت.');
    return;
  }
  const newTab = createNewTab();
  tabs.push(newTab);
  setActiveTab(newTab.id);
  renderTabs();
}

function setActiveTab(tabId) {
  activeTabId = tabId;
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;

  invoiceItems = [...tab.items];
  currentMode = tab.mode;
  
  // ✅ تحديث القيم مع منع إعادة حساب الإجمالي أثناء التحميل
  if (DOM.sellerName) DOM.sellerName.value = tab.sellerName || '';
  if (DOM.discountType) DOM.discountType.value = tab.discountType;
  if (DOM.discountValue) DOM.discountValue.value = tab.discountValue;
  if (DOM.deliveryFee) DOM.deliveryFee.value = tab.deliveryFee;

  toggleModeUI();
  updateInvoiceUI();
  calculateTotal(); // ✅ حساب الإجمالي مرة واحدة بعد تحميل كل البيانات
  renderTabs();
}

function closeTab(tabId) {
  if (tabs.length <= 1) {
    showNotification('warning', 'ملاحظة', 'لا يمكن إغلاق الفاتورة الوحيدة.');
    return;
  }
  if (confirm('هل تريد إغلاق هذه الفاتورة؟')) {
    tabs = tabs.filter(t => t.id !== tabId);
    if (activeTabId === tabId) {
      setActiveTab(tabs[0].id);
    }
    renderTabs();
  }
}

function renderTabs() {
  if (!DOM.invoiceTabs) return;
  let tabsHtml = tabs.map(tab => {
    const isActive = tab.id === activeTabId;
    return `
      <div class="flex items-center gap-1.5 px-4 py-2 rounded-t-xl border-t-2 border-transparent cursor-pointer transition-all duration-200
          ${isActive 
            ? 'bg-white border-t-pink-500 shadow-md -mb-px z-10' 
            : 'bg-gray-100 hover:bg-gray-200 border-t-gray-300'}">
        <span class="text-sm font-bold ${isActive ? 'text-gray-800' : 'text-gray-600'}">${tab.name}</span>
        ${tabs.length > 1 ? `
          <button onclick="closeTab('${tab.id}')" class="text-gray-500 hover:text-red-600 ml-1">
            <i class="fas fa-times text-xs"></i>
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  tabsHtml += `
    <button onclick="openNewTab()" class="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-full shadow-md transition-transform hover:scale-110">
      <i class="fas fa-plus text-xs"></i>
    </button>
  `;

  DOM.invoiceTabs.innerHTML = tabsHtml;
  DOM.invoiceTabs.querySelectorAll('.cursor-pointer').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.querySelector('button')?.onclick?.toString().match(/'([^']+)'/)?.[1];
      if (id) setActiveTab(id);
    });
  });
}

// == واجهة الفاتورة والوضع ==
function toggleModeUI() {
  const isReturn = currentMode === 'return';

  if (DOM.returnReasonSection) DOM.returnReasonSection.classList.toggle('hidden', !isReturn);
  if (DOM.completeSaleBtn) DOM.completeSaleBtn.classList.toggle('hidden', isReturn);
  if (DOM.completeReturnBtn) DOM.completeReturnBtn.classList.toggle('hidden', !isReturn);
  if (document.getElementById('discount-delivery-row')) {
    document.getElementById('discount-delivery-row').classList.toggle('hidden', isReturn);
  }
  if (DOM.invoiceModeText) DOM.invoiceModeText.textContent = isReturn ? 'فاتورة إرجاع' : 'فاتورة مبيعات';

  if (isReturn) {
    if (DOM.returnModeCard) DOM.returnModeCard.classList.add('bg-gradient-to-r', 'from-red-50', 'to-rose-50', 'border-2', 'border-red-300');
    if (DOM.saleModeCard) DOM.saleModeCard.classList.remove('bg-gradient-to-r', 'from-green-50', 'to-emerald-50', 'border-2', 'border-green-300');
  } else {
    if (DOM.saleModeCard) DOM.saleModeCard.classList.add('bg-gradient-to-r', 'from-green-50', 'to-emerald-50', 'border-2', 'border-green-300');
    if (DOM.returnModeCard) DOM.returnModeCard.classList.remove('bg-gradient-to-r', 'from-red-50', 'to-rose-50', 'border-2', 'border-red-300');
  }
}

function toggleMode() {
  currentMode = DOM.modeToggle?.checked ? 'return' : 'sale';
  invoiceItems = [];
  updateInvoiceUI();
  toggleModeUI();
}

// == وظائف الفاتورة ==
function updateInvoiceUI() {
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (activeTab) {
    activeTab.items = [...invoiceItems];
    activeTab.mode = currentMode;
    activeTab.sellerName = DOM.sellerName?.value.trim() || '';
    activeTab.discountType = DOM.discountType?.value || 'fixed';
    activeTab.discountValue = parseFloat(DOM.discountValue?.value) || 0;
    activeTab.deliveryFee = parseFloat(DOM.deliveryFee?.value) || 0;
  }

  if (invoiceItems.length === 0) {
    if (DOM.invoiceItems) {
      DOM.invoiceItems.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <i class="fas fa-inbox text-4xl mb-2"></i>
          <p class="text-sm">لا توجد منتجات</p>
        </div>
      `;
    }
  } else {
if (DOM.invoiceItems) {
  DOM.invoiceItems.innerHTML = invoiceItems.map((item, index) => {
    const key = item._key || item.id;
    return `
      <div class="invoice-item grid grid-cols-[30px_1fr_110px_35px_15px] items-center gap-2 sm:gap-3 p-2 rounded-xl border border-gray-200 bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition">
        <!-- التسلسل -->
        <div class="flex justify-center">
          <div class="w-6 h-6 flex items-center justify-center bg-pink-500 text-white text-[10px] font-bold rounded-full">
            ${index + 1}
          </div>
        </div>

        <!-- الاسم -->
        <div class="flex items-center gap-2 min-w-0">
          <img src="${escapeHtml(item.image)}" class="hidden sm:block w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shadow-sm flex-shrink-0">
          <div class="min-w-0">
            <p class="font-bold text-xs sm:text-sm text-gray-800 break-words line-clamp-2">${escapeHtml(item.name)}${item.variant_name ? ' — ' + escapeHtml(item.variant_name) : ''}</p>
            <p class="text-[10px] text-gray-500 whitespace-nowrap mt-0.5">سعر القطعة: $${item.price}</p>
          </div>
        </div>

        <!-- الكمية -->
        <div class="flex items-center justify-center gap-1">
          <button onclick="updateQuantity('${key}', -1)" class="w-7 h-7 text-sm bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">−</button>
          <input type="number" value="${item.quantity}" min="1" onchange="updateQuantityDirect('${key}', this.value)" class="w-9 h-7 text-center border border-gray-300 rounded font-bold text-[16px] focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none">
          <button onclick="updateQuantity('${key}', 1)" class="w-7 h-7 text-sm bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">+</button>
        </div>

        <!-- الإجمالي -->
        <div class="text-center">
          <p class="font-bold text-pink-600 text-sm">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>

        <!-- الحذف -->
        <div class="flex justify-center">
          <button onclick="removeInvoiceItem('${key}')" class="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full" title="حذف">
            <i class="fas fa-trash text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}
  }
  calculateTotal();
}

// == معالجات البيع والإرجاع ==
async function completeSale() {
    if (invoiceItems.length === 0) {
        showNotification('error', 'الفاتورة فارغة', 'الرجاء إضافة منتجات أولاً.');
        return;
    }

    const saleData = {
        items: invoiceItems.map(i => ({
            id: parseInt(i.id),
            variant_id: i.variant_id ? parseInt(i.variant_id) : null,
            quantity: parseInt(i.quantity)
        })),
        delivery_fee: parseFloat(DOM.deliveryFee?.value) || 0,
        seller_name: DOM.sellerName?.value.trim() || '',
        discount_type: DOM.discountType?.value || 'fixed',
        discount_value: parseFloat(DOM.discountValue?.value) || 0,
        createdAt: new Date().toISOString()
    };

    // ✅ التحقق الحقيقي من الاتصال (ليس فقط navigator.onLine)
    const isActuallyOnline = await isOnlineForReal();

    if (!isActuallyOnline) {
        // احفظ محليًا
        const localId = await db.pendingSales.add(saleData);
        await db.syncLog.add({ type: 'sale', localId, status: 'pending', createdAt: new Date() });
        showNotification('warning', 'تم الحفظ محليًا', 'سيتم مزامنة الفاتورة عند عودة الاتصال.');
        clearCurrentInvoice();
        return;
    }

    try {
  const response = await fetch('api.php?action=complete_sale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData)
  });

  // 🔥 التحقق من حالة HTTP أولًا
  if (!response.ok) {
    // خطأ في الشبكة أو السيرفر (500, 404, etc.)
    throw new Error('فشل الاتصال بالخادم');
  }

  const result = await response.json();
  if (result.success) {
    showNotification('success', 'تم البيع', 'تم تسجيل عملية البيع بنجاح.');
    clearCurrentInvoice();
  } else {
    // ❌ خطأ منطقي (كمية غير متوفرة، منتج غير موجود...) → لا تحفظ محليًا!
    showNotification('error', 'فشل البيع', result.message || 'حدث خطأ في البيانات.');
  }
} catch (error) {
  // ✅ الحفظ محليًا فقط عند فشل الشبكة (وليس عند خطأ منطقي)
  if (error.name === 'TypeError' || error.message.includes('fetch') || !navigator.onLine) {
    const localId = await db.pendingSales.add(saleData);
    await db.syncLog.add({ type: 'sale', localId, status: 'pending', createdAt: new Date() });
    showNotification('warning', 'تم الحفظ محليًا', 'سيتم مزامنة الفاتورة عند عودة الاتصال.');
    clearCurrentInvoice();
  } else {
    // خطأ منطقي أو غير متعلق بالشبكة → لا تحفظ
    showNotification('error', 'فشل البيع', error.message || 'حدث خطأ غير متوقع.');
  }
}
}

async function completeReturn() {
    if (invoiceItems.length === 0) {
        showNotification('error', 'القائمة فارغة', 'الرجاء إضافة منتجات مرتجعة أولاً.');
        return;
    }

    // ✅ التأكد من وجود السعر لكل منتج
    const returnData = {
        items: invoiceItems.map(i => {
            const priceValue = parseFloat(i.price) || parseFloat(i.base_price) || 0;
            if (priceValue === 0) {
                console.warn('تحذير: المنتج بدون سعر:', i);
            }
            return {
                id: parseInt(i.id) || 0,
                variant_id: i.variant_id ? parseInt(i.variant_id) : null,
                quantity: parseInt(i.quantity) || 1,
                price_at_return: priceValue
            };
        }),
        reason: DOM.returnReason?.value.trim() || '',
        createdAt: new Date().toISOString()
    };

    // ✅ تسجيل البيانات للتحقق
    console.log('🔄 بيانات الإرجاع:', JSON.stringify(returnData, null, 2));

    // التحقق من الاتصال أولاً
    const isActuallyOnline = await isOnlineForReal();
    console.log('📡 حالة الاتصال:', isActuallyOnline);
    
    if (!isActuallyOnline) {
        // غير متصل → احفظ محلياً
        try {
            const localId = await db.pendingReturns.add(returnData);
            await db.syncLog.add({ 
                type: 'return', 
                localId, 
                status: 'pending', 
                createdAt: new Date() 
            });
            showNotification('warning', 'تم الحفظ محلياً', 'سيتم مزامنة الإرجاع عند عودة الاتصال.');
            clearCurrentInvoice();
        } catch (dexieError) {
            console.error('❌ فشل في الحفظ المحلي:', dexieError);
            showNotification('error', 'فشل الحفظ', 'تعذر حفظ الإرجاع حتى محلياً.');
        }
        return;
    }

    // متصل → حاول الإرسال للسيرفر
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('api.php?action=process_return', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(returnData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ استجابة غير JSON:', await response.text());
            throw new Error('استجابة غير متوقعة من الخادم');
        }

        const result = await response.json();
        console.log('✅ استجابة السيرفر:', result);

        if (response.ok && result.success) {
            showNotification('success', 'تم الإرجاع', 'تم تسجيل عملية الإرجاع بنجاح.');
            clearCurrentInvoice();
        } else {
            // خطأ منطقي من الخادم → لا تحفظ محلياً
            const errorMessage = result.message || 'فشل في معالجة الإرجاع';
            console.error('❌ خطأ من السيرفر:', errorMessage);
            showNotification('error', 'فشل الإرجاع', errorMessage);
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال:', error.name, error.message);
        // فقط أخطاء الشبكة تحفظ محلياً
        if (error.name === 'TypeError' || error.name === 'AbortError' || !navigator.onLine) {
            try {
                const localId = await db.pendingReturns.add(returnData);
                await db.syncLog.add({ 
                    type: 'return', 
                    localId, 
                    status: 'pending', 
                    createdAt: new Date() 
                });
                showNotification('warning', 'تم الحفظ محلياً', 'سيتم مزامنة الإرجاع عند عودة الاتصال.');
                clearCurrentInvoice();
            } catch (dexieError) {
                console.error('❌ فشل في الحفظ المحلي:', dexieError);
                showNotification('error', 'فشل الحفظ', 'تعذر حفظ الإرجاع حتى محلياً.');
            }
        } else {
            // خطأ آخر → لا تحفظ
            showNotification('error', 'خطأ في الإرجاع', error.message || 'حدث خطأ غير متوقع.');
        }
    }
}

// == دوال المساعدة ==
function isBarcodeInput(input) {
  return /^\d+$/.test(input) && input.length >= 3;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '<', '>': '>', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function calculateTotal() {
  console.log('🔄 حساب الإجمالي - العناصر:', invoiceItems.length); // للتتبع
  
  const subtotal = invoiceItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  if (DOM.subtotal) DOM.subtotal.textContent = `$${subtotal.toFixed(2)}`;

  if (currentMode === 'return') {
    if (DOM.grandTotal) DOM.grandTotal.textContent = `-$${subtotal.toFixed(2)}`;
    return;
  }

  const discountType = DOM.discountType?.value || 'fixed';
  const discountValue = parseFloat(DOM.discountValue?.value) || 0;
  let discountAmount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  
  // ✅ منع الخصم السلبي
  discountAmount = Math.min(discountAmount, subtotal);
  
  const totalAfterDiscount = subtotal - discountAmount;
  const deliveryFee = parseFloat(DOM.deliveryFee?.value) || 0;
  const grandTotal = Math.max(0, totalAfterDiscount + deliveryFee);

  if (DOM.discountAmount) DOM.discountAmount.textContent = `-$${discountAmount.toFixed(2)}`;
  if (DOM.grandTotal) DOM.grandTotal.textContent = `$${grandTotal.toFixed(2)}`;
  
  console.log('💰 الإجمالي:', { subtotal, discountAmount, deliveryFee, grandTotal }); // للتتبع
}

function clearCurrentInvoice() {
  invoiceItems = [];
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (activeTab) {
    activeTab.items = [];
    activeTab.sellerName = '';
    activeTab.discountValue = 0;
    activeTab.deliveryFee = 0;
  }
  if (DOM.sellerName) DOM.sellerName.value = '';
  if (DOM.discountValue) DOM.discountValue.value = '0';
  if (DOM.deliveryFee) DOM.deliveryFee.value = '0';
  if (DOM.returnReason) DOM.returnReason.value = '';
  updateInvoiceUI();
}

// == البحث والمسح ==
async function handleSearch() {
  const term = DOM.productSearch?.value.trim() || '';
  if (term.length < 1) {
    if (DOM.searchResults) DOM.searchResults.classList.add('hidden');
    return;
  }
  if (isBarcodeInput(term)) {
    await handleBarcodeSearch(term);
  } else {
    await handleTextSearch(term);
  }
}

async function handleKeyPress(e) {
  if (e.key === 'Enter') {
    const term = DOM.productSearch?.value.trim() || '';
    if (isBarcodeInput(term)) {
      e.preventDefault();
      await handleBarcodeSearch(term);
    }
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
        await addProductToList(product);
        if (DOM.productSearch) DOM.productSearch.value = '';
        if (DOM.searchResults) DOM.searchResults.classList.add('hidden');
        showNotification('success', 'تمت الإضافة', `تم إضافة ${product.name} إلى الفاتورة`);
      } else {
        await handleTextSearch(barcode);
      }
    } else {
      if (DOM.searchResults) {
        DOM.searchResults.innerHTML = '<div class="p-4 text-center text-red-500">المنتج غير موجود</div>';
        DOM.searchResults.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error("Barcode search failed", err);
    showNotification('error', 'خطأ', 'تعذر العثور على المنتج');
  }
}

async function handleTextSearch(term) {
  const isOnline = navigator.onLine;
  let products = [];

  if (isOnline) {
    try {
      const response = await fetch(`api.php?action=search_products&term=${encodeURIComponent(term)}`, { timeout: 5000 });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        products = result.data;
        const now = new Date().toISOString();
        const toCache = result.data.map(p => ({
            id: p.variant_id ? `${p.id}_${p.variant_id}` : p.id,
            original_id: p.id,
            variant_id: p.variant_id || null,
            barcode: p.barcode || '',
            name: p.name || '',
            variant_name: p.variant_name || null,
            price: parseFloat(p.price) || 0,
            stock: parseInt(p.stock) || 0,
            reserved_stock: parseInt(p.reserved_stock) || 0,
            available_stock: parseInt(p.available_stock) || (parseInt(p.stock) - parseInt(p.reserved_stock)),
            image: p.image || 'uploads/placeholder.jpg',
            category_id: parseInt(p.category_id) || 0,
            lastUpdated: now
        }));
        await db.products.bulkPut(toCache);
      }
    } catch (err) {
      console.warn("فشل الاتصال، التحويل للبحث المحلي...");
    }
  }

  if (!isOnline || products.length === 0) {
    try {
      products = await db.products
        .filter(p => 
            (p.name && p.name.toLowerCase().includes(term.toLowerCase())) ||
            (p.barcode && p.barcode.includes(term))
        )
        .limit(20)
        .toArray();
    } catch (err) {
      console.error("فشل البحث المحلي:", err);
      products = [];
    }
  }

  if (DOM.searchResults) {
    DOM.searchResults.innerHTML = '';
    if (products.length > 0) {
      renderSearchResults(products);
    } else {
      renderNoResults();
    }
  }
}

function renderSearchResults(products) {
  if (!DOM.searchResults) return;
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'p-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 cursor-pointer border-b border-pink-100 transition flex items-center gap-4';
    const hasVariantsIndicator = product.variant_id ? `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">درجة: ${product.variant_name}</span>` : '';
    div.innerHTML = `
      <img src="${escapeHtml(product.image)}" class="w-12 h-12 sm:w-12 sm:h-12 rounded-xl object-cover shadow-md">
      <div class="flex-grow">
        <div class="font-bold text-sm text-gray-800">${escapeHtml(product.name)}</div>
        <div class="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
          <span class="flex items-center gap-1">
            <i class="fas fa-cubes text-blue-500"></i> 
            ${product.stock}
            ${product.reserved_stock > 0 ? `<span class="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full mr-1">(محجوز: ${product.reserved_stock})</span>` : ''}
          </span>
          <span class="flex items-center gap-1"><i class="fas fa-dollar-sign text-green-500"></i> ${product.price}</span>
          ${hasVariantsIndicator}
        </div>
      </div>
      <button class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition transform hover:scale-105">
        <i class="fas fa-plus"></i>
      </button>
    `;
    div.onclick = () => {
      addProductToList(product);
      if (DOM.productSearch) DOM.productSearch.value = '';
      if (DOM.searchResults) DOM.searchResults.classList.add('hidden');
    };
    DOM.searchResults.appendChild(div);
  });
  DOM.searchResults.classList.remove('hidden');
}

function renderNoResults() {
  if (DOM.searchResults) {
    DOM.searchResults.innerHTML = '<div class="p-4 text-center text-gray-500">لا توجد نتائج</div>';
    DOM.searchResults.classList.remove('hidden');
  }
}

async function addProductToList(product) {
  try {
    const resp = await fetch(`api.php?action=get_variants&product_id=${product.id}`);
    const result = await resp.json();
    if (result.success && result.data && result.data.length > 0) {
      openVariantSelectorForAccounting(product, result.data);
      return;
    }
  } catch (e) { /* ignore */ }

  const key = `${product.id}`;
  const existingItem = invoiceItems.find(item => item._key === key);
  
  // ✅ حساب الكمية المتاحة الفعلية
  const totalStock = parseInt(product.stock) || 0;
  const reservedStock = parseInt(product.reserved_stock) || 0;
  const availableStock = totalStock - reservedStock;

  if (existingItem) {
    if (currentMode === 'sale' && existingItem.quantity >= availableStock) {
      showNotification('warning', 'الكمية محدودة', `الكمية المتاحة: ${availableStock} (المخزون: ${totalStock}، المحجوز: ${reservedStock})`);
      return;
    }
    existingItem.quantity++;
  } else {
    if (currentMode === 'sale' && availableStock <= 0) {
      showNotification('warning', 'غير متوفر', `المنتج غير متوفر حالياً (المحجوز: ${reservedStock})`);
      return;
    }
    invoiceItems.unshift({ 
      ...product, 
      _key: key, 
      quantity: 1,
      available_stock: availableStock
    });
  }
  updateInvoiceUI();
}

// == مزامنة البيانات ==
async function syncPendingTransactions() {
  const pendingSales = await db.pendingSales.toArray();
  
  for (const sale of pendingSales) {
    try {
      const response = await fetch('api.php?action=complete_sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale)
      });
      
      // ✅ التحقق من نوع المحتوى قبل محاولة تحويله لـ JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlResponse = await response.text();
        console.error('❌ السيرفر أرجع HTML بدلاً من JSON:', htmlResponse.substring(0, 200));
        throw new Error('استجابة غير صالحة من السيرفر');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // ✅ حذف الفاتورة المحلية بعد النجاح
        await db.pendingSales.delete(sale.id);
        await db.syncLog.where('localId').equals(sale.id).delete();
        console.log('✅ تم مزامنة بيع محلي بنجاح:', sale.id);
      } else {
        console.warn('⚠️ فشل مزامنة بيع:', result.message);
      }
    } catch (err) {
      console.warn('❌ فشل مزامنة بيع محلي:', err.message);
      // لا نرمي الخطأ لنستمر في مزامنة باقي الفواتير
    }
  }

  const pendingReturns = await db.pendingReturns.toArray();
  
  for (const ret of pendingReturns) {
    try {
      const response = await fetch('api.php?action=process_return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ret)
      });
      
      // ✅ التحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlResponse = await response.text();
        console.error('❌ السيرفر أرجع HTML بدلاً من JSON:', htmlResponse.substring(0, 200));
        throw new Error('استجابة غير صالحة من السيرفر');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // ✅ حذف الإرجاع المحلي بعد النجاح
        await db.pendingReturns.delete(ret.id);
        await db.syncLog.where('localId').equals(ret.id).delete();
        console.log('✅ تم مزامنة إرجاع محلي بنجاح:', ret.id);
      } else {
        console.warn('⚠️ فشل مزامنة إرجاع:', result.message);
      }
    } catch (err) {
      console.warn('❌ فشل مزامنة إرجاع محلي:', err.message);
    }
  }
  
  // ✅ تحديث حالة الاتصال بعد المزامنة
  await updateConnectionStatus();
}

// == تحديث حالة الاتصال ==
async function updateConnectionStatus() {
    const statusEl = DOM.connectionStatus;
    if (!statusEl) return;

    const isActuallyOnline = await isOnlineForReal();
    const pendingSales = await db.pendingSales.count();
    const pendingReturns = await db.pendingReturns.count();
    const totalPending = pendingSales + pendingReturns;
    
    const overlay = document.getElementById('sync-queue-overlay');

    if (isActuallyOnline) {
        statusEl.innerHTML = '<i class="fas fa-wifi text-green-600"></i><span>متصل</span>';
        statusEl.className = 'flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs';
        
        if (totalPending > 0) {
            const pendingText = `${pendingSales} مبيعات، ${pendingReturns} إرجاع`;
            if (document.getElementById('pending-count')) {
                document.getElementById('pending-count').textContent = pendingText;
            }
            overlay?.classList.remove('hidden');
        } else {
            overlay?.classList.add('hidden');
        }
    } else {
        statusEl.innerHTML = '<i class="fas fa-wifi-slash text-red-600"></i><span>غير متصل</span>';
        statusEl.className = 'flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs';
        
        if (totalPending > 0) {
            const pendingText = `${pendingSales} مبيعات، ${pendingReturns} إرجاع`;
            if (document.getElementById('pending-count')) {
                document.getElementById('pending-count').textContent = pendingText;
            }
            overlay?.classList.remove('hidden');
        } else {
            overlay?.classList.add('hidden');
        }
    }
}

// == أدوات واجهة المستخدم ==
function updateQuantityDirect(keyOrId, value) {
  const qty = parseInt(value) || 1;
  const key = String(keyOrId);
  const item = invoiceItems.find(i => (i._key || String(i.id)) === key);
  if (!item) return;

  // ✅ حساب الكمية المتاحة الفعلية
  const totalStock = parseInt(item.stock) || 0;
  const reservedStock = parseInt(item.reserved_stock) || 0;
  const availableStock = totalStock - reservedStock;

  if (currentMode === 'sale' && qty > availableStock) {
    showNotification('warning', 'الكمية محدودة', `الكمية المتاحة: ${availableStock} (المخزون: ${totalStock}، المحجوز: ${reservedStock})`);
    // ✅ إرجاع القيمة للكمية المتاحة في حقل الإدخال
    const inputField = document.querySelector(`input[onchange*="${keyOrId}"]`);
    if (inputField) inputField.value = item.quantity;
    return;
  }
  
  item.quantity = qty;
  
  if (item.quantity <= 0) {
    invoiceItems = invoiceItems.filter(i => (i._key || String(i.id)) !== key);
  }
  
  updateInvoiceUI();
}

function removeInvoiceItem(keyOrId) {
  if (!confirm('هل تريد حذف هذا المنتج من الفاتورة؟')) return;
  const key = String(keyOrId);
  invoiceItems = invoiceItems.filter(i => (i._key || String(i.id)) !== key);
  updateInvoiceUI();
  showNotification('success', 'تم الحذف', 'تم حذف المنتج من الفاتورة.');
}

function updateQuantity(keyOrId, amount) {
  const key = String(keyOrId);
  const item = invoiceItems.find(i => (i._key || String(i.id)) === key);
  if (!item) return;

  // ✅ حساب الكمية المتاحة الفعلية
  const totalStock = parseInt(item.stock) || 0;
  const reservedStock = parseInt(item.reserved_stock) || 0;
  const availableStock = totalStock - reservedStock;
  
  const newQuantity = item.quantity + amount;

  if (currentMode === 'sale' && newQuantity > availableStock) {
    showNotification('warning', 'الكمية محدودة', `الكمية المتاحة: ${availableStock} (المخزون: ${totalStock}، المحجوز: ${reservedStock})`);
    return;
  }
  
  item.quantity = newQuantity;
  
  if (item.quantity <= 0) {
    invoiceItems = invoiceItems.filter(i => (i._key || String(i.id)) !== key);
  }
  
  updateInvoiceUI();
}

// == مزامنة يدوية وتحديث ==
async function handleRefreshProducts(e) {
  if (!navigator.onLine) {
    showNotification('warning', 'لا يوجد اتصال', 'لا يمكن التحديث دون اتصال.');
    return;
  }
  showNotification('info', 'جارٍ التحديث', 'يتم تحميل أحدث قائمة منتجات...');
  await cacheAllProducts();
  showNotification('success', 'تم التحديث', 'قائمة المنتجات محدثة محليًا.');
}

async function handleSyncNow() {
  if (!navigator.onLine) {
    showNotification('warning', 'لا يوجد اتصال', 'الرجاء التحقق من الإنترنت.');
    return;
  }
  await syncPendingTransactions();
  showNotification('success', 'تمت المزامنة', 'جميع الفواتير المؤقتة تم إرسالها.');
}

// == دوال ذاكرة التخزين المؤقت ==
async function cacheAllProducts() {
  try {
    const response = await fetch('api.php?action=get_all_products_for_cache');
    if (!response.ok) throw new Error('فشل تحميل المنتجات');
    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) return;

    const now = new Date().toISOString();
    const productsToCache = result.data.map(p => ({
      id: p.variant_id ? `${p.id}_${p.variant_id}` : p.id,
      original_id: p.id,
      variant_id: p.variant_id || null,
      barcode: p.barcode || '',
      name: p.name || '',
      variant_name: p.variant_name || null,
      price: parseFloat(p.price) || 0,
      stock: parseInt(p.stock) || 0,
      reserved_stock: parseInt(p.reserved_stock) || 0,
      available_stock: parseInt(p.available_stock) || (parseInt(p.stock) - parseInt(p.reserved_stock)),
      image: p.image || 'uploads/placeholder.jpg',
      category_id: parseInt(p.category_id) || 0,
      lastUpdated: now
    }));

    await db.products.clear();
    await db.products.bulkPut(productsToCache);
    console.log(`✅ تم تخزين ${productsToCache.length} منتج/درجة محليًا`);
  } catch (err) {
    console.warn('❌ فشل تخزين المنتجات محليًا:', err);
  }
}

// == دوال الإشعارات ==
function showNotification(type, title, message) {
  let notification = document.getElementById('dynamic-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'dynamic-notification';
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-md w-full px-4';
    document.body.appendChild(notification);
  }
  let iconClass = '', bgClass = '', borderClass = '', textClass = '';
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
  notification.innerHTML = `
    <div class="flex items-start gap-3 p-4 rounded-2xl shadow-lg border ${bgClass} ${borderClass} animate-fade-in-up">
      <i class="fas ${iconClass} text-2xl mt-0.5"></i>
      <div class="flex-1 min-w-0">
        <h4 class="font-bold ${textClass} text-sm mb-1">${title}</h4>
        <p class="text-sm ${textClass} opacity-90">${message}</p>
      </div>
      <button onclick="this.closest('#dynamic-notification').remove()" class="text-gray-500 hover:text-gray-700 transition self-start mt-1">
        <i class="fas fa-times text-sm"></i>
      </button>
    </div>
  `;
  setTimeout(() => {
    const notif = document.getElementById('dynamic-notification');
    if (notif) {
      notif.style.opacity = '0';
      notif.style.transform = 'translate(-50%, -20px)';
      setTimeout(() => notif.remove(), 300);
    }
  }, 4000);
}

// == دوال اختيار الدرجة ==
function openVariantSelectorForAccounting(product, variants) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4';
  const inner = document.createElement('div');
  inner.className = 'bg-white rounded-3xl shadow-2xl w-full max-w-md p-5 max-h-[85vh] overflow-y-auto';
  inner.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-bold text-gray-800">اختر الدرجة</h3>
      <button class="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl" onclick="this.closest('.fixed').remove()"><i class="fas fa-times"></i></button>
    </div>
    <div class="space-y-2" id="acct-variant-buttons"></div>
  `;
  overlay.appendChild(inner);
  document.body.appendChild(overlay);
  const list = inner.querySelector('#acct-variant-buttons');
  variants.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-right flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-xl border border-pink-100';
    btn.onclick = () => {
  const key = `${product.id}:${v.id}`;
  const existingItem = invoiceItems.find(item => item._key === key);
  const itemPrice = (v.price_override !== null && v.price_override !== undefined && v.price_override !== '') 
    ? parseFloat(v.price_override) 
    : parseFloat(product.price);
  
  // ✅ حساب الكمية المتاحة
  const totalStock = parseInt(v.stock) || 0;
  const reservedStock = parseInt(v.reserved_stock) || 0;
  const availableStock = totalStock - reservedStock;
  
  if (existingItem) {
    if (currentMode === 'sale' && existingItem.quantity >= availableStock) {
      showNotification('warning', 'الكمية محدودة', `الكمية المتاحة: ${availableStock} (المحجوز: ${reservedStock})`);
      return;
    }
    existingItem.quantity++;
  } else {
    if (currentMode === 'sale' && availableStock <= 0) {
      showNotification('warning', 'غير متوفر', `الدرجة غير متوفرة (المحجوز: ${reservedStock})`);
      return;
    }
    invoiceItems.push({ 
      ...product, 
      price: itemPrice, 
      variant_id: v.id, 
      variant_name: v.name, 
      image: v.image || product.image, 
      _key: key, 
      stock: totalStock, 
      reserved_stock: reservedStock,
      available_stock: availableStock,
      quantity: 1 
    });
  }
  updateInvoiceUI();
  overlay.remove();
};
    btn.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg overflow-hidden bg-white shadow"><img src="${v.image || product.image}" class="w-full h-full object-cover"></div>
        <span class="font-semibold text-gray-800">${v.name}</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        ${v.price_override !== null ? `<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">$${parseFloat(v.price_override).toFixed(2)}</span>` : ''}
        <span class="px-2 py-0.5 ${parseInt(v.stock) - parseInt(v.reserved_stock || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-full">
          المتوفر: ${parseInt(v.stock) - parseInt(v.reserved_stock || 0)}
          ${v.reserved_stock > 0 ? `<span class="text-xs text-orange-600">(محجوز: ${v.reserved_stock})</span>` : ''}
        </span>
      </div>
    `;
    list.appendChild(btn);
  });
}

// == مزامنة تلقائية كل 30 ثانية ==
setInterval(async () => {
  if (navigator.onLine) {
    const totalPending = (await db.pendingSales.count()) + (await db.pendingReturns.count());
    if (totalPending > 0) {
      await syncPendingTransactions();
    }
  }
}, 30000);


async function isOnlineForReal() {
    if (!navigator.onLine) {
        return false;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('api.php?action=ping', { 
            method: 'GET',
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok && response.status === 200;
    } catch (err) {
        console.warn('الاتصال غير فعّال:', err.name, err.message);
        return false;
    }
}

// ✅ دالة لحذف جميع الفواتير المعلقة يدوياً
async function clearAllPendingTransactions() {
  if (!confirm('هل تريد حذف جميع الفواتير المعلقة؟ (لن يتم إرسالها للسيرفر)')) {
    return;
  }
  
  try {
    await db.pendingSales.clear();
    await db.pendingReturns.clear();
    await db.syncLog.clear();
    showNotification('success', 'تم التنظيف', 'تم حذف جميع الفواتير المعلقة');
    await updateConnectionStatus();
  } catch (err) {
    showNotification('error', 'فشل', 'تعذر حذف الفواتير المعلقة');
  }
}
