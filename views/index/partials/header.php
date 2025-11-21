   <!-- Header -->
    <header class="bg-white/90 backdrop-blur-xl shadow-xl sticky top-0 z-40 border-b-2 border-pink-200">
        <div class="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div class="flex justify-between items-center">
                <!-- Logo -->
                <div class="flex items-center gap-2 md:gap-3">
                    <div class="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                        <i class="fas fa-gem text-white text-lg md:text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-xl md:text-2xl font-bold logo-font bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">MS Store</h1>
                        <p class="text-xs text-gray-500 hidden sm:block">الجمال والأناقة في مكان واحد</p>
                    </div>
                </div>
                <!-- Search & Cart -->
                <div class="flex items-center gap-2 md:gap-4">
                    <div class="relative w-32 sm:w-40 md:w-72">
                        <input type="text" id="main-search-bar" class="w-full px-3 md:px-4 py-2 md:py-3 pr-10 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition bg-white/80 backdrop-blur-sm text-sm" placeholder="ابحث عن منتج..." autocomplete="off">
                        <i class="fa-solid fa-magnifying-glass absolute top-1/2 -translate-y-1/2 right-3 text-pink-400 text-sm"></i>
                        <div id="main-search-results" class="absolute top-full left-0 right-0 bg-white border-2 border-pink-200 mt-2 rounded-2xl shadow-2xl z-50 hidden max-h-96 overflow-y-auto"></div>
                    </div>
                    <button onclick="openCart()" class="relative p-2 md:p-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 floating-cart">
                        <i class="fa-solid fa-cart-shopping text-base md:text-xl"></i>
                        <span id="cart-count" class="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center shadow-lg">0</span>
                    </button>
                </div>
            </div>
        </div>
    </header>