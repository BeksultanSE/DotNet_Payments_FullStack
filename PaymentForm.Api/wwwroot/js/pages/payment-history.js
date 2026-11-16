/* ═══════════════════════════════════════
   Payment History Page
   ═══════════════════════════════════════ */

let historyPage = 1;
const HISTORY_PAGE_SIZE = 10;

/**
 * Render the Payment History table into the given container.
 * @param {HTMLElement} container
 */
function renderPaymentHistory(container) {
    container.innerHTML = `
        <div class="page-enter">
            <div class="section-header">
                <h1 class="section-header__title">Payment History</h1>
                <p class="section-header__subtitle">View all processed transactions</p>
            </div>
            <div class="card" style="padding: 0; overflow: hidden;">
                <div id="history-content">
                    <div class="loading"><div class="loading__spinner"></div></div>
                </div>
            </div>
        </div>
    `;
    historyPage = 1;
    loadHistory();
}

async function loadHistory() {
    const content = document.getElementById('history-content');
    if (!content) return;

    content.innerHTML = '<div class="loading"><div class="loading__spinner"></div></div>';

    try {
        const payments = await getPayments(historyPage, HISTORY_PAGE_SIZE);
        if (payments.length === 0 && historyPage === 1) {
            content.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                    </svg>
                    <h3 class="empty-state__title">No payments yet</h3>
                    <p class="empty-state__text">Create your first payment to see it here</p>
                </div>
            `;
            return;
        }

        const hasMore = payments.length === HISTORY_PAGE_SIZE;

        content.innerHTML = `
            <div class="table-wrapper" style="border: none; border-radius: 0;">
                <table class="table" id="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Account</th>
                            <th>Email</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Status</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(p => `
                            <tr>
                                <td>${formatDate(p.createdAt)}</td>
                                <td>${escapeHtml(p.account)}</td>
                                <td class="email">${escapeHtml(p.email)}</td>
                                <td class="amount">${formatAmount(p.amount)}</td>
                                <td><span class="currency-symbol">${escapeHtml(p.currency)}</span></td>
                                <td>
                                    <span class="badge badge--${p.status.toLowerCase()}">
                                        ${escapeHtml(p.status)}
                                    </span>
                                </td>
                                <td class="comment" title="${escapeHtml(p.comment || '')}">${escapeHtml(p.comment || '—')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="pagination" style="padding: 1rem;">
                <button class="btn btn--secondary btn--sm" id="prev-page" ${historyPage <= 1 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <span class="pagination__info">Page ${historyPage}</span>
                <button class="btn btn--secondary btn--sm" id="next-page" ${!hasMore ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        `;

        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (historyPage > 1) {
                historyPage--;
                loadHistory();
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            if (hasMore) {
                historyPage++;
                loadHistory();
            }
        });

    } catch (err) {
        content.innerHTML = `
            <div class="empty-state">
                <h3 class="empty-state__title">Failed to load payments</h3>
                <p class="empty-state__text">${escapeHtml(err.message)}</p>
                <button class="btn btn--secondary btn--sm" style="margin-top: 1rem;" onclick="loadHistory()">
                    Retry
                </button>
            </div>
        `;
    }
}

/* ── Helpers ── */
function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatAmount(val) {
    return Number(val).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
