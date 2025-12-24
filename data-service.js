// Data Service for Main Site
class DataService {
    constructor() {
        // Initialize with empty arrays if no data exists
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