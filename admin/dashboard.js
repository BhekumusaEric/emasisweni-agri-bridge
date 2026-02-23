// =============================================
// Admin Dashboard Controller — Emasisweni Agri-Bridge
// Fully revamped: image preview, rich editor,
// replace-image, drag & drop, toast feedback
// =============================================

class AdminDashboard {
    constructor() {
        this.dataService = new DataService();
        this.currentEditId = null;
        this.currentImageData = null; // base64 data URL or existing path
        this.init();
    }

    init() {
        this.setupNav();
        this.setupModal();
        this.setupImageUpload();
        this.setupRichEditor();
        this.setupContacts();
        this.setupLogout();
        this.loadNews();
        this.loadContacts();
    }

    // ──────────────────────────────
    // Navigation / Tabs
    // ──────────────────────────────
    setupNav() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                document.getElementById(`${tab}-tab`).classList.add('active');
            });
        });
    }

    // ──────────────────────────────
    // Logout
    // ──────────────────────────────
    setupLogout() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('loginTime');
            window.location.href = '../admin.html';
        });
    }

    // ──────────────────────────────
    // Modal open / close
    // ──────────────────────────────
    setupModal() {
        // Open new article
        document.getElementById('add-news-btn').addEventListener('click', () => {
            this.openModal();
        });

        // Close buttons
        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-article-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('article-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('article-modal')) this.closeModal();
        });

        // Form submit
        document.getElementById('article-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveArticle();
        });

        // Character counts
        const titleInput = document.getElementById('article-title');
        const excerptInput = document.getElementById('article-excerpt');
        const updateCounts = () => {
            document.getElementById('title-count').textContent = `${titleInput.value.length} / 150`;
            document.getElementById('excerpt-count').textContent = `${excerptInput.value.length} / 300`;
        };
        titleInput.addEventListener('input', updateCounts);
        excerptInput.addEventListener('input', updateCounts);
    }

    openModal(article = null) {
        const modal = document.getElementById('article-modal');
        const form = document.getElementById('article-form');

        form.reset();
        this.resetImageUI();
        document.getElementById('article-content-editor').innerHTML = '';
        this.currentEditId = null;
        this.currentImageData = null;

        if (article) {
            document.getElementById('modal-title').textContent = 'Edit Article';
            document.getElementById('article-id').value = article.id;
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-excerpt').value = article.excerpt;
            document.getElementById('article-content-editor').innerHTML = article.content || '';
            document.getElementById('article-category').value = article.category || 'news';
            this.currentEditId = article.id;

            // Show existing image
            if (article.image) {
                this.currentImageData = article.image;
                this.showImagePreview(article.image);
            }
        } else {
            document.getElementById('modal-title').textContent = 'New Article';
        }

        // Update char counts
        document.getElementById('title-count').textContent = `${document.getElementById('article-title').value.length} / 150`;
        document.getElementById('excerpt-count').textContent = `${document.getElementById('article-excerpt').value.length} / 300`;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.getElementById('article-title').focus();
    }

    closeModal() {
        document.getElementById('article-modal').classList.remove('open');
        document.body.style.overflow = '';
    }

    // ──────────────────────────────
    // Image upload & preview
    // ──────────────────────────────
    setupImageUpload() {
        const dropZone = document.getElementById('image-drop-zone');
        const fileInput = document.getElementById('article-image');

        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.processImageFile(file);
        });

        // Drag & drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processImageFile(file);
            } else {
                this.showToast('Please drop an image file.', 'error');
            }
        });

        // Replace / remove buttons
        document.getElementById('replace-image-btn').addEventListener('click', () => {
            fileInput.click();
        });
        document.getElementById('remove-image-btn').addEventListener('click', () => {
            this.currentImageData = null;
            this.resetImageUI();
            fileInput.value = '';
        });
    }

    processImageFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('Image too large — max 10 MB.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            this.currentImageData = ev.target.result;
            this.showImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(src) {
        document.getElementById('upload-placeholder').style.display = 'none';
        const wrap = document.getElementById('image-preview-wrap');
        wrap.style.display = 'flex';
        document.getElementById('image-preview').src = src;
    }

    resetImageUI() {
        document.getElementById('upload-placeholder').style.display = 'flex';
        document.getElementById('image-preview-wrap').style.display = 'none';
        document.getElementById('image-preview').src = '';
    }

    // ──────────────────────────────
    // Rich text editor toolbar
    // ──────────────────────────────
    setupRichEditor() {
        document.querySelectorAll('#editor-toolbar button').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                if (cmd === 'h2') {
                    document.execCommand('formatBlock', false, 'H2');
                } else {
                    document.execCommand(cmd, false, null);
                }
                document.getElementById('article-content-editor').focus();
            });
        });
    }

    // ──────────────────────────────
    // Save article (add or update)
    // ──────────────────────────────
    saveArticle() {
        const title   = document.getElementById('article-title').value.trim();
        const excerpt = document.getElementById('article-excerpt').value.trim();
        const content = document.getElementById('article-content-editor').innerHTML.trim();
        const category = document.getElementById('article-category').value;

        if (!title || !excerpt || !content) {
            this.showToast('Please fill in all required fields.', 'error');
            return;
        }

        const article = {
            title,
            excerpt,
            content,
            category,
            image: this.currentImageData || null
        };

        const btn = document.getElementById('save-article-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

        setTimeout(() => {
            if (this.currentEditId) {
                this.dataService.updateNews(this.currentEditId, article);
                this.showToast('Article updated successfully!', 'success');
            } else {
                this.dataService.addNews(article);
                this.showToast('Article published!', 'success');
            }

            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Save Article';
            this.closeModal();
            this.loadNews();
            this.syncPublicNews();
        }, 300);
    }

    // ──────────────────────────────
    // Load & render news articles
    // ──────────────────────────────
    loadNews() {
        const list = document.getElementById('admin-news-list');
        const news = this.dataService.getAllNews();

        if (!news.length) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>No articles yet. Click <strong>New Article</strong> to get started.</p>
                </div>`;
            return;
        }

        list.innerHTML = news.map(article => {
            const imgTag = article.image
                ? `<img src="${article.image}" alt="${this.escape(article.title)}" class="article-card-img">`
                : `<div class="article-card-img-placeholder"><i class="fas fa-image"></i></div>`;

            const category = article.category || 'news';
            const categoryLabel = {
                news: 'General News', training: 'Training', impact: 'Community Impact',
                partnership: 'Partnerships', sustainability: 'Sustainability'
            }[category] || 'News';

            const date = article.date ? new Date(article.date).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' }) : '';

            return `
                <div class="article-card">
                    ${imgTag}
                    <div class="article-card-body">
                        <span class="article-card-category">${categoryLabel}</span>
                        <div class="article-card-title">${this.escape(article.title)}</div>
                        <div class="article-card-excerpt">${this.escape(article.excerpt)}</div>
                        <div class="article-card-meta">
                            <span><i class="far fa-calendar-alt"></i> ${date}</span>
                        </div>
                        <div class="article-card-actions">
                            <button class="btn-edit" onclick="dashboard.editArticle(${article.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn-delete" onclick="dashboard.deleteArticle(${article.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    editArticle(id) {
        const article = this.dataService.getAllNews().find(a => a.id === id);
        if (article) this.openModal(article);
    }

    deleteArticle(id) {
        if (!confirm('Delete this article? This cannot be undone.')) return;
        this.dataService.deleteNews(id);
        this.loadNews();
        this.syncPublicNews();
        this.showToast('Article deleted.', 'success');
    }

    syncPublicNews() {
        localStorage.setItem('publicNewsData', JSON.stringify(this.dataService.getAllNews()));
    }

    // ──────────────────────────────
    // Contacts
    // ──────────────────────────────
    setupContacts() {
        document.getElementById('clear-contacts-btn').addEventListener('click', () => {
            if (confirm('Clear ALL contact messages? This cannot be undone.')) {
                localStorage.setItem('contactMessages', '[]');
                this.loadContacts();
                this.showToast('All messages cleared.', 'success');
            }
        });
    }

    loadContacts() {
        const list = document.getElementById('contacts-list');
        const contacts = this.dataService.getAllContacts();
        const badge = document.getElementById('contacts-badge');

        // Update badge
        if (contacts.length > 0) {
            badge.textContent = contacts.length;
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }

        if (!contacts.length) {
            list.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:4rem 2rem;color:#6b7b6b;">
                    <i class="fas fa-inbox" style="font-size:3rem;margin-bottom:1rem;color:#7ab892;display:block;"></i>
                    <p>No contact messages yet.</p>
                </div>`;
            return;
        }

        list.innerHTML = contacts.map(c => {
            const name = this.escape(c['contact-name'] || 'Unknown');
            const org  = this.escape(c.organization || 'Individual');
            const email = this.escape(c.email || '');
            const phone = this.escape(c.phone || 'N/A');
            const type  = this.escape(c['partnership-type'] || 'N/A');
            const msg   = this.escape(c.message || '');
            const date  = c.date ? new Date(c.date).toLocaleString('en-ZA') : '';

            return `
                <div class="contact-card">
                    <div class="contact-card-info">
                        <h3>${org}</h3>
                        <p><strong>Contact:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Partnership:</strong> ${type}</p>
                        <div class="contact-card-msg">${msg}</div>
                    </div>
                    <div class="contact-card-actions">
                        <span class="contact-date">${date}</span>
                        <button class="btn-delete" onclick="dashboard.deleteContact(${c.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>`;
        }).join('');
    }

    deleteContact(id) {
        if (!confirm('Delete this message?')) return;
        this.dataService.deleteContact(id);
        this.loadContacts();
        this.showToast('Message deleted.', 'success');
    }

    // ──────────────────────────────
    // Toast notification
    // ──────────────────────────────
    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = `toast ${type} show`;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ──────────────────────────────
    // Utility: escape HTML
    // ──────────────────────────────
    escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

// Initialise
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new AdminDashboard();
});