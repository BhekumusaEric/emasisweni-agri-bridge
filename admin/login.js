// Login page only
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // Check if already logged in
    const auth = localStorage.getItem('adminAuth');
    const loginTime = localStorage.getItem('loginTime');
    
    if (auth && loginTime) {
        const sessionDuration = 24 * 60 * 60 * 1000;
        if ((Date.now() - parseInt(loginTime)) < sessionDuration) {
            window.location.href = 'admin/dashboard.html';
            return;
        }
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'admin' && password === 'emasisweni2025') {
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            window.location.href = 'admin/dashboard.html';
        } else {
            errorMessage.textContent = 'Invalid username or password';
        }
    });
});