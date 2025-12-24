// Dashboard auth check
(function() {
    const auth = localStorage.getItem('adminAuth');
    const loginTime = localStorage.getItem('loginTime');
    
    if (!auth || !loginTime) {
        window.location.href = '../admin.html';
        return;
    }
    
    const sessionDuration = 24 * 60 * 60 * 1000;
    if ((Date.now() - parseInt(loginTime)) >= sessionDuration) {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('loginTime');
        window.location.href = '../admin.html';
        return;
    }
})();