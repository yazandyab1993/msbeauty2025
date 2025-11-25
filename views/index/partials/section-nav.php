
        <!-- Section Navigation - ديناميكي -->
<section class="text-center mb-8 md:mb-12">
    <h2 class="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">اكتشفي عالمنا المميز</h2>
    <div class="flex flex-wrap justify-center gap-3 md:gap-4">
        <?php foreach($parent_sections as $index => $ps): ?>
        <div class="group category-tab <?= $index === 0 ? 'active' : '' ?> px-4 md:px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105" data-section="<?= strtolower(str_replace(['-', ' '], '', $ps['slug'])) ?>" href="#<?= strtolower(str_replace(['-', ' ', '/'], '', $ps['slug'])) ?>">
            <div class="flex flex-col items-center gap-1 md:gap-2">
                <div class="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <?php if (!empty($ps['icon_file']) && file_exists($ps['icon_file'])): ?>
                        <img src="<?= htmlspecialchars($ps['icon_file']) ?>" class="w-9 h-9 object-contain" alt="<?= htmlspecialchars($ps['name']) ?>">
                    <?php else: ?>
                        <i class="fas <?= htmlspecialchars($ps['icon'] ?? 'fa-box') ?> text-white text-lg md:text-2xl"></i>
                    <?php endif; ?>
                </div>
                <span class="text-sm md:text-lg font-bold text-gray-800"><?= htmlspecialchars($ps['name']) ?></span>
                <?php if ($ps['description']): ?>
                <span class="text-xs text-gray-500 hidden sm:block"><?= htmlspecialchars($ps['description']) ?></span>
                <?php endif; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>