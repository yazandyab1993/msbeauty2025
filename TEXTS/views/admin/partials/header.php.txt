 <!-- Top Header -->
    <header class="bg-white shadow-md sticky top-0 z-40">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-crown text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">لوحة التحكم المتقدمة</h1>
                        <p class="text-sm text-gray-500">إدارة متجرك بسهولة واحترافية</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div class="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                        <i class="fas fa-user-circle text-pink-600"></i>
                        <span class="text-sm font-semibold text-gray-700">المدير</span>
                    </div>
                    <a href="?logout=true" class="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition px-4 py-2 hover:bg-pink-50 rounded-lg">
                        <i class="fas fa-sign-out-alt"></i>
                        <span class="hidden md:inline">تسجيل الخروج</span>
                    </a>
                </div>
            </div>
        </div>
        <?php if(isset($_GET['logout'])){ session_destroy(); header('Location: admin.php'); exit(); } ?>
    </header>