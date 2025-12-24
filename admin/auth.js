// Authentication Service
class AuthService {
    constructor() {
        this.credentials = {
            username: 'admin',
            password: 'emasisweni2025'
        };
    }

    login(username, password) {
        if (username === this.credentials.username && password === this.credentials.password) {
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('loginTime');
        window.location.href = '../admin.html';
    }

    isAuthenticated() {
        const auth = localStorage.getItem('adminAuth');
        const loginTime = localStorage.getItem('loginTime');
        
        if (!auth || !loginTime) return false;
        
        // Session expires after 24 hours
        const sessionDuration = 24 * 60 * 60 * 1000;
        return (Date.now() - parseInt(loginTime)) < sessionDuration;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '../admin.html';
        }
    }
}

// Only run login logic if we're on the login page
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('login-form');
        const errorMessage = document.getElementById('error-message');
        const authService = new AuthService();

        // Redirect if already authenticated
        if (authService.isAuthenticated()) {
            window.location.href = 'admin/dashboard.html';
            return;
        }

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (authService.login(username, password)) {
                window.location.href = 'admin/dashboard.html';
            } else {
                errorMessage.textContent = 'Invalid username or password';
            }
        });
    });
}