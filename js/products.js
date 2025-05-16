// Product functions
async function loadFeaturedProducts() {
    const productsContainer = document.getElementById('featured-products-grid');
    productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
    
    try {
        const response = await fetch(`${API_URL}/api/Product/All Products`);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const products = await response.json();
        
        // Take first 4 products as featured
        const featuredProducts = products.slice(0, 4);
        
        if (featuredProducts.length === 0) {
            productsContainer.innerHTML = '<p>No products available.</p>';
            return;
        }
        
        productsContainer.innerHTML = '';
        featuredProducts.forEach(product => {
            productsContainer.appendChild(createProductCard(product));
        });
    } catch (error) {
        productsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function loadAllProducts() {
    const productsContainer = document.getElementById('products-grid');
    productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
    
    try {
        console.log('Fetching products from:', `${API_URL}/api/Product/All Products`);
        const response = await fetch(`${API_URL}/api/Product/All Products`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('Products received:', products);
        
        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<p>No products available.</p>';
            return;
        }
        
        productsContainer.innerHTML = '';
        products.forEach(product => {
            productsContainer.appendChild(createProductCard(product));
        });
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Show sample data on error for development purposes
        const sampleProducts = [
            { productId: '1', name: 'Sample Smartphone', price: 799.99, description: 'Sample product' },
            { productId: '2', name: 'Sample Laptop', price: 1299.99, description: 'Sample product' },
            { productId: '3', name: 'Sample Headphones', price: 199.99, description: 'Sample product' }
        ];
        
        productsContainer.innerHTML = `
            <p>Error connecting to API: ${error.message}</p>
            <p>Showing sample data instead:</p>
        `;
        
        sampleProducts.forEach(product => {
            productsContainer.appendChild(createProductCard(product));
        });
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Using a placeholder image
    const imageSrc = product.image || 'https://via.placeholder.com/300';
    
    card.innerHTML = `
        <img src="${imageSrc}" alt="${product.name}" class="product-image">
        <div class="product-details">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-actions">
                <button class="add-to-cart-btn" data-id="${product.productId || product.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="view-details-btn" data-id="${product.productId || product.id}">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `;
    
    card.querySelector('.add-to-cart-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute('data-id');
        
        // Add animation to the card
        card.classList.add('product-added-animation');
        setTimeout(() => {
            card.classList.remove('product-added-animation');
        }, 600);
        
        // Call addToCart only once
        addToCart(productId);
    });
    
    // Add view details event listener
    card.querySelector('.view-details-btn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute('data-id');
        showProductDetails(productId);
    });
    
    return card;
}

// In products.js - update showProductDetails function
async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_URL}/api/Product/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to load product details');
        }
        
        const product = await response.json();
        const detailContent = document.getElementById('product-detail-content');
        
        // Using a placeholder image
        const imageSrc = product.image || 'https://via.placeholder.com/500';
        
        detailContent.innerHTML = `
            <div class="product-detail">
                <img src="${imageSrc}" alt="${product.name}" class="product-detail-image">
                <h2>${product.name}</h2>
                <p class="product-detail-price">$${product.price.toFixed(2)}</p>
                <p class="product-detail-description">${product.description || 'No description available'}</p>
                <p class="product-detail-stock">In Stock: ${product.stockQuantity || 'Unknown'}</p>
                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <label for="detail-quantity">Quantity:</label>
                        <div class="quantity-control detail-quantity-control">
                            <button class="quantity-btn detail-decrease-btn">-</button>
                            <input type="number" id="detail-quantity" class="quantity-input" value="1" min="1" max="${product.stockQuantity || 99}">
                            <button class="quantity-btn detail-increase-btn">+</button>
                        </div>
                    </div>
                    <button class="action-btn add-to-cart-detail-btn" data-id="${product.productId}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        // Setup quantity control
        const quantityInput = detailContent.querySelector('#detail-quantity');
        const decreaseBtn = detailContent.querySelector('.detail-decrease-btn');
        const increaseBtn = detailContent.querySelector('.detail-increase-btn');
        
        decreaseBtn.addEventListener('click', function() {
            const currentVal = parseInt(quantityInput.value);
            if (currentVal > 1) {
                quantityInput.value = currentVal - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            const currentVal = parseInt(quantityInput.value);
            const max = parseInt(quantityInput.max);
            if (currentVal < max) {
                quantityInput.value = currentVal + 1;
            }
        });
        
        // Add to cart event listener
        detailContent.querySelector('.add-to-cart-detail-btn').addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            addToCart(product.productId, quantity);
        });
        
        // Show modal
        showModal('product-modal');
    } catch (error) {
        console.error('Error loading product details:', error);
        showToast('Error loading product details: ' + error.message, 'error');
        
        // Show a fallback UI for development/testing
        const detailContent = document.getElementById('product-detail-content');
        detailContent.innerHTML = `
            <div class="product-detail">
                <img src="https://via.placeholder.com/500" alt="Product" class="product-detail-image">
                <h2>Product #${productId}</h2>
                <p class="product-detail-price">$99.99</p>
                <p class="product-detail-description">Mock product description for development.</p>
                <p class="product-detail-stock">In Stock: 10</p>
                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <label for="detail-quantity">Quantity:</label>
                        <div class="quantity-control detail-quantity-control">
                            <button class="quantity-btn detail-decrease-btn">-</button>
                            <input type="number" id="detail-quantity" class="quantity-input" value="1" min="1" max="10">
                            <button class="quantity-btn detail-increase-btn">+</button>
                        </div>
                    </div>
                    <button class="action-btn add-to-cart-detail-btn" data-id="${productId}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        // Setup quantity control for fallback UI
        const quantityInput = detailContent.querySelector('#detail-quantity');
        const decreaseBtn = detailContent.querySelector('.detail-decrease-btn');
        const increaseBtn = detailContent.querySelector('.detail-increase-btn');
        
        decreaseBtn.addEventListener('click', function() {
            const currentVal = parseInt(quantityInput.value);
            if (currentVal > 1) {
                quantityInput.value = currentVal - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            const currentVal = parseInt(quantityInput.value);
            const max = parseInt(quantityInput.max);
            if (currentVal < max) {
                quantityInput.value = currentVal + 1;
            }
        });
        
        // Add to cart event listener for fallback UI
        detailContent.querySelector('.add-to-cart-detail-btn').addEventListener('click', function() {
            const quantity = parseInt(quantityInput.value);
            addToCart(productId, quantity);
        });
        
        // Show modal
        document.getElementById('product-modal').style.display = 'flex';
    }
}

