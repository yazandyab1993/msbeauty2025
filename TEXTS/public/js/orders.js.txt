// ✅ تعريف المتغيرات العامة
let notifSound = null;
let soundLoaded = false;
const initializedMaps = {};
let notificationCooldown = false;
let lastCheckedOrderId = null;

// ✅ تحميل الصوت فوراً (خارج DOMContentLoaded)
try {
    notifSound = new Audio('/msbeauty/notification/notification.mp3');
    
    notifSound.addEventListener('canplaythrough', function() {
        soundLoaded = true;
        console.log('✅ تم تحميل ملف الصوت بنجاح');
    }, { once: true });
    
    notifSound.addEventListener('error', function(e) {
        console.error('⚠️ خطأ في تحميل ملف الصوت:', e);
        console.log('💡 المسار المستخدم: /msbeauty/notification/notification.mp3');
        soundLoaded = false;
    });
    
    // محاولة التحميل المسبق
    notifSound.load();
    
} catch (error) {
    console.error('⚠️ خطأ في إنشاء عنصر الصوت:', error);
    notifSound = null;
}

// ✅ دالة آمنة لتشغيل الصوت
async function playNotificationSound() {
    if (!notifSound) {
        console.warn('⚠️ عنصر الصوت غير موجود');
        return false;
    }
    
    try {
        // إعادة تعيين الموضع إلى البداية
        notifSound.currentTime = 0;
        
        // محاولة التشغيل
        const playPromise = notifSound.play();
        
        if (playPromise !== undefined) {
            await playPromise;
            console.log('🔊 تم تشغيل الصوت بنجاح');
            return true;
        }
    } catch (error) {
        // الأخطاء الشائعة:
        // DOMException: play() failed because the user didn't interact with the document first
        if (error.name === 'NotAllowedError') {
            console.warn('⚠️ المتصفح يمنع تشغيل الصوت التلقائي. يتطلب تفاعل المستخدم أولاً.');
        } else if (error.name === 'NotSupportedError') {
            console.warn('⚠️ صيغة الصوت غير مدعومة');
        } else {
            console.error('⚠️ خطأ في تشغيل الصوت:', error);
        }
        return false;
    }
}

// ✅ دوال الخرائط
function parseMapsUrl(url) {
    try {
        const regex = /@([-+]?\d*\.\d+),([-+]?\d*\.\d+)|ll=([-+]?\d*\.\d+),([-+]?\d*\.\d+)|q=([-+]?\d*\.\d+),([-+]?\d*\.\d+)/;
        const match = url.match(regex);
        if (match) {
            if (match[1] && match[2]) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
            if (match[3] && match[4]) return { lat: parseFloat(match[3]), lng: parseFloat(match[4]) };
            if (match[5] && match[6]) return { lat: parseFloat(match[5]), lng: parseFloat(match[6]) };
        }
    } catch (e) { 
        console.error("Could not parse URL:", url, e); 
    }
    return null;
}

function toggleMap(orderId, locationUrl) {
    const mapContainer = document.getElementById(`map-${orderId}`);
    if (!mapContainer) return;
    
    const isHidden = mapContainer.style.display === 'none';
    if (isHidden) {
        mapContainer.style.display = 'block';
        if (!initializedMaps[orderId]) {
            const coords = parseMapsUrl(locationUrl);
            if (coords) {
                const map = L.map(mapContainer).setView([coords.lat, coords.lng], 16);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                L.marker([coords.lat, coords.lng]).addTo(map);
                initializedMaps[orderId] = map;
                setTimeout(() => map.invalidateSize(), 100);
            } else {
                mapContainer.innerHTML = '<p class="text-red-500 text-center p-4">تعذر تحليل رابط الموقع.</p>';
            }
        } else {
            setTimeout(() => initializedMaps[orderId].invalidateSize(), 100);
        }
    } else {
        mapContainer.style.display = 'none';
    }
}

// ✅ نظام الإشعارات المحسّن
const alertDiv = document.getElementById('new-order-alert');


// ✅ دالة لمسح كل الإشعارات "الجديدة" عند تحميل الصفحة
async function markAllOrdersAsSeen() {
    try {
        console.log('🔄 جاري تحديد كل الطلبات كمقروءة...');
        const response = await fetch('api.php?action=mark_all_orders_seen', {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
        });
        const result = await response.json();
        if (result.success) {
            console.log('✅ تم تحديد كل الطلبات كمقروءة بنجاح.');
        } else {
            console.warn('⚠️ فشل تحديد كل الطلبات كمقروءة:', result.message);
        }
    } catch (error) {
        console.error('❌ خطأ في دالة markAllOrdersAsSeen:', error);
    }
}



