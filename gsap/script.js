/* =============================================
   GSAP Portfolio — Animation Script
   ============================================= */

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, ScrollToPlugin);

// =============================================
// 1. PRELOADER & INITIAL ANIMATIONS
// =============================================

function initHeroAnimations() {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTimeline
        .to(".hero-greeting", {
            opacity: 1,
            duration: 0.8,
            y: 0,
        })
        .from(".hero-title-line", {
            y: 80,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
        }, "-=0.4")
        .to(".hero-description", {
            opacity: 1,
            duration: 0.8,
        }, "-=0.5")
        .to(".hero-cta", {
            opacity: 1,
            duration: 0.8,
        }, "-=0.5")
        .to(".hero-svg", {
            opacity: 1,
            duration: 1.2,
            scale: 1,
        }, "-=0.8")
        .to(".scroll-indicator", {
            opacity: 1,
            duration: 0.6,
        }, "-=0.3");
}

// =============================================
// 2. SVG MOTION PATH ANIMATIONS
// =============================================

function initMotionPathAnimations() {
    // Particle 1 — main orbit
    gsap.to("#particle1", {
        motionPath: {
            path: "#motionPath1",
            align: "#motionPath1",
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
        },
        duration: 8,
        repeat: -1,
        ease: "none",
    });

    // Particle 2 — reverse orbit, slower
    gsap.to("#particle2", {
        motionPath: {
            path: "#motionPath2",
            align: "#motionPath2",
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
        },
        duration: 12,
        repeat: -1,
        ease: "none",
    });

    // Particle 3 — inner orbit
    gsap.to("#particle3", {
        motionPath: {
            path: "#motionPath3",
            align: "#motionPath3",
            alignOrigin: [0.5, 0.5],
            autoRotate: false,
        },
        duration: 10,
        repeat: -1,
        ease: "none",
        delay: 2,
    });

    // Subtle float on orbital rings
    gsap.to(".hero-svg ellipse", {
        rotation: "+=360",
        transformOrigin: "250px 250px",
        duration: 60,
        repeat: -1,
        ease: "none",
        stagger: 5,
    });
}

// =============================================
// 3. SCROLL PROGRESS BAR
// =============================================

function initScrollProgress() {
    gsap.to("#scrollProgress", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
        },
    });
}

// =============================================
// 4. NAV SCROLL BEHAVIOR
// =============================================

function initNavBehavior() {
    const nav = document.getElementById("nav");

    ScrollTrigger.create({
        start: "top -80",
        onUpdate: (self) => {
            if (self.direction === 1 && self.scroll() > 80) {
                nav.classList.add("scrolled");
            }
            if (self.scroll() <= 80) {
                nav.classList.remove("scrolled");
            }
        },
    });

    // Active nav link highlight on scroll
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    sections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActiveLink(section.id),
            onEnterBack: () => setActiveLink(section.id),
        });
    });

    function setActiveLink(sectionId) {
        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.dataset.section === sectionId) {
                link.classList.add("active");
            }
        });
    }

    // Smooth scroll on nav link click
    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = link.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: targetElement, offsetY: 70 },
                    ease: "power3.inOut",
                });
            }

            // Close mobile menu if open
            closeMobileMenu();
        });
    });

    // Mobile nav toggle
    const navToggle = document.getElementById("navToggle");
    const navLinksContainer = document.getElementById("navLinks");

    navToggle.addEventListener("click", () => {
        navToggle.classList.toggle("active");
        navLinksContainer.classList.toggle("open");
    });

    function closeMobileMenu() {
        navToggle.classList.remove("active");
        navLinksContainer.classList.remove("open");
    }
}

// =============================================
// 5. SECTION REVEAL ANIMATIONS
// =============================================

