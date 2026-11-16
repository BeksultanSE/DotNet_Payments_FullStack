/* ═══════════════════════════════════════
   SPA Router & Toast System
   ═══════════════════════════════════════ */

const PAGES = {
    create: renderCreatePayment,
    history: renderPaymentHistory,
    stats: renderStatistics,
};

/**
 * Navigate to the page matching the current hash.
 */
function navigate() {
    const hash = (location.hash || '#create').replace('#', '');
    const page = PAGES[hash] ? hash : 'create';
    const container = document.getElementById('app');

    // Update active tab
    document.querySelectorAll('.navbar__tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.page === page);
    });

    // Render the page
    if (container && PAGES[page]) {
        PAGES[page](container);
    }
}

/* ── Toast Notification System ── */
function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <span class="toast__icon">${icons[type] || icons.info}</span>
        <div class="toast__content">
            <div class="toast__title">${title}</div>
            <div class="toast__message">${message}</div>
        </div>
        <button class="toast__close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast__close');
    const dismiss = () => {
        toast.classList.add('toast--exiting');
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', dismiss);
    const timer = setTimeout(dismiss, duration);

    // Pause timer on hover
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => setTimeout(dismiss, 2000));
}

/* ── Initialize ── */
document.addEventListener('DOMContentLoaded', () => {
    navigate();
    window.addEventListener('hashchange', navigate);
});
