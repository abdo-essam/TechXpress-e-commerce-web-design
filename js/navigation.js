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