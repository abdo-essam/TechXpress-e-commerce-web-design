// Cart variables
let cart = [];

// Cart functions
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