async function checkForNewOrders() {
    // إذا كان هناك فترة تهدئة نشطة، تخطي الفحص
    if (notificationCooldown) {
        console.log('⏳ فترة التهدئة نشطة - تخطي الفحص');
        return;
    }
    
    try {
        const response = await fetch('api.php?action=check_new_orders', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📡 نتيجة فحص الطلبات:', result);
        
        if (result.success && result.new_order) {
            // ✅ التحقق من أن الطلب جديد فعلاً
            if (lastCheckedOrderId !== result.order_id) {
                console.log('🔔 طلب جديد اكتُشف! ID:', result.order_id);
                
                // تحديث آخر طلب تم فحصه
                lastCheckedOrderId = result.order_id;
                
                // تفعيل فترة التهدئة
                notificationCooldown = true;
                
                // إظهار الإشعار
                if (alertDiv) {
                    alertDiv.classList.remove('hidden');
                }
                
                // ✅ تشغيل الصوت
                await playNotificationSound();
                
                // ✅ تحديد الطلب كمقروء
                try {
                    const markResponse = await fetch(`api.php?action=mark_order_seen&id=${result.order_id}`, {
                        method: 'GET'
                    });
                    const markResult = await markResponse.json();
                    console.log('✅ تم تحديد الطلب كمقروء:', markResult);
                    
                    // ✅ التحقق من نجاح العملية
                    if (!markResult.success) {
                        console.warn('⚠️ فشل تحديد الطلب كمقروء:', markResult.message);
                    }
                } catch (markError) {
                    console.error("⚠️ خطأ في تحديد الطلب كمقروء:", markError);
                }
                
               
                // إنهاء فترة التهدئة بعد 20 ثانية
                setTimeout(() => {
                    notificationCooldown = false;
                    console.log('✅ انتهت فترة التهدئة');
                }, 20000);
            } else {
                console.log('ℹ️ نفس الطلب - تم تجاهله');
            }
        } else {
            console.log('ℹ️ لا توجد طلبات جديدة');
        }
    } catch(error) { 
        console.error("❌ خطأ في فحص الطلبات الجديدة:", error);
        notificationCooldown = false;
    }
}

// ✅ تفعيل الصوت عند أول تفاعل (لتجاوز قيود المتصفح)
function enableSoundOnFirstInteraction() {
    if (notifSound && !soundLoaded) {
        playNotificationSound().then(() => {
            // إيقاف الصوت فوراً بعد التشغيل الاختباري
            notifSound.pause();
            notifSound.currentTime = 0;
            console.log('✅ تم تفعيل الصوت بنجاح');
        });
    }
    // إزالة المستمع بعد أول تفاعل
    document.removeEventListener('click', enableSoundOnFirstInteraction);
    document.removeEventListener('keydown', enableSoundOnFirstInteraction);
    document.removeEventListener('touchstart', enableSoundOnFirstInteraction);
}

// ✅ الانتظار لأول تفاعل من المستخدم
document.addEventListener('click', enableSoundOnFirstInteraction, { once: true });
document.addEventListener('keydown', enableSoundOnFirstInteraction, { once: true });
document.addEventListener('touchstart', enableSoundOnFirstInteraction, { once: true });

// ✅ بدء النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 بدء نظام فحص الطلبات الجديدة...');
    console.log('🔊 حالة الصوت:', notifSound ? 'محمّل' : 'غير محمّل');
    

// 💡 نداء فوري لمسح الإشعارات الحالية (هذا هو السطر الجديد)
    markAllOrdersAsSeen();
        
    // فحص فوري بعد ثانيتين
    setTimeout(checkForNewOrders, 2000);
    
    // فحص دوري كل 10 ثواني
    setInterval(checkForNewOrders, 10000);
});


function openEditModal(order) {
            document.getElementById('edit_order_id').value = order.id;
            document.getElementById('edit_customer_name').value = order.customer_name;
            document.getElementById('edit_customer_phone').value = order.customer_phone;
            document.getElementById('edit_customer_location').value = order.customer_location;
            
            const modal = document.getElementById('editOrderModal');
            modal.classList.remove('hidden');
            // تفعيل الأنيميشن
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
        }

        function closeEditModal() {
            const modal = document.getElementById('editOrderModal');
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        // إغلاق المودال عند النقر خارجه
        document.getElementById('editOrderModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });