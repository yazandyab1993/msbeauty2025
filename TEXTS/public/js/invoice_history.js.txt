document.addEventListener('DOMContentLoaded', function () {
    // تحميل البيانات من DOM
    const initialDataScript = document.getElementById('initial-data');
    if (!initialDataScript) {
        console.warn('No initial data found for charts');
        return;
    }
    const initialData = JSON.parse(initialDataScript.textContent);

    const { transactions, total_sales_amount, total_returns_amount } = initialData;

    if (!Array.isArray(transactions)) {
        console.warn('Invalid transactions data');
        return;
    }

    try {
        // === 1. بناء مخطط "أفضل المنتجات مبيعًا" ===
        const topCounts = {};
        transactions.forEach(t => {
            if (!Array.isArray(t.items)) return;
            t.items.forEach(item => {
                const key = `${item.product_name}${item.variant_name ? ' — ' + item.variant_name : ''}`;
                const qty = parseInt(item.quantity) || 0;
                if (t.type === 'sale') {
                    topCounts[key] = (topCounts[key] || 0) + qty;
                } else if (t.type === 'return') {
                    topCounts[key] = (topCounts[key] || 0) - qty;
                }
            });
        });

        const sortedProducts = Object.entries(topCounts)
            .filter(([, qty]) => qty > 0)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8);

        const ctx1 = document.getElementById('chartTopProducts');
        if (ctx1 && sortedProducts.length > 0) {
            const labels = sortedProducts.map(([label]) => label);
            const data = sortedProducts.map(([, qty]) => qty);
            new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'صافي عدد القطع المباعة',
                        data,
                        backgroundColor: 'rgba(76, 175, 80, 0.8)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'أفضل المنتجات مبيعًا (صافي الكمية)', font: { size: 14 } }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        // === 2. مخطط "المبيعات مقابل المرتجعات" ===
        const ctx2 = document.getElementById('chartSalesVsReturns');
        if (ctx2 && (total_sales_amount > 0 || total_returns_amount > 0)) {
            new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['صافي المبيعات', 'المرتجعات'],
                    datasets: [{
                        data: [total_sales_amount - total_returns_amount, total_returns_amount],
                        backgroundColor: ['#3b82f6', '#ef4444'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'right', labels: { usePointStyle: true } },
                        title: { display: true, text: 'صافي المبيعات والمرتجعات', font: { size: 14 } }
                    }
                }
            });
        }
    } catch (e) {
        console.error('Charts error', e);
    }

    // دوال الطباعة
    function showNotification(title, message, type = 'info') {
            clearTimeout(notificationTimeout);
            const notification = document.getElementById('custom-notification');
            const iconEl = document.getElementById('notification-icon');
            const titleEl = document.getElementById('notification-title');
            const messageEl = document.getElementById('notification-message');
            const borderEl = notification.querySelector('.notification');

            const icons = {
                success: 'fas fa-check-circle text-green-500',
                error: 'fas fa-exclamation-circle text-red-500',
                info: 'fas fa-info-circle text-blue-500',
                warning: 'fas fa-exclamation-triangle text-yellow-500'
            };

            const backgrounds = {
                success: 'bg-green-100',
                error: 'bg-red-100',
                info: 'bg-blue-100',
                warning: 'bg-yellow-100'
            };
             const borders = {
                success: 'border-green-400',
                error: 'border-red-400',
                info: 'border-blue-400',
                warning: 'border-yellow-400'
            };

            // تعيين المحتوى
            iconEl.className = `w-12 h-12 rounded-full flex items-center justify-center ${backgrounds[type]}`;
            iconEl.innerHTML = `<i class="${icons[type]} text-xl"></i>`;
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // تعيين لون الحدود
            borderEl.className = `bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-80 max-w-md notification border-t-4 ${borders[type]}`;


            // إظهار الإشعار
            notification.classList.remove('hidden');
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -20px)';

            setTimeout(() => {
                notification.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                notification.style.opacity = '1';
                notification.style.transform = 'translate(-50%, 0)';
            }, 10);

            // إزالة الإشعار تلقائياً بعد 4 ثواني
            notificationTimeout = setTimeout(hideNotification, 4000);
        }

  // دالة طباعة الفواتير المحسنة
    async function printInvoice(type, id) {
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            showNotification('خطأ في الطباعة', 'يرجى تحديث الصفحة والمحاولة مرة أخرى (مكتبات PDF مفقودة).', 'error');
            return;
        }

        showNotification('جاري إنشاء PDF', 'يرجى الانتظار، قد تستغرق العملية بضع ثوانٍ...', 'info');
        
        const element = document.getElementById(`invoice-${type}-${id}`);
        if (!element) {
            showNotification('خطأ', 'لم يتم العثور على الفاتورة', 'error');
            return;
        }

        const printBtn = document.querySelector(`#invoice-${type}-${id}`).closest('.invoice-card').querySelector('.print-btn');
        const originalText = printBtn.innerHTML;
        
        try {
            printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحميل...';
            printBtn.disabled = true;

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: false,
                removeContainer: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= -50) { 
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${type}-invoice-${id}.pdf`);
            
            printBtn.innerHTML = originalText;
            printBtn.disabled = false;
            
            showNotification('تم إنشاء PDF بنجاح', 'تم تحميل ملف الفاتورة رقم ' + id, 'success');
            
        } catch (error) {
            printBtn.innerHTML = originalText;
            printBtn.disabled = false;
            showNotification('خطأ في إنشاء PDF', 'حدث خطأ غير متوقع أثناء المعالجة.', 'error');
        }
    }

    window.printInvoiceDirect = printInvoice;

    // تفعيل الفلاتر عند التمرير
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.invoice-card, .stat-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(card);
    });
});