/**
 * script.js
 * ---------
 * Handles all client-side interactivity for the Gmail Compose Launcher:
 *   - Building the Gmail deep-link
 *   - Opening Gmail compose in a new tab (never sending anything)
 *   - Loading animation on the compose button
 *   - Toast notifications
 *   - Copy-to-clipboard helpers
 *   - Ripple button effect
 *   - Responsive navbar toggle
 *   - Popup-blocker error handling
 *
 * No credentials are ever collected, stored, or transmitted.
 */

'use strict';

/* ==========================================================================
   1. Hardcoded email details
   ========================================================================== */
const EMAIL_DETAILS = Object.freeze({
  to: [
    'minister.sm@gov.in',
    'd.pradhan@sansad.nic.in'
  ],

  subject: 'Request for Resignation',

  body: `Dharmendra Pradhan,

I respectfully request your resignation as the Education Minister. In my opinion, you have failed to meet the expectations of countless students across the country. Many people have lost confidence in your leadership, and I do not believe you deserve to continue serving in this position.

I urge you to step down and allow someone who can work sincerely for the future of India's education system.

Thank you.`
});

/* ==========================================================================
   2. Gmail compose URL builder
   ========================================================================== */
/**
 * Builds a Gmail "compose" deep-link.
 * Using view=cm (compose mail) opens the compose window pre-filled;
 * it NEVER sends the email — the user must press Send manually inside Gmail.
 * @returns {string} Fully encoded Gmail compose URL.
 */
function buildComposeUrl({ to, subject, body }) {

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
        return `mailto:${to.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    const base = "https://mail.google.com/mail/?view=cm&fs=1&tf=1";

    const params = new URLSearchParams({
        to: to.join(","),
        su: subject,
        body: body
    });

    return `${base}&${params.toString()}`;
}

  const base = "https://mail.google.com/mail/?view=cm&fs=1&tf=1";
  const params = new URLSearchParams({
    to: to.join(","),
    su: subject,
    body: body,
  });

  return `${base}&${params.toString()}`;
}

/* ==========================================================================
   3. Toast notification system
   ========================================================================== */
const toastContainer = document.getElementById('toastContainer');

/**
 * Displays a toast notification.
 * @param {string} message - Text to display.
 * @param {'success'|'error'|'info'} type - Visual style of the toast.
 * @param {number} duration - Milliseconds before auto-dismiss.
 */
function showToast(message, type = 'info', duration = 3500) {
  if (!toastContainer) return;

  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  const removeToast = () => {
    toast.classList.add('toast--hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  const timer = setTimeout(removeToast, duration);

  // Allow the user to dismiss early by clicking the toast.
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    removeToast();
  });
}

/* ==========================================================================
   4. Ripple button effect
   ========================================================================== */
/**
 * Adds a Material-style ripple effect to any element with the `.ripple` class.
 * @param {MouseEvent|KeyboardEvent} event
 */
function createRipple(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();

  // Support both mouse clicks and keyboard activation (centered ripple).
  const x = (event.clientX ?? rect.left + rect.width / 2) - rect.left;
  const y = (event.clientY ?? rect.top + rect.height / 2) - rect.top;

  const circle = document.createElement('span');
  const diameter = Math.max(rect.width, rect.height);
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${x - diameter / 2}px`;
  circle.style.top = `${y - diameter / 2}px`;
  circle.classList.add('ripple-circle');

  const existingRipple = button.querySelector('.ripple-circle');
  if (existingRipple) existingRipple.remove();

  button.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

document.querySelectorAll('.ripple').forEach((btn) => {
  btn.addEventListener('click', createRipple);
});

/* ==========================================================================
   5. Clipboard helpers
   ========================================================================== */
/**
 * Copies text to the clipboard with a graceful fallback for older browsers.
 * @param {string} text
 * @returns {Promise<boolean>} whether the copy succeeded
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for non-secure contexts / older browsers.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    textarea.remove();
    return success;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

const copySubjectBtn = document.getElementById('copySubjectBtn');
const copyBodyBtn = document.getElementById('copyBodyBtn');

if (copySubjectBtn) {
  copySubjectBtn.addEventListener('click', async () => {
    const ok = await copyToClipboard(EMAIL_DETAILS.subject);
    showToast(
      ok ? 'Subject copied to clipboard.' : 'Could not copy subject. Please copy manually.',
      ok ? 'success' : 'error'
    );
  });
}

if (copyBodyBtn) {
  copyBodyBtn.addEventListener('click', async () => {
    const ok = await copyToClipboard(EMAIL_DETAILS.body);
    showToast(
      ok ? 'Message copied to clipboard.' : 'Could not copy message. Please copy manually.',
      ok ? 'success' : 'error'
    );
  });
}

/* ==========================================================================
   6. Compose button logic (with 1s loading animation + popup handling)
   ========================================================================== */
const composeBtn = document.getElementById('composeBtn');

/**
 * Simulates a short loading state, then opens Gmail compose in a new tab.
 * Handles popup blockers gracefully by detecting a null/blocked window.
 */
function handleComposeClick() {
  if (!composeBtn || composeBtn.classList.contains('is-loading')) return;

  composeBtn.classList.add('is-loading');
  composeBtn.disabled = true;
  composeBtn.setAttribute('aria-busy', 'true');

  window.setTimeout(() => {
    try {
      const composeUrl = buildComposeUrl(EMAIL_DETAILS);

      let newTab = null;

      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
       window.location.href = composeUrl;
      } else {
       newTab = window.open(composeUrl, "_blank");
      }

      // Popup blockers typically return null or an undefined/closed window.
      if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {

        if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {

          showToast(
              'Pop-up blocked! Please allow pop-ups for this site and try again.',
              'error',
              5000
          );

        } else {
          showToast('Gmail opened successfully.', 'success');
        }

      } else {
        showToast('Opening your email app...', 'success');
      }
        showToast(
          'Pop-up blocked! Please allow pop-ups for this site and try again.',
          'error',
          5000
        );
      } else {
        showToast('Gmail opened successfully.', 'success');
      }
    } catch (err) {
      console.error('Failed to open Gmail:', err);
      showToast('Something went wrong while opening Gmail. Please try again.', 'error');
    } finally {
      composeBtn.classList.remove('is-loading');
      composeBtn.disabled = false;
      composeBtn.removeAttribute('aria-busy');
    }
  }, 1000); // 1-second loading animation, as required.
}

