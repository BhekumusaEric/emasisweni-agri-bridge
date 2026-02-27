// Data Service for Main Site
class DataService {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem('agri_users')) localStorage.setItem('agri_users', JSON.stringify([]));
        if (!localStorage.getItem('agri_listings')) localStorage.setItem('agri_listings', JSON.stringify([]));
        if (!localStorage.getItem('agri_applications')) localStorage.setItem('agri_applications', JSON.stringify([]));
        if (!localStorage.getItem('contactMessages')) localStorage.setItem('contactMessages', JSON.stringify([]));
    }

    // User Operations
    register(userData) {
        const users = JSON.parse(localStorage.getItem('agri_users'));
        if (users.find(u => u.email === userData.email)) return { success: false, message: 'Email already registered' };

        const newUser = {
            id: 'u_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In a real app, this would be hashed
            phone: userData.phone,
            area: userData.area,
            role: userData.role || 'farmer',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('agri_users', JSON.stringify(users));
        return { success: true, user: newUser };
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('agri_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            const sessionUser = { ...user };
            delete sessionUser.password;
            localStorage.setItem('agri_current_user', JSON.stringify(sessionUser));
            return { success: true, user: sessionUser };
        }
        return { success: false, message: 'Invalid email or password' };
    }

    updateUser(userId, updatedData) {
        const users = JSON.parse(localStorage.getItem('agri_users') || '[]');
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, message: 'User not found' };

        // Update fields, keeping password and id intact
        users[idx] = { ...users[idx], ...updatedData, id: userId, email: users[idx].email };
        localStorage.setItem('agri_users', JSON.stringify(users));

        // Update current session if the updated user is logged in
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const sessionUser = { ...users[idx] };
            delete sessionUser.password;
            localStorage.setItem('agri_current_user', JSON.stringify(sessionUser));
        }

        return { success: true, user: users[idx] };
    }

    logout() {
        localStorage.removeItem('agri_current_user');
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('agri_current_user') || 'null');
    }

    // Data Operations with User Context
    getListings(userId = null) {
        const all = JSON.parse(localStorage.getItem('agri_listings') || '[]');
        if (userId) return all.filter(l => l.userId === userId);
        return all;
    }

    addListing(listing, userId) {
        const all = JSON.parse(localStorage.getItem('agri_listings') || '[]');
        const newItem = {
            ...listing,
            id: 'l_' + Date.now(),
            userId: userId,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        all.unshift(newItem);
        localStorage.setItem('agri_listings', JSON.stringify(all));
        return newItem;
    }

    getApplications(userId) {
        const all = JSON.parse(localStorage.getItem('agri_applications') || '[]');
        return all.filter(a => a.userId === userId);
    }

    addApplication(app, userId) {
        const all = JSON.parse(localStorage.getItem('agri_applications') || '[]');
        const newItem = {
            ...app,
            id: 'a_' + Date.now(),
            userId: userId,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        all.unshift(newItem);
        localStorage.setItem('agri_applications', JSON.stringify(all));
        return newItem;
    }

    // Contact Operations
    getAllContacts() {
        return JSON.parse(localStorage.getItem('contactMessages') || '[]');
    }

    addContact(contact) {
        const contacts = this.getAllContacts();
        contact.id = Date.now();
        contact.date = new Date().toISOString();
        contacts.unshift(contact);
        localStorage.setItem('contactMessages', JSON.stringify(contacts));
        return contact;
    }
}