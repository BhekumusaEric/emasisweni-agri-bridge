// Admin Dashboard Controller
class AdminDashboard {
    constructor() {
        this.authService = new AuthService();
        this.dataService = new DataService();
        this.currentEditId = null;
        
        this.init();
    }

    init() {
        this.authService.requireAuth();
        this.setupEventListeners();
        this.loadNews();
        this.loadContacts();
    }

    setupEventListeners() {
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.authService.logout();
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Add news button
        document.getElementById('add-news-btn').addEventListener('click', () => {
            this.openNewsModal();
        });

        // News form
        document.getElementById('news-form').addEventListener('submit', (e) => {
            this.handleNewsSubmit(e);
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Image upload
        document.getElementById('article-image').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    loadNews() {
        const newsList = document.getElementById('admin-news-list');
        const news = this.dataService.getAllNews();
        
        newsList.innerHTML = news.map(article => `
            <div class="news-item">
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <small>Published: ${new Date(article.date).toLocaleDateString()}</small>
                <div class="news-actions">
                    <button class="btn-edit" onclick="dashboard.editNews(${article.id})">Edit</button>
                    <button class="btn-delete" onclick="dashboard.deleteNews(${article.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    loadContacts() {
        const contactsList = document.getElementById('contacts-list');
        const contacts = this.dataService.getAllContacts();
        
        contactsList.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <h3>${contact.organization || 'Individual'}</h3>
                <p><strong>Contact:</strong> ${contact['contact-name']}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
                <p><strong>Partnership Type:</strong> ${contact['partnership-type']}</p>
                <p><strong>Message:</strong> ${contact.message}</p>
                <small>Received: ${new Date(contact.date).toLocaleString()}</small>
                <div class="news-actions">
                    <button class="btn-delete" onclick="dashboard.deleteContact(${contact.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    openNewsModal(article = null) {
        const modal = document.getElementById('news-modal');
        const form = document.getElementById('news-form');
        
        if (article) {
            document.getElementById('modal-title').textContent = 'Edit Article';
            document.getElementById('article-id').value = article.id;
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-excerpt').value = article.excerpt;
            document.getElementById('article-content').value = article.content;
            this.currentEditId = article.id;
        } else {
            document.getElementById('modal-title').textContent = 'Add New Article';
            form.reset();
            this.currentEditId = null;
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('news-modal').style.display = 'none';
    }

    handleNewsSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const article = {
            title: formData.get('article-title'),
            excerpt: formData.get('article-excerpt'),
            content: formData.get('article-content'),
            image: this.currentImagePath || '../images/default-news.jpg'
        };

        if (this.currentEditId) {
            this.dataService.updateNews(this.currentEditId, article);
        } else {
            this.dataService.addNews(article);
        }

        this.loadNews();
        this.closeModal();
        this.updateMainSiteNews();
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // In a real implementation, you'd upload to server
            // For now, we'll use a placeholder path
            this.currentImagePath = `../images/${file.name}`;
        }
    }

    editNews(id) {
        const article = this.dataService.getAllNews().find(a => a.id === id);
        if (article) {
            this.openNewsModal(article);
        }
    }

    deleteNews(id) {
        if (confirm('Are you sure you want to delete this article?')) {
            this.dataService.deleteNews(id);
            this.loadNews();
            this.updateMainSiteNews();
        }
    }

    deleteContact(id) {
        if (confirm('Are you sure you want to delete this contact message?')) {
            this.dataService.deleteContact(id);
            this.loadContacts();
        }
    }

    updateMainSiteNews() {
        // Update the main site's news data
        const news = this.dataService.getAllNews();
        localStorage.setItem('publicNewsData', JSON.stringify(news));
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new AdminDashboard();
});