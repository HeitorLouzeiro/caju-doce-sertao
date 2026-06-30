// Caju Doce Sertão — lógica da vitrine, modo varejo/atacado e carrinho via WhatsApp
const WHATS = "5589999990000"; // << troque pelo número real da Caju Doce Sertão (com DDI 55 + DDD)
const MIN_ATACADO = 250;
const PRODUCTS_URL = "data/products.json";

let PRODUCTS = [];
let mode = "varejo";
let cart = {}; // id -> qty (em unidades)

const BRL = n => "R$ " + n.toFixed(2).replace(".", ",");

function priceOf(p) { return mode === "varejo" ? p.varejo : p.atacado; }
function stepOf(p) { return mode === "varejo" ? 1 : p.caixa; }

function setMode(m) {
  mode = m;
  cart = {}; // recomeça pois unidade/mínimo muda
  document.getElementById("btnVarejo").setAttribute("aria-pressed", m === "varejo");
  document.getElementById("btnAtacado").setAttribute("aria-pressed", m === "atacado");
  document.getElementById("modeTitle").textContent = m === "varejo" ? "Comprando para consumo próprio" : "Comprando para revenda (atacado)";
  document.getElementById("modeDesc").textContent = m === "varejo"
    ? "Preços de varejo, a partir de 1 unidade. Quer revender? Troque para atacado e veja os preços por caixa."
    : "Preços por unidade ao levar caixas fechadas. Pedido mínimo de revenda: " + BRL(MIN_ATACADO) + ".";
  document.getElementById("cartMode").textContent = m === "varejo" ? "Varejo" : "Atacado";
  document.getElementById("unitsLabel").textContent = m === "varejo" ? "Unidades" : "Caixas";
  renderGrid();
  renderCart();
}

