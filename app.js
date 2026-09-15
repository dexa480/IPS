// --- DİNAMİK YAPILANDIRMA & VARSAYILAN DEĞERLER ---
const urlParams = new URLSearchParams(window.location.search);

const CONFIG = {
    name: urlParams.get('name') || 'Lezzet Restoran',
    wa: urlParams.get('wa') || '905000000000',
    glink: urlParams.get('glink') || 'https://maps.google.com'
};

const STORAGE_KEY = `ips_voted_${CONFIG.name.replace(/\s+/g, '_')}`;

// --- DOM ELEMANLARI ---
const brandNameEl = document.getElementById('brand-name');
const ratingCard = document.getElementById('rating-card');
const alreadyVotedCard = document.getElementById('already-voted-card');
const votedBrandSub = document.getElementById('voted-brand-sub');

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

// SAYFA YÜKLENDİĞİNDE HAFIZA KONTROLÜ
document.addEventListener('DOMContentLoaded', () => {
    if (brandNameEl) {
        brandNameEl.textContent = CONFIG.name;
    }

    // Daha önce oy kullanılmış mı kontrol et
    if (localStorage.getItem(STORAGE_KEY)) {
        showAlreadyVotedState();
    }
});

function showAlreadyVotedState() {
    if (ratingCard) ratingCard.classList.add('hidden');
    if (alreadyVotedCard) {
        alreadyVotedCard.classList.remove('hidden');
        if (votedBrandSub) {
            votedBrandSub.textContent = `"${CONFIG.name}" işletmesini daha önce değerlendirdiniz.`;
        }
    }
}

function markAsVoted() {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

// Yıldız Tıklama
starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.getAttribute('data-value'), 10);
        highlightStars(selectedRating);

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

// Onay Butonuna Basıldığında
if (submitRatingBtn) {
    submitRatingBtn.addEventListener('click', () => {
        if (selectedRating === 0) return;

        // Oy kullanıldı olarak hafızaya kaydet
        markAsVoted();

        if (selectedRating === 1) {
            feedbackHint.textContent = "Geri bildiriminiz bizim için çok değerli.";
            crisisModal.classList.remove('hidden');
        } else {
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
        
        // Kriz mesajı sonrası oy kullanıldı ekranına geçir
        showAlreadyVotedState();
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        crisisModal.classList.add('hidden');
        showAlreadyVotedState();
    });
}