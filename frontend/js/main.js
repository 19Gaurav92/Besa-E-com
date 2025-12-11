// Besa Ventures E-Commerce Store
const CART_KEY = 'besa_cart';

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
  alert('✓ ' + product.title + ' added to cart!');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  updateCart();
}

function openCart() {
  const modal = document.getElementById('cart-modal');
  const overlay = document.getElementById('overlay');
  modal.classList.add('open');
  overlay.classList.add('show');
}

function closeCart() {
  const modal = document.getElementById('cart-modal');
  const overlay = document.getElementById('overlay');
  modal.classList.remove('open');
  overlay.classList.remove('show');
}

function updateCart() {
  const cart = getCart();
  const itemsDiv = document.getElementById('cart-items');
  const totalDiv = document.getElementById('cart-total');
  
  itemsDiv.innerHTML = '';
  let subtotal = 0;
  
  if (cart.length === 0) {
    itemsDiv.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    totalDiv.innerHTML = '<button class="checkout-btn" onclick="closeCart()">Continue Shopping</button>';
    return;
  }
  
  cart.forEach(item => {
    subtotal += item.price * (item.quantity || 1);
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <p>Qty: ${item.quantity || 1}</p>
      </div>
      <div>
        <p>$${(item.price * (item.quantity || 1)).toFixed(2)}</p>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
    itemsDiv.appendChild(itemDiv);
  });
  
  totalDiv.innerHTML = `
    <div class="total-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="total-amount">Total: $${subtotal.toFixed(2)}</div>
    <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
  `;
}

function checkout() {
  const cart = getCart();
  if (!cart.length) {
    alert('Cart is empty');
    return;
  }
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  alert('✓ Order placed!\nTotal: $' + total.toFixed(2) + '\n\nWe will contact you within 24 hours.');
  localStorage.setItem(CART_KEY, '[]');
  updateCount();
  closeCart();
}

async function loadProducts() {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/gh/19Gaurav92/Besa-E-com@main/products.json');
    const products = await res.json();
    const wrap = document.querySelector('.products-grid');
    if (!wrap) return;
    
    wrap.innerHTML = '';
    products.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';
      
      div.innerHTML = `
        <div class="product-image">📦</div>
        <div class="product-info">
          <h3 class="product-name">${p.title}</h3>
          <p class="product-description">${p.description}</p>
          <div class="product-price">$${p.price.toFixed(2)}</div>
          <button class="add-to-cart-btn" onclick="addToCart({id:'${p.id}', title:'${p.title}', price:${p.price}})">Add to Cart</button>
        </div>
      `;
      wrap.appendChild(div);
    });
  } catch(e) {
    console.error('Error loading products:', e);
    const wrap = document.querySelector('.products-grid');
    if (wrap) wrap.innerHTML = '<p style="color:red;padding:2rem;text-align:center;">Failed to load products. Please refresh the page.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCount();
  
  const cartLink = document.getElementById('cart-link');
  if (cartLink) {
    cartLink.onclick = (e) => {
      e.preventDefault();
      openCart();
      updateCart();
    };
  }
  
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.onclick = closeCart;
  }
});

// Initialize cart on page load
setTimeout(() => {
  updateCart();
}, 100);
