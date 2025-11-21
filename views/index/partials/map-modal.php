<!-- Map Modal -->
    <div id="map-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div class="bg-gradient-to-r from-pink-500 to-purple-600 p-6 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-map-marked-alt text-white"></i>
                    </div>
                    <h3 class="font-bold text-xl text-white">حدد موقعك على الخريطة</h3>
                </div>
                <button onclick="closeMapModal()" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="map" style="height: 450px;" class="w-full"></div>
            <div class="p-6 bg-gray-50 flex justify-center gap-4">
                <button onclick="closeMapModal()" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-semibold transition">
                    <i class="fas fa-times ml-2"></i>إلغاء
                </button>
                <button onclick="setLocationFromMap()" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-lg transition">
                    <i class="fas fa-check ml-2"></i>تأكيد الموقع
                </button>
            </div>
        </div>
    </div>