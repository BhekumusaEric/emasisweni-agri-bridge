// Data Service - Handles all data operations
class DataService {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem('newsData')) {
            const initialNews = [
                {
                    id: 1,
                    title: "New Composting Hub Launched in Impendle",
                    excerpt: "Our latest organic waste composting facility is now operational, converting community waste into nutrient-rich soil amendments.",
                    date: "2025-01-15",
                    image: "../images/WhatsApp Image 2025-12-24 at 4.32.50 PM.jpeg",
                    content: "We are excited to announce the launch of our new composting hub in Impendle, which will serve as a cornerstone of our circular economy initiative. This facility demonstrates our commitment to sustainable waste management and soil regeneration."
                },
                {
                    id: 2,
                    title: "Youth Training Program Graduates 50 New Farmers",
                    excerpt: "Our agricultural training program has successfully graduated 50 young farmers, equipping them with modern farming techniques and business skills.",
                    date: "2025-01-10",
                    image: "../images/guy_doing_spinach_harvesting.jpeg",
                    content: "This month marks a significant milestone as we celebrate the graduation of 50 young farmers from our comprehensive agricultural training program. These dedicated individuals are now equipped with the skills and knowledge to transform their communities through sustainable agriculture."
                }
            ];
            localStorage.setItem('newsData', JSON.stringify(initialNews));
        }

        if (!localStorage.getItem('contactMessages')) {
            localStorage.setItem('contactMessages', JSON.stringify([]));
        }
    }

    // News Operations
    getAllNews() {
        return JSON.parse(localStorage.getItem('newsData') || '[]');
    }

    addNews(article) {
        const news = this.getAllNews();
        article.id = Date.now();
        article.date = new Date().toISOString().split('T')[0];
        news.unshift(article);
        localStorage.setItem('newsData', JSON.stringify(news));
        return article;
    }

    updateNews(id, updatedArticle) {
        const news = this.getAllNews();
        const index = news.findIndex(article => article.id === id);
        if (index !== -1) {
            news[index] = { ...news[index], ...updatedArticle };
            localStorage.setItem('newsData', JSON.stringify(news));
            return news[index];
        }
        return null;
    }

    deleteNews(id) {
        const news = this.getAllNews();
        const filtered = news.filter(article => article.id !== id);
        localStorage.setItem('newsData', JSON.stringify(filtered));
        return true;
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

    deleteContact(id) {
        const contacts = this.getAllContacts();
        const filtered = contacts.filter(contact => contact.id !== id);
        localStorage.setItem('contactMessages', JSON.stringify(filtered));
        return true;
    }
}