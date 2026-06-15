(function() {
    // المان‌ها
    const splashScreen = document.getElementById('splashScreen');
    const mainPage = document.getElementById('mainPage');
    const bgMusic = document.getElementById('bgMusic');
    const track = document.getElementById('timelineTrack');
    const indicatorContainer = document.getElementById('progressIndicator');
    const scrollContainer = document.getElementById('timelineScroll');
    
    // المان‌های مودال
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalImg = document.getElementById('modalImg');
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    
    let cards = [];
    let isMusicPlaying = false;

    // ========== پخش موزیک ==========
    function playMusic() {
        bgMusic.play().catch(e => console.log("پخش موزیک:", e));
        isMusicPlaying = true;
    }

    // ========== صفحه اسپلش ==========
    document.getElementById('splashBtn').addEventListener('click', () => {
        splashScreen.classList.add('hide');
        mainPage.classList.add('show');
        playMusic();
        setTimeout(() => {
            updateActiveDot();
        }, 300);
    });

    // ========== ساخت کارت‌ها ==========
    function buildTimeline() {
        track.innerHTML = '';
        storyData.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.setAttribute('data-index', idx);
            card.innerHTML = `
                <div class="card-media">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="card-content">
                    <span class="card-date">${item.date}</span>
                    <h3>${item.title}</h3>
                    <p>${item.shortDesc}</p>
                </div>
            `;
            
            // کلیک روی کارت = نمایش مودال
            card.addEventListener('click', () => {
                showModal(idx);
            });
            
            track.appendChild(card);
            cards.push(card);
        });

        // ساخت نقطه‌های پیشرفت
        indicatorContainer.innerHTML = '';
        storyData.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('progress-dot');
            if (i === 0) dot.classList.add('active');
            dot.style.cursor = 'pointer';
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardWidth = cards[0]?.offsetWidth || 300;
                const gap = 28;
                const scrollLeft = i * (cardWidth + gap);
                scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            });
            indicatorContainer.appendChild(dot);
        });
    }

    // ========== نمایش مودال ==========
    function showModal(index) {
        const item = storyData[index];
        modalImg.src = item.image;
        modalDate.textContent = item.date;
        modalTitle.textContent = item.title;
        modalText.textContent = item.fullDesc;
        modal.classList.add('show');
        
        // جلوگیری از اسکرول صفحه اصلی
        document.body.style.overflow = 'hidden';
    }

    // ========== بستن مودال ==========
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // ========== انیمیشن نمایش کارت‌ها ==========
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    function observeCards() {
        cards.forEach(card => observer.observe(card));
    }

    // ========== به‌روزرسانی نقطه فعال ==========
    function updateActiveDot() {
        if (!cards.length) return;
        
        const scrollLeft = scrollContainer.scrollLeft;
        const containerWidth = scrollContainer.clientWidth;
        let activeIndex = 0;
        let maxVisibleArea = 0;
        
        cards.forEach((card, idx) => {
            const cardLeft = card.offsetLeft;
            const cardRight = cardLeft + card.offsetWidth;
            const viewportLeft = scrollLeft;
            const viewportRight = scrollLeft + containerWidth;
            
            const visibleLeft = Math.max(cardLeft, viewportLeft);
            const visibleRight = Math.min(cardRight, viewportRight);
            const visibleArea = Math.max(0, visibleRight - visibleLeft);
            
            if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                activeIndex = idx;
            }
        });
        
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // ========== دکمه اسکرول به تایم‌لاین ==========
    document.getElementById('scrollToTimelineBtn').addEventListener('click', () => {
        document.getElementById('timelineSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ========== کشیدن با ماوس ==========
    let isDown = false;
    let startX, scrollLeftStart;

    scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeftStart = scrollContainer.scrollLeft;
        scrollContainer.style.cursor = 'grabbing';
    });

    scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
    });

    scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.2;
        scrollContainer.scrollLeft = scrollLeftStart - walk;
    });

    scrollContainer.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveDot);
    });
    
    window.addEventListener('resize', () => {
        setTimeout(updateActiveDot, 100);
    });

    // ========== اجرا ==========
    buildTimeline();
    observeCards();

    setTimeout(() => {
        updateActiveDot();
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.left < window.innerWidth && rect.right > 0) {
                card.classList.add('reveal');
            }
        });
    }, 200);
})();
// ========== کنترل موزیک ==========
const bgMusic = document.getElementById('bgMusic');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicIcon = document.querySelector('.music-icon');
const musicText = document.querySelector('.music-text');
let isMusicPlaying = false;

function playMusic() {
    bgMusic.play().catch(e => console.log("پخش موزیک:", e));
    isMusicPlaying = true;
    musicToggleBtn.classList.add('playing');
    if (musicIcon) musicIcon.textContent = '🎶';
    if (musicText) musicText.textContent = 'در حال پخش';
}

function pauseMusic() {
    bgMusic.pause();
    isMusicPlaying = false;
    musicToggleBtn.classList.remove('playing');
    if (musicIcon) musicIcon.textContent = '🎵';
    if (musicText) musicText.textContent = 'پخش موزیک';
}

function toggleMusic() {
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

// رویداد کلیک دکمه موزیک
if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
}

// وقتی صفحه اسپلش بسته شد، موزیک شروع میشه
document.getElementById('splashBtn').addEventListener('click', () => {
    splashScreen.classList.add('hide');
    mainPage.classList.add('show');
    playMusic();  // موزیک شروع میشه
    setTimeout(() => {
        updateActiveDot();
    }, 300);
});