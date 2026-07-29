/**
 * KWASU Food Ordering System - Client Side JavaScript
 * Handles cart, modals, and UI interactions
 */

// ==================== MOBILE NAV ====================
(function () {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (!navToggle || !navMenu) return;

    function setOpen(isOpen) {
        navMenu.classList.toggle('open', isOpen);
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    }

    navToggle.addEventListener('click', () => {
        setOpen(!navMenu.classList.contains('open'));
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setOpen(false);
    });
})();

// ==================== CART FUNCTIONALITY ====================
let cart = JSON.parse(localStorage.getItem('kwasu_cart')) || [];

function saveCart() {
    localStorage.setItem('kwasu_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(id, name, price, btn) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price: parseFloat(price), quantity: 1 });
    }
    saveCart();

    if (!btn) return;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 700);
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
    const cartInputDesktop = document.getElementById('cartInputDesktop');

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

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartTotalEl) cartTotalEl.textContent = total;
    if (cartInput) cartInput.value = JSON.stringify(cart);
    if (cartInputDesktop) cartInputDesktop.value = JSON.stringify(cart);

    const mobileBar = document.getElementById('mobileCartBar');
    const mobileSummary = document.getElementById('mobileCartSummary');
    if (mobileBar) {
        if (cart.length === 0) {
            mobileBar.classList.remove('show');
        } else {
            mobileBar.classList.add('show');
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (mobileSummary) mobileSummary.textContent = `${count} item${count !== 1 ? 's' : ''} · ₦${total}`;
        }
    }
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
['orderForm', 'desktopOrderForm'].forEach(id => {
    const form = document.getElementById(id);
    if (form) {
        form.addEventListener('submit', () => {
            localStorage.removeItem('kwasu_cart');
        });
    }
});
