/**
 * services-router.js
 * Detects mobile vs web and redirects to the correct portal version.
 * Preserves any query-string or hash so deep links work.
 */
(function () {
    var isMobile =
        window.innerWidth < 768 ||
        /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Allow manual override via ?view=mobile or ?view=web in the URL
    var params = new URLSearchParams(window.location.search);
    var override = params.get('view'); // 'mobile' | 'web'
    if (override === 'mobile') isMobile = true;
    if (override === 'web') isMobile = false;

    var suffix = window.location.search + window.location.hash;
    var target = isMobile
        ? './services-mobile.html' + suffix
        : './services-web.html' + suffix;

    // Replace so Back button doesn't loop through the router
    window.location.replace(target);
})();
