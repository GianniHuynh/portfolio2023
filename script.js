(() => {
    const root = document.documentElement;
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const navLinks = Array.from(document.querySelectorAll('.nav__link'));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('js');

    /* ---------- Smooth scroll (Lenis) ---------- */
    const lenis = window.Lenis && !prefersReducedMotion
        ? new Lenis({
            duration: 1.1,
            easing: (t) => 1 - Math.pow(2, -10 * t),
            smoothWheel: true
        })
        : null;

    if (lenis) {
        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    const scrollToTarget = (target) => {
        const offset = -header.offsetHeight + 1;
        if (lenis) {
            lenis.scrollTo(target, { offset });
        } else {
            const top = target.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    };

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const id = link.getAttribute('href').slice(1);
            const target = id ? document.getElementById(id) : null;
            if (!target) return;
            event.preventDefault();
            closeMenu();
            scrollToTarget(target);
            history.replaceState(null, '', id === 'accueil' ? location.pathname : `#${id}`);
        });
    });

    /* ---------- Header au scroll ---------- */
    const onScroll = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Menu mobile ---------- */
    function closeMenu() {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
    }

    burger.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    /* ---------- Lien actif dans la navigation ---------- */
    const sections = Array.from(document.querySelectorAll('main > section[id]'));

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));

    /* ---------- Apparition des éléments ---------- */
    const revealItems = document.querySelectorAll('.reveal');

    // Léger décalage entre éléments voisins d'un même groupe
    revealItems.forEach((item) => {
        const siblings = Array.from(item.parentElement.children).filter((el) => el.classList.contains('reveal'));
        const index = siblings.indexOf(item);
        if (index > 0) item.style.setProperty('--delay', `${Math.min(index, 6) * 0.07}s`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    revealItems.forEach((item) => revealObserver.observe(item));

    /* ---------- Thème clair / sombre ---------- */
    const themeToggle = document.getElementById('themeToggle');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

    themeToggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try {
            localStorage.setItem('theme', next);
        } catch (e) { /* stockage indisponible */ }
    });

    /* ---------- Copier l'e-mail ---------- */
    const copyButton = document.getElementById('copyEmail');
    const copyLabel = copyButton.querySelector('.copy-label');

    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(copyButton.dataset.email);
            copyLabel.textContent = 'Copié ✓';
        } catch (e) {
            window.location.href = `mailto:${copyButton.dataset.email}`;
            return;
        }
        setTimeout(() => { copyLabel.textContent = 'Copier'; }, 2000);
    });

    /* ---------- Année du footer ---------- */
    document.getElementById('year').textContent = new Date().getFullYear();
})();
