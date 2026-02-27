/**
 * services.js — Services Portal Logic
 * Emasisweni Agri-Bridge
 */
'use strict';

// Global Instances
const ds = new DataService();
const auth = new FarmerAuth(ds);

const PRODUCE_EMOJI = {
    'Vegetables (Leafy Greens)': '🥬', 'Vegetables (Root Crops)': '🥕',
    'Fruit': '🍎', 'Poultry': '🐔', 'Livestock': '🐄',
    'Maize / Grain': '🌽', 'Eggs': '🥚', 'Compost / Organic Matter': '♻️', 'Other': '🌾'
};

/* ==================== INIT ==================== */
document.addEventListener('DOMContentLoaded', () => {
    // Check saved role first
    const savedRole = sessionStorage.getItem('agri_role');
    if (savedRole) {
        showPortal(savedRole);
    }

    initTabSwitching();
    initServicePills();
    updateUIForUser();

    // Initial renders
    renderFarmerStatusList();
    renderFarmerProduceList();
    renderMarketProduceGrid();
});

/* ==================== AUTH UI LOGIC ==================== */
function openAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.textContent.toLowerCase() === tab));
    document.querySelectorAll('.auth-view').forEach(v => v.classList.toggle('active', v.id === tab + '-view'));
}

async function handleAuthSubmit(e, mode) {
    e.preventDefault();
    let result;
    if (mode === 'login') {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;
        result = auth.handleLogin(email, pass);
    } else {
        const userData = {
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            area: document.getElementById('reg-area').value,
            password: document.getElementById('reg-pass').value
        };
        result = auth.handleRegister(userData);
        if (result.success) {
            // Auto login after registration
            result = auth.handleLogin(userData.email, userData.password);
        }
    }

    if (result.success) {
        closeAuthModal();
        updateUIForUser();
        showToast('Welcome, ' + result.user.name + '!', 'success');
        // Refresh data
        renderFarmerStatusList();
        renderFarmerProduceList();
        refreshFarmerStats();
    } else {
        showToast(result.message, 'error');
    }
}

