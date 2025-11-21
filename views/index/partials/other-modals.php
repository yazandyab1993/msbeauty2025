  
    <!-- Floating Notification Layer -->
    <div id="notification-layer" class="notification-overlay">
        <div class="notification-box">
            <div id="notification-icon" class="notification-icon"></div>
            <h3 id="notification-title" class="notification-title"></h3>
            <p id="notification-message" class="notification-message"></p>
            <div id="notification-actions" class="notification-actions"></div>
        </div>
    </div>
    <!-- Stock Limit Warning Modal -->
    <div id="stock-warning-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all scale-95 opacity-0" id="stock-warning-content">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-3xl">
                <div class="flex items-center justify-center gap-3 mb-2">
                    <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                        <i class="fas fa-exclamation-triangle text-white text-3xl"></i>
                    </div>
                </div>
                <h3 class="text-2xl font-bold text-white text-center">تنبيه المخزون!</h3>
            </div>
            <div class="p-6">
                <div class="text-center mb-6">
                    <p class="text-gray-700 text-lg mb-2">عذراً، الكمية المطلوبة غير متوفرة</p>
                    <div class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 mt-4">
                        <p class="text-sm text-gray-600 mb-2">المنتج: <span class="font-bold text-gray-800" id="stock-warning-product-name"></span></p>
                        <div class="flex items-center justify-center gap-4 mt-3">
                            <div class="text-center">
                                <p class="text-xs text-gray-500">الكمية المطلوبة</p>
                                <p class="text-2xl font-bold text-red-600" id="stock-warning-requested"></p>
                            </div>
                            <i class="fas fa-arrow-left text-gray-400"></i>
                            <div class="text-center">
                                <p class="text-xs text-gray-500">المتوفر في المخزون</p>
                                <p class="text-2xl font-bold text-green-600" id="stock-warning-available"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-blue-50 rounded-2xl p-4 mb-6">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-lightbulb text-blue-500 text-xl mt-1"></i>
                        <div class="flex-grow">
                            <p class="text-sm font-semibold text-blue-800 mb-2">هل تريد تعديل الكمية؟</p>
                            <p class="text-xs text-blue-600">يمكنك تعديل الكمية لتتناسب مع المخزون المتاح</p>
                        </div>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button onclick="adjustToMaxStock()" class="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        تعديل للحد الأقصى
                    </button>
                    <button onclick="closeStockWarning()" class="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold transition-all transform hover:scale-105">
                        <i class="fas fa-times ml-2"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    </div>