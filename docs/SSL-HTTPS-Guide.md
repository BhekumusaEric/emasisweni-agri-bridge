# SSL Certificate & HTTPS Setup Guide

## GitHub Pages SSL (Automatic)

### Enable HTTPS on GitHub Pages
1. **Repository Settings**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Custom domain" section
   - Check "Enforce HTTPS" checkbox
   - GitHub automatically provides SSL certificate

### Verification Steps
```bash
# Check SSL certificate
curl -I https://your-domain.com

# Verify HTTPS redirect
curl -I http://your-domain.com
```

## Custom Domain SSL Setup

### Step 1: Domain Configuration
```dns
# DNS Records for SSL
Type    Name    Value                    TTL
A       @       185.199.108.153         300
A       @       185.199.109.153         300
A       @       185.199.110.153         300
A       @       185.199.111.153         300
CNAME   www     username.github.io      300
```

### Step 2: GitHub Pages Configuration
1. Add CNAME file to repository root:
```
emasisweni-agri-bridge.co.za
```

2. Enable HTTPS in repository settings
3. Wait for SSL certificate provisioning (up to 24 hours)

## Alternative SSL Providers

### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --webroot -w /var/www/html -d emasisweni-agri-bridge.co.za

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare SSL (Free)
1. **Setup Cloudflare**
   - Add domain to Cloudflare
   - Update nameservers
   - Enable "Full (strict)" SSL mode

2. **Configuration**
   ```
   SSL/TLS → Overview → Full (strict)
   SSL/TLS → Edge Certificates → Always Use HTTPS: On
   ```

## HTTPS Enforcement

### HTML Meta Redirect
```html
<script>
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
</script>
```

### .htaccess (Apache)
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name emasisweni-agri-bridge.co.za www.emasisweni-agri-bridge.co.za;
    return 301 https://$server_name$request_uri;
}
```

## Security Headers for HTTPS

### Enhanced Security Headers
```html
<!-- Add to all HTML pages -->
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">
```

### Server Configuration
```
# Security Headers
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: upgrade-insecure-requests
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

## SSL Certificate Monitoring

### Certificate Expiry Check
```bash
# Check certificate expiry
echo | openssl s_client -servername emasisweni-agri-bridge.co.za -connect emasisweni-agri-bridge.co.za:443 2>/dev/null | openssl x509 -noout -dates
```

### Automated Monitoring Script
```bash
#!/bin/bash
# ssl-monitor.sh
DOMAIN="emasisweni-agri-bridge.co.za"
EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
EXPIRY_DATE=$(date -d "$EXPIRY" +%s)
CURRENT_DATE=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
    echo "SSL certificate expires in $DAYS_LEFT days!"
    # Send alert email
fi
```

## SSL Best Practices

### Certificate Chain Validation
- Ensure complete certificate chain
- Include intermediate certificates
- Verify root CA trust

### Security Configuration
```javascript
// Force HTTPS in JavaScript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}

// Update cookie security
document.cookie = "name=value; Secure; SameSite=Strict";
```

### Mixed Content Prevention
```html
<!-- Use protocol-relative URLs -->
<script src="//cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></script>

<!-- Or force HTTPS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></script>
```

## Troubleshooting SSL Issues

### Common Problems
1. **Mixed Content Warnings**
   - Update all HTTP resources to HTTPS
   - Use protocol-relative URLs
   - Check external CDN links

2. **Certificate Chain Issues**
   - Verify intermediate certificates
   - Check certificate order
   - Validate with SSL checker tools

3. **DNS Propagation Delays**
   - Wait 24-48 hours for DNS changes
   - Use DNS checker tools
   - Clear local DNS cache

### SSL Testing Tools
- SSL Labs Test: https://www.ssllabs.com/ssltest/
- SSL Checker: https://www.sslshopper.com/ssl-checker.html
- Mozilla Observatory: https://observatory.mozilla.org/

## Implementation for Emasisweni Agri-Bridge

### Current Setup (GitHub Pages)
```
Domain: emasisweni-agri-bridge.github.io
SSL: Automatic (GitHub provided)
Certificate: Let's Encrypt via GitHub
Renewal: Automatic
```

### Recommended Actions
1. ✅ Enable "Enforce HTTPS" in GitHub Pages settings
2. ✅ Add security headers to HTML pages
3. ✅ Update all internal links to use HTTPS
4. ✅ Test SSL configuration with online tools
5. ✅ Monitor certificate expiry

### Custom Domain Setup (Future)
```
1. Purchase domain: emasisweni-agri-bridge.co.za
2. Configure DNS records
3. Add CNAME file to repository
4. Enable HTTPS in GitHub settings
5. Wait for SSL certificate provisioning
```

## Maintenance Schedule

### Weekly Tasks
- [ ] Check HTTPS redirect functionality
- [ ] Verify SSL certificate validity
- [ ] Monitor mixed content warnings

### Monthly Tasks
- [ ] Run SSL security scan
- [ ] Check certificate expiry date
- [ ] Review security headers
- [ ] Update SSL monitoring scripts

### Quarterly Tasks
- [ ] Full SSL configuration audit
- [ ] Update security policies
- [ ] Review certificate chain
- [ ] Test disaster recovery procedures