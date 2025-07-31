const apiUrl = 'http://localhost:5000/api/products';

async function fetchProducts() {
  const res = await fetch(apiUrl);
  const data = await res.json();
  displayProducts(data.data);
}

function displayProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  products.forEach((p) => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `<h3>${p.name}</h3><p>${p.brand}</p><p>₹${p.retail_price}</p>`;
    div.onclick = () => fetchProduct(p.id);
    list.appendChild(div);
  });
}

async function fetchProduct(id) {
  const res = await fetch(`${apiUrl}/${id}`);
  const data = await res.json();
  displayProductDetail(data.data);
}

function displayProductDetail(p) {
  const detail = document.getElementById('product-detail');
  detail.innerHTML = `
    <h2>${p.name}</h2>
    <p><strong>Brand:</strong> ${p.brand}</p>
    <p><strong>Category:</strong> ${p.category}</p>
    <p><strong>Price:</strong> ₹${p.retail_price}</p>
    <p><strong>SKU:</strong> ${p.sku}</p>
    <hr />
  `;
}

fetchProducts();
