document.addEventListener("DOMContentLoaded", () => {
        const targets = document.querySelectorAll('.home-page .home-reveal');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const heroSection = document.querySelector('[data-home-hero]');

        if (heroSection && !reduceMotion) {
            let pointer = null;
            let focusX = .5;
            let focusY = .48;
            const followFocus = (timestamp) => {
                const targetX = pointer?.x ?? (.5 + Math.sin(timestamp * .00022) * .34);
                const targetY = pointer?.y ?? (.48 + Math.cos(timestamp * .00031) * .17);
                focusX += (targetX - focusX) * .08;
                focusY += (targetY - focusY) * .08;
                heroSection.style.setProperty('--hero-focus-x', `${focusX * 100}%`);
                heroSection.style.setProperty('--hero-focus-y', `${focusY * 100}%`);
                window.requestAnimationFrame(followFocus);
            };
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                heroSection.addEventListener('pointermove', (event) => {
                    const bounds = heroSection.getBoundingClientRect();
                    pointer = {
                        x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
                        y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
                    };
                });
                heroSection.addEventListener('pointerleave', () => { pointer = null; });
            }
            window.requestAnimationFrame(followFocus);
        }

        if (!reduceMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('home-motion-ready');
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
        targets.forEach((target) => observer.observe(target));
    }

    const menu = document.querySelector('#mobile-menu');
    const toggle = document.querySelector('[aria-controls="mobile-menu"]');
    const [openIcon, closeIcon] = toggle.querySelectorAll('svg');

    function setMenu(expanded) {
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.querySelector('.sr-only').textContent = expanded ? 'Cerrar menú principal' : 'Abrir menú principal';
        menu.hidden = !expanded;
        openIcon.toggleAttribute('hidden', expanded);
        closeIcon.toggleAttribute('hidden', !expanded);
    }

    toggle.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !menu.hidden) {
            setMenu(false);
            toggle.focus();
        }
    });

    document.querySelector("#year").textContent = new Date().getFullYear();
    if (document.querySelector("#contact-form")) {
        const contactForm = document.querySelector("#contact-form");
        const formNote = contactForm.querySelector(".form-note");
        const messageLink = contactForm.querySelector(".form-fallback");

        contactForm.addEventListener("input", (event) => {
          event.target.setCustomValidity("");
          formNote.textContent = "";
          messageLink.hidden = true;
        });

        contactForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const { name, email, project } = contactForm.elements;

          for (const [field, error] of [[name, "Escribe tu nombre."], [project, "Describe tu proyecto."]]) {
            if (!field.value.trim()) {
              field.setCustomValidity(error);
              field.reportValidity();
              return;
            }
          }

          const message = [
            'Hola ABNIEX, soy ' + name.value.trim() + '.',
            'Correo: ' + email.value.trim(),
            'Proyecto: ' + project.value.trim(),
          ].join("\n\n");
          const url = new URL(document.querySelector(".contact-whatsapp").href);
          url.searchParams.set("text", message);

          messageLink.href = url.href;
          messageLink.hidden = false;
          formNote.textContent = "Tu mensaje está listo para revisar en WhatsApp.";
          window.open(url.href, "_blank", "noopener");
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const stage = document.querySelector("[data-portfolio-stage]");
    if (!stage) return;

    const slides = [...stage.querySelectorAll("[data-project-slide]")];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const links = [...document.querySelectorAll(".ax-project-link")];
    let active = Math.max(0, slides.findIndex((slide) => "#" + slide.id === location.hash));
    let timer;

    function show(index) {
        active = index;
        links.forEach((link) => {
            if (link.hash === "#" + slides[index].id) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
        slides.forEach((slide, position) => {
            slide.toggleAttribute("inert", position !== index);
            if (position === index) slide.removeAttribute("aria-hidden");
            else slide.setAttribute("aria-hidden", "true");
        });
    }

    function schedule() {
        clearInterval(timer);
        if (reducedMotion.matches || document.hidden) return;
        timer = setInterval(() => {
            const bounds = stage.getBoundingClientRect();
            if (bounds.bottom <= 0 || bounds.top >= innerHeight ||
                stage.matches(":hover, :focus-within")) return;
            show((active + 1) % slides.length);
        }, 6500);
    }

    links.forEach((link) => link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const index = slides.findIndex((slide) => "#" + slide.id === link.hash);
        if (index === -1) return;
        event.preventDefault();
        show(index);
        stage.scrollIntoView({ block: "start" });
        if (event.detail === 0) slides[index].focus({ preventScroll: true });
        schedule();
    }));
    document.addEventListener("visibilitychange", schedule);
    reducedMotion.addEventListener("change", schedule);

    show(active);
    stage.setAttribute("data-portfolio-ready", "");
    schedule();
});
