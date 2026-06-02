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
    let mouse = { x: null, y: null, active: false };

    canvas.addEventListener('mouseenter', () => mouse.active = true);
    canvas.addEventListener('mouseleave', () => mouse.active = false);
    canvas.addEventListener('mousemove', (e) => {
        if (mouse.active) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }
    });

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

        // Draw interactive constellations
        if (mouse.active && mouse.x !== null) {
            stars.forEach(star => {
                const dx = star.x - mouse.x;
                const dy = star.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(star.x, star.y);
                    ctx.strokeStyle = `rgba(212, 168, 83, ${0.4 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            });
        }

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


    // ─── Gallery Logic ─────────────────────────────────────────
    function initGallery() {
        const filters = document.querySelectorAll('.gallery-filter');
        const items = document.querySelectorAll('.gallery-item');
        const loadMoreBtn = document.getElementById('gallery-load-more');
        
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxVideo = document.getElementById('lightbox-video');
        const lightboxClose = document.getElementById('lightbox-close');
        
        let currentFilter = 'all';
        let visibleCount = 12;
        const INCREMENT = 12;

        function updateGallery() {
            let shown = 0;
            let matchCount = 0;
            
            items.forEach(item => {
                const type = item.dataset.type;
                const match = currentFilter === 'all' || type === currentFilter;
                
                if (match) {
                    matchCount++;
                    if (shown < visibleCount) {
                        item.classList.add('show');
                        shown++;
                    } else {
                        item.classList.remove('show');
                    }
                } else {
                    item.classList.remove('show');
                }
            });
            
            if (loadMoreBtn) {
                loadMoreBtn.style.display = shown >= matchCount ? 'none' : 'inline-flex';
            }
        }

        if (filters.length) {
            filters.forEach(btn => {
                btn.addEventListener('click', () => {
                    filters.forEach(f => f.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    visibleCount = INCREMENT;
                    updateGallery();
                });
            });
        }
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                visibleCount += INCREMENT;
                updateGallery();
            });
        }
        
        updateGallery();

        // Lightbox
        items.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const vid = item.querySelector('video');
                
                if (lightboxImg) lightboxImg.style.display = 'none';
                if (lightboxVideo) {
                    lightboxVideo.style.display = 'none';
                    lightboxVideo.pause();
                }
                
                if (img && lightboxImg) {
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt || '';
                    lightboxImg.style.display = 'block';
                } else if (vid && lightboxVideo) {
                    lightboxVideo.src = vid.src;
                    lightboxVideo.style.display = 'block';
                    lightboxVideo.play();
                }
                
                if (lightbox) {
                    lightbox.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        function closeLightbox() {
            if (lightbox) lightbox.classList.remove('open');
            document.body.style.overflow = '';
            if (lightboxVideo) {
                lightboxVideo.pause();
                lightboxVideo.src = '';
            }
        }

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
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


    // ─── Preloader ─────────────────────────────────────────────
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        
        const hidePreloader = () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800);
        };
        
        window.addEventListener('load', hidePreloader);
        // Fallback max 3 seconds
        setTimeout(hidePreloader, 3000);
    }

    // ─── Magnetic Buttons ──────────────────────────────────────
    function initMagneticButtons() {
        const btns = document.querySelectorAll('.btn');
        
        btns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate pull (-10px to +10px)
                const pullX = ((x / rect.width) - 0.5) * 20;
                const pullY = ((y / rect.height) - 0.5) * 20;
                
                btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
                btn.style.transition = 'transform 0.3s ease-out';
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.transition = 'none'; // Snap instantly to cursor, then follow
            });
        });
    }

    // ─── Custom Review Video Player (Lazy & Controls) ──────────
    function initReviewsVideo() {
        const reviewCards = document.querySelectorAll('.review-video-card');
        if (!reviewCards.length) return;

        // Lazy load logic
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const video = card.querySelector('video');
                    if (video && video.dataset.src) {
                        video.src = video.dataset.src;
                        video.removeAttribute('data-src');
                    }
                    obs.unobserve(card);
                }
            });
        }, { rootMargin: '200px' });

        reviewCards.forEach(card => {
            observer.observe(card);
            
            const video = card.querySelector('video');
            if (!video) return;
            
            card.addEventListener('click', () => {
                if (video.paused) {
                    // Pause all other videos
                    document.querySelectorAll('.review-video-card video').forEach(v => {
                        if (v !== video) {
                            v.pause();
                            v.closest('.review-video-card').classList.remove('is-playing');
                        }
                    });
                    
                    video.play();
                    card.classList.add('is-playing');
                } else {
                    video.pause();
                    card.classList.remove('is-playing');
                }
            });

            video.addEventListener('ended', () => {
                card.classList.remove('is-playing');
            });
        });
    }

    // ─── FAQ Toggle ────────────────────────────────────────────
    function initFAQ() {
        const questions = document.querySelectorAll('.faq-question');
        
        questions.forEach(q => {
            q.addEventListener('click', () => {
                const item = q.closest('.faq-item');
                const isActive = item.classList.contains('active');
                
                // Close all other items
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                
                // Toggle clicked item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }


    // ─── Tilt Cards ────────────────────────────────────────────
    function initTiltCards() {
        const tiltCards = document.querySelectorAll('.tilt-card');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Tilt intensity modifier
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                card.style.transition = 'none';
                card.style.zIndex = '10'; // Bring to front while hovering
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                card.style.transition = 'transform 0.5s ease-out';
                card.style.zIndex = '1';
            });
        });
    }

    // ─── Newsletter Form ───────────────────────────────────────
    function initNewsletterForm() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const email = formData.get('newsletterEmail');
            
            const message = `Hi, I want to join the Stargazer's Club newsletter! My email is ${email}`;
            const waUrl = `https://wa.me/+917307556533?text=${encodeURIComponent(message)}`;
            
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Subscribing...';
            btn.style.background = '#25d366';
            
            setTimeout(() => {
                window.open(waUrl, '_blank');
                btn.innerHTML = originalText;
                btn.style.background = '';
                form.reset();
            }, 600);
        });
    }

    // ─── Initialize Everything ─────────────────────────────────
    function init() {
        initPreloader();
        initStarCanvas();
        initScrollReveal();
        initNav();
        initCounters();
        initGallery();
        initContactForm();
        initSmoothScroll();
        initParallax();
        initMagneticButtons();
        initReviewsVideo();
        initFAQ();
        initTiltCards();
        initNewsletterForm();

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
