(function () {
  'use strict';

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const open = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const images = Array.prototype.slice.call(document.querySelectorAll('img'));
  images.forEach(function (img) {
    img.setAttribute('data-loaded', 'false');
    const show = function () { img.setAttribute('data-loaded', 'true'); };
    if (img.complete && img.naturalWidth > 0) {
      show();
    } else {
      img.addEventListener('load', show);
      img.addEventListener('error', show);
    }
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const btnClose = document.getElementById('lightboxClose');
  const btnPrev = document.getElementById('lightboxPrev');
  const btnNext = document.getElementById('lightboxNext');
  const galleryItems = Array.prototype.slice.call(document.querySelectorAll('.masonry__item'));

  let currentIndex = -1;
  let lastFocused = null;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg || !lightboxCaption) return;
    const item = galleryItems[index];
    const img = item ? item.querySelector('img') : null;
    if (!img) return;
    if (currentIndex === -1) lastFocused = document.activeElement;
    currentIndex = index;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = item.getAttribute('data-caption') || img.alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (btnClose) btnClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    currentIndex = -1;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  function stepLightbox(delta) {
    if (!galleryItems.length) return;
    const next = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    openLightbox(next);
  }

  if (lightbox && lightboxImg) {
    galleryItems.forEach(function (item, index) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Open photo: ' + (item.getAttribute('data-caption') || 'gallery image'));
      item.addEventListener('click', function () { openLightbox(index); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    if (btnClose) btnClose.addEventListener('click', closeLightbox);
    if (btnPrev) btnPrev.addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(-1); });
    if (btnNext) btnNext.addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox__figure')) {
        closeLightbox();
      }
    });

    lightbox.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusables = [btnClose, btnPrev, btnNext].filter(Boolean);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('contactForm');
  if (form) {
    const success = document.getElementById('formSuccess');

    const setError = function (input, message) {
      const field = input.closest('.form__field');
      const errorEl = field ? field.querySelector('.form__error') : null;
      if (errorEl) errorEl.textContent = message;
      input.classList.toggle('is-invalid', Boolean(message));
    };

    const validators = {
      name: function (v) {
        if (!v.trim()) return 'Please enter your name.';
        return '';
      },
      email: function (v) {
        if (!v.trim()) return 'Please enter your email.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Please enter a valid email address.';
        return '';
      },
      type: function (v) {
        if (!v) return 'Please choose a shoot type.';
        return '';
      },
      message: function (v) {
        if (!v.trim()) return 'Please write a few words.';
        if (v.trim().length < 10) return 'A little more detail would help (at least 10 characters).';
        return '';
      }
    };

    const validateField = function (input) {
      const validate = validators[input.name];
      if (!validate) return true;
      const message = validate(input.value);
      setError(input, message);
      return !message;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const inputs = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
      const allValid = inputs.map(validateField).every(Boolean);
      if (!allValid) return;
      if (success) success.hidden = false;
      form.reset();
    });

    form.addEventListener('input', function (e) {
      const input = e.target;
      if (input.classList && input.classList.contains('is-invalid')) validateField(input);
    });

    form.addEventListener('change', function (e) {
      const input = e.target;
      if (input.name === 'type') validateField(input);
    });
  }
})();
