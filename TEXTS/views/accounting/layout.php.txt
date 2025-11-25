<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام المحاسبة</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/dexie@3.2.4/dist/dexie.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&family=Marhey:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/msbeauty/assets/css/fontawesome/all.min.css">
    <link rel="icon" type="image/png" href="/msbeauty/icons/accounting.png">
</head>
<body class="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

    <!-- Header -->
    <header class="bg-white/90 backdrop-blur-xl shadow-xl sticky top-0 z-40 border-b-2 border-pink-200">
        <div class="container mx-auto px-4 md:px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                        <i class="fas fa-calculator text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold logo-font bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">نظام المحاسبة</h1>
                        <p class="text-xs text-gray-500 hidden md:block">إدارة المبيعات والمرتجعات</p>
                    </div>
                </div>
                <!-- مؤشر حالة الاتصال -->
                <div id="connection-status" class="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                    <i class="fas fa-wifi text-green-600"></i>
                    <span>متصل</span>
                </div>
<div class="flex items-center gap-2 md:gap-3">
  <!-- زر التحديث الآن طبيعي ضمن التدفق -->
  <button id="refresh-products-btn" class="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-sm" title="تحديث قائمة المنتجات">
    <i class="fas fa-redo text-sm"></i>
  </button>

  <a href="orders.php" class="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-sm transition text-xs md:text-sm">
    <i class="fas fa-shopping-bag mr-1 md:mr-2"></i>
    <span class="hidden sm:inline">الطلبات</span>
  </a>
  <a href="invoice_history.php" class="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-sm transition text-xs md:text-sm">
    <i class="fas fa-file-invoice mr-1 md:mr-2"></i>
    <span class="hidden sm:inline">الفواتير</span>
  </a>
  <a href="admin.php" class="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-sm transition text-xs md:text-sm">
    <i class="fas fa-cog mr-1 md:mr-2"></i>
    <span class="hidden sm:inline">التحكم</span>
  </a>