function toggleAuthPanel() {
    const user = ds.getCurrentUser();
    if (!user) {
        openAuthModal();
        return;
    }
    const panel = document.getElementById('auth-panel');
    const shown = panel.style.display !== 'none';
    panel.style.display = shown ? 'none' : 'block';

    if (!shown) {
        document.getElementById('auth-panel-content').innerHTML = `
            <div class="auth-panel-user">
                <strong>${esc(user.name)}</strong>
                <span>${esc(user.email)}</span>
            </div>
            <button class="auth-btn-logout" style="margin-bottom: 0.5rem; background: var(--secondary);" onclick="openProfileModal()">
                <i class="fas fa-user-edit"></i> Manage Profile
            </button>
            <button class="auth-btn-logout" onclick="auth.handleLogout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }
}

function openProfileModal() {
    const user = ds.getCurrentUser();
    if (!user) return;

    // Populate form
    document.getElementById('prof-name').value = user.name || '';
    document.getElementById('prof-email').value = user.email || '';
    document.getElementById('prof-phone').value = user.phone || '';
    document.getElementById('prof-area').value = user.area || '';

    document.getElementById('profile-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    toggleAuthPanel(); // Close the panel so it's not behind the modal
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function handleProfileSubmit(e) {
    e.preventDefault();
    const user = ds.getCurrentUser();
    if (!user) return;

    const updatedData = {
        name: document.getElementById('prof-name').value.trim(),
        phone: document.getElementById('prof-phone').value.trim(),
        area: document.getElementById('prof-area').value.trim()
    };

    const res = ds.updateUser(user.id, updatedData);
    if (res.success) {
        closeProfileModal();
        updateUIForUser();
        renderFarmerProduceList(); // Refresh any list that shows the user's name
        showToast('Profile updated successfully!', 'success');
    } else {
        showToast(res.message, 'error');
    }
}

function updateUIForUser() {
    const user = ds.getCurrentUser();
    const label = document.getElementById('user-name-label');
    const greeting = document.getElementById('farmer-greeting');

    const hr = new Date().getHours();
    const timeGreet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

    if (user) {
        if (label) {
            label.textContent = user.name;
            label.style.display = 'inline';
        }
        if (greeting) greeting.textContent = `${timeGreet}, ${user.name} 👋`;
        // Pre-fill forms
        if (document.getElementById('p-farmer-name')) document.getElementById('p-farmer-name').value = user.name;
        if (document.getElementById('p-phone')) document.getElementById('p-phone').value = user.phone;
        if (document.getElementById('p-location')) document.getElementById('p-location').value = user.area;

        if (document.getElementById('app-name')) document.getElementById('app-name').value = user.name;
        if (document.getElementById('app-phone')) document.getElementById('app-phone').value = user.phone;
        if (document.getElementById('app-email')) document.getElementById('app-email').value = user.email;
        if (document.getElementById('app-area')) document.getElementById('app-area').value = user.area;

        refreshFarmerStats();
    } else {
        if (label) label.style.display = 'none';
        if (greeting) greeting.textContent = `${timeGreet}, Farmer 👋`;
    }
}

/* ==================== ROLE SELECTOR ==================== */
function selectRole(role) {
    sessionStorage.setItem('agri_role', role);
    showPortal(role);

    // If farmer and not logged in, prompt login
    if (role === 'farmer' && !ds.getCurrentUser()) {
        setTimeout(openAuthModal, 500);
    }
}

function showPortal(role) {
    document.getElementById('role-screen').style.display = 'none';
    const app = document.getElementById('portal-app');
    if (app) app.style.display = 'flex';

    ['farmer-portal', 'market-portal', 'partner-portal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const titles = { farmer: 'Farmer Services', market: 'Market Portal', partner: 'Partner Portal' };
    const titleEl = document.getElementById('portal-title');
    if (titleEl) titleEl.textContent = titles[role] || 'Services';

    const portalId = role + '-portal';
    const portal = document.getElementById(portalId);
    if (portal) portal.style.display = 'block';
}

function goBackToRoleScreen() {
    sessionStorage.removeItem('agri_role');
    document.getElementById('role-screen').style.display = 'flex';
    document.getElementById('portal-app').style.display = 'none';
}

/* ==================== TAB SWITCHING ==================== */
function initTabSwitching() {
    document.querySelectorAll('.sec-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (!target) return;

            // Check auth for protected tables
            if (['ftab-produce', 'ftab-apply', 'ftab-status'].includes(target) && !ds.getCurrentUser()) {
                openAuthModal();
                return;
            }

            const portalView = btn.closest('.portal-view');
            const tabs = btn.closest('.section-tabs');

            tabs.querySelectorAll('.sec-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');

            portalView.querySelectorAll('.sec-panel').forEach(p => p.classList.remove('active'));
            const targetPanel = document.getElementById(target);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}

function switchFarmerTab(tabId, serviceType) {
    // Check auth
    if (!ds.getCurrentUser()) {
        openAuthModal();
        return;
    }

    document.querySelectorAll('#farmer-portal .sec-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.target === tabId);
    });
    document.querySelectorAll('#farmer-portal .sec-panel').forEach(p => {
        p.classList.toggle('active', p.id === tabId);
    });

    if (serviceType && tabId === 'ftab-apply') {
        document.querySelectorAll('.svc-pill').forEach(p => {
            p.classList.toggle('active', p.dataset.svc === serviceType);
        });
        updateApplicationForm(serviceType);
    }
}

/* ==================== SERVICE PILLS ==================== */
function initServicePills() {
    document.querySelectorAll('.svc-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.svc-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const typeInput = document.getElementById('app-service-type');
            if (typeInput) typeInput.value = pill.dataset.svc;
            updateApplicationForm(pill.dataset.svc);
        });
    });
    updateApplicationForm('training');
}

function updateApplicationForm(svc) {
    const field = document.getElementById('app-specific-field');
    if (!field) return;
    const configs = {
        training: {
            label: 'Which training area interests you most?',
            html: `<select id="app-specific"><option value="">Select...</option><option>Vegetable Production</option><option>Poultry Farming</option><option>Livestock Management</option><option>Agro-Processing</option><option>Business Skills</option><option>All Areas</option></select>`
        },
        waste: {
            label: 'Type of waste you need managed',
            html: `<select id="app-specific"><option value="">Select...</option><option>Crop Residues</option><option>Livestock Manure</option><option>Farm Plastics</option><option>Agro-Processing By-products</option><option>Mixed/General Farm Waste</option></select>`
        },
        agro: {
            label: 'What would you like to process?',
            html: `<input type="text" id="app-specific" placeholder="e.g. Tomatoes into sauce, Chickens into portions">`
        },
        food: {
            label: 'School/Community name',
            html: `<input type="text" id="app-specific" placeholder="e.g. Impendle Primary School">`
        },
        climate: {
            label: 'Current farming challenge',
            html: `<select id="app-specific"><option value="">Select...</option><option>Drought / Water Scarcity</option><option>Soil Degradation</option><option>Pest Pressure</option><option>Flooding / Erosion</option><option>Temperature Extremes</option></select>`
        },
        market: {
            label: 'Produce you want to sell',
            html: `<input type="text" id="app-specific" placeholder="e.g. Spinach, 50 kg per week">`
        }
    };
    const cfg = configs[svc] || configs.training;
    field.innerHTML = `<label>${cfg.label}</label>${cfg.html}`;
}

/* ==================== PRODUCE LISTING ==================== */
function openProduceForm() {
    if (!ds.getCurrentUser()) {
        openAuthModal();
        return;
    }
    document.getElementById('produce-form-wrap').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProduceForm() {
    document.getElementById('produce-form-wrap').style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('produce-form').reset();
    updateUIForUser(); // Restore defaults
}

function submitProduceListing(e) {
    e.preventDefault();
    const user = ds.getCurrentUser();
    if (!user) return;

    const listing = {
        farmerName: document.getElementById('p-farmer-name').value.trim(),
        phone: document.getElementById('p-phone').value.trim(),
        location: document.getElementById('p-location').value.trim(),
        type: document.getElementById('p-type').value,
        name: document.getElementById('p-name').value.trim(),
        qty: document.getElementById('p-qty').value.trim(),
        price: document.getElementById('p-price').value.trim(),
        date: document.getElementById('p-date').value,
        desc: document.getElementById('p-desc').value.trim()
    };

    ds.addListing(listing, user.id);
    closeProduceForm();
    renderFarmerProduceList();
    renderMarketProduceGrid();
    refreshFarmerStats();
    showToast('✅ Produce listed! Buyers can now see your listing.', 'success');
}

function renderFarmerProduceList() {
    const list = document.getElementById('farmer-produce-list');
    if (!list) return;

    const user = ds.getCurrentUser();
    if (!user) {
        list.innerHTML = `<div class="empty-panel"><i class="fas fa-lock"></i><p>Log in to manage your produce.</p></div>`;
        return;
    }

    const items = ds.getListings(user.id);
    if (!items.length) {
        list.innerHTML = `<div class="empty-panel"><i class="fas fa-seedling"></i><p>No produce listed yet.<br>Add your first listing to reach buyers.</p></div>`;
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="produce-item" onclick="openProduceDetail('${item.id}')">
            <div class="produce-item-icon">${PRODUCE_EMOJI[item.type] || '🌾'}</div>
            <div class="produce-item-info">
                <h4>${esc(item.name)}</h4>
                <p>${esc(item.location)} · ${esc(item.farmerName)}</p>
                <div class="produce-item-actions" onclick="event.stopPropagation()">
                    <button class="produce-action-btn del" onclick="deleteListing('${item.id}')">Remove</button>
                </div>
            </div>
            <div class="produce-item-meta">
                <div class="price">${item.price ? esc(item.price) : 'POA'}</div>
                <div class="qty">${esc(item.qty) || '–'}</div>
            </div>
        </div>
    `).join('');
}

