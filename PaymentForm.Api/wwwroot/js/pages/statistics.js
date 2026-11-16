/* ═══════════════════════════════════════
   Statistics Page
   ═══════════════════════════════════════ */

/**
 * Render the Statistics dashboard into the given container.
 * @param {HTMLElement} container
 */
function renderStatistics(container) {
    container.innerHTML = `
        <div class="page-enter">
            <div class="section-header">
                <h1 class="section-header__title">Payment Statistics</h1>
                <p class="section-header__subtitle">Aggregated overview of all transactions</p>
            </div>
            <div id="stats-content">
                <div class="loading"><div class="loading__spinner"></div></div>
            </div>
        </div>
    `;
    loadStats();
}

async function loadStats() {
    const content = document.getElementById('stats-content');
    if (!content) return;

    try {
        const stats = await getStats();

        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card__icon stat-card__icon--payments">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                    </div>
                    <div class="stat-card__label">Total Payments</div>
                    <div class="stat-card__value" id="stat-count">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__icon stat-card__icon--amount">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="stat-card__label">Total Amount</div>
                    <div class="stat-card__value" id="stat-sum">0.00</div>
                </div>
            </div>

            <div class="card" style="padding: 0; overflow: hidden;">
                <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--glass-border);">
                    <h2 style="font-size: 1.125rem; font-weight: 700; color: var(--text-primary);">Daily Breakdown</h2>
                </div>
                <div id="daily-content"></div>
            </div>
        `;

        // Animated counters
        animateCounter('stat-count', stats.totalCount, false);
        animateCounter('stat-sum', stats.totalSum, true);

        // Daily breakdown
        const dailyContent = document.getElementById('daily-content');
        if (!stats.dailyBreakdown || stats.dailyBreakdown.length === 0) {
            dailyContent.innerHTML = `
                <div class="empty-state" style="padding: 2.5rem;">
                    <h3 class="empty-state__title">No data yet</h3>
                    <p class="empty-state__text">Create payments to see daily breakdown</p>
                </div>
            `;
        } else {
            dailyContent.innerHTML = `
                <div class="table-wrapper" style="border: none; border-radius: 0;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Number of Payments</th>
                                <th>Daily Sum</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.dailyBreakdown.map(d => `
                                <tr>
                                    <td>${formatStatsDate(d.date)}</td>
                                    <td><strong>${d.count}</strong></td>
                                    <td class="amount">${formatAmount(d.sum)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

    } catch (err) {
        content.innerHTML = `
            <div class="empty-state">
                <h3 class="empty-state__title">Failed to load statistics</h3>
                <p class="empty-state__text">${escapeHtml(err.message)}</p>
                <button class="btn btn--secondary btn--sm" style="margin-top: 1rem;" onclick="loadStats()">
                    Retry
                </button>
            </div>
        `;
    }
}

/**
 * Animate a number counter from 0 to target value.
 */
function animateCounter(elementId, target, isDecimal) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const duration = 800;
    const start = performance.now();
    const numTarget = Number(target) || 0;

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = numTarget * eased;

        if (isDecimal) {
            el.textContent = current.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } else {
            el.textContent = Math.round(current).toLocaleString('en-US');
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function formatStatsDate(dateStr) {
    // dateStr can be "2024-01-15" or ISO format
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}
