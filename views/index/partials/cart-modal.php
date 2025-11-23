<!-- Shopping Cart Modal -->
   <div id="cart-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 hidden">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-w-screen-sm max-h-[95vh] flex flex-col transform transition-all scale-95 opacity-0" id="cart-modal-content">
            <!-- Header -->
            <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-5 rounded-t-3xl flex justify-between items-center">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <i class="fas fa-shopping-cart text-white text-lg sm:text-xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl sm:text-2xl font-bold text-white">سلة التسوق</h2>
                        <p class="text-pink-100 text-xs sm:text-sm">راجع طلبك قبل التأكيد</p>
                    </div>
                </div>
                <button onclick="closeCart()" class="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl text-white transition flex items-center justify-center">
                    <i class="fas fa-times text-base sm:text-xl"></i>
                </button>
            </div>

            <!-- Success Message -->
            <div id="order-success-message" class="hidden p-6 text-center flex-grow flex flex-col justify-center">
                <div class="relative inline-block mb-4 mx-auto">
                    <div class="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                        <i class="fas fa-check text-white text-5xl"></i>
                    </div>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">تم تأكيد طلبك بنجاح! 🎉</h3>
                <p class="text-gray-600 text-sm mb-4">سيتم التواصل معك قريبًا.</p>
                <button onclick="closeCartAfterSuccess()" class="mt-2 w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow">
                    متابعة التسوق
                </button>
            </div>

            <!-- Main Content Area -->
            <div id="cart-main-content" class="flex flex-col flex-grow overflow-hidden">
                <!-- Tabs Navigation -->
                <div class="flex border-b border-gray-200 bg-gray-50">
                    <button id="products-tab" class="flex-1 py-3 px-2 text-sm font-medium text-center border-b-2 border-transparent hover:border-pink-300 transition-colors active-tab" onclick="switchCartTab('products')">
                        <i class="fas fa-list mr-1"></i> المنتجات (<span id="cart-items-count">0</span>)
                    </button>
                    <button id="info-tab" class="flex-1 py-3 px-2 text-sm font-medium text-center border-b-2 border-transparent hover:border-pink-300 transition-colors" onclick="switchCartTab('info')">
                        <i class="fas fa-user mr-1"></i> معلومات العميل
                    </button>
                </div>

                <!-- Tab Content -->
                <div class="flex-grow overflow-hidden flex flex-col">
                    <!-- Products Tab -->
                    <div id="products-tab-content" class="flex-grow overflow-hidden flex flex-col">
                        <!-- Scrollable Products Area -->
                        <div id="cart-items" class="overflow-y-auto flex-grow p-3 sm:p-4 max-h-[calc(50vh-60px)]"></div>
                        
                        <!-- Coupon Section in Products Tab -->
                        <div class="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
                            <!-- كوبون الخصم -->
                            <div class="space-y-2 mb-3">
                                <div class="relative">
                                    <input type="text" 
                                           id="coupon-code-input" 
                                           class="w-full px-3 py-2 text-sm border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400 transition"
                                           placeholder="أدخل كود الخصم (إن وُجد)">
                                    <button type="button" 
                                            id="apply-coupon-btn" 
                                            class="absolute left-1 top-1/2 -translate-y-1/2 bg-pink-500 text-white rounded px-2 py-1 text-xs font-bold"
                                            onclick="applyCoupon()">
                                        تطبيق
                                    </button>
                                </div>
                                <div id="coupon-message" class="hidden mt-1 text-xs text-center min-h-[1.2rem]"></div>
                            </div>
                            <!-- شارة الكوبون المطبق (تظهر عند النجاح) -->
                            <div id="coupon-applied-badge" class="hidden mb-3 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-center font-bold text-sm animate-pulse">
                                <i class="fas fa-ticket-alt mr-1"></i>
                                كوبون "<span id="coupon-badge-code" class="font-bold"></span>" مطبق! وفرت <span id="coupon-saved-amount" class="font-bold"></span> 🎉
                            </div>
                        </div>
                    </div>

                    <!-- Info Tab -->
                    <div id="info-tab-content" class="hidden flex-grow overflow-y-auto p-3 sm:p-4">
                        <div class="space-y-4">
                            <div class="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100">
                                <h3 class="font-bold text-pink-700 mb-3 flex items-center">
                                    <i class="fas fa-user-circle text-xl mr-2"></i>
                                    معلومات العميل
                                </h3>
                                
                                <div class="space-y-3">
                                    <input type="text" id="customer-name" class="w-full px-4 py-3 text-sm border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400" placeholder="الاسم الكامل" required>
                                    <div id="name-error" class="hidden mt-1 text-xs text-red-600 text-center">الرجاء إدخال الاسم</div>

                                    <input type="tel" id="customer-phone" class="w-full px-4 py-3 text-sm border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400" placeholder="رقم الهاتف" required>
                                    <div id="phone-error" class="hidden mt-1 text-xs text-red-600 text-center">الرجاء إدخال رقم الهاتف</div>

                                    <div class="relative">
                                        <input type="text" id="customer-location" class="w-full px-4 py-3 pl-10 text-sm border border-pink-200 rounded-xl bg-gray-50 cursor-not-allowed" placeholder="حدد موقعك من الخريطة" readonly required>
                                        <i class="fas fa-map-marker-alt absolute top-1/2 right-3 -translate-y-1/2 text-pink-500 text-sm"></i>
                                        <button id="get-location-btn" onclick="openMapModal()" class="absolute left-2 top-1/2 -translate-y-1/2 bg-pink-500 text-white rounded-lg px-3 py-2 text-xs font-bold">خريطة</button>
                                    </div>
                                    <div id="location-error" class="hidden mt-1 text-xs text-red-600 text-center">الرجاء تحديد الموقع</div>
                                </div>
                            </div>
                            
                            <div id="cart-summary" class="bg-white p-4 rounded-xl text-sm space-y-2 border border-pink-100">
                                <h3 class="font-bold text-gray-800 mb-2 flex items-center">
                                    <i class="fas fa-receipt text-xl mr-2"></i>
                                    ملخص الطلب
                                </h3>
                                
                                <div class="flex justify-between">
                                    <span class="text-gray-700">المجموع:</span>
                                    <span id="cart-subtotal-before-discount" class="font-medium">$0.00</span>
                                </div>
                                
                                <div class="flex justify-between">
                                    <span class="text-gray-700">الخصم:</span>
                                    <span id="cart-discount" class="text-red-500 font-medium">-$0.00</span>
                                </div>
                                
                                <div id="coupon-discount-row" class="hidden flex justify-between text-blue-600 font-medium"></div>
                                
                                <div class="flex justify-between">
                                    <span class="text-gray-700">رسوم التوصيل:</span>
                                    <span id="cart-delivery-fee" class="font-medium">$0.00</span>
                                </div>
                                
                                <div class="flex justify-between pt-3 border-t border-gray-100">
                                    <span class="font-bold text-gray-800">الإجمالي:</span>
                                    <span id="cart-total" class="font-bold text-pink-600 text-lg">$0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Confirm Button (always visible at bottom) -->
                <div class="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
                    <button id="confirm-order-button" onclick="confirmOrder()" class="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm shadow hover:shadow-lg transition-shadow">
                        تأكيد الطلب (<span id="cart-total-amount-display">$0.00</span>)
                    </button>
                </div>
            </div>
        </div>
    </div>
</file>