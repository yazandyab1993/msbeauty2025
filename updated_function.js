function updateInvoiceCurrencyDisplay() {
    const currencySelect = document.getElementById('invoice-currency');
    const exchangeRateInput = document.getElementById('invoice-exchange-rate');
    const currency = currencySelect.value;
    
    // إذا كانت العملة هي الليرة السورية، نظهر حقل سعر الصرف
    // إذا كانت العملة دولار، نخفي حقل سعر الصرف أو نجعله 1
    if (currency === 'SYP') {
        // لا نخفي حقل سعر الصرف، نتركه مرئيًا للسماح بتحديد السعر
        exchangeRateInput.disabled = false;
        // نقوم بتحديث الأسعار المعروضة في عناصر الفاتورة
        updateInvoiceItemsPrices();
    } else {
        // للدولار، نجعل سعر الصرف 1
        exchangeRateInput.disabled = false;
        // نترك سعر الصرف كما هو مدخل من قبل المستخدم
    }
    
    // تحديث الرمز في الملخص
    updateInvoiceSummary();
}