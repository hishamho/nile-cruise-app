// =================================================================
// هذا هو المحتوى الكامل والنهائي لملف main.js
// =================================================================

// --- متغيرات عامة لتخزين البيانات ---
let processedTemplesData = [];
let processedPartiesData = [];
let processedServicesData = [];

// --- الدوال الأساسية للتطبيق ---

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('show');
    }, 50);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

// --- نظام المعابد ---

async function loadTemples() {
    try {
        const response = await fetch('data/temples.json');
        const templesData = await response.json();
        const lang = localStorage.getItem('language') || 'ar';
        processedTemplesData = Object.keys(templesData).map(key => {
            const temple = templesData[key];
            const langData = temple[lang] || temple['ar'];
            return { id: key, image: temple.image, ...langData };
        });
        renderTempleCards();
    } catch (error) {
        console.error("فشل تحميل بيانات المعابد:", error);
    }
}

function renderTempleCards() {
    const container = document.getElementById('temple-cards-container');
    if (!container) return;
    container.innerHTML = '';
    processedTemplesData.forEach(temple => {
        const card = document.createElement('div');
        card.className = 'temple-card';
        card.innerHTML = `
            <img src="${temple.image}" alt="${temple.name}" />
            <h3>${temple.name}</h3>
            <p>${temple.shortDesc}</p>
            <button class="temple-btn" onclick="openTempleDetails('${temple.id}')" data-i18n="view_details">عرض التفاصيل</button>
        `;
        container.appendChild(card);
    });
    if (typeof applyAllTranslations === 'function') {
        applyAllTranslations();
    }
}

function openTempleDetails(templeId) {
    const temple = processedTemplesData.find(t => t.id === templeId);
    if (!temple) return;
    document.getElementById('temple-detail-image').src = temple.image;
    document.getElementById('temple-detail-image').alt = temple.name;
    document.getElementById('temple-detail-title').textContent = temple.name;
    document.getElementById('temple-detail-description').textContent = temple.fullDescription || temple.shortDesc;
    const infoContainer = document.getElementById('temple-detail-info');
    infoContainer.innerHTML = `
        <div><strong data-i18n="location">الموقع:</strong> <span>${temple.location || ''}</span></div>
        <div><strong data-i18n="build_date">تاريخ البناء:</strong> <span>${temple.buildDate || ''}</span></div>
        <div><strong data-i18n="main_god">الإله الرئيسي:</strong> <span>${temple.mainGod || ''}</span></div>
        <div><strong data-i18n="visit_time">مدة الزيارة:</strong> <span>${temple.visitTime || ''}</span></div>
    `;
    if (typeof applyAllTranslations === 'function') {
        applyAllTranslations();
    }
    openModal('temple-details-modal');
}

// --- نظام الحفلات ---

async function loadParties() {
    try {
        const response = await fetch('data/parties.json');
        const partiesData = await response.json();
        const lang = localStorage.getItem('language') || 'ar';
        processedPartiesData = Object.keys(partiesData).map(key => {
            const party = partiesData[key];
            const langData = party[lang] || party['ar'];
            return { id: key, image: party.image, time: party.time, ...langData };
        });
        renderPartyCards();
    } catch (error) {
        console.error("فشل تحميل بيانات الحفلات:", error);
    }
}

function renderPartyCards() {
    const container = document.getElementById('party-cards-container');
    if (!container) return;
    container.innerHTML = '';
    processedPartiesData.forEach(party => {
        const card = document.createElement('div');
        card.className = 'party-card';
        card.innerHTML = `
            <img src="${party.image}" alt="${party.name}" class="party-card-img">
            <div class="party-card-overlay"></div>
            <div class="party-card-content">
                <div class="party-card-time">${party.time}</div>
                <h3 class="party-card-title">${party.name}</h3>
                <p class="party-card-desc">${party.description}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- نظام الخدمات ---

async function loadServices() {
    try {
        const response = await fetch('data/services.json');
        const servicesData = await response.json();
        const lang = localStorage.getItem('language') || 'ar';
        processedServicesData = Object.keys(servicesData).map(key => {
            const service = servicesData[key];
            const langData = service[lang] || service['ar'];
            return { id: key, icon: service.icon, ...langData };
        });
        renderServiceCards();
    } catch (error) {
        console.error("فشل تحميل بيانات الخدمات:", error);
    }
}

/**
 * ✅ (تم تعديل هذه الدالة)
 * عرض بطاقات الخدمات مع إضافة وظيفة الضغط عليها
 */
function renderServiceCards() {
    const container = document.getElementById('service-cards-container');
    if (!container) return;

    container.innerHTML = '';

    processedServicesData.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';

        // --- الجزء الجديد والمهم ---
        // نفحص كل بطاقة، إذا كانت بطاقة الخريطة، نضيف لها وظيفة فتح الخريطة
        if (service.id === 'nile_map') {
            card.setAttribute('onclick', "window.location.href='pages/map.html'");
        } else {
            // لباقي الخدمات، نظهر رسالة تأكيد لطيفة
            card.setAttribute('onclick', `alert('تم استلام طلبك لـ: ${service.title}')`);
        }
        // --- نهاية الجزء الجديد ---

        card.innerHTML = `
            <div class="service-card-icon">${service.icon}</div>
            <div class="service-card-text">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- نظام إشعارات الوجبات ---

let lastNotified = '';

function checkMealNotification() {
    const i18nData = window.i18nData;
    if (!i18nData) return;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const meals = [
        { key: 'breakfast_time', label: 'breakfast' },
        { key: 'lunch_time', label: 'lunch' },
        { key: 'dinner_time', label: 'dinner' }
    ];
    meals.forEach(meal => {
        const timeStr = i18nData[meal.key];
        if (!timeStr) return;
        const match = timeStr.match(/(\d{2}):(\d{2})/);
        if (!match) return;
        const mealHour = parseInt(match[1], 10);
        const mealMin = parseInt(match[2], 10);
        const mealMinutes = mealHour * 60 + mealMin;
        if (currentMinutes === mealMinutes - 10) {
            if (lastNotified === meal.key) return;
            lastNotified = meal.key;
            showMealNotification(i18nData[meal.label], timeStr);
        }
    });
}

function showMealNotification(title, time) {
    const box = document.getElementById('meal-notification');
    const text = document.getElementById('notification-text');
    const audio = document.getElementById('notification-sound');
    text.innerText = `🔔 ${title} الساعة ${time}`;
    box.classList.remove('hidden');
    if (audio) {
        audio.play().catch(e => console.error("Audio play failed:", e));
    }
    setTimeout(() => {
        box.classList.add('hidden');
    }, 10000);
}

// --- تشغيل الأكواد عند تحميل الصفحة ---

document.addEventListener('DOMContentLoaded', () => {
    setInterval(checkMealNotification, 60000);
});