function initSectionReveals() {
    // About section
    gsap.from(".about-text", {
        scrollTrigger: {
            trigger: ".about-grid",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
    });

    gsap.from(".about-visual", {
        scrollTrigger: {
            trigger: ".about-grid",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
    });

    // Section headers
    document.querySelectorAll(".section-header").forEach((header) => {
        gsap.from(header.querySelector(".section-label"), {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
        });

        gsap.from(header.querySelector(".section-title"), {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.15,
        });
    });

    // Contact section
    gsap.from(".contact-info", {
        scrollTrigger: {
            trigger: ".contact-grid",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
    });

    gsap.from(".contact-form", {
        scrollTrigger: {
            trigger: ".contact-grid",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        x: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2,
    });
}

// =============================================
// 6. ABOUT SVG ANIMATION
// =============================================

function initAboutSVGAnimation() {
    // Stagger code lines in the editor SVG
    gsap.from(".code-line", {
        scrollTrigger: {
            trigger: ".about-svg",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.3,
    });

    // Float the decorative elements
    gsap.from(".float-element", {
        scrollTrigger: {
            trigger: ".about-svg",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.8,
    });

    // Continuous gentle float on float elements
    document.querySelectorAll(".float-element").forEach((el, index) => {
        gsap.to(el, {
            y: index % 2 === 0 ? -8 : 8,
            duration: 2 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
        });
    });
}

// =============================================
// 7. SKILL BAR & CARD ANIMATIONS
// =============================================

function initSkillAnimations() {
    const skillCards = document.querySelectorAll(".skill-card");

    skillCards.forEach((card, index) => {
        const fillBar = card.querySelector(".skill-bar-fill");
        const targetWidth = fillBar.dataset.width;

        // Card reveal
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            delay: index * 0.1,
        });

        // Skill bar fill
        gsap.to(fillBar, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            width: targetWidth + "%",
            duration: 1.2,
            ease: "power3.out",
            delay: 0.4 + index * 0.1,
        });
    });
}

// =============================================
// 8. PROJECT CARD ANIMATIONS
// =============================================

function initProjectAnimations() {
    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach((card, index) => {
        // Scroll reveal
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: index * 0.15,
        });

        // Parallax tilt effect on mouse move
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.4,
                ease: "power2.out",
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: "power2.out",
            });
        });
    });
}

// =============================================
// 9. COUNTER ANIMATION
// =============================================

function initCounterAnimation() {
    const counters = document.querySelectorAll(".stat-number");

    counters.forEach((counter) => {
        const target = parseInt(counter.dataset.count, 10);

        gsap.to(counter, {
            scrollTrigger: {
                trigger: counter,
                start: "top 85%",
                toggleActions: "play none none none",
            },
            innerText: target,
            duration: 2,
            ease: "power3.out",
            snap: { innerText: 1 },
            onUpdate: function () {
                counter.textContent = Math.ceil(
                    parseFloat(counter.textContent)
                );
            },
        });
    });
}

// =============================================
// 10. SOCIAL LINKS STAGGER
// =============================================

function initSocialLinksAnimation() {
    gsap.from(".social-link", {
        scrollTrigger: {
            trigger: ".social-links",
            start: "top 90%",
            toggleActions: "play none none none",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
    });
}

// =============================================
// 11. CONTACT FORM FOCUS ANIMATION
// =============================================

function initFormAnimations() {
    const formInputs = document.querySelectorAll(".form-input");

    formInputs.forEach((input) => {
        input.addEventListener("focus", () => {
            gsap.to(input, {
                scale: 1.01,
                duration: 0.2,
                ease: "power2.out",
            });
        });

        input.addEventListener("blur", () => {
            gsap.to(input, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out",
            });
        });
    });

    // Form submit (demo only)
    const form = document.getElementById("contactForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const submitBtn = form.querySelector(".btn-primary");
        const originalHTML = submitBtn.innerHTML;

        gsap.to(submitBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                submitBtn.innerHTML = '<span>Message Sent!</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
                submitBtn.style.background = "linear-gradient(135deg, #16A34A, #22C55E)";

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = "";
                    form.reset();
                }, 3000);
            },
        });
    });
}

// =============================================
// 12. BACK TO TOP
// =============================================

function initBackToTop() {
    const backToTop = document.querySelector(".back-to-top");
    if (!backToTop) return;

    backToTop.addEventListener("click", (event) => {
        event.preventDefault();
        gsap.to(window, {
            duration: 1.2,
            scrollTo: { y: 0 },
            ease: "power3.inOut",
        });
    });
}

// =============================================
// 13. FOOTER ANIMATION
// =============================================

function initFooterAnimation() {
    gsap.from(".footer-inner", {
        scrollTrigger: {
            trigger: ".footer",
            start: "top 95%",
            toggleActions: "play none none none",
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
    });
}

// =============================================
// INITIALIZE EVERYTHING
// =============================================

document.addEventListener("DOMContentLoaded", () => {
    // Small delay to ensure fonts are loaded
    setTimeout(() => {
        initHeroAnimations();
        initMotionPathAnimations();
        initScrollProgress();
        initNavBehavior();
        initSectionReveals();
        initAboutSVGAnimation();
        initSkillAnimations();
        initProjectAnimations();
        initCounterAnimation();
        initSocialLinksAnimation();
        initFormAnimations();
        initBackToTop();
        initFooterAnimation();
    }, 100);
});
