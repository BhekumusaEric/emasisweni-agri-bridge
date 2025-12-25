# GitHub Pages Deployment Instructions

## Quick Setup Steps

### 1. Initialize Git Repository
```bash
cd /home/bhekumusa-eric-ntshwenya/emasisweni-agri-bridge
git init
git add .
git commit -m "Initial website commit"
```

### 2. Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `emasisweni-agri-bridge`
4. Make it Public
5. Don't initialize with README (you already have files)
6. Click "Create repository"

### 3. Connect Local to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/emasisweni-agri-bridge.git
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: "main"
5. Folder: "/ (root)"
6. Click "Save"

### 5. Access Your Website
After 5-10 minutes, visit:
```
https://YOUR_USERNAME.github.io/emasisweni-agri-bridge/
```

## Alternative: Local Development Server

### Option 1: Python Server
```bash
cd /home/bhekumusa-eric-ntshwenya/emasisweni-agri-bridge
python3 -m http.server 8000
```
Then visit: http://localhost:8000

### Option 2: Node.js Server
```bash
npx http-server
```
Then visit: http://localhost:8080

### Option 3: PHP Server
```bash
php -S localhost:8000
```
Then visit: http://localhost:8000

## Troubleshooting

### File Path Issues
- ❌ Don't open: `file:///home/user/folder/index.html`
- ✅ Use web server: `http://localhost:8000` or GitHub Pages

### GitHub Pages Not Working
1. Check repository is public
2. Verify Pages settings enabled
3. Wait 5-10 minutes for deployment
4. Check Actions tab for build status

### Local Server Issues
```bash
# Check if port is in use
netstat -tulpn | grep :8000

# Kill process if needed
sudo kill -9 $(lsof -t -i:8000)
```

## Quick Commands Summary

```bash
# Deploy to GitHub Pages
git add .
git commit -m "Update website"
git push origin main

# Run local server
python3 -m http.server 8000
```