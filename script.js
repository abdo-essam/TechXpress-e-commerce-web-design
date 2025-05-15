// Global variables
const API_URL = 'https://localhost:3000';
let currentUser = null;
let userRole = null;
let jwtToken = null;
let cart = [];

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved token
    jwtToken = localStorage.getItem('jwtToken');
    const userData = localStorage.getItem('userData');
    
    if (jwtToken && userData) {
        currentUser = JSON.parse(userData);
        userRole = currentUser.role;
        updateUIForLoggedInUser();
    }
    
    // Initialize page navigation
    initNavigation();
    
    // Load initial data
    loadFeaturedProducts();
    loadCategories();
    
    // Event listeners for navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage(this.getAttribute('data-page'));
        });
    });
    
    // Auth event listeners
    document.getElementById('login-btn').addEventListener('click', showLoginForm);
    document.getElementById('register-btn').addEventListener('click', showRegisterForm);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        showLoginForm();
    });
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(close => {
        close.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Form submissions
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('register-form-element').addEventListener('submit', handleRegister);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('category-form').addEventListener('submit', handleCategorySubmit);
    
    // Admin actions
    document.getElementById('add-product-btn').addEventListener('click', showAddProductForm);
    document.getElementById('add-category-btn').addEventListener('click', showAddCategoryForm);
    
    // Mobile menu toggle
    document.querySelector('.mobile-toggle').addEventListener('click', function() {
        document.querySelector('nav').classList.toggle('active');
    });
});

// Navigation functions
function initNavigation() {
    const currentPage = localStorage.getItem('currentPage') || 'home';
    navigateToPage(currentPage);
}

function navigateToPage(page) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(page).classList.add('active');
    
    document.querySelectorAll('[data-page]').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll(`[data-page="${page}"]`).forEach(link => {
        link.classList.add('active');
    });
    
    localStorage.setItem('currentPage', page);
    
    if (page === 'products') {
        loadAllProducts();
    } else if (page === 'categories') {
        loadCategories();
    } else if (page === 'cart') {
        loadCartItems();
    }
}

// Auth functions
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'flex';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('auth-modal').style.display = 'flex';
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/api/Auth/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        
        // Save auth data
        jwtToken = data.token;
        currentUser = {
            username: data.username,
            email: data.email,
            role: data.role
        };
        userRole = data.role;
        
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal and show success
        document.getElementById('auth-modal').style.display = 'none';
        showToast('Logged in successfully', 'success');
        
        // Reset form
        document.getElementById('login-form-element').reset();
    } catch (error) {
        showToast('Login failed: ' + error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const address = document.getElementById('register-address').value;
    
    try {
        const response = await fetch(`${API_URL}/api/Auth/Register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username, 
                email, 
                password,
                address
            })
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        // Show success and switch to login
        showToast('Registration successful! Please login.', 'success');
        showLoginForm();
        
        // Reset form
        document.getElementById('register-form-element').reset();
    } catch (error) {
        showToast('Registration failed: ' + error.message, 'error');
    }
}

function logout() {
    // Clear auth data
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    jwtToken = null;
    currentUser = null;
    userRole = null;
    
    // Update UI
    document.getElementById('logged-in-state').style.display = 'none';
    document.getElementById('logged-out-state').style.display = 'flex';
    document.getElementById('admin-actions').style.display = 'none';
    document.getElementById('admin-category-actions').style.display = 'none';
    
    showToast('Logged out successfully', 'success');
    navigateToPage('home');
}

function updateUIForLoggedInUser() {
    document.getElementById('logged-out-state').style.display = 'none';
    document.getElementById('logged-in-state').style.display = 'flex';
    document.getElementById('username').textContent = currentUser.username;
    
    // Show admin controls if admin
    if (userRole === 'Admin' || userRole === 'Vendor') {
        document.getElementById('admin-actions').style.display = 'block';
        document.getElementById('admin-category-actions').style.display = 'block';
    }
}

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

async function addToCart(productId) {
    if (!jwtToken) {
        showToast('Please login to add items to cart', 'warning');
        showLoginForm();
        return;
    }
    
    try {
        // This is a placeholder - you'll need to implement the actual cart API endpoint
        // const response = await fetch(`${API_URL}/api/Cart/AddItem`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${jwtToken}`
        //     },
        //     body: JSON.stringify({ productId, quantity: 1 })
        // });
        
        // if (!response.ok) {
        //     throw new Error('Failed to add item to cart');
        // }
        
        // For now, just show a success message
        showToast('Item added to cart successfully', 'success');
    } catch (error) {
        showToast('Error adding to cart: ' + error.message, 'error');
    }
}

// Category functions
async function loadCategories() {
    const categoriesContainer = document.getElementById('categories-grid');
    categoriesContainer.innerHTML = '<div class="loading">Loading categories...</div>';
    
    // Update category dropdown for filters
    const categoryFilter = document.getElementById('category-filter');
    const productCategorySelect = document.getElementById('product-category');
    
    try {
        const response = await fetch(`${API_URL}/api/Category/All Categories`);
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        
        const categories = await response.json();
        
        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p>No categories available.</p>';
            return;
        }
        
        // Populate categories grid
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            categoriesContainer.appendChild(createCategoryCard(category));
        });
        
        // Populate category filter dropdown
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        productCategorySelect.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.categoryId;
            option.textContent = category.name;
            
            const optionClone = option.cloneNode(true);
            
            categoryFilter.appendChild(option);
            productCategorySelect.appendChild(optionClone);
        });
    } catch (error) {
        categoriesContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.setAttribute('data-id', category.categoryId);
    
    card.innerHTML = `
        <h3 class="category-name">${category.name}</h3>
        <p class="category-product-count">${category.products ? category.products.length : 0} Products</p>
    `;
    
    // Add admin controls if user is admin
    if (userRole === 'Admin' || userRole === 'Vendor') {
        const actions = document.createElement('div');
        actions.className = 'category-actions';
        
        actions.innerHTML = `
            <button class="edit-btn" data-id="${category.categoryId}">Edit</button>
            <button class="delete-btn" data-id="${category.categoryId}">Delete</button>
        `;
        
        // Add event listeners
        actions.querySelector('.edit-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            showEditCategoryForm(category.categoryId);
        });
        
        actions.querySelector('.delete-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            deleteCategory(category.categoryId);
        });
        
        card.appendChild(actions);
    }
    
    // Add click event to show products in this category
    card.addEventListener('click', function() {
        navigateToPage('products');
        document.getElementById('category-filter').value = category.categoryId;
        filterProducts();
    });
    
    return card;
}

