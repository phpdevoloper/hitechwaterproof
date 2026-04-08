// Initialize Lucide icons after DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    initEnhancementFloatDelays();
    initBubbleLayer();
    initHeroParallax();
    initScrollReveal();
    initGlassCardEnhancements();
    setupBeforeAfterCompare();

    setupMobileMenu();
    setupSmoothScroll();
    setupFaqAccordion();
    setupCalculator();
    setupContactValidation();
    setupScrollToTopButton();
});

/** Random animation-delay for global float (cards / icons / images) */
function initEnhancementFloatDelays() {
    const prefersReduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    document.querySelectorAll("main section:not(#faq) article.rounded-2xl").forEach((el) => {
        el.classList.add("enh-float-card");
        el.style.animationDelay = `${Math.random() * 2.5}s`;
    });

    document.querySelectorAll("main section:not(#faq) article i[data-lucide]").forEach((el) => {
        el.classList.add("enh-float-icon");
        el.style.animationDelay = `${Math.random() * 2.5}s`;
    });

    document.querySelectorAll("main img:not(.ba-compare__img)").forEach((el) => {
        el.classList.add("enh-float-img");
        el.style.animationDelay = `${Math.random() * 2.5}s`;
    });
}

/** Lightweight rising bubbles in hero */
function initBubbleLayer() {
    const layer = document.getElementById("bubble-layer");
    if (!layer) return;

    const prefersReduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const count = 12;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i += 1) {
        const b = document.createElement("span");
        b.className = "enh-bubble";
        const size = 4 + Math.random() * 12;
        b.style.width = `${size}px`;
        b.style.height = `${size}px`;
        b.style.left = `${Math.random() * 100}%`;
        b.style.setProperty("--bx", `${(Math.random() - 0.5) * 48}px`);
        b.style.animationDuration = `${8 + Math.random() * 10}s`;
        b.style.animationDelay = `${Math.random() * 6}s`;
        fragment.appendChild(b);
    }

    layer.appendChild(fragment);
}

/** Parallax: background decorative layer moves slower than foreground */
function initHeroParallax() {
    const bg = document.getElementById("hero-bg-parallax");
    const hero = document.getElementById("home");
    const fg = document.getElementById("hero-foreground");
    if (!bg || !hero) return;

    const prefersReduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;

    function update() {
        ticking = false;
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;

        const scrollY = window.scrollY;
        const progress = Math.min(Math.max(scrollY / (rect.height + vh * 0.35), 0), 1);
        const yBg = progress * 36;
        const yFg = progress * 10;

        bg.style.transform = `translate3d(0, ${yBg * 0.45}px, 0)`;
        if (fg) fg.style.transform = `translate3d(0, ${yFg * 0.12}px, 0)`;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        },
        { passive: true }
    );
    update();
}

/** IntersectionObserver: fade-up + blur → clear */
function initScrollReveal() {
    const prefersReduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const candidates = document.querySelectorAll(
        "main section:not(#faq) article, main section figure, main section li.rounded-2xl, main #calculator .rounded-2xl, main section:not(#faq) .rounded-2xl.border, main #before-after .ba-card"
    );

    if (prefersReduced) {
        candidates.forEach((el) => el.classList.add("is-revealed"));
        return;
    }

    candidates.forEach((el) => el.classList.add("reveal-on-scroll"));

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-revealed");
                    io.unobserve(entry.target);
                }
            });
        },
        { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    candidates.forEach((el) => io.observe(el));
}

/** Glassmorphism layer on card surfaces (non-FAQ) */
function initGlassCardEnhancements() {
    document.querySelectorAll("main section:not(#faq):not(#home) article.rounded-2xl").forEach((el) => {
        if (el.closest("#before-after")) return;
        el.classList.add("glass-card-enh");
    });

    document.querySelectorAll("#home aside article.rounded-xl").forEach((el) => {
        el.classList.add("glass-card-enh", "glass-card-enh--dark");
    });
}

/**
 * Before / After sliders: AFTER on the left (top layer, zig-zag clip), BEFORE underneath on the right.
 * One instance per [data-ba-compare] surface.
 */