function filterProducts() {
    // This would filter the products based on the selected category
    // For simplicity, we'll just reload all products
    loadAllProducts();
}

function showAddProductForm() {
    document.getElementById('product-form-title').textContent = 'Add New Product';
    document.getElementById('product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-description').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-stock').value = '';
    
    showModal('product-form-modal');
}

async function showEditProductForm(productId) {
    try {
        const response = await fetch(`${API_URL}/api/Product/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to load product details');
        }
        
        const product = await response.json();
        
        document.getElementById('product-form-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.productId;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stockQuantity;
        document.getElementById('product-category').value = product.categoryId;
        
        showModal('product-form-modal');
    } catch (error) {
        showToast('Error loading product details: ' + error.message, 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stockQuantity = parseInt(document.getElementById('product-stock').value);
    const categoryId = document.getElementById('product-category').value;
    
    if (!jwtToken) {
        showToast('Please login to perform this action', 'warning');
        showLoginForm();
        return;
    }
    
    try {
        let url = `${API_URL}/api/Product/Add Product`;
        let method = 'POST';
        
        if (productId) {
            url = `${API_URL}/api/Product/${productId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ 
                name, 
                description, 
                price, 
                stockQuantity, 
                categoryId 
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save product');
        }
        
        // Close modal
    hideModal('product-form-modal');
        
        // Reload products
        loadAllProducts();
        
        showToast('Product saved successfully', 'success');
    } catch (error) {
        showToast('Error saving product: ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    if (!jwtToken) {
        showToast('Please login to perform this action', 'warning');
        showLoginForm();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/Product/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        // Reload products
        loadAllProducts();
        
        showToast('Product deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting product: ' + error.message, 'error');
    }
}