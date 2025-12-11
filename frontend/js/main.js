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
  alert(product.title + ' added to cart!');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

async function loadProducts() {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/gh/19Gaurav92/Besa-E-com@main/products.json');
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
          <h3 class="product-name">${p.title}</h3>
          <p style="font-size:0.85rem;color:#666;margin:0.3rem 0;">${p.description || ''}</p>
          <div class="product-price">$${p.price.toFixed(2)}</div>
          <button class="add-to-cart-btn" onclick="addToCart({id:'${p.id}', title:'${p.title}', price:${p.price}})">Add to Cart</button>
        </div>
      `;
      wrap.appendChild(div);
    });
  } catch(e) { 
    console.error('Error:', e);
    const wrap = document.getElementById('products');
    if (wrap) wrap.innerHTML = '<p style="color:red;padding:1rem;">Failed to load products</p>';
  }
}

function showCartModal() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  const cart = getCart();
  const itemsDiv = document.getElementById('cart-items');
  const totalDiv = document.getElementById('cart-total');
  
  itemsDiv.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `<h4>${item.title}</h4><p>$${item.price.toFixed(2)}</p><button class="remove-btn" onclick="removeFromCart('${item.id}');showCartModal();">Remove</button>`;
    itemsDiv.appendChild(itemDiv);
  });
  
  if (cart.length === 0) itemsDiv.innerHTML = '<p style="text-align:center;padding:1rem;">Your cart is empty</p>';
  
  totalDiv.innerHTML = `<div style="font-weight:bold;font-size:1.1rem;">Total: $${subtotal.toFixed(2)}</div><button class="checkout-btn" onclick="checkout()">Checkout</button>`;
  
  modal.style.display = 'block';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function checkout() {
  const cart = getCart();
  if (!cart.length) { alert('Cart is empty'); return; }
  alert('Order placed! Thank you for your purchase. Our team will contact you within 24 hours.');
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