if (composeBtn) {
  composeBtn.addEventListener('click', handleComposeClick);

  // Keyboard accessibility: allow activation with Enter/Space (native for
  // <button>, but we guard here in case markup changes to a non-button element).
  composeBtn.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleComposeClick();
    }
  });
}

/* ==========================================================================
   7. Responsive navbar toggle
   ========================================================================== */
const navbarToggle = document.getElementById('navbarToggle');
const navbarMobile = document.getElementById('navbarMobile');

if (navbarToggle && navbarMobile) {
  navbarToggle.addEventListener('click', () => {
    const isOpen = navbarMobile.classList.toggle('is-open');
    navbarToggle.setAttribute('aria-expanded', String(isOpen));
    navbarToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Close mobile menu when a link is clicked (better UX for single-page nav).
  navbarMobile.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', () => {
      navbarMobile.classList.remove('is-open');
      navbarToggle.setAttribute('aria-expanded', 'false');
      navbarToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });
}

/* ==========================================================================
   8. Smooth scrolling for in-page anchor links (progressive enhancement)
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      event.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ==========================================================================
   9. Navbar shrink-on-scroll effect (subtle premium touch)
   ========================================================================== */
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

window.addEventListener(
  'scroll',
  () => {
    if (!navbar) return;
    const currentScrollY = window.scrollY;
    navbar.style.boxShadow =
      currentScrollY > 10 ? '0 4px 24px rgba(0,0,0,0.35)' : 'none';
    lastScrollY = currentScrollY;
  },
  { passive: true }
);

/* ==========================================================================
   10. Initial welcome log (developer-friendly, non-intrusive)
   ========================================================================== */
console.info(
  '%cGmail Compose Launcher%c — no passwords, no auto-send, ever.',
  'color:#6a5cff;font-weight:bold;',
  'color:inherit;'
);
