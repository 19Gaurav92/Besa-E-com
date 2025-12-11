
const apiBase = window.location.origin;
const CART_KEY = "bv_cart";

function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); }
function updateCount(){ document.getElementById("cart-count").textContent = getCart().length; }

async function loadProducts(){
  const res = await fetch("/products");
  const products = await res.json();
  const wrap = document.getElementById("products");
  wrap.innerHTML = "";
  products.forEach(p=>{
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${p.image}" style="width:200px"/>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <button onclick="add('${p.id}')">Add</button>
    `;
    wrap.appendChild(div);
  });
}

function add(id){
  const c = getCart();
  c.push({id, qty:1});
  saveCart(c);
  updateCount();
}

document.getElementById("cart-link").onclick = async ()=>{
  document.getElementById("cart-modal").classList.remove("hidden");
  const itemsDiv = document.getElementById("cart-items");
  itemsDiv.innerHTML = "";
  const res = await fetch("/products");
  const products = await res.json();
  const cart = getCart();
  cart.forEach(ci=>{
    const p = products.find(x=>x.id===ci.id);
    itemsDiv.innerHTML += `<div>${p.title} x ${ci.qty}</div>`;
  });
};

document.getElementById("close-cart").onclick = ()=>document.getElementById("cart-modal").classList.add("hidden");

loadProducts();
updateCount();
