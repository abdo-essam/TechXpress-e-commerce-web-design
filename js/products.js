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
    const imageSrc = 'https://via.placeholder.com/300';
    
    card.innerHTML = `
        <img src="${imageSrc}" alt="${product.name}" class="product-image">
        <div class="product-details">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-actions">
                <button class="add-to-cart-btn" data-id="${product.productId}">Add to Cart</button>
                <button class="view-details-btn" data-id="${product.productId}">Details</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.add-to-cart-btn').addEventListener('click', function() {
        addToCart(product.productId);
    });
    
    card.querySelector('.view-details-btn').addEventListener('click', function() {
        showProductDetails(product.productId);
    });
    
    return card;
}

async function showProductDetails(productId) {
    try {
        const response = await fetch(`${API_URL}/api/Product/${productId}`);
        if (!response.ok) {
            throw new Error('Failed to load product details');
        }
        
        const product = await response.json();
        const detailContent = document.getElementById('product-detail-content');
        
        // Using a placeholder image
        const imageSrc = 'https://via.placeholder.com/500';
        
        detailContent.innerHTML = `
            <div class="product-detail">
                <img src="${imageSrc}" alt="${product.name}" class="product-detail-image">
                <h2>${product.name}</h2>
                <p class="product-detail-price">$${product.price.toFixed(2)}</p>
                <p class="product-detail-description">${product.description}</p>
                <p class="product-detail-stock">In Stock: ${product.stockQuantity}</p>
                <div class="product-detail-actions">
                    <button class="action-btn add-to-cart-detail-btn" data-id="${product.productId}">Add to Cart</button>
                </div>
            </div>
        `;
        
        // Add event listener
        document.querySelector('.add-to-cart-detail-btn').addEventListener('click', function() {
            addToCart(product.productId);
        });
        
        // Show modal
        document.getElementById('product-modal').style.display = 'flex';
    } catch (error) {
        showToast('Error loading product details: ' + error.message, 'error');
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
    
    document.getElementById('product-form-modal').style.display = 'flex';
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
        
        document.getElementById('product-form-modal').style.display = 'flex';
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
        document.getElementById('product-form-modal').style.display = 'none';
        
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