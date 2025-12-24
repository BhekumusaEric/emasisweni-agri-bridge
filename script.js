// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// News/Blog Data and Management
class NewsService {
    constructor() {
        this.loadNewsData();
    }

    loadNewsData() {
        // Try to load from admin updates first
        const adminNews = localStorage.getItem('publicNewsData');
        if (adminNews) {
            this.newsData = JSON.parse(adminNews);
        } else {
            // Fallback to default news
            this.newsData = [
                {
                    id: 1,
                    title: "New Composting Hub Launched in Impendle",
                    excerpt: "Our latest organic waste composting facility is now operational, converting community waste into nutrient-rich soil amendments.",
                    date: "2025-01-15",
                    image: "images/WhatsApp Image 2025-12-24 at 4.32.50 PM.jpeg",
                    content: "We are excited to announce the launch of our new composting hub in Impendle, which will serve as a cornerstone of our circular economy initiative. This facility demonstrates our commitment to sustainable waste management and soil regeneration."
                },
                {
                    id: 2,
                    title: "Youth Training Program Graduates 50 New Farmers",
                    excerpt: "Our agricultural training program has successfully graduated 50 young farmers, equipping them with modern farming techniques and business skills.",
                    date: "2025-01-10",
                    image: "images/guy_doing_spinach_harvesting.jpeg",
                    content: "This month marks a significant milestone as we celebrate the graduation of 50 young farmers from our comprehensive agricultural training program. These dedicated individuals are now equipped with the skills and knowledge to transform their communities through sustainable agriculture."
                },
                {
                    id: 3,
                    title: "Partnership with Local Schools for Food Gardens",
                    excerpt: "We've partnered with 10 local schools to establish food gardens, promoting food security and environmental education.",
                    date: "2025-01-05",
                    image: "images/HealthySpinachLeaves.jpeg",
                    content: "Education and nutrition go hand in hand. Our new partnership with local schools aims to create sustainable food gardens that will provide fresh vegetables while teaching students about sustainable agriculture and environmental stewardship."
                }
            ];
        }
    }

    getAllNews() {
        return this.newsData;
    }

    getNewsById(id) {
        return this.newsData.find(article => article.id === id);
    }
}

const newsService = new NewsService();

let currentNewsIndex = 0;
const newsPerPage = 3;

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function createNewsArticle(article) {
    return `
        <article class="news-article">
            <img src="${article.image}" alt="${article.title}" loading="lazy">
            <div class="news-content">
                <div class="news-date">${formatDate(article.date)}</div>
                <h3>${article.title}</h3>
                <p>${article.excerpt}</p>
                <a href="#" class="read-more" onclick="openNewsModal(${article.id})">Read More</a>
            </div>
        </article>
    `;
}

function loadNews() {
    const newsContainer = document.getElementById('news-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    const allNews = newsService.getAllNews();
    const nextNews = allNews.slice(currentNewsIndex, currentNewsIndex + newsPerPage);
    
    nextNews.forEach(article => {
        newsContainer.innerHTML += createNewsArticle(article);
    });
    
    currentNewsIndex += newsPerPage;
    
    if (currentNewsIndex >= allNews.length) {
        loadMoreBtn.style.display = 'none';
    }
}

function openNewsModal(articleId) {
    const article = newsService.getNewsById(articleId);
    if (!article) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${article.image}" alt="${article.title}">
            <div class="modal-body">
                <div class="news-date">${formatDate(article.date)}</div>
                <h2>${article.title}</h2>
                <p>${article.content}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const modalStyles = `
        .news-modal {
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .modal-content {
            background: white;
            border-radius: 8px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        .modal-content img {
            width: 100%;
            height: 300px;
            object-fit: cover;
        }
        .modal-body {
            padding: 2rem;
        }
        .close-modal {
            position: absolute;
            right: 20px;
            top: 20px;
            font-size: 2rem;
            color: white;
            cursor: pointer;
            z-index: 1;
            background: rgba(0,0,0,0.5);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    
    if (!document.getElementById('modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }
    
    // Close modal functionality
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Load initial news
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    
    document.getElementById('load-more-btn').addEventListener('click', loadNews);
});

// Partnership Form Handling
class ContactService {
    constructor() {
        this.dataService = new DataService();
    }

    submitContact(formData) {
        return this.dataService.addContact(formData);
    }
}

const contactService = new ContactService();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('partnership-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Submit to admin system
        setTimeout(() => {
            contactService.submitContact(data);
            
            // Show success message
            showNotification('Thank you for your interest! We will contact you within 24 hours.', 'success');
            
            // Reset form
            form.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        }
        .notification-success {
            background: #28a745;
        }
        .notification-error {
            background: #dc3545;
        }
        .notification-info {
            background: #17a2b8;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    if (!document.getElementById('notification-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = notificationStyles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.service, .mv-card, .leader, .value, .sustainability-item, .news-article');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});