function setupBeforeAfterCompare() {
    const roots = document.querySelectorAll("[data-ba-compare]");
    if (!roots.length) return;

    const prefersReduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const waveAmp = 2.75;
    const waveCycles = 5;
    const segments = 40;

    function buildWaveClipPath(p) {
        const pts = ["0% 0%", "0% 100%"];
        for (let i = 0; i <= segments; i += 1) {
            const t = i / segments;
            const y = 100 - t * 100;
            const wave = waveAmp * Math.sin(t * Math.PI * 2 * waveCycles);
            let x = p * 100 + wave;
            x = Math.max(0.4, Math.min(99.6, x));
            pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
        }
        pts.push("0% 0%");
        return `polygon(${pts.join(", ")})`;
    }

    roots.forEach((root) => {
        const afterLayer = root.querySelector(".ba-compare__after");
        const handle = root.querySelector(".ba-handle");
        if (!afterLayer || !handle) return;

        let pos = 0.5;
        let dragging = false;
        let activePointerId = null;

        function apply() {
            if (prefersReduced) {
                const rightCrop = (1 - pos) * 100;
                afterLayer.style.clipPath = `inset(0 ${rightCrop}% 0 0)`;
                afterLayer.style.webkitClipPath = afterLayer.style.clipPath;
            } else {
                const cp = buildWaveClipPath(pos);
                afterLayer.style.clipPath = cp;
                afterLayer.style.webkitClipPath = cp;
            }
            handle.style.left = `${pos * 100}%`;
            root.setAttribute("aria-valuenow", String(Math.round(pos * 100)));
        }

        function setFromClientX(clientX) {
            const rect = root.getBoundingClientRect();
            let n = (clientX - rect.left) / rect.width;
            n = Math.max(0.02, Math.min(0.98, n));
            pos = n;
            apply();
        }

        root.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            dragging = true;
            activePointerId = e.pointerId;
            root.classList.add("is-dragging");
            try {
                root.setPointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
            setFromClientX(e.clientX);
        });

        root.addEventListener("pointermove", (e) => {
            if (!dragging || e.pointerId !== activePointerId) return;
            setFromClientX(e.clientX);
        });

        function endDrag(e) {
            if (!dragging) return;
            if (e.pointerId !== activePointerId) return;
            dragging = false;
            activePointerId = null;
            root.classList.remove("is-dragging");
            try {
                root.releasePointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
        }

        root.addEventListener("pointerup", endDrag);
        root.addEventListener("pointercancel", endDrag);
        root.addEventListener("lostpointercapture", endDrag);

        root.setAttribute("role", "slider");
        root.setAttribute("aria-valuemin", "0");
        root.setAttribute("aria-valuemax", "100");
        root.setAttribute("aria-orientation", "horizontal");
        root.setAttribute("tabindex", "0");

        root.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                pos = Math.max(0.02, pos - 0.04);
                apply();
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                pos = Math.min(0.98, pos + 0.04);
                apply();
            }
        });

        apply();
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function setupMobileMenu() {
    const toggleBtn = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");

    if (!toggleBtn || !mobileMenu) return;

    toggleBtn.addEventListener("click", () => {
        const isHidden = mobileMenu.classList.contains("hidden");
        mobileMenu.classList.toggle("hidden");
        toggleBtn.setAttribute("aria-expanded", String(isHidden));
    });

    mobileMenu.querySelectorAll("a[href^='#']").forEach((link) => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            toggleBtn.setAttribute("aria-expanded", "false");
        });
    });
}

function setupSmoothScroll() {
    document.querySelectorAll("a[href^='#']").forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const href = anchor.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function setupFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        const trigger = item.querySelector(".faq-trigger");
        if (!trigger) return;

        trigger.addEventListener("click", () => {
            const willOpen = !item.classList.contains("is-open");

            faqItems.forEach((faq) => {
                faq.classList.remove("is-open");
                const btn = faq.querySelector(".faq-trigger");
                if (btn) btn.setAttribute("aria-expanded", "false");
            });

            if (willOpen) {
                item.classList.add("is-open");
                trigger.setAttribute("aria-expanded", "true");
            }
        });
    });
}

function setupCalculator() {
    const form = document.getElementById("calculatorForm");
    const areaInput = document.getElementById("areaInput");
    const typeInput = document.getElementById("typeInput");
    const result = document.getElementById("estimateResult");

    if (!form || !areaInput || !typeInput || !result) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const area = Number(areaInput.value);
        const rate = Number(typeInput.value);

        if (!area || area <= 0) {
            result.classList.remove("hidden");
            result.textContent = "Please enter a valid area greater than 0.";
            return;
        }

        const estimate = Math.round(area * rate);
        result.classList.remove("hidden");
        result.textContent = `Estimated project cost: ₹${estimate.toLocaleString("en-IN")} (approx.)`;
    });
}

function setupContactValidation() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");

    const nameError = document.getElementById("nameError");
    const phoneError = document.getElementById("phoneError");
    const messageError = document.getElementById("messageError");
    const successMessage = document.getElementById("formSuccess");

    if (!nameInput || !phoneInput || !messageInput || !nameError || !phoneError || !messageError || !successMessage) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        let isValid = true;

        resetError(nameError);
        resetError(phoneError);
        resetError(messageError);
        successMessage.classList.add("hidden");

        const nameValue = nameInput.value.trim();
        const phoneValue = phoneInput.value.trim();
        const messageValue = messageInput.value.trim();

        if (nameValue.length < 2) {
            showError(nameError, "Please enter at least 2 characters.");
            isValid = false;
        }

        if (!/^\d{10}$/.test(phoneValue)) {
            showError(phoneError, "Phone number must be exactly 10 digits.");
            isValid = false;
        }

        if (messageValue.length < 10) {
            showError(messageError, "Message should be at least 10 characters.");
            isValid = false;
        }

        if (isValid) {
            successMessage.classList.remove("hidden");
            form.reset();
        }
    });
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
}

function resetError(errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
}

/** Fixed corner button: scroll back to top after user scrolls down */
function setupScrollToTopButton() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    const prefersReduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showAfter = 320;

    function updateVisibility() {
        const show = window.scrollY > showAfter;
        if (show) {
            btn.classList.add("scroll-top-btn--visible");
            btn.setAttribute("aria-hidden", "false");
        } else {
            btn.classList.remove("scroll-top-btn--visible");
            btn.setAttribute("aria-hidden", "true");
        }
    }

    let ticking = false;
    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    ticking = false;
                    updateVisibility();
                });
                ticking = true;
            }
        },
        { passive: true }
    );

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReduced ? "auto" : "smooth"
        });
    });

    updateVisibility();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}
