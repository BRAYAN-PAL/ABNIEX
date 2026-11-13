const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const header = document.querySelector(".site-header");
const navigation = Array.from(navLinks.querySelectorAll("a"), (link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
}));
let activeLink = navLinks.querySelector("[aria-current]");
let scrollFrame = 0;
let scrollTimer = 0;

function setMenuOpen(isOpen) {
  navLinks.classList.toggle("open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
}

menuButton.addEventListener("click", () => {
  setMenuOpen(!navLinks.classList.contains("open"));
});

function positionIndicator() {
  if (!activeLink.getClientRects().length) return;

  const linkBounds = activeLink.getBoundingClientRect();
  const navBounds = navLinks.getBoundingClientRect();
  navLinks.style.setProperty("--indicator-left", `${linkBounds.left - navBounds.left}px`);
  navLinks.style.setProperty("--indicator-width", `${linkBounds.width}px`);
  navLinks.classList.add("has-indicator");
}

function setActiveLink(link) {
  if (activeLink === link) return;

  activeLink.removeAttribute("aria-current");
  activeLink = link;
  activeLink.setAttribute("aria-current", "location");
  positionIndicator();
}

function syncActiveSection() {
  const headerBottom = header.getBoundingClientRect().bottom + 2;
  let current = navigation[0];
  let closestTop = -Infinity;

  for (const item of navigation) {
    const top = item.section.getBoundingClientRect().top;
    if (top <= headerBottom && top > closestTop) {
      current = item;
      closestTop = top;
    }
  }

  const page = document.scrollingElement;
  if (page.scrollTop > 0 && page.scrollHeight - page.clientHeight - page.scrollTop <= 2) {
    current = navigation.find(({ section }) => section.id === "contact");
  }
  setActiveLink(current.link);
}

function finishNavigation() {
  window.clearTimeout(scrollTimer);
  scrollTimer = 0;
  syncActiveSection();
}

function scrollToSection(destination) {
  setActiveLink(destination.link);
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(finishNavigation, 180);

  if (destination === navigation[0]) {
    window.scrollTo({ top: 0 });
  } else {
    destination.section.scrollIntoView({ block: "start" });
  }
}

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const anchor = event.target.closest('a[href^="#"]');
  const destination = anchor && navigation.find(({ link }) => link.hash === anchor.hash);
  if (!destination) return;

  event.preventDefault();
  setMenuOpen(false);
  if (location.hash !== anchor.hash) history.pushState(null, "", anchor.hash);
  scrollToSection(destination);
  if (navLinks.contains(anchor)) {
    destination.section.focus({ preventScroll: true });
  }
});

window.addEventListener("scroll", () => {
  if (scrollTimer) {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(finishNavigation, 180);
  } else if (!scrollFrame) {
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      if (!scrollTimer) syncActiveSection();
    });
  }
}, { passive: true });

window.addEventListener("popstate", () => {
  window.requestAnimationFrame(() => {
    const destination = navigation.find(({ link }) => link.hash === location.hash);
    if (destination) {
      scrollToSection(destination);
    } else {
      finishNavigation();
    }
  });
});

const navResizeObserver = new ResizeObserver(() => {
  positionIndicator();
  if (!scrollTimer) syncActiveSection();
});
navigation.forEach(({ link, section }) => {
  navResizeObserver.observe(link);
  section.tabIndex = -1;
});
positionIndicator();
window.addEventListener("load", syncActiveSection);

const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
reveals.forEach((el) => revealObserver.observe(el));

document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  const email = form.get("email").trim();
  const project = form.get("project").trim();
  const message = encodeURIComponent(
    `Hola ABNIEX, soy ${name}.\n\nCorreo: ${email}\nProyecto: ${project}`,
  );
  const note = document.querySelector(".form-note");
  note.textContent = "Abriendo WhatsApp…";
  window.open(
    `https://wa.me/51919693879?text=${message}`,
    "_blank",
    "noopener",
  );
});
