// ==================== CartMart App JavaScript ==================== //

// Global state
let currentUser = null;
let authToken = null;
let products = [];
let cartItems = [];

// API Base URL
const API_BASE = 'http://localhost:5000';

// Initialize app on document load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
    loadProducts();
    loadCart();
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Auth buttons
    document.getElementById('loginBtn').addEventListener('click', () => showAuthModal('login'));
    document.getElementById('registerBtn').addEventListener('click', () => showAuthModal('register'));
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Auth modal
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('authToggleLink').addEventListener('click', toggleAuthMode);
    document.querySelector('.modal-close').addEventListener('click', hideAuthModal);

    // Search and filter
    document.getElementById('productSearch').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);

    // Checkout form
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
}

// ==================== VIEW MANAGEMENT ==================== //

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected view
    document.getElementById(`${viewName}View`).classList.remove('hidden');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Load view-specific data
    switch (viewName) {
        case 'cart':
            loadCart();
            break;
        case 'profile':
            if (currentUser) loadProfile();
            break;
    }
}

// ==================== AUTHENTICATION ==================== //

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showAuthenticatedUI();
    } else {
        showUnauthenticatedUI();
    }
}

function showAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const registerFields = document.getElementById('registerFields');
    const toggleText = document.getElementById('authToggleText');

    if (mode === 'register') {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        registerFields.classList.remove('hidden');
        toggleText.innerHTML = 'Already have an account? <a href="#" id="authToggleLink">Login here</a>';
    } else {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        registerFields.classList.add('hidden');
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="authToggleLink">Register here</a>';
    }

    modal.classList.remove('hidden');
    document.getElementById('authUsername').focus();
}

function hideAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authForm').reset();
}

function toggleAuthMode(e) {
    e.preventDefault();
    const isLogin = document.getElementById('authTitle').textContent === 'Login';
    showAuthModal(isLogin ? 'register' : 'login');
}

async function handleAuth(e) {
    e.preventDefault();

    const isLogin = document.getElementById('authTitle').textContent === 'Login';
    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;

    if (isLogin) {
        await login(username, password);
    } else {
        const regUsername = document.getElementById('regUsername').value;
        await register(regUsername || username, password);
    }
}

async function register(username, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = { id: jwt_decode(data.token).id, username };
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showAuthenticatedUI();
            hideAuthModal();
            showNotification('Registration successful!', 'success');
            loadCart();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = { id: jwt_decode(data.token).id, username };
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            showAuthenticatedUI();
            hideAuthModal();
            showNotification('Login successful!', 'success');
            loadCart();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cartItems = [];
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showUnauthenticatedUI();
    switchView('products');
    showNotification('Logged out successfully', 'success');
}

function showAuthenticatedUI() {
    document.getElementById('authStatus').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('usernameDisplay').textContent = currentUser.username;
}

function showUnauthenticatedUI() {
    document.getElementById('authStatus').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
}

// ==================== PRODUCTS ==================== //

async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
        showNotification('Failed to load products', 'error');
    }
}

function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');

    if (productsToShow.length === 0) {
        grid.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }

    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="https://via.placeholder.com/150?text=${encodeURIComponent(product.name)}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-category">${product.category || 'General'}</div>
            </div>
            <div class="product-controls">
                <input type="number" value="1" min="1" class="quantity-input">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;

    let filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) &&
        (categoryFilter === '' || product.category === categoryFilter)
    );

    displayProducts(filtered);
}

// ==================== CART MANAGEMENT ==================== //

async function loadCart() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/dashboard/cart`, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            cartItems = await response.json();
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Failed to load cart:', error);
    }
}

async function addToCart(productId) {
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'error');
        showAuthModal('login');
        return;
    }

    const quantity = parseInt(document.querySelector(`[data-id="${productId}"] .quantity-input`).value);
    const product = products.find(p => p.id === productId);

    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/dashboard/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: JSON.stringify({
                product: product.name,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(`${product.name} added to cart!`, 'success');
            loadCart(); // Refresh cart
        } else {
            showNotification(data.message || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

async function updateCartItem(cartId, quantity) {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/dashboard/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            },
            body: JSON.stringify({ quantity })
        });

        if (response.ok) {
            loadCart();
        } else {
            const data = await response.json();
            showNotification(data.message || 'Failed to update cart', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

async function removeFromCart(cartId) {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/dashboard/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            showNotification('Item removed from cart', 'success');
            loadCart();
        } else {
            const data = await response.json();
            showNotification(data.message || 'Failed to remove item', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

function updateCartDisplay() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartCount = document.querySelector('.cart-count');

    // Update cart count
    const totalItems = cartItems.reduce((sum, item) => sum + item.nos, 0);
    cartCount.textContent = totalItems;

    if (cartItems.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <button class="btn-primary" onclick="switchView('products')">Start Shopping</button>
            </div>
        `;
        cartSummary.classList.add('hidden');
        return;
    }

    cartItemsEl.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.Product}</h4>
                <p>Quantity: ${item.nos}</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.nos - 1})">-</button>
                <span class="quantity">${item.nos}</span>
                <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.nos + 1})">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    cartSummary.classList.remove('hidden');
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => {
        const product = products.find(p => p.name === item.Product);
        return sum + (product ? product.price * item.nos : 0);
    }, 0);

    const shipping = subtotal > 500 ? 0 : 10;
    const tax = (subtotal + shipping) * 0.1;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
}

// ==================== CHECKOUT ==================== //

async function handleCheckout(e) {
    e.preventDefault();

    if (!currentUser || cartItems.length === 0) {
        showNotification('Please login and add items to cart', 'error');
        return;
    }

    // In a real app, you would send this data to your backend
    const formData = new FormData(e.target);
    const orderData = Object.fromEntries(formData);

    console.log('Order data:', orderData);

    // Simulate order processing
    showNotification('Order placed successfully! (This is a demo)', 'success');

    // Clear cart after successful order
    cartItems = [];
    updateCartDisplay();
    e.target.reset();
    switchView('products');
}

// ==================== PROFILE ==================== //

async function loadProfile() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/dashboard/profile`, {
            headers: { 'Authorization': authToken }
        });

        if (response.ok) {
            const profile = await response.json();
            document.getElementById('profileInfo').innerHTML = `
                <div class="profile-details">
                    <h3>Welcome, ${profile.username}!</h3>
                    <p>User ID: ${profile.id}</p>
                    <p>Member since: ${new Date().toLocaleDateString()}</p>
                </div>
            `;

            // Update stats
            document.getElementById('cartItemCount').textContent = cartItems.reduce((sum, item) => sum + item.nos, 0);
            document.getElementById('totalSpent').textContent = '$0.00'; // Would calculate from order history
        }
    } catch (error) {
        document.getElementById('profileInfo').innerHTML = '<p>Failed to load profile</p>';
    }
}

// ==================== UTILITIES ==================== //

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');

    messageEl.textContent = message;
    notification.className = `notification ${type}`;

    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Simple JWT decode (for demo purposes - use a proper library in production)
function jwt_decode(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (e) {
        return {};
    }
}

// Make functions globally available
window.switchView = switchView;
window.addToCart = addToCart;
window.updateCartItem = updateCartItem;
window.removeFromCart = removeFromCart;