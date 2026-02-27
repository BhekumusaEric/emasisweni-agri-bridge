/**
 * Farmer Authentication Manager
 */
class FarmerAuth {
    constructor(dataService) {
        this.ds = dataService;
    }

    requireAuth() {
        const user = this.ds.getCurrentUser();
        if (!user) {
            // If not logged in and trying to access farmer portal, we should show login
            return false;
        }
        return true;
    }

    handleLogin(email, password) {
        return this.ds.login(email, password);
    }

    handleRegister(userData) {
        return this.ds.register(userData);
    }

    handleLogout() {
        this.ds.logout();
        window.location.reload(); // Refresh to clear portal state
    }
}

// Global instance if on services page
if (typeof DataService !== 'undefined' && window.location.pathname.includes('services')) {
    window.farmerAuth = new FarmerAuth(new DataService());
}
