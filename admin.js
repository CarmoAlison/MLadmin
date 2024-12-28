const API_URL = "https://sheetdb.io/api/v1/x06x83pnb1w3d";

let allProducts = []; // Para armazenar todos os produtos inicialmente carregados

// Função para gerar um ID único
function generateUniqueId() {
    return Date.now();
}

// Atualizar o estoque do produto na API
async function updateProductStock(id, newStock) {
    try {
        await fetch(`${API_URL}/id/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estoque: newStock }),
        });

        renderProducts(allProducts); // Atualizar produtos na tela
    } catch (error) {
        console.error("Erro ao atualizar estoque:", error);
        alert("Erro ao atualizar estoque. Tente novamente mais tarde.");
    }
}

// Renderizar produtos na tela
function renderProducts(products) {
    const productList = document.querySelector('.product-list');
    productList.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;

        productCard.innerHTML = `
            <img src="${product.imagem}" alt="${product.nome}">
            <h3>${product.nome}</h3>
            <p class="price">R$${parseFloat(product.preco).toFixed(2)}</p>
            <p class="stock">Estoque: <span id="stock-${product.id}">${product.estoque}</span></p>
            <div class="stock-controls">
                <button class="decrease-stock" data-id="${product.id}">-</button>
                <button class="increase-stock" data-id="${product.id}">+</button>
            </div>
            <p class="type">Tipo: ${product.tipo}</p>
            <button class="remove-product" data-id="${product.id}">Remover</button>
        `;

        productList.appendChild(productCard);
    });
}

// Carregar todos os produtos
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json(); // Armazenar os produtos na memória
        renderProducts(allProducts); // Exibir todos os produtos inicialmente
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        alert("Erro ao carregar produtos. Tente novamente mais tarde.");
    }
}

// Adicionar produto à API
async function addProduct(product) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        loadProducts(); // Recarregar a lista de produtos
    } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        alert("Erro ao adicionar produto. Tente novamente mais tarde.");
    }
}

// Remover produto da API
async function removeProduct(id) {
    try {
        await fetch(`${API_URL}/id/${id}`, {
            method: 'DELETE',
        });

        loadProducts(); // Recarregar a lista de produtos
    } catch (error) {
        console.error("Erro ao remover produto:", error);
        alert("Erro ao remover produto. Tente novamente mais tarde.");
    }
}

// Filtrar produtos com base na pesquisa
document.getElementById('search-bar').addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(product => 
        product.nome.toLowerCase().includes(searchText) || 
        product.descricao.toLowerCase().includes(searchText)
    );

    renderProducts(filteredProducts); // Renderizar os produtos filtrados
});

// Evento de envio do formulário
document.getElementById('product-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const type = document.getElementById('product-type').value;
    const stock = parseInt(document.getElementById('product-stock').value, 10);
    const imageInput = document.getElementById('product-image');
    const imageFile = imageInput.files[0];

    if (!imageFile) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const newProduct = {
            id: generateUniqueId(),
            imagem: e.target.result,
            nome: name,
            descricao: description,
            preco: price,
            tipo: type,
            estoque: stock,
        };

        addProduct(newProduct);

        document.getElementById('product-form').reset();
    };

    reader.readAsDataURL(imageFile);
});

// Eventos de clique para ações nos produtos
document.querySelector('.product-list').addEventListener('click', (event) => {
    const productId = event.target.getAttribute('data-id');

    if (event.target.classList.contains('remove-product')) {
        removeProduct(productId);
    } else if (event.target.classList.contains('increase-stock')) {
        const stockElement = document.getElementById(`stock-${productId}`);
        const newStock = parseInt(stockElement.textContent, 10) + 1;
        updateProductStock(productId, newStock);
    } else if (event.target.classList.contains('decrease-stock')) {
        const stockElement = document.getElementById(`stock-${productId}`);
        const newStock = Math.max(parseInt(stockElement.textContent, 10) - 1, 0);
        updateProductStock(productId, newStock);
    }
});

// Inicializar produtos
loadProducts();
