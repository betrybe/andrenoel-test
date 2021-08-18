const CLASS_TOTAL_PRICE = '.total-price';
const CLASS_CART_ITEMS = '.cart__items';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  if (event.type === 'click') {
    const item = this.innerText.split('|');
    const preco = parseFloat(item[2].substr(item[2].indexOf('$') + 1));
    const total = parseFloat(document.querySelector(CLASS_TOTAL_PRICE).innerText);
    document.querySelector(CLASS_TOTAL_PRICE).innerText = (total - preco);
    this.remove();
    localStorage.setItem('cart__items', document.querySelector(CLASS_CART_ITEMS).innerHTML);
  }
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  const total = parseFloat(document.querySelector(CLASS_TOTAL_PRICE).innerText);
  document.querySelector(CLASS_TOTAL_PRICE).innerText = (total + salePrice);
  return li;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  const BT = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  BT.addEventListener('click', () => {
    const URL = `https://api.mercadolibre.com/items/${sku}`;
    fetch(`${URL}`).then((body) => body.json())
      .then((data) => {
        const ITEM = { sku: data.id, name: data.title, salePrice: data.price };
        document.querySelector(CLASS_CART_ITEMS).append(createCartItemElement(ITEM));
        localStorage.setItem('cart__items', document.querySelector(CLASS_CART_ITEMS).innerHTML);
      })
      .catch((error) => console.error('Erro:', error.message || error));
  });
  section.appendChild(BT);
  return section;
}

function emptyCart() {
  document.querySelector(CLASS_CART_ITEMS).innerHTML = '';
  localStorage.setItem('cart__items', document.querySelector(CLASS_CART_ITEMS).innerHTML);
  document.querySelector(CLASS_TOTAL_PRICE).innerText = '0.00';
}

function loadCart() {
  document.querySelector('.empty-cart').addEventListener('click', emptyCart);
  if (localStorage.getItem('cart__items')) {
    document.querySelector(CLASS_CART_ITEMS).innerHTML = localStorage.getItem('cart__items');
  }

  const e = document.createElement('div');
  e.className = 'total';
  e.innerHTML = 'Preço total: $<span class=\'total-price\'>0.00<span>';
  document.querySelector('.cart').append(e);

  document.querySelectorAll('.cart__items li').forEach((it) => {
    it.addEventListener('click', cartItemClickListener);
    const item = it.innerText.split('|');
    const preco = parseFloat(item[2].substr(item[2].indexOf('$') + 1));
    const total = parseFloat(document.querySelector(CLASS_TOTAL_PRICE).innerText);
    document.querySelector(CLASS_TOTAL_PRICE).innerText = (total + preco);
  });
}

function showLoading() {
  const e = document.createElement('div');
  e.className = 'loading';
  e.innerHTML = 'Loading...';
  document.querySelector('.items').append(e);
}

function hideLoading() {
  document.querySelector('.loading').remove();
}

window.onload = () => {
  loadCart();
  const QUERY = 'computador';
  const URL = `https://api.mercadolibre.com/sites/MLB/search?q=${QUERY}`;
  showLoading();
  fetch(`${URL}`)
    .then((body) => body.json())
    .then((data) => {
      hideLoading();
      const PRODUTOS = data.results;
      PRODUTOS.forEach((item, i) => {
        const PRODUTO_ITEM = { sku: item.id, name: item.title, image: item.thumbnail };
        document.querySelector('.items').append(createProductItemElement(PRODUTO_ITEM));
      });
    })
    .catch((error) => console.error('Erro:', error.message || error));
};
