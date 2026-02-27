// --- THEME TOGGLE LOGIC ---
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Force Light Mode Default unless user explicitly chooses dark
// If localStorage.theme is 'dark', use dark; otherwise default to light
const navLogo = document.getElementById('nav-logo');
if (localStorage.theme === 'dark') {
    document.documentElement.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
    if (navLogo) navLogo.src = 'assets/img/white-text-logo.png';
} else {
    document.documentElement.classList.remove('dark');
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
    if (navLogo) navLogo.src = 'assets/img/black-text-logo.png';
}

// Toggle Function
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        if (navLogo) navLogo.src = 'assets/img/black-text-logo.png';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        if (navLogo) navLogo.src = 'assets/img/white-text-logo.png';
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Remove Loader - With failsafe
const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (loader && loader.style.display !== 'none') {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            initAnimations();
        }, 500);
    }
};

window.addEventListener('load', hideLoader);
setTimeout(hideLoader, 3000);

// Mobile Menu
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const menuItems = menu.querySelectorAll('.menu-item');
    const isClosed = menu.classList.toggle('-translate-y-full');
    // Prevent background scroll when menu is open
    if (!isClosed) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }

    // Animate mobile menu items (fan in from top to bottom)
    try {
        // 'isClosed' is true when menu is now closed (has -translate-y-full)
        if (!isClosed) {
            // Menu opened: animate in
            gsap.killTweensOf(menuItems);
            gsap.set(menuItems, { opacity: 0, y: -30, rotate: -8, transformOrigin: '50% 0%' });
            // Small delay so the overlay slide-in starts first
            gsap.to(menuItems, { opacity: 1, y: 0, rotate: 0, stagger: 0.07, duration: 0.45, ease: 'back.out(1.2)', delay: 0.08 });
        } else {
            // Menu closed: animate out quickly
            gsap.killTweensOf(menuItems);
            gsap.to(menuItems, { opacity: 0, y: -20, rotate: -6, stagger: 0.03, duration: 0.18, ease: 'power1.in' });
        }
    } catch (e) {
        // If GSAP not available, ignore gracefully
        console.warn('GSAP animation skipped for mobile menu:', e);
    }
}

// --- CUSTOM CURSOR ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorjelly = document.querySelector('.cursor-jelly');