</div>
            </div>
        </div>
    </header>

    <main class="container mx-auto p-4 md:p-8">
       <!-- Mode Toggle Section -->
  <div class="bg-white rounded-3xl shadow-xl p-5 md:p-6 mb-8 border-2 border-gray-100">
    <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
      <!-- وضع البيع -->
      <div class="mode-card cursor-pointer p-3 sm:p-4 rounded-2xl transition-all" id="sale-mode-card">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
            <i class="fas fa-cash-register text-white text-base sm:text-xl"></i>
          </div>
          <div>
            <p class="font-bold text-base sm:text-lg text-gray-800">وضع البيع</p>
            <p class="text-[10px] sm:text-xs text-gray-500">تسجيل عمليات البيع</p>
          </div>
        </div>
      </div>

      <!-- زر التبديل -->
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" id="mode-toggle" class="sr-only peer">
        <div class="w-16 h-8 sm:w-20 sm:h-10 bg-gradient-to-r from-green-400 to-emerald-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 sm:after:h-8 sm:after:w-8 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-400 peer-checked:to-rose-500 shadow-md sm:shadow-lg"></div>
      </label>

      <!-- وضع الإرجاع -->
      <div class="mode-card cursor-pointer p-3 sm:p-4 rounded-2xl transition-all" id="return-mode-card">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-md sm:shadow-lg">
            <i class="fas fa-undo text-white text-base sm:text-xl"></i>
          </div>
          <div>
            <p class="font-bold text-base sm:text-lg text-gray-800">وضع الإرجاع</p>
            <p class="text-[10px] sm:text-xs text-gray-500">تسجيل المرتجعات</p>
          </div>
        </div>
      </div>
    </div>
  </div>

        <!-- Search Section -->
        <div class="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-100">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-search text-white"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-800">البحث عن المنتجات</h2>
            </div>
            <div id="search-by-name-section">
                <label for="product-search" class="block font-semibold mb-3 text-gray-700">
                    <i class="fas fa-barcode text-pink-500 mr-2"></i>
                    ابحث بالاسم أو الباركود
                </label>
                <div class="relative flex items-center">
                    <input type="text" id="product-search" class="w-full px-4 py-3 pr-12 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition" placeholder="اكتب اسم المنتج أو امسح الباركود..." autocomplete="off">
                    <button type="button" id="scan-accounting-qr-btn"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition md:hidden"
                            title="مسح باركود بالكاميرا">
                        <i class="fas fa-qrcode text-sm"></i>
                    </button>
                    <i class="fas fa-search absolute top-1/2 -translate-y-1/2 right-4 text-pink-400"></i>
                    <div id="search-results" class="absolute top-full left-0 right-0 bg-white border-2 border-pink-200 mt-2 rounded-2xl shadow-2xl z-20 hidden max-h-96 overflow-y-auto"></div>
                </div>
            </div>
        </div>

        <!-- Return Reason Section -->
        <div id="return-reason-section" class="hidden bg-white rounded-3xl shadow-xl p-6 border-2 border-red-200">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-comment-dots text-white"></i>
                </div>
                <h2 class="text-xl font-bold text-gray-800">سبب الإرجاع</h2>
            </div>
            <textarea id="return-reason" class="w-full px-4 py-3 border-2 border-red-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 transition" rows="4" placeholder="مثال: قياس خاطئ، عيب في المنتج، تغيير رأي العميل..."></textarea>
        </div>

        <!-- Invoice Tabs -->
        <div id="invoice-tabs" class="flex flex-wrap items-center gap-2 mb-1 mt-6">
            <!-- سيتم إنشاء التبويبات ديناميكيًا -->
        </div>

        <!-- Invoice Section -->
        <div id="invoice-section" class="bg-white rounded-tl-3xl rounded-bl-3xl rounded-br-3xl shadow-xl overflow-hidden border border-gray-200">
            <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-2">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-file-invoice text-white text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-white">الفاتورة</h2>
                        <p class="text-pink-100 text-sm" id="invoice-mode-text">فاتورة مبيعات</p>
                    </div>
                </div>
            </div>
            <div class="p-6">
                <div id="invoice-items" class="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-inbox text-4xl mb-2"></i>
                        <p class="text-sm">لا توجد منتجات</p>
                    </div>
                </div>

                <!-- Totals Section -->
                <div class="border-t-2 border-gray-200 pt-4 space-y-3">
                    <div class="flex justify-between text-gray-700">
                        <span class="font-semibold">المجموع الفرعي:</span>
                        <span id="subtotal" class="font-bold text-lg">$0.00</span>
                    </div>

                    <div id="discount-delivery-row" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-sm">
                            <label class="block font-semibold text-gray-700 text-sm mb-2">
                                <i class="fas fa-percent text-green-600 mr-2"></i>الخصم
                            </label>
                            <div class="flex gap-2">
                                <select id="discount-type" class="flex-1 px-3 py-2 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition text-sm">
                                    <option value="fixed">خصم $ ثابت</option>
                                    <option value="percentage">خصم % نسبة</option>
                                </select>
                                <input type="number" id="discount-value" class="w-24 px-3 py-2 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition text-center" value="0" min="0" step="1">
                            </div>
                            <div class="mt-2 flex justify-between text-green-600 font-semibold text-sm">
                                <span>قيمة الخصم:</span>
                                <span id="discount-amount">-$0.00</span>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200 shadow-sm">
                            <label for="delivery-fee" class="block font-semibold text-gray-700 text-sm mb-2">
                                <i class="fas fa-truck text-blue-600 mr-2"></i>رسوم التوصيل ($)
                            </label>
                            <input type="number" id="delivery-fee" class="w-full px-3 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-center" value="0.00" min="0" step="1">
                        </div>
                    </div>

                    <div class="flex justify-between items-center font-bold text-2xl pt-3 border-t-2 border-gray-200">
                        <span class="text-gray-800">الإجمالي:</span>
                        <span id="grand-total" class="text-pink-600">$0.00</span>
                    </div>
                </div>

                <div class="mt-6 bg-purple-50 p-4 rounded-2xl">
                    <label for="seller-name" class="block font-semibold text-gray-700 mb-2 text-sm">
                        <i class="fas fa-user-tie text-purple-600 mr-2"></i>اسم البائع (اختياري)
                    </label>
                    <input type="text" id="seller-name" class="w-full px-3 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition" placeholder="أدخل اسم البائع">
                </div>

                <button id="complete-sale-btn" class="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <i class="fas fa-check-circle text-xl"></i>
                    إتمام البيع
                </button>
                <button id="complete-return-btn" class="hidden w-full mt-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-lg rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <i class="fas fa-undo text-xl"></i>
                    إتمام الإرجاع
                </button>
            </div>
            <button id="sync-now-btn" class="w-full mt-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-md transition">
                <i class="fas fa-sync mr-2"></i>مزامنة الآن
            </button>

        </div>
        <div id="invoice-items" class="space-y-3 w-full"></div>
    </main>

    <!-- Floating Notification Layer -->
    <div id="notification-layer" class="notification-overlay">
        <div class="notification-box">
            <div id="notification-icon" class="notification-icon"></div>
            <h3 id="notification-title" class="notification-title"></h3>
            <p id="notification-message" class="notification-message"></p>
            <div id="notification-actions" class="notification-actions"></div>
        </div>
    </div>


<!-- نافذة عائمة للمزامنة -->
<div id="sync-queue-overlay" class="fixed bottom-4 left-4 z-50 hidden">
    <div class="bg-white rounded-xl shadow-lg border border-red-200 p-3 max-w-xs">
        <div class="flex items-center gap-2">
            <i class="fas fa-exclamation-triangle text-red-500 text-lg"></i>
            <div>
                <p class="font-bold text-sm text-gray-800">فواتير غير مزامنة</p>
                <p class="text-xs text-gray-600">الإنترنت مقطوع. سيتم المزامنة تلقائيًا عند العودة.</p>
            </div>
        </div>
        <div class="mt-2 flex justify-between items-center">
            <span id="pending-count" class="text-xs font-semibold text-red-600">0 فاتورة</span>
            <button id="sync-now-from-overlay" class="text-xs bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-2 py-1 rounded">
                مزامنة الآن
            </button>
                        <button onclick="clearAllPendingTransactions()" class="btn btn-danger">
  🗑️ حذف الفواتير المعلقة
</button>
        </div>
    </div>
</div>



    <!-- ZXing for QR/Barcode scanning -->
    <script src="/msbeauty/assets/js/zxing/index.min.js"></script>

    
    <!-- Main JS (يجب أن يكون آخر شيء!) -->
    <script src="/msbeauty/public/js/accounting.js"></script>

</body>
</html>