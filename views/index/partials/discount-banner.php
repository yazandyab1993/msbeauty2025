<main class="container mx-auto px-4 md:px-6 py-4 md:py-8">
<!-- Discount Banner -->
        <?php if ($discount_percentage > 0): ?>
            <div class="hero-gradient text-white text-center p-4 md:p-6 rounded-3xl shadow-2xl mb-6 md:mb-10 relative overflow-hidden">
                <div class="absolute inset-0 shimmer"></div>
                <div class="relative z-10">
                    <div class="text-3xl md:text-4xl mb-2">✨🎉✨</div>
                    <h2 class="text-xl md:text-2xl font-bold mb-1">عرض خاص اليوم!</h2>
                    <p class="text-lg md:text-xl font-bold">خصم <?= $discount_percentage ?>% على جميع المنتجات</p>
                    <p class="text-xs md:text-sm mt-1 opacity-90">لفترة محدودة - لا تفوت الفرصة!</p>
                </div>
            </div>
        <?php endif; ?>
</main>