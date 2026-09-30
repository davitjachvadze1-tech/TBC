/**
 * NovaPulse — Landing Page Interactions & Form Validation
 * Clean, modern vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. SELECTORS & STATE
  // --------------------------------------------------------------------------
  const header = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Contact Form Elements
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackBanner = document.getElementById('form-feedback');
  const feedbackText = document.getElementById('feedback-text');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackClose = document.getElementById('feedback-close');

  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const messageInput = document.getElementById('user-message');
  const charCounter = document.getElementById('char-counter');

  const currentYearSpan = document.getElementById('current-year');

  // Dynamic Year in Footer
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 2. MOBILE NAVIGATION MENU
  // --------------------------------------------------------------------------
  const toggleMobileMenu = (forceClose = false) => {
    const isCurrentlyOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    const shouldOpen = forceClose ? false : !isCurrentlyOpen;

    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    menuToggle.classList.toggle('is-active', shouldOpen);
    siteNav.classList.toggle('is-open', shouldOpen);
    document.body.classList.toggle('no-scroll', shouldOpen);
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });

    // Close menu when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (siteNav.classList.contains('is-open')) {
          toggleMobileMenu(true);
        }
      });
    });

    // Close menu when clicking outside of the drawer
    document.addEventListener('click', (e) => {
      if (
        siteNav.classList.contains('is-open') &&
        !siteNav.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        toggleMobileMenu(true);
      }
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        toggleMobileMenu(true);
        menuToggle.focus();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. STICKY HEADER ON SCROLL
  // --------------------------------------------------------------------------
  const handleHeaderScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Run immediately on mount

  // --------------------------------------------------------------------------
  // 4. ACTIVE NAVIGATION LINK OBSERVER
  // --------------------------------------------------------------------------
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // --------------------------------------------------------------------------
  // 5. CONTACT FORM VALIDATION & SUBMISSION
  // --------------------------------------------------------------------------
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * Validate a specific input field
   * @param {HTMLElement} input 
   * @returns {boolean} is field valid
   */
  const validateField = (input) => {
    const group = input.closest('.form-group');
    if (!group) return true;

    const errorMsg = group.querySelector('.form-error-msg');
    const val = input.value.trim();
    let isValid = true;
    let message = '';

    if (input === nameInput) {
      if (!val) {
        isValid = false;
        message = 'Please enter your full name.';
      } else if (val.length < 2) {
        isValid = false;
        message = 'Name must be at least 2 characters long.';
      }
    } else if (input === emailInput) {
      if (!val) {
        isValid = false;
        message = 'Please enter your work email.';
      } else if (!emailRegex.test(val)) {
        isValid = false;
        message = 'Please enter a valid email address (e.g. name@domain.com).';
      }
    } else if (input === messageInput) {
      if (!val) {
        isValid = false;
        message = 'Please enter a message.';
      } else if (val.length < 10) {
        isValid = false;
        message = `Message must be at least 10 characters long (${10 - val.length} more needed).`;
      }
    }

    if (!isValid) {
      group.classList.add('has-error');
      group.classList.remove('is-valid');
      if (errorMsg) errorMsg.textContent = message;
    } else {
      group.classList.remove('has-error');
      group.classList.add('is-valid');
      if (errorMsg) errorMsg.textContent = '';
    }

    return isValid;
  };

  // Live validation listeners
  [nameInput, emailInput, messageInput].forEach((input) => {
    if (!input) return;

    input.addEventListener('blur', () => {
      validateField(input);
    });

    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  // Message Character Counter
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const count = messageInput.value.length;
      charCounter.textContent = `${count} / 1000`;
      if (count > 1000) {
        charCounter.style.color = 'var(--accent-red)';
      } else {
        charCounter.style.color = 'var(--text-muted)';
      }
    });
  }

  // Toast feedback helper
  let feedbackTimeout = null;
  const showFeedback = (type, message) => {
    if (!feedbackBanner) return;

    feedbackBanner.className = `form-feedback-banner ${type}`;
    feedbackText.textContent = message;
    feedbackIcon.textContent = type === 'success' ? '✓' : '⚠️';
    feedbackBanner.hidden = false;

    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
      feedbackBanner.hidden = true;
    }, 6000);
  };

  if (feedbackClose) {
    feedbackClose.addEventListener('click', () => {
      if (feedbackBanner) feedbackBanner.hidden = true;
    });
  }

  // Form Submit Handler
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all fields
      const isNameValid = validateField(nameInput);
      const isEmailValid = validateField(emailInput);
      const isMessageValid = validateField(messageInput);

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        showFeedback('error', 'Please correct the highlighted fields before submitting.');
        // Focus first invalid input
        if (!isNameValid) nameInput.focus();
        else if (!isEmailValid) emailInput.focus();
        else if (!isMessageValid) messageInput.focus();
        return;
      }

      // Enter Loading State
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      // Simulate asynchronous API network call
      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;

        const userName = nameInput.value.trim().split(' ')[0] || 'there';
        showFeedback(
          'success',
          `Thank you, ${userName}! Your message was received. Our team will contact you shortly.`
        );

        // Reset Form & Clear validation borders
        contactForm.reset();
        [nameInput, emailInput, messageInput].forEach((input) => {
          const group = input.closest('.form-group');
          if (group) {
            group.classList.remove('has-error', 'is-valid');
          }
        });

        if (charCounter) {
          charCounter.textContent = '0 / 1000';
        }
      }, 900);
    });
  }
});
