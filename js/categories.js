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