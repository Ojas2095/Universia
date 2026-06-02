/* ═══════════════════════════════════════════════════════════════
   UNIVERSIA — Main Script
   Handles: Star canvas, scroll reveals, nav behavior, 
   counter animations, lightbox, form handling
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ─── Star Canvas Background ────────────────────────────────
    const canvas = document.getElementById('star-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    let animId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars(count) {
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.3,
                opacity: Math.random() * 0.7 + 0.3,
                twinkleSpeed: Math.random() * 0.015 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
            });
        }
    }

    function createShootingStar() {
        if (shootingStars.length > 2) return;
        if (Math.random() > 0.003) return; // Rare occurrence

        const startX = Math.random() * canvas.width * 0.8;
        const startY = Math.random() * canvas.height * 0.4;
        shootingStars.push({
            x: startX,
            y: startY,
            length: Math.random() * 80 + 40,
            speed: Math.random() * 6 + 4,
            angle: (Math.random() * 30 + 20) * (Math.PI / 180),
            opacity: 1,
            life: 0,
            maxLife: 60 + Math.random() * 40,
        });
    }

    function drawStars(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw static stars
        stars.forEach(star => {
            const flicker = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
            const alpha = star.opacity * flicker;

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232, 220, 198, ${alpha})`;
            ctx.fill();
        });

        // Draw shooting stars
        shootingStars = shootingStars.filter(s => {
            s.life++;
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            s.opacity = 1 - (s.life / s.maxLife);

            if (s.opacity <= 0) return false;

            const tailX = s.x - Math.cos(s.angle) * s.length;
            const tailY = s.y - Math.sin(s.angle) * s.length;

            const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            gradient.addColorStop(0, `rgba(232, 196, 124, 0)`);
            gradient.addColorStop(1, `rgba(232, 196, 124, ${s.opacity})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 210, ${s.opacity})`;
            ctx.fill();

            return true;
        });

        createShootingStar();
    }

    let lastTime = 0;
    function animateStars(timestamp) {
        drawStars(timestamp);
        animId = requestAnimationFrame(animateStars);
    }

    function initStarCanvas() {
        resizeCanvas();
        const starCount = Math.min(Math.floor((canvas.width * canvas.height) / 3000), 400);
        createStars(starCount);
        animateStars(0);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        const starCount = Math.min(Math.floor((canvas.width * canvas.height) / 3000), 400);
        createStars(starCount);
    });


    // ─── Scroll Reveal (Intersection Observer) ──────────────────
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal-up');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }


    // ─── Navigation Behavior ───────────────────────────────────
    function initNav() {
        const header = document.getElementById('site-header');
        const mobileToggle = document.getElementById('mobile-toggle');
        const mainNav = document.getElementById('main-nav');
        const navLinks = document.querySelectorAll('.nav-link');

        // Scroll state
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            header.classList.toggle('scrolled', currentScroll > 60);
            lastScroll = currentScroll;
        }, { passive: true });

        // Mobile toggle
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
            document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
        });

        // Close on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('open');
                mainNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // Active nav link on scroll
        const sections = document.querySelectorAll('section[id]');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.dataset.section === id);
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    }


    // ─── Counter Animation ─────────────────────────────────────
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.target, 10);
                    animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    function animateCounter(el, target) {
        const duration = 2000;
        const start = performance.now();
        const easeOut = t => 1 - Math.pow(1 - t, 3);

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(easeOut(progress) * target);
            el.textContent = current.toLocaleString('en-IN');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }


    // ─── Gallery Lightbox ──────────────────────────────────────
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (!img) return;
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }
    }


    // ─── Contact Form ──────────────────────────────────────────
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Build WhatsApp message
            const message = [
                `Hi! I'm ${data.fullName}.`,
                data.subject ? `I'm interested in: ${data.subject}` : '',
                data.message ? `\nMessage: ${data.message}` : '',
                data.email ? `\nEmail: ${data.email}` : '',
                data.mobile ? `\nPhone: ${data.mobile}` : '',
            ].filter(Boolean).join('\n');

            const waUrl = `https://wa.me/+917307556533?text=${encodeURIComponent(message)}`;

            // Show success state
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Opening WhatsApp...';
            btn.style.background = '#25d366';

            setTimeout(() => {
                window.open(waUrl, '_blank');
                btn.innerHTML = originalText;
                btn.style.background = '';
                form.reset();
            }, 600);
        });
    }


    // ─── Smooth scroll for anchor links ────────────────────────
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            });
        });
    }


    // ─── Parallax-like effect for hero bg ──────────────────────
    function initParallax() {
        const heroBg = document.querySelector('.hero-bg-image');
        if (!heroBg) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
                heroBg.style.opacity = Math.max(0, 0.35 - scrolled * 0.0003);
            }
        }, { passive: true });
    }


    // ─── Initialize Everything ─────────────────────────────────
    function init() {
        initStarCanvas();
        initScrollReveal();
        initNav();
        initCounters();
        initLightbox();
        initContactForm();
        initSmoothScroll();
        initParallax();

        // Trigger reveal for elements already in viewport
        setTimeout(() => {
            window.dispatchEvent(new Event('scroll'));
        }, 100);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
