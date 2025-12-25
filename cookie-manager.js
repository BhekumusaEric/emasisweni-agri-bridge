// Enhanced Cookie Manager with HTTPS Security
class CookieManager {
    constructor() {
        this.cookieConsent = this.getCookie('cookieConsent');
        this.isSecure = location.protocol === 'https:';
        this.init();
    }

    init() {
        // Force HTTPS in production
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            location.replace('https:' + window.location.href.substring(window.location.protocol.length));
            return;
        }
        
        if (!this.cookieConsent) {
            this.showCookieBanner();
        } else if (this.cookieConsent === 'accepted') {
            this.enableAnalytics();
        }
        this.loadUserPreferences();
    }

    setCookie(name, value, days = 365) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        const secure = this.isSecure ? '; Secure' : '';
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict${secure}`;
    }

    getCookie(name) {
        return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
    }

    showCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>We use cookies to improve your experience and analyze website traffic. 
                <a href="#privacy" onclick="togglePrivacyInfo()">Learn more</a></p>
                <div class="cookie-buttons">
                    <button onclick="cookieManager.acceptCookies()" class="btn-accept">Accept</button>
                    <button onclick="cookieManager.declineCookies()" class="btn-decline">Decline</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
    }

    acceptCookies() {
        this.setCookie('cookieConsent', 'accepted');
        this.enableAnalytics();
        this.removeCookieBanner();
    }

    declineCookies() {
        this.setCookie('cookieConsent', 'declined');
        this.removeCookieBanner();
    }

    removeCookieBanner() {
        const banner = document.querySelector('.cookie-banner');
        if (banner) banner.remove();
    }

    enableAnalytics() {
        // Google Analytics (when implemented)
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    }

    // User Preferences
    saveUserPreference(key, value) {
        if (this.cookieConsent === 'accepted') {
            this.setCookie(`pref_${key}`, value, 30);
        }
    }

    getUserPreference(key) {
        return this.getCookie(`pref_${key}`);
    }

    loadUserPreferences() {
        // Newsletter signup preference
        const newsletterPref = this.getUserPreference('newsletter');
        if (newsletterPref) {
            const emailInputs = document.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                if (input.placeholder.includes('email')) {
                    input.value = newsletterPref;
                }
            });
        }

        // Language preference (future use)
        const langPref = this.getUserPreference('language');
        if (langPref && langPref !== 'en') {
            // Future: Load translated content
        }
    }

    // Admin session management
    setAdminSession(token) {
        this.setCookie('adminSession', token, 0.083); // 2 hours
    }

    getAdminSession() {
        return this.getCookie('adminSession');
    }

    clearAdminSession() {
        this.setCookie('adminSession', '', -1);
    }
}

// Initialize cookie manager
const cookieManager = new CookieManager();

// Privacy info toggle
function togglePrivacyInfo() {
    const info = document.createElement('div');
    info.className = 'privacy-info';
    info.innerHTML = `
        <div class="privacy-content">
            <h3>Cookie Information</h3>
            <p><strong>Essential Cookies:</strong> Required for website functionality</p>
            <p><strong>Analytics Cookies:</strong> Help us understand visitor behavior</p>
            <p><strong>Preference Cookies:</strong> Remember your settings</p>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(info);
}