let mouse = { x: 0, y: 0 };
let pos = { x: 0, y: 0 };
let vel = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Dot follows instantly
    cursorDot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`;
});

// Loop for smooth jelly physics
const updateCursor = () => {
    // Lerp position
    pos.x += (mouse.x - pos.x) * 0.15;
    pos.y += (mouse.y - pos.y) * 0.15;

    // Calculate velocity
    vel.x = mouse.x - pos.x;
    vel.y = mouse.y - pos.y;

    // Calculate direction angle
    const angle = Math.atan2(vel.y, vel.x);

    // Calculate speed (clamped)
    const speed = Math.min(Math.sqrt(vel.x ** 2 + vel.y ** 2), 150);

    // Squash and stretch based on speed
    const scale = speed / 300;

    cursorjelly.style.transform = `
                translate3d(${pos.x}px, ${pos.y}px, 0) 
                translate(-50%, -50%) 
                rotate(${angle}rad) 
                scale(${1 + scale}, ${1 - scale})
            `;

    requestAnimationFrame(updateCursor);
};
updateCursor();

// Enhanced Hover Interactions & Click Ripples
const handleHoverEnter = () => {
    document.body.classList.add('hovering');
};

const handleHoverLeave = () => {
    document.body.classList.remove('hovering');
};

// Make sure we don't add hover-cursor interactions for desktop nav items
document.querySelectorAll('.hover-trigger:not(.nav-desktop-item)').forEach(el => {
    el.addEventListener('mouseenter', handleHoverEnter);
    el.addEventListener('mouseleave', handleHoverLeave);
});

// CLICK RIPPLE EFFECT LOGIC
document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';

    // Set size
    const size = 20;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;

    // Position center of click
    ripple.style.left = `${e.clientX - size / 2}px`;
    ripple.style.top = `${e.clientY - size / 2}px`;

    document.body.appendChild(ripple);

    // Remove after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
});

// Magnetic Effect for Buttons
// Apply magnetic hover effect only to non-desktop-nav elements to avoid nav jitter
document.querySelectorAll('.magnetic-btn:not(.nav-desktop-item)').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Move button slightly towards cursor
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
    });
});

// --- 3D TILT EFFECT (Optimized with RAF) ---
let isTiltRunning = false;
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        if (!isTiltRunning) {
            window.requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10;
                const rotateY = ((x - centerX) / centerX) * 10;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                isTiltRunning = false;
            });
            isTiltRunning = true;
        }
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

// --- ANIMATIONS ---
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline();
    tl.from(".hero-anim", { y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });

    // Desktop nav animations have been intentionally removed to keep the nav static on desktop.

    // GENERAL REVEAL ON SCROLL - Now targets more elements
    gsap.utils.toArray('.reveal-up, h2, p, .faq-item, .project-card').forEach(elem => {
        // Ensure class is added if not present to trigger CSS transition
        elem.classList.add('reveal-up');

        ScrollTrigger.create({
            trigger: elem,
            start: "top 90%", // Trigger slightly earlier for better feel
            onEnter: () => elem.classList.add('revealed'), // Changed to 'revealed'
            once: true
        });
    });

    gsap.fromTo(".service-card",
        { y: 50, opacity: 0 },
        {
            scrollTrigger: { trigger: "#services", start: "top 90%", end: "bottom 20%", toggleActions: "play none none reverse" },
            y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power2.out"
        }
    );

    gsap.from(".stat-item", {
        scrollTrigger: { trigger: ".stat-item", start: "top 85%" },
        scale: 0.5, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)"
    });

    gsap.utils.toArray('.stat-item .counter').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        gsap.to(counter, {
            scrollTrigger: { trigger: counter, start: "top 85%" },
            innerText: target, duration: 2, snap: { innerText: 1 }, ease: "power1.out"
        });
    });
}

// --- LIQUID BACKGROUND CANVAS ---
const canvas = document.getElementById('liquidCanvas');
const ctx = canvas.getContext('2d');
let width, height;
let blobs = [];
const isMobile = window.innerWidth <= 768;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initBlobs();
}

class Blob {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Reduce velocity on mobile to minimize distraction
        const speedMultiplier = isMobile ? 0.3 : 1;
        this.vx = (Math.random() - 0.5) * speedMultiplier;
        this.vy = (Math.random() - 0.5) * speedMultiplier;
        this.size = Math.random() * 200 + 100;
        // Random colors based on theme
        this.color = Math.random() > 0.5 ? 'rgba(37, 99, 235, 0.4)' : 'rgba(6, 182, 212, 0.3)'; // Primary/Accent
    }

    update() {
        // Animation disabled - blobs remain static
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initBlobs() {
    blobs = [];
    // Create fewer blobs on mobile for better performance
    const blobCount = isMobile ? 3 : 6;
    for (let i = 0; i < blobCount; i++) {
        blobs.push(new Blob());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    blobs.forEach(blob => {
        blob.draw();
    });

    // Animation loop removed - render once only
}

window.addEventListener('resize', resize);
resize();
animate();

document.getElementById('copyright-year').textContent = new Date().getFullYear();

// --- INTERACTIVE STACK LOGIC ---
// --- INTERACTIVE STACK LOGIC (Enhanced with Auto-Shuffle & Swipe) ---
const stackCards = document.querySelectorAll('.stack-card');
const stackContainer = document.querySelector('.stack-container');
let autoShuffleInterval;
let isAutoShufflePaused = false;

// Function to cycle the stack by 1 step (bring back card to front)
const rotateStack = () => {
    const totalCards = stackCards.length;
    stackCards.forEach(card => {
        let current = parseInt(card.getAttribute('data-pos'));
        // Increment pos: 0->1, 1->2, 2->0
        // Visual effect: 0 (front) goes to 1 (back), 2 (back) comes to 0 (front)
        let next = (current + 1) % totalCards;
        card.setAttribute('data-pos', next);
    });
};

// Click Handler: Bring clicked card to front
const handleCardClick = (index) => {
    const clickedCard = stackCards[index];
    const targetPos = parseInt(clickedCard.getAttribute('data-pos'));

    // If clicking the front card (0), do nothing (or maybe rotate anyway?)
    // Let's rotate anyway for fun, or strict logic:
    if (targetPos === 0) return;

    // Rotate enough times to make this card 0
    // If pos is 1, we need 2 rotations (1->2->0) ? 
    // Wait, earlier logic: current+1 logic means:
    // 0->1, 1->2, 2->0.
    // So if I am at 1, one rotation makes me 2. Two rotations make me 0.
    // So distinct rotations needed = (Total - CurrentPos) % Total
    // Ex: Pos 1, Total 3. (3-1)=2. Rotate 2 times: 1->2, 2->0. Correct.
    // Ex: Pos 2, Total 3. (3-2)=1. Rotate 1 time: 2->0. Correct.

    const rotations = (stackCards.length - targetPos) % stackCards.length;

    for (let i = 0; i < rotations; i++) {
        rotateStack();
    }

    resetAutoShuffle();
};

// Auto Shuffle Logic
const startAutoShuffle = () => {
    clearInterval(autoShuffleInterval);
    autoShuffleInterval = setInterval(() => {
        if (!isAutoShufflePaused) {
            rotateStack();
        }
    }, 4000); // Shuffle every 4 seconds
};

const resetAutoShuffle = () => {
    clearInterval(autoShuffleInterval);
    startAutoShuffle();
};

// Event Listeners
if (stackContainer) {
    // Click
    stackCards.forEach((card, index) => {
        card.addEventListener('click', () => handleCardClick(index));
    });

    // Hover Pause
    stackContainer.addEventListener('mouseenter', () => { isAutoShufflePaused = true; });
    stackContainer.addEventListener('mouseleave', () => { isAutoShufflePaused = false; });

    // Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    stackContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isAutoShufflePaused = true; // Pause while touching
    }, { passive: true });

    stackContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        isAutoShufflePaused = false; // Resume
        resetAutoShuffle();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50; // min distance
        if (touchEndX < touchStartX - threshold) {
            // Swipe Left -> Next
            rotateStack();
        }
        if (touchEndX > touchStartX + threshold) {
            // Swipe Right -> Prev (Reverse rotation)
            // Reverse of (current + 1) % total is (current - 1 + total) % total
            // Or just cycle forward 2 times (in 3 card stack)
            rotateStack();
            rotateStack();
        }
    };

    // Start immediately
    startAutoShuffle();
}
