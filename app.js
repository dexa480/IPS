// --- DİNAMİK YAPILANDIRMA & VARSAYILAN DEĞERLER ---
const urlParams = new URLSearchParams(window.location.search);

const CONFIG = {
    name: urlParams.get('name') || 'Lezzet Restoran',
    wa: urlParams.get('wa') || '905334020724',
    glink: urlParams.get('glink') || 'https://maps.google.com'
};

// Mobil uyumlu güvenli hafıza anahtarı
const STORAGE_KEY = 'ips_voted_' + encodeURIComponent(CONFIG.name);

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

// SAYFA YÜKLENDİĞİNDE MOBİL & COOKIE KONTROLÜ
document.addEventListener('DOMContentLoaded', () => {
    if (brandNameEl) {
        brandNameEl.textContent = CONFIG.name;
    }

    // Hem LocalStorage hem Cookie kontrolü
    if (checkIfVoted()) {
        showAlreadyVotedState();
    }
});

// Mobil Çerez ve LocalStorage Çift Yönlü Kontrolü
function checkIfVoted() {
    try {
        const localData = localStorage.getItem(STORAGE_KEY);
        const cookieData = document.cookie.split('; ').find(row => row.startsWith(STORAGE_KEY + '='));
        return localData === 'true' || !!cookieData;
    } catch (e) {
        return false;
    }
}

// Çift Yönlü Kayıt (Mobil Uyumlu)
function markAsVoted() {
    try {
        localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}

    // Mobil Safari/Chrome için 1 yıllık Çerez yedeği
    const expires = new Date(Date.now() + 365 * 86400000).toUTCString();
    document.cookie = `${STORAGE_KEY}=true; expires=${expires}; path=/; SameSite=Lax`;
}

function showAlreadyVotedState() {
    if (ratingCard) ratingCard.classList.add('hidden');
    if (alreadyVotedCard) {
        alreadyVotedCard.classList.remove('hidden');
        if (votedBrandSub) {
            votedBrandSub.textContent = `"${CONFIG.name}" işletmesini daha önce değerlendirdiniz.`;
        }
    }
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

        // Anında hafızaya kaydet
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
            }, 500);
        }
    });
}

// --- KRİZ MODALI & WHATSAPP İLETİMİ ---
if (crisisForm) {
    crisisForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userMsg = crisisMessage.value.trim();
        if (!userMsg) return;

        markAsVoted();

        const fullMessage = `⚠️ *OLUMSUZ MÜŞTERİ BİLDİRİMİ*\n\n` +
                            `🏢 *İşletme:* ${CONFIG.name}\n` +
                            `⭐ *Puan:* 1 Yıldız\n\n` +
                            `📝 *Müşteri Notu:*\n"${userMsg}"`;

        const waUrl = `https://wa.me/${CONFIG.wa}?text=${encodeURIComponent(fullMessage)}`;

        window.open(waUrl, '_blank');

        crisisModal.classList.add('hidden');
        crisisForm.reset();
        
        showAlreadyVotedState();
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        crisisModal.classList.add('hidden');
        showAlreadyVotedState();
    });
}