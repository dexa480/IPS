// --- DİNAMİK YAPILANDIRMA & VARSAYILAN DEĞERLER ---
const urlParams = new URLSearchParams(window.location.search);

const CONFIG = {
    name: urlParams.get('name') || 'Lezzet Restoran',
    wa: urlParams.get('wa') || '905000000000',
    glink: urlParams.get('glink') || 'https://maps.google.com'
};

// --- DOM ELEMANLARI ---
const brandNameEl = document.getElementById('brand-name');
const starBtns = document.querySelectorAll('.star-btn');
const submitWrapper = document.getElementById('submit-wrapper');
const submitRatingBtn = document.getElementById('submit-rating-btn');
const selectedStarCountEl = document.getElementById('selected-star-count');
const feedbackHint = document.getElementById('feedback-hint');
const crisisModal = document.getElementById('crisis-modal');
const crisisForm = document.getElementById('crisis-form');
const crisisMessage = document.getElementById('crisis-message');
const closeModalBtn = document.getElementById('close-modal-btn');

let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (brandNameEl) {
        brandNameEl.textContent = CONFIG.name;
    }
});

// Yıldız Tıklama
starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.getAttribute('data-value'), 10);
        highlightStars(selectedRating);

        // Onay butonunu göster ve yıldız sayısını güncelle
        if (selectedStarCountEl) {
            selectedStarCountEl.textContent = selectedRating;
        }
        submitWrapper.classList.remove('hidden');
        feedbackHint.textContent = "Seçiminizi onaylamak için butona dokunun.";
    });
});

function highlightStars(count) {
    starBtns.forEach(btn => {
        const val = parseInt(btn.getAttribute('data-value'), 10);
        if (val <= count) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Onay Butonuna Basıldığında Mantığı Çalıştır
if (submitRatingBtn) {
    submitRatingBtn.addEventListener('click', () => {
        if (selectedRating === 0) return;

        if (selectedRating === 1) {
            // Sadece 1 Yıldız: Kriz kalkanını çalıştır ve modalı aç
            feedbackHint.textContent = "Geri bildiriminiz bizim için çok değerli.";
            crisisModal.classList.remove('hidden');
        } else {
            // 2, 3, 4, 5 Yıldız: Google Haritalar'a yönlendir
            feedbackHint.textContent = "Google Haritalar'a yönlendiriliyorsunuz...";
            submitRatingBtn.disabled = true;
            submitRatingBtn.textContent = "Yönlendiriliyor...";
            
            setTimeout(() => {
                window.location.href = CONFIG.glink;
            }, 400);
        }
    });
}

// --- KRİZ MODALI & WHATSAPP İLETİMİ ---
if (crisisForm) {
    crisisForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userMsg = crisisMessage.value.trim();
        if (!userMsg) return;

        const fullMessage = `⚠️ *OLUMSUZ MÜŞTERİ BİLDİRİMİ*\n\n` +
                            `🏢 *İşletme:* ${CONFIG.name}\n` +
                            `⭐ *Puan:* 1 Yıldız\n\n` +
                            `📝 *Müşteri Notu:*\n"${userMsg}"`;

        const waUrl = `https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(fullMessage)}`;

        window.open(waUrl, '_blank');

        crisisModal.classList.add('hidden');
        crisisForm.reset();
        feedbackHint.textContent = "Geri bildiriminiz işletme sahibine iletildi. Teşekkür ederiz!";
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        crisisModal.classList.add('hidden');
    });
}