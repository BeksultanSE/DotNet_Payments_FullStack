/* ═══════════════════════════════════════
   Create Payment Page
   ═══════════════════════════════════════ */

const CURRENCY_SYMBOLS = { RUB: '₽', USD: '$', EUR: '€' };

/**
 * Render the Create Payment form into the given container.
 * @param {HTMLElement} container
 */
function renderCreatePayment(container) {
    container.innerHTML = `
        <div class="page-enter">
            <div class="section-header">
                <h1 class="section-header__title">Create Payment</h1>
                <p class="section-header__subtitle">Fill in the payment details below to create a new transaction</p>
            </div>
            <div class="card" id="payment-form-card">
                <form id="payment-form" novalidate autocomplete="off">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label" for="walletNumber">
                                Wallet Number <span class="form-label__required">*</span>
                            </label>
                            <input type="text" id="walletNumber" class="form-input"
                                   placeholder="e.g. W-10042" maxlength="100">
                            <span class="form-error" id="walletNumber-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="account">
                                Account / UserId <span class="form-label__required">*</span>
                            </label>
                            <input type="text" id="account" class="form-input"
                                   placeholder="e.g. user_12345" maxlength="200">
                            <span class="form-error" id="account-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="email">
                                Email <span class="form-label__required">*</span>
                            </label>
                            <input type="email" id="email" class="form-input"
                                   placeholder="user@example.com" maxlength="254">
                            <span class="form-error" id="email-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="phone">
                                Phone
                            </label>
                            <input type="tel" id="phone" class="form-input"
                                   placeholder="+7 (999) 000-00-00" maxlength="32">
                            <span class="form-error" id="phone-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="amount">
                                Amount <span class="form-label__required">*</span>
                            </label>
                            <div class="input-group">
                                <input type="number" id="amount" class="form-input"
                                       placeholder="0.00" step="0.01" min="0.01">
                                <span class="input-group__suffix" id="currency-symbol">₽</span>
                            </div>
                            <span class="form-error" id="amount-error"></span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="currency">
                                Currency <span class="form-label__required">*</span>
                            </label>
                            <select id="currency" class="form-select">
                                <option value="RUB">RUB — Russian Ruble</option>
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                            </select>
                            <span class="form-error" id="currency-error"></span>
                        </div>
                        <div class="form-group form-group--full">
                            <label class="form-label" for="comment">
                                Comment
                            </label>
                            <textarea id="comment" class="form-textarea"
                                      placeholder="Optional comment for this payment..." maxlength="1000"></textarea>
                            <span class="form-error" id="comment-error"></span>
                        </div>
                    </div>
                    <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                        <button type="submit" class="btn btn--primary" id="submit-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                            Create Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Wire up currency symbol update
    const currencySelect = document.getElementById('currency');
    const currencySymbol = document.getElementById('currency-symbol');
    currencySelect.addEventListener('change', () => {
        currencySymbol.textContent = CURRENCY_SYMBOLS[currencySelect.value] || '';
    });

    // Form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', handleFormSubmit);

    // Live validation — clear errors on input
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
        el.addEventListener('input', () => {
            el.classList.remove('error');
            const errorEl = document.getElementById(`${el.id}-error`);
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('visible');
            }
        });
    });
}

/**
 * Validate and submit the payment form.
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const fields = {
        walletNumber: document.getElementById('walletNumber').value.trim(),
        account: document.getElementById('account').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        amount: parseFloat(document.getElementById('amount').value),
        currency: document.getElementById('currency').value,
        comment: document.getElementById('comment').value.trim() || null,
    };

    // Validate
    let valid = true;

    if (!fields.walletNumber) {
        showFieldError('walletNumber', 'Wallet number is required');
        valid = false;
    }

    if (!fields.account) {
        showFieldError('account', 'Account / UserId is required');
        valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fields.email) {
        showFieldError('email', 'Email is required');
        valid = false;
    } else if (!emailRegex.test(fields.email)) {
        showFieldError('email', 'Enter a valid email address');
        valid = false;
    }

    if (fields.phone) {
        const phoneRegex = /^\+?[\d\s\-().]{7,32}$/;
        if (!phoneRegex.test(fields.phone)) {
            showFieldError('phone', 'Enter a valid phone number');
            valid = false;
        }
    }

    if (isNaN(fields.amount) || fields.amount <= 0) {
        showFieldError('amount', 'Amount must be a positive number');
        valid = false;
    }

    if (!valid) return;

    // Submit
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
        const result = await createPayment(fields);
        showToast('success', 'Payment Created', `Payment ${result.id.substring(0, 8)}... created successfully`);
        document.getElementById('payment-form').reset();
        document.getElementById('currency-symbol').textContent = '₽';
    } catch (err) {
        showToast('error', 'Payment Failed', err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Create Payment
        `;
    }
}

function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    if (input) input.classList.add('error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}
