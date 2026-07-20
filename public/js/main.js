/**
 * KWASU Food Ordering System - Client Side JavaScript
 * Handles cart, modals, and UI interactions
 */

// ==================== CART FUNCTIONALITY ====================
let cart = JSON.parse(localStorage.getItem('kwasu_cart')) || [];

function saveCart() {
    localStorage.setItem('kwasu_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price: parseFloat(price), quantity: 1 });
    }
    saveCart();
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Added!';
    btn.style.background = '#059669';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 800);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function updateCartUI() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartInput = document.getElementById('cartInput');

    if (!cartItemsEl) return;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        let html = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `<div class="cart-item">
                <span>${item.name} x${item.quantity}</span>
                <div>
                    <span>₦${itemTotal}</span>
                    <button onclick="removeFromCart(${item.id})">×</button>
                </div>
            </div>`;
        });
        cartItemsEl.innerHTML = html;
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    if (cartTotalEl) cartTotalEl.textContent = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartInput) cartInput.value = JSON.stringify(cart);
}

function openOrderModal() {
    const modal = document.getElementById('orderModal');
    const summary = document.getElementById('orderSummary');
    const summaryTotal = document.getElementById('summaryTotal');

    if (!modal) return;

    let html = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<p>${item.name} x${item.quantity} = ₦${itemTotal}</p>`;
    });

    if (summary) summary.innerHTML = html;
    if (summaryTotal) summaryTotal.textContent = total;
    modal.style.display = 'flex';
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('orderModal');
    if (modal && e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', updateCartUI);

// Clear cart after successful order placement
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', () => {
        localStorage.removeItem('kwasu_cart');
    });
}
