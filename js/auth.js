// Auth variables
let currentUser = null;
let userRole = null;
let jwtToken = null;

// Auth functions
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    showModal('auth-modal');
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    showModal('auth-modal');
}


// auth.js - Updated login function
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        console.log('Attempting login with:', { email });
        
        const response = await fetch(`${API_URL}/api/Auth/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed. Please check your credentials.');
        }
        
        // Save auth data
        jwtToken = data.token;
        currentUser = {
            username: data.username || email.split('@')[0], // Fallback if username is not provided
            email: data.email || email,
            role: data.role || 'User'
        };
        userRole = currentUser.role;
        
        localStorage.setItem('jwtToken', jwtToken);
        localStorage.setItem('userData', JSON.stringify(currentUser));
        
        // Update UI
        updateUIForLoggedInUser();
        
        // Close modal and show success
    hideModal('auth-modal');
        showToast('Logged in successfully', 'success');
        
        // Reset form
        document.getElementById('login-form-element').reset();
    } catch (error) {
        console.error('Login error:', error);
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
        console.log('Attempting registration with:', { username, email });
        
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
        
        console.log('Registration response status:', response.status);
        
        // Always try to parse the response, even if status is not OK
        let data;
        try {
            data = await response.json();
            console.log('Registration response data:', data);
        } catch (err) {
            console.log('Could not parse response as JSON');
        }
        
        if (!response.ok) {
            throw new Error(data?.message || 'Registration failed. Please try again later.');
        }
        
        // Show success and switch to login
        showToast('Registration successful! Please login.', 'success');
        showLoginForm();
        
        // Reset form
        document.getElementById('register-form-element').reset();
    } catch (error) {
        console.error('Registration error:', error);
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