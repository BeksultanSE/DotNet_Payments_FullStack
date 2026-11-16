/* ═══════════════════════════════════════
   API Client — Payment Form
   ═══════════════════════════════════════ */

const API_BASE = '/api/payments';
const API_KEY = 'TestApiKey-PaymentForm-2024-SecureKey!!';

/**
 * Create a new payment.
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Created payment response
 */
async function createPayment(data) {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': API_KEY,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.title || `Error ${response.status}`);
    }

    return response.json();
}

/**
 * Get paginated list of payments.
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Items per page
 * @returns {Promise<Object[]>} Array of payment responses
 */
async function getPayments(page = 1, pageSize = 10) {
    const params = new URLSearchParams({ page, pageSize });
    const response = await fetch(`${API_BASE}?${params}`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.title || `Error ${response.status}`);
    }

    return response.json();
}

/**
 * Get payment statistics.
 * @returns {Promise<Object>} Stats response with totalSum, totalCount, dailyBreakdown
 */
async function getStats() {
    const response = await fetch(`${API_BASE}/stats`);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.title || `Error ${response.status}`);
    }

    return response.json();
}