function deleteListing(id) {
    const all = JSON.parse(localStorage.getItem('agri_listings') || '[]');
    const updated = all.filter(l => l.id !== id);
    localStorage.setItem('agri_listings', JSON.stringify(updated));
    renderFarmerProduceList();
    renderMarketProduceGrid();
    refreshFarmerStats();
    showToast('Listing removed.', '');
}

/* ==================== APPLICATIONS ==================== */
function submitApplication(e) {
    e.preventDefault();
    const user = ds.getCurrentUser();
    if (!user) {
        openAuthModal();
        return;
    }

    const svc = document.getElementById('app-service-type').value;
    const specific = document.getElementById('app-specific');
    const application = {
        service: svc,
        name: document.getElementById('app-name').value.trim(),
        phone: document.getElementById('app-phone').value.trim(),
        email: document.getElementById('app-email').value.trim(),
        area: document.getElementById('app-area').value.trim(),
        farmSize: document.getElementById('app-farm-size').value,
        farmType: document.getElementById('app-farm-type').value,
        specific: specific ? specific.value : '',
        message: document.getElementById('app-message').value.trim()
    };

    ds.addApplication(application, user.id);
    document.getElementById('application-form').reset();
    updateUIForUser();
    updateApplicationForm('training');
    renderFarmerStatusList();
    refreshFarmerStats();
    showToast('✅ Application submitted! We\'ll contact you within 2 days.', 'success');

    setTimeout(() => switchFarmerTab('ftab-status', null), 1200);
}

