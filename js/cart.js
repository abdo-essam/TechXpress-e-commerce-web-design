// cart.js - Complete implementation with all cart functions

// Cart variables
let cart = [];

// Initialize cart from local storage
function initCart() {
    const savedCart = localStorage.getItem('techXpressCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            cart = [];
        }
    }
}

// Save cart to local storage
function saveCart() {
    localStorage.setItem('techXpressCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart item count in the UI
function updateCartCount() {
    const cartLink = document.getElementById('cart-link');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartLink) {
        if (totalItems > 0) {
            cartLink.innerHTML = `<a href="#" data-page="cart"><i class="fas fa-shopping-cart"></i> Cart (${totalItems})</a>`;
        } else {
            cartLink.innerHTML = `<a href="#" data-page="cart"><i class="fas fa-shopping-cart"></i> Cart</a>`;
        }
    }
    
    // Reattach click event
    if (cartLink) {
        cartLink.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage('cart');
        });
    }
}

// Add product to cart
async function addToCart(productId, quantity = 1) {
    try {
        // Add visual feedback to the cart icon
        const cartIcon = document.querySelector('#cart-link i');
        if (cartIcon) {
            cartIcon.classList.add('cart-bump');
            setTimeout(() => {
                cartIcon.classList.remove('cart-bump');
            }, 500);
        }
        
        // Get product details
        const response = await fetch(`${API_URL}/api/Product/${productId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }
        
        const product = await response.json();
        
        // Check if product already in cart
        const existingItemIndex = cart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex >= 0) {
            // Update quantity if product already in cart
            cart[existingItemIndex].quantity += quantity;
            
            // Make sure we don't exceed available stock
            if (product.stockQuantity && cart[existingItemIndex].quantity > product.stockQuantity) {
                cart[existingItemIndex].quantity = product.stockQuantity;
                showToast(`Only ${product.stockQuantity} items available in stock`, 'warning');
            }
        } else {
            // Add new item to cart
            cart.push({
                productId: product.productId,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image || 'https://via.placeholder.com/80',
                maxQuantity: product.stockQuantity || 99
            });
        }
        
        // Save cart and show success message
        saveCart();
        showToast(`${product.name} added to cart`, 'success');
        
        // If on cart page, reload it to show the update
        if (document.getElementById('cart').classList.contains('active')) {
            loadCartItems();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        
        // Fallback for demo/development - add a mock item if API fails
        try {
            const mockProduct = {
                productId: productId,
                name: 'Product #' + productId,
                price: 99.99,
                image: 'https://via.placeholder.com/80'
            };
            
            const existingItemIndex = cart.findIndex(item => item.productId === productId);
            
            if (existingItemIndex >= 0) {
                cart[existingItemIndex].quantity += quantity;
            } else {
                cart.push({
                    productId: mockProduct.productId,
                    name: mockProduct.name,
                    price: mockProduct.price,
                    quantity: quantity,
                    image: mockProduct.image,
                    maxQuantity: 99
                });
            }
            
            saveCart();
            showToast('Added to cart (using mock data)', 'warning');
            
            if (document.getElementById('cart').classList.contains('active')) {
                loadCartItems();
            }
        } catch (fallbackError) {
            console.error('Even fallback failed:', fallbackError);
            showToast('Error adding item to cart: ' + error.message, 'error');
        }
    }
}

// Updated removeFromCart function
function removeFromCart(productId) {
    console.log('Removing product from cart:', productId);
    
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex >= 0) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        saveCart();
        loadCartItems();
        showToast(`${removedItem.name} removed from cart`, 'success');
    } else {
        console.warn('Product not found in cart:', productId);
    }
}

// Updated updateCartItemQuantity function
function updateCartItemQuantity(productId, quantity) {
    console.log('Updating quantity for product:', productId, 'to', quantity);
    
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex >= 0) {
        // Ensure quantity is at least 1
        quantity = Math.max(1, quantity);
        
        // Ensure quantity doesn't exceed max
        if (cart[itemIndex].maxQuantity) {
            quantity = Math.min(quantity, cart[itemIndex].maxQuantity);
        }
        
        // Update the quantity
        cart[itemIndex].quantity = quantity;
        
        // Save and reload
        saveCart();
        loadCartItems();
    } else {
        console.warn('Product not found in cart:', productId);
    }
}


// Calculate cart subtotal
function calculateSubtotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        loadCartItems();
        showToast('Cart cleared', 'success');
    }
}

// Updated loadCartItems function to fix delete, increase, and decrease functionality
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        document.getElementById('cart-subtotal').textContent = '$0.00';
        checkoutBtn.disabled = true;
        if (clearCartBtn) clearCartBtn.disabled = true;
        return;
    }
    
    // Generate HTML for cart items
    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item" data-id="${item.productId}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-btn" data-id="${item.productId}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-id="${item.productId}">+</button>
                    </div>
                    <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="remove-item-btn" data-id="${item.productId}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    
    // Update subtotal
    const subtotal = calculateSubtotal();
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    
    // Enable checkout and clear cart buttons
    checkoutBtn.disabled = false;
    if (clearCartBtn) clearCartBtn.disabled = false;
    
    // Add event listeners to decrease buttons
    const decreaseButtons = document.querySelectorAll('.decrease-btn');
    decreaseButtons.forEach(btn => {
        btn.onclick = function() {
            console.log('Decrease button clicked');
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.productId === productId);
            if (item && item.quantity > 1) {
                updateCartItemQuantity(productId, item.quantity - 1);
            }
        };
    });
    
    // Add event listeners to increase buttons
    const increaseButtons = document.querySelectorAll('.increase-btn');
    increaseButtons.forEach(btn => {
        btn.onclick = function() {
            console.log('Increase button clicked');
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.productId === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity + 1);
            }
        };
    });
    
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(btn => {
        btn.onclick = function() {
            console.log('Remove button clicked');
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        };
    });
    
    // Make sure checkout button has an event listener
    checkoutBtn.onclick = proceedToCheckout;
}
// Checkout process
function proceedToCheckout() {
    if (!jwtToken) {
        showToast('Please login to checkout', 'warning');
        showLoginForm();
        return;
    }
    
    // In a real implementation, you would redirect to a checkout page
    // or open a checkout modal
    alert('Checkout functionality would be implemented here. Current cart total: $' + calculateSubtotal().toFixed(2));
    
    // For this demo, we'll just clear the cart
    // clearCart();
}

// Debug function to check cart contents
function debugCart() {
    console.log('Current cart contents:', cart);
    
    if (cart.length === 0) {
        console.log('Cart is empty');
    } else {
        console.log(`Cart contains ${cart.length} unique items`);
        console.log(`Total items: ${cart.reduce((total, item) => total + item.quantity, 0)}`);
        console.log(`Total value: $${calculateSubtotal().toFixed(2)}`);
    }
    
    return cart;
}

// Expose debug function globally
window.debugCart = debugCart;