function productImage(p) {
  return `<picture>
    <source srcset="${p.imgWebp}" type="image/webp">
    <img src="${p.img}" alt="${p.name}" loading="lazy" width="265" height="265">
  </picture>`;
}

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  PRODUCTS.forEach(p => {
    const price = priceOf(p);
    const tags = p.tags.map(t => `<span class="tag ${t.k}">${t.t}</span>`).join("");
    let priceHtml;
    if (mode === "varejo") {
      priceHtml = `<div class="price">${BRL(price)}</div><div class="unitline">por unidade · ${p.vol}</div>`;
    } else {
      const save = Math.round((1 - p.atacado / p.varejo) * 100);
      const boxTotal = price * p.caixa;
      priceHtml = `<div class="price">${BRL(price)}<span class="cents"> /un</span></div>
        <div class="unitline"><span class="save">−${save}%</span> vs. varejo (${BRL(p.varejo)})</div>
        <div class="boxnote">📦 Caixa com ${p.caixa} un · ${BRL(boxTotal)}/caixa</div>`;
    }
    const inCart = cart[p.id] || 0;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="ph"><div class="tagrow">${tags}</div>${productImage(p)}</div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="vol">${p.vol}</div>
        <div class="desc">${p.desc}</div>
        <div class="priceblock">${priceHtml}</div>
        <div class="addrow">
          <button class="add ${inCart ? "done" : ""}" onclick="addToCart('${p.id}')">
            ${inCart ? "✓ No carrinho" : (mode === "varejo" ? "Adicionar" : "Add caixa")}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  cart[id] = (cart[id] || 0) + stepOf(p);
  renderGrid();
  renderCart();
  toast(mode === "varejo" ? `${p.name} adicionado` : `1 caixa de ${p.name} adicionada`);
  pulseCount();
}

function changeQty(id, dir) {
  const p = PRODUCTS.find(x => x.id === id);
  const s = stepOf(p);
  cart[id] = (cart[id] || 0) + dir * s;
  if (cart[id] <= 0) delete cart[id];
  renderGrid();
  renderCart();
}

function removeItem(id) {
  delete cart[id];
  renderGrid();
  renderCart();
}

function totals() {
  let total = 0, units = 0;
  for (const id in cart) {
    const p = PRODUCTS.find(x => x.id === id);
    total += priceOf(p) * cart[id];
    units += mode === "varejo" ? cart[id] : cart[id] / p.caixa;
  }
  return { total, units };
}

function renderCart() {
  const box = document.getElementById("items");
  const ids = Object.keys(cart);
  document.getElementById("count").textContent = ids.length ? totals().units : 0;
  if (!ids.length) {
    box.innerHTML = `<div class="empty"><div class="big">🧺</div><p>Seu carrinho está vazio.<br>Escolha seus produtos do caju!</p></div>`;
  } else {
    box.innerHTML = ids.map(id => {
      const p = PRODUCTS.find(x => x.id === id);
      const qtyUnits = cart[id];
      const lineTotal = priceOf(p) * qtyUnits;
      const sub = mode === "varejo"
        ? `${qtyUnits} un × ${BRL(priceOf(p))}`
        : `${qtyUnits / p.caixa} cx (${qtyUnits} un) × ${BRL(priceOf(p))}/un`;
      const disp = mode === "varejo" ? qtyUnits : qtyUnits / p.caixa;
      return `<div class="citem">
        <img src="${p.img}" alt="${p.name}" width="58" height="58" loading="lazy">
        <div class="ci-info">
          <h5>${p.name}</h5>
          <div class="ci-sub">${sub}</div>
          <div class="ci-foot">
            <div class="miniqty">
              <button onclick="changeQty('${id}',-1)" aria-label="Diminuir">−</button>
              <span>${disp}${mode === "atacado" ? " cx" : ""}</span>
              <button onclick="changeQty('${id}',1)" aria-label="Aumentar">+</button>
            </div>
            <div class="ci-price">${BRL(lineTotal)}</div>
          </div>
          <button class="rm" onclick="removeItem('${id}')">remover</button>
        </div>
      </div>`;
    }).join("");
  }
  const { total, units } = totals();
  document.getElementById("units").textContent = ids.length ? units : 0;
  document.getElementById("total").textContent = BRL(total);
  const warn = document.getElementById("minwarn");
  const co = document.getElementById("checkout");
  if (mode === "atacado" && total > 0 && total < MIN_ATACADO) {
    warn.textContent = `Faltam ${BRL(MIN_ATACADO - total)} para o pedido mínimo de revenda (${BRL(MIN_ATACADO)}).`;
    warn.classList.add("show");
    co.disabled = true;
  } else {
    warn.classList.remove("show");
    co.disabled = total <= 0;
  }
}

function checkout() {
  const ids = Object.keys(cart);
  if (!ids.length) return;
  let msg = `*Novo pedido — Caju Doce Sertão*\n`;
  msg += `Modo: *${mode === "varejo" ? "Consumo (varejo)" : "Revenda (atacado)"}*\n\n`;
  ids.forEach(id => {
    const p = PRODUCTS.find(x => x.id === id);
    const q = cart[id];
    const line = mode === "varejo"
      ? `• ${q}x ${p.name} (${p.vol}) — ${BRL(priceOf(p) * q)}`
      : `• ${q / p.caixa} cx (${q} un) ${p.name} — ${BRL(priceOf(p) * q)}`;
    msg += line + "\n";
  });
  msg += `\n*Total: ${BRL(totals().total)}*\n\nMeu nome é: `;
  openWhats(msg);
}

function openWhats(text) {
  window.open(`https://wa.me/${WHATS}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

function openCart() {
  document.getElementById("drawer").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}

function closeCart() {
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

let toastTimer;
function toast(m) {
  const t = document.getElementById("toast");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1900);
}

function pulseCount() {
  const c = document.getElementById("count");
  c.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }], { duration: 300 });
}

async function init() {
  document.getElementById("yr").textContent = new Date().getFullYear();
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

  try {
    const res = await fetch(PRODUCTS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    PRODUCTS = await res.json();
  } catch (err) {
    console.error("Falha ao carregar produtos:", err);
    document.getElementById("grid").innerHTML =
      `<p>Não foi possível carregar os produtos agora. Tente novamente em instantes.</p>`;
    return;
  }

  renderGrid();
  renderCart();
}

document.addEventListener("DOMContentLoaded", init);