function renderFarmerStatusList() {
    const list = document.getElementById('farmer-status-list');
    if (!list) return;

    const user = ds.getCurrentUser();
    if (!user) {
        list.innerHTML = `<div class="empty-panel"><i class="fas fa-lock"></i><p>Log in to view applications.</p></div>`;
        return;
    }

    const apps = ds.getApplications(user.id);
    const listings = ds.getListings(user.id);
    const all = [
        ...apps.map(a => ({ ...a, _type: 'application' })),
        ...listings.map(l => ({ ...l, _type: 'listing', service: 'produce', name: l.farmerName || 'Me' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!all.length) {
        list.innerHTML = `<div class="empty-panel"><i class="fas fa-clipboard-list"></i><p>No applications yet.<br>Submit your first request using the Apply tab.</p></div>`;
        return;
    }

    const svcLabels = {
        training: 'Training & Mentorship', waste: 'Waste Management',
        agro: 'Agro-Processing', food: 'Food Security',
        climate: 'Climate-Smart Farming', market: 'Market Access', produce: 'Produce Listing'
    };

    list.innerHTML = all.map(item => `
        <div class="status-item">
            <div class="status-item-header">
                <h4>${svcLabels[item.service] || item.service}</h4>
                <span class="status-badge ${item.status || 'pending'}">${formatStatus(item.status)}</span>
            </div>
            <p>${item._type === 'listing' ? 'Produce: ' + esc(item.name || '') : 'Name: ' + esc(item.name || '')}</p>
            <small>${formatDate(item.createdAt)}</small>
        </div>
    `).join('');
}

function formatStatus(s) {
    const map = { pending: 'Pending Review', review: 'Under Review', approved: 'Approved', active: 'Active' };
    return map[s] || 'Pending';
}

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function refreshFarmerStats() {
    const user = ds.getCurrentUser();
    if (!user) return;

    const apps = ds.getApplications(user.id).length;
    const listings = ds.getListings(user.id).length;

    const el1 = document.getElementById('my-applications-count');
    const el2 = document.getElementById('my-listings-count');
    const el3 = document.getElementById('my-requests-count');
    if (el1) el1.textContent = apps;
    if (el2) el2.textContent = listings;
    if (el3) el3.textContent = apps + listings;
}

/* ==================== MARKET / BUYER ==================== */
function renderMarketProduceGrid() {
    const grid = document.getElementById('market-produce-grid');
    if (!grid) return;
    const listings = ds.getListings().filter(l => l.status === 'active');
    const emptyEl = document.getElementById('market-empty');

    if (!listings.length) {
        if (emptyEl) emptyEl.style.display = 'flex';
        grid.querySelectorAll('.market-produce-card').forEach(c => c.remove());
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    grid.querySelectorAll('.market-produce-card').forEach(c => c.remove());

    listings.forEach(item => {
        const card = document.createElement('div');
        card.className = 'market-produce-card';
        card.innerHTML = `
            <div class="mpc-header">${PRODUCE_EMOJI[item.type] || '🌾'}</div>
            <div class="mpc-body">
                <h4>${esc(item.name)}</h4>
                <div class="mpc-type">${esc(item.type)}</div>
                <div class="mpc-price">${item.price ? esc(item.price) : 'POA'}</div>
                <div class="mpc-farmer"><i class="fas fa-map-marker-alt"></i> ${esc(item.location)}</div>
                ${item.qty ? `<span class="mpc-tag"><i class="fas fa-box"></i> ${esc(item.qty)}</span>` : ''}
            </div>
        `;
        card.addEventListener('click', () => openProduceDetail(item.id));
        grid.insertBefore(card, emptyEl);
    });
}

function filterProduce() {
    const q = (document.getElementById('produce-search')?.value || '').toLowerCase();
    const type = document.getElementById('filter-type')?.value || '';
    const listings = ds.getListings().filter(l => {
        const matchQ = !q || l.name.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || (l.farmerName || '').toLowerCase().includes(q);
        const matchT = !type || l.type === type;
        return l.status === 'active' && matchQ && matchT;
    });
    const grid = document.getElementById('market-produce-grid');
    if (!grid) return;
    const emptyEl = document.getElementById('market-empty');
    grid.querySelectorAll('.market-produce-card').forEach(c => c.remove());
    if (!listings.length) {
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    listings.forEach(item => {
        const card = document.createElement('div');
        card.className = 'market-produce-card';
        card.innerHTML = `
            <div class="mpc-header">${PRODUCE_EMOJI[item.type] || '🌾'}</div>
            <div class="mpc-body">
                <h4>${esc(item.name)}</h4>
                <div class="mpc-type">${esc(item.type)}</div>
                <div class="mpc-price">${item.price ? esc(item.price) : 'POA'}</div>
                <div class="mpc-farmer"><i class="fas fa-map-marker-alt"></i> ${esc(item.location)}</div>
                ${item.qty ? `<span class="mpc-tag">${esc(item.qty)}</span>` : ''}
            </div>
        `;
        card.addEventListener('click', () => openProduceDetail(item.id));
        grid.insertBefore(card, emptyEl);
    });
}

function toggleFilter() {
    const fp = document.getElementById('filter-panel');
    const btn = document.getElementById('filter-btn');
    if (!fp) return;
    const shown = fp.style.display !== 'none';
    fp.style.display = shown ? 'none' : 'block';
    btn.classList.toggle('active', !shown);
}

/* ==================== PRODUCE DETAIL MODAL ==================== */
function openProduceDetail(id) {
    const item = ds.getListings().find(l => l.id === id);
    if (!item) return;
    const body = document.getElementById('produce-modal-body');
    const link = document.getElementById('produce-contact-link');
    body.innerHTML = `
        <div class="modal-produce-header">
            <div class="modal-produce-icon">${PRODUCE_EMOJI[item.type] || '🌾'}</div>
            <div>
                <h3>${esc(item.name)}</h3>
                <p>${esc(item.type)}</p>
            </div>
        </div>
        ${row('Price', item.price || 'Price on Application')}
        ${row('Quantity', item.qty || 'Contact farmer')}
        ${row('Location', item.location)}
        ${row('Farmer', item.farmerName)}
        ${item.date ? row('Available From', new Date(item.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })) : ''}
        ${item.desc ? `<p style="margin-top:.75rem;font-size:.85rem;color:var(--text-secondary);line-height:1.6;">${esc(item.desc)}</p>` : ''}
    `;
    if (item.phone) {
        link.href = 'tel:' + item.phone.replace(/\D/g, '');
        link.innerHTML = `<i class="fas fa-phone"></i> Call ${esc(item.farmerName)}`;
    }
    document.getElementById('produce-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function row(label, val) {
    return val ? `<div class="modal-detail-row"><span>${label}</span><span>${esc(val)}</span></div>` : '';
}

function closeProduce(e) {
    if (e && e.target !== document.getElementById('produce-modal')) return;
    document.getElementById('produce-modal').style.display = 'none';
    document.body.style.overflow = '';
}

/* ==================== BUYER REGISTRATION ==================== */
function submitBuyerRegistration(e) {
    e.preventDefault();
    const buyer = {
        org: document.getElementById('b-org').value.trim(),
        contact: document.getElementById('b-contact').value.trim(),
        phone: document.getElementById('b-phone').value.trim(),
        email: document.getElementById('b-email').value.trim(),
        type: document.getElementById('b-type').value,
        produce: document.getElementById('b-produce').value.trim(),
        volume: document.getElementById('b-volume').value.trim(),
        location: document.getElementById('b-location').value.trim(),
        notes: document.getElementById('b-notes').value.trim()
    };
    ds.addContact({ ...buyer, type: 'buyer_reg' });
    document.getElementById('buyer-form').reset();
    showToast('✅ Registered as buyer! Our market team will be in touch.', 'success');
}

/* ==================== MARKET CONTACT ==================== */
function submitMarketContact(e) {
    e.preventDefault();
    const msg = {
        name: document.getElementById('mc-name').value.trim(),
        phone: document.getElementById('mc-phone').value.trim(),
        message: document.getElementById('mc-message').value.trim(),
        type: 'market_inquiry'
    };
    ds.addContact(msg);
    document.getElementById('market-contact-form').reset();
    showToast('✅ Message sent! We\'ll get back to you soon.', 'success');
}

/* ==================== PARTNER FORM ==================== */
function submitPartnerInquiry(e) {
    e.preventDefault();
    const inquiry = {
        org: document.getElementById('pt-org').value.trim(),
        contact: document.getElementById('pt-contact').value.trim(),
        phone: document.getElementById('pt-phone').value.trim(),
        email: document.getElementById('pt-email').value.trim(),
        type: document.getElementById('pt-type').value,
        message: document.getElementById('pt-message').value.trim()
    };
    ds.addContact({ ...inquiry, type: 'partner_inquiry' });
    document.getElementById('partner-form').reset();
    showToast('✅ Inquiry submitted! Our partnerships team will be in touch.', 'success');
}

/* ==================== UTILS ==================== */
function showToast(msg, type = '') {
    const toast = document.getElementById('svc-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'svc-toast' + (type ? ' ' + type : '');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