async function showEditCategoryForm(categoryId) {
    try {
        const response = await fetch(`${API_URL}/api/Category/${categoryId}`);
        if (!response.ok) {
            throw new Error('Failed to load category details');
        }
        
        const category = await response.json();
        
        document.getElementById('category-form-title').textContent = 'Edit Category';
        document.getElementById('category-id').value = category.categoryId;
        document.getElementById('category-name').value = category.name;
        
        document.getElementById('category-form-modal').style.display = 'flex';
    } catch (error) {
        showToast('Error loading category details: ' + error.message, 'error');
    }
}

function showAddCategoryForm() {
    document.getElementById('category-form-title').textContent = 'Add New Category';
    document.getElementById('category-id').value = '';
    document.getElementById('category-name').value = '';
    
    document.getElementById('category-form-modal').style.display = 'flex';
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    
    if (!jwtToken) {
        showToast('Please login to perform this action', 'warning');
        showLoginForm();
        return;
    }
    
    try {
        let url = `${API_URL}/api/Category/Add Category`;
        let method = 'POST';
        
        if (categoryId) {
            url = `${API_URL}/api/Category/${categoryId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({ name })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save category');
        }
        
        // Close modal
        document.getElementById('category-form-modal').style.display = 'none';
        
        // Reload categories
        loadCategories();
        
        showToast('Category saved successfully', 'success');
    } catch (error) {
        showToast('Error saving category: ' + error.message, 'error');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    if (!jwtToken) {
        showToast('Please login to perform this action', 'warning');
        showLoginForm();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/Category/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete category');
        }
        
        // Reload categories
        loadCategories();
        
        showToast('Category deleted successfully', 'success');
    } catch (error) {
        showToast('Error deleting category: ' + error.message, 'error');
    }
}

// Product CRUD functions
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

// Cart functions
function loadCartItems() {
    if (!jwtToken) {
        document.getElementById('cart-items').innerHTML = '<p class="empty-cart">Please login to view your cart.</p>';
        return;
    }
    
    // This is a placeholder - you'll need to implement the actual cart API endpoint
    // In a real implementation, you would fetch cart items from the server
    document.getElementById('cart-items').innerHTML = `
        <div class="cart-item">
            <img src="https://via.placeholder.com/80" alt="Product" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-title">Sample Product</h3>
                <p class="cart-item-price">$99.99</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn">-</button>
                    <span class="quantity-value">1</span>
                    <button class="quantity-btn">+</button>
                </div>
                <button class="remove-item-btn">Remove</button>
            </div>
        </div>
    `;
    
    // Update cart summary
    document.getElementById('cart-subtotal').textContent = '$99.99';
    document.getElementById('checkout-btn').disabled = false;
}

// Utility functions
function filterProducts() {
    // This would filter the products based on the selected category
    // For simplicity, we'll just reload all products
    loadAllProducts();
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 4000);
    
    // Add close button functionality
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.remove();
    });
}

// Window click event to close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Search functionality
document.getElementById('search-input').addEventListener('input', function() {
    // This would search products based on the input
    // For simplicity, we'll just reload all products
    loadAllProducts();
});