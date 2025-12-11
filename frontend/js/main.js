// Besa Ventures E-Commerce JavaScript
const CART_KEY = 'bv_cart';

function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCount();
}

function updateCount() {
    const cart = getCart();
    const el = document.getElementById('cart-count');
    if (el) el.textContent = cart.length;
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    saveCart(cart);
    alert(product.name + ' added to cart!');
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

async function loadProducts() {
    try {
        const res = await fetch('/products.json');
        const products = await res.json();
        const wrap = document.getElementById('products');
        if (!wrap) return;
        
        wrap.innerHTML = '';
        products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                <div class="product-image">📦</div>
                <div class="product-info">
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-price">₹${p.price}</div>
                    <button class="add-to-cart-btn" onclick="addToCart({id:${p.id}, name:'${p.name}', price:${p.price}})">Add to Cart</button>
                </div>
            `;
            wrap.appendChild(div);
        });
    } catch(e) { console.error(e); }
}

function showCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    const cart = getCart();
    const itemsDiv = document.getElementById('cart-items');
    const totalDiv = document.getElementById('cart-total');
    
    itemsDiv.innerHTML = cart.length === 0 ? '<p style="text-align:center;color:#999;padding:1rem;">Empty cart</p>' : '';
    
    let total = 0;
    cart.forEach(item => {
        total += item.price;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `<h4>${item.name}</h4><p>₹${item.price}</p><button class="remove-btn" onclick="removeFromCart(${item.id});showCartModal();">Remove</button>`;
        if (cart.length > 0) itemsDiv.appendChild(itemDiv);
    });
    
    totalDiv.innerHTML = `<div class="summary-row total"><span>Total: ₹${(total * 1.18).toFixed(2)}</span></div><button class="checkout-btn" onclick="checkout()">Checkout</button>`;
    
    modal.style.display = 'block';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function checkout() {
    const cart = getCart();
    if (!cart.length) { alert('Cart is empty'); return; }
    alert('Order placed! Thank you!');
    localStorage.setItem(CART_KEY, '[]');
    updateCount();
    document.getElementById('cart-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCount();
    const link = document.getElementById('cart-link');
    if (link) link.onclick = (e) => { e.preventDefault(); showCartModal(); };
});
