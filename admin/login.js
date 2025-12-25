// Login page security enhancements
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    let loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    let lastAttempt = parseInt(localStorage.getItem('lastAttempt') || '0');
    
    // Rate limiting - 5 attempts per hour
    const RATE_LIMIT = 5;
    const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
    
    function isRateLimited() {
        const now = Date.now();
        if (now - lastAttempt > RATE_WINDOW) {
            loginAttempts = 0;
            localStorage.setItem('loginAttempts', '0');
        }
        return loginAttempts >= RATE_LIMIT;
    }
    
    // Check if already logged in
    const auth = localStorage.getItem('adminAuth');
    const loginTime = localStorage.getItem('loginTime');
    
    if (auth && loginTime) {
        const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        if ((Date.now() - parseInt(loginTime)) < sessionDuration) {
            window.location.href = 'admin/dashboard.html';
            return;
        } else {
            // Session expired
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('loginTime');
        }
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isRateLimited()) {
            errorMessage.textContent = 'Too many login attempts. Please try again later.';
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Simple hash check (in production, use proper authentication)
        const validHash = btoa(username + ':' + password);
        const expectedHash = btoa('admin:emasisweni2025');
        
        if (validHash === expectedHash) {
            // Reset attempts on successful login
            localStorage.setItem('loginAttempts', '0');
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            
            window.location.href = 'admin/dashboard.html';
        } else {
            loginAttempts++;
            localStorage.setItem('loginAttempts', loginAttempts.toString());
            localStorage.setItem('lastAttempt', Date.now().toString());
            
            errorMessage.textContent = `Invalid credentials. ${RATE_LIMIT - loginAttempts} attempts remaining.`;
            
            // Clear password field
            document.getElementById('password').value = '';
        }
    });
    
    // Clear error message on input
    document.getElementById('username').addEventListener('input', () => {
        errorMessage.textContent = '';
    });
    
    document.getElementById('password').addEventListener('input', () => {
        errorMessage.textContent = '';
    });
});