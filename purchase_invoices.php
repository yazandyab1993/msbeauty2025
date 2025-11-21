<?php
date_default_timezone_set('Asia/Damascus');
session_start();
// Simple password protection (same as admin.php)
$password = 'admin123';
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header('Location: admin.php');
    exit;
}
require_once __DIR__ . '/includes/db.php';

// Fetch all purchase invoices with summary
$invoices_result = $mysqli->query("
    SELECT 
        pi.*,
        COUNT(pii.id) as items_count,
        SUM(pii.quantity + pii.gifts) as total_quantity
    FROM purchase_invoices pi
    LEFT JOIN purchase_invoice_items pii ON pi.id = pii.purchase_invoice_id
    GROUP BY pi.id
    ORDER BY pi.id DESC
");
$invoices = [];
while ($row = $invoices_result->fetch_assoc()) {
    $invoices[] = $row;
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فواتير المشتريات</title>
    <link rel="icon" type="image/png" href="/msbeauty/icons/admin.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <link rel="stylesheet" href="style.css">
    <style>
        .invoice-card {
            transition: all 0.3s ease;
        }
        .invoice-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        .invoice-gradient {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
    </style>
    <link rel="icon" type="image/png" href="/msbeauty/icons/purchace.png">
</head>
<body class="bg-gray-50">
    <!-- Top Header -->
    <header class="bg-white shadow-md sticky top-0 z-40">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-file-invoice-dollar text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">فواتير المشتريات</h1>
                        <p class="text-sm text-gray-500">عرض وتحليل جميع فواتير الشراء</p>
                    </div>
                </div>
                <a href="admin.php" class="flex items-center gap-2 text-gray-600 hover:text-green-600 transition px-4 py-2 hover:bg-green-50 rounded-lg">
                    <i class="fas fa-arrow-right"></i>
                    <span>العودة للوحة التحكم</span>
                </a>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Filters -->
        <div class="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-3">تصفية الفواتير</h3>
            <form id="invoice-filter-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">من تاريخ</label>
                    <input type="date" id="filter-from-date" name="from_date" class="form-input w-full">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">إلى تاريخ</label>
                    <input type="date" id="filter-to-date" name="to_date" class="form-input w-full">
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">المورد</label>
                    <input type="text" id="filter-supplier" name="supplier" class="form-input w-full" placeholder="اسم المورد...">
                </div>
            </form>
            <div class="mt-3 flex gap-2">
                <button onclick="applyInvoiceFilter()" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold">
                    <i class="fas fa-filter ml-1"></i> تطبيق التصفية
                </button>
                <button onclick="resetInvoiceFilter()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-bold">
                    <i class="fas fa-redo ml-1"></i> إعادة التعيين
                </button>
            </div>
        </div>

        <?php if (empty($invoices)): ?>
            <div class="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                <i class="fas fa-file-invoice text-5xl text-gray-300 mb-4"></i>
                <h2 class="text-xl font-bold text-gray-700">لا توجد فواتير مشتريات</h2>
                <p class="text-gray-500 mt-2">يمكنك إدخال فاتورة جديدة من لوحة التحكم</p>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" id="invoices-container">
                <?php foreach ($invoices as $inv): ?>
                <div class="invoice-card bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer" onclick="openInvoiceDetails(<?= $inv['id'] ?>)">
                    <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-bold">فاتورة #<?= $inv['id'] ?></h3>
                                <p class="text-green-100 text-sm mt-1"><?= htmlspecialchars($inv['invoice_date']) ?></p>
                            </div>
                            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <i class="fas fa-receipt"></i>
                            </div>
                        </div>
                    </div>
                    <div class="p-5">
                        <?php if (!empty($inv['supplier_name'])): ?>
                            <div class="mb-2">
                                <span class="text-xs text-gray-500">المورد:</span>
                                <p class="font-medium text-gray-800"><?= htmlspecialchars($inv['supplier_name']) ?></p>
                            </div>
                        <?php endif; ?>
                        <div class="grid grid-cols-2 gap-2 text-sm mt-3">
                            <div>
                                <span class="text-gray-500">المواد:</span>
                                <span class="font-bold text-gray-800"><?= $inv['items_count'] ?></span>
                            </div>
                            <div>
                                <span class="text-gray-500">الكمية:</span>
                                <span class="font-bold text-gray-800"><?= $inv['total_quantity'] ?></span>
                            </div>
                            <div>
                                <span class="text-gray-500">التكلفة:</span>
                                <span class="font-bold text-green-600">$<?= number_format($inv['total_cost'], 2) ?></span>
                            </div>
                            <div class="text-right">
                                <button class="text-green-600 hover:text-green-800 text-xs font-semibold">
                                    عرض التفاصيل <i class="fas fa-chevron-left mr-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>

    <!-- Invoice Details Modal -->
    <div id="invoice-details-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl flex justify-between items-center">
                <h2 class="text-2xl font-bold text-white">تفاصيل الفاتورة</h2>
                <button onclick="closeInvoiceDetailsModal()" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 overflow-y-auto" id="invoice-details-content">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-green-500"></i>
                    <p class="mt-3 text-gray-600">جارٍ تحميل التفاصيل...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        function openInvoiceDetails(invoiceId) {
            const modal = document.getElementById('invoice-details-modal');
            const content = document.getElementById('invoice-details-content');
            modal.classList.remove('hidden');
            fetch(`api.php?action=get_purchase_invoice_details&invoice_id=${invoiceId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const inv = data.data;
                        let html = `
                            <div class="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 class="font-bold text-gray-800 mb-2">معلومات الفاتورة</h3>
                                        <p><span class="text-gray-600">رقم الفاتورة:</span> #${inv.id}</p>
                                        <p><span class="text-gray-600">التاريخ:</span> ${inv.invoice_date}</p>
                                        ${inv.supplier_name ? `<p><span class="text-gray-600">المورد:</span> ${escapeHtml(inv.supplier_name)}</p>` : ''}
                                        ${inv.notes ? `<p><span class="text-gray-600">ملاحظات:</span> ${escapeHtml(inv.notes)}</p>` : ''}
                                    </div>
                                    <div class="text-left md:text-right">
                                        <div class="text-2xl font-bold text-green-600">$${parseFloat(inv.total_cost).toFixed(2)}</div>
                                        <div class="text-sm text-gray-600">التكلفة الإجمالية</div>
                                    </div>
                                </div>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th class="p-3 text-right text-sm font-bold text-gray-700">المنتج</th>
                                            <th class="p-3 text-center text-sm font-bold text-gray-700">الكمية</th>
                                            <th class="p-3 text-center text-sm font-bold text-gray-700">الهدايا</th>
                                            <th class="p-3 text-center text-sm font-bold text-gray-700">سعر التكلفة</th>
                                            <th class="p-3 text-center text-sm font-bold text-gray-700">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                        `;
                        if (inv.items && inv.items.length > 0) {
                            inv.items.forEach(item => {
                                const paidQty = parseInt(item.quantity) || 0;
                                const gifts = parseInt(item.gifts) || 0;
                                const cost = parseFloat(item.cost_price);
                                const total = paidQty * cost; // الهدايا لا تُحتسب
                                const productName = escapeHtml(item.product_name) + (item.variant_name ? ` — <span class="text-purple-600">${escapeHtml(item.variant_name)}</span>` : '');
                                html += `
                                    <tr class="border-b border-gray-100 hover:bg-green-50">
                                        <td class="p-3 font-medium text-gray-800">${productName}</td>
                                        <td class="p-3 text-center">${paidQty}</td>
                                        <td class="p-3 text-center">${gifts}</td>
                                        <td class="p-3 text-center">$${cost.toFixed(2)}</td>
                                        <td class="p-3 text-center font-bold text-green-600">$${total.toFixed(2)}</td>
                                    </tr>
                                `;
                            });
                        } else {
                            html += `<tr><td colspan="5" class="p-4 text-center text-gray-500">لا توجد مواد</td></tr>`;
                        }
                        html += `
                                    </tbody>
                                </table>
                            </div>
                        `;
                        content.innerHTML = html;
                    } else {
                        content.innerHTML = `<div class="text-center py-6 text-red-500">${data.message || 'حدث خطأ'}</div>`;
                    }
                })
                .catch(() => {
                    content.innerHTML = `<div class="text-center py-6 text-red-500">فشل تحميل التفاصيل</div>`;
                });
        }

        function closeInvoiceDetailsModal() {
            document.getElementById('invoice-details-modal').classList.add('hidden');
        }

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '<',
                '>': '>',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        document.getElementById('invoice-details-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('invoice-details-modal')) {
                closeInvoiceDetailsModal();
            }
        });

        // === FILTERING LOGIC ===
        let currentFilter = {};

        function loadInvoices(filter = {}) {
            currentFilter = filter;
            let url = 'api.php?action=get_all_purchase_invoices';
            const params = [];
            if (filter.from_date) params.push('from_date=' + encodeURIComponent(filter.from_date));
            if (filter.to_date) params.push('to_date=' + encodeURIComponent(filter.to_date));
            if (filter.supplier) params.push('supplier=' + encodeURIComponent(filter.supplier));
            if (params.length > 0) url += '&' + params.join('&');

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    const container = document.getElementById('invoices-container');
                    if (data.success && data.data.length > 0) {
                        container.innerHTML = data.data.map(inv => `
                            <div class="invoice-card bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer" onclick="openInvoiceDetails(${inv.id})">
                                <div class="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h3 class="text-lg font-bold">فاتورة #${inv.id}</h3>
                                            <p class="text-green-100 text-sm mt-1">${escapeHtml(inv.invoice_date)}</p>
                                        </div>
                                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <i class="fas fa-receipt"></i>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-5">
                                    ${inv.supplier_name ? `<div class="mb-2"><span class="text-xs text-gray-500">المورد:</span><p class="font-medium text-gray-800">${escapeHtml(inv.supplier_name)}</p></div>` : ''}
                                    <div class="grid grid-cols-2 gap-2 text-sm mt-3">
                                        <div><span class="text-gray-500">المواد:</span> <span class="font-bold text-gray-800">${inv.items_count}</span></div>
                                        <div><span class="text-gray-500">الكمية:</span> <span class="font-bold text-gray-800">${inv.total_quantity}</span></div>
                                        <div><span class="text-gray-500">التكلفة:</span> <span class="font-bold text-green-600">$${parseFloat(inv.total_cost).toFixed(2)}</span></div>
                                        <div class="text-right">
                                            <button class="text-green-600 hover:text-green-800 text-xs font-semibold">
                                                عرض التفاصيل <i class="fas fa-chevron-left mr-1"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        container.innerHTML = `
                            <div class="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                                <i class="fas fa-file-invoice text-5xl text-gray-300 mb-4"></i>
                                <h2 class="text-xl font-bold text-gray-700">لا توجد فواتير مطابقة</h2>
                            </div>
                        `;
                    }
                });
        }

        // Load initial invoices
        loadInvoices();

        function applyInvoiceFilter() {
            const filter = {
                from_date: document.getElementById('filter-from-date').value,
                to_date: document.getElementById('filter-to-date').value,
                supplier: document.getElementById('filter-supplier').value.trim()
            };
            loadInvoices(filter);
        }

        function resetInvoiceFilter() {
            document.getElementById('filter-from-date').value = '';
            document.getElementById('filter-to-date').value = '';
            document.getElementById('filter-supplier').value = '';
            loadInvoices();
        }
    </script>
</body>
</html>