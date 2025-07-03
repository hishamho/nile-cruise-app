// =================================================================
// هذا هو المحتوى الكامل والنهائي لملف language.js
// =================================================================

/**
 * هذه الدالة هي المسؤولة عن تطبيق الترجمات على كل العناصر في الصفحة
 */
function applyAllTranslations() {
    const i18nData = window.i18nData;
    if (!i18nData) return;

    // ترجمة النصوص العادية
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData[key]) {
            el.innerHTML = i18nData[key];
        }
    });

    // ترجمة النصوص المؤقتة (placeholders)
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18nData[key]) {
            el.setAttribute('placeholder', i18nData[key]);
        }
    });
}

/**
 * الدالة الرئيسية التي يتم استدعاؤها عند تغيير اللغة
 */
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    loadLanguage(lang);
}

/**
 * تقوم بتحميل ملف اللغة ثم إعادة تحميل كل شيء
 */
async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        const data = await response.json();

        // 1. نحفظ بيانات ملف اللغة في متغير عام ليستخدمه الجميع
        window.i18nData = data;
        
        // 2. نغير لغة واتجاه الصفحة بالكامل
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // 3. نطبق الترجمات على الواجهة الرئيسية
        applyAllTranslations();

        // 4. (الخطوة الأهم) نطلب من main.js إعادة تحميل كل البيانات باللغة الجديدة
        if (typeof loadTemples === 'function') {
            await loadTemples();
        }
        if (typeof loadParties === 'function') {
            await loadParties();
        }
        // ✅ (الجديد) نقوم بتحميل بيانات الخدمات أيضًا
        if (typeof loadServices === 'function') {
            await loadServices();
        }

        // 5. نتأكد من تحديث إشعارات الوجبات باللغة الجديدة
        if (typeof checkMealNotification === 'function') {
            checkMealNotification();
        }

    } catch (error) {
        console.error("Failed to load language file:", error);
    }
}

// عند تحميل الصفحة لأول مرة، قم بتحميل اللغة المحفوظة
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLanguage(savedLang);
});
