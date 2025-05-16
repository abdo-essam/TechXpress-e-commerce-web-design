// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {

    // Replace this:
document.querySelectorAll('.close-modal').forEach(close => {
    close.addEventListener('click', function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

// With this:
document.querySelectorAll('.close-modal').forEach(close => {
    close.addEventListener('click', hideAllModals);
});

// Also update the window click event to close modals
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        hideAllModals();
    }
});

    // Add this in your main.js DOMContentLoaded event handler:
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

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
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navigateToPage(this.getAttribute('data-page'));
        });
    });

    // Auth event listeners
    document.getElementById('login-btn').addEventListener('click', showLoginForm);
    document.getElementById('register-btn').addEventListener('click', showRegisterForm);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('show-login').addEventListener('click', function (e) {
        e.preventDefault();
        showLoginForm();
    });
    document.getElementById('show-register').addEventListener('click', function (e) {
        e.preventDefault();
        showRegisterForm();
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(close => {
        close.addEventListener('click', function () {
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
    document.querySelector('.mobile-toggle').addEventListener('click', function () {
        document.querySelector('nav').classList.toggle('active');
    });

    // Search functionality
    document.getElementById('search-input').addEventListener('input', function () {
        // This would search products based on the input
        // For simplicity, we'll just reload all products
        loadAllProducts();
    });
});