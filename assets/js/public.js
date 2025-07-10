/*
 * Archivo: assets/js/public.js
 * Descripción: JavaScript específico para páginas públicas
 * Autor: Equipo ORIGINARIA
 * Fecha: 2024
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    window.toggleMobileMenu = function() {
        const overlay = document.getElementById('mobileMenuOverlay');
        const body = document.body;
        
        if (overlay) {
            if (overlay.style.display === 'block') {
                overlay.style.display = 'none';
                body.classList.remove('no-scroll');
            } else {
                overlay.style.display = 'block';
                body.classList.add('no-scroll');
            }
        }
    };

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const overlay = document.getElementById('mobileMenuOverlay');
        
        if (overlay && overlay.style.display === 'block' && 
            mobileMenu && !mobileMenu.contains(e.target) && 
            mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // Smooth scroll for anchor links
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

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header-public');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email && OriginariaUtils.validateEmail(email)) {
                OriginariaUtils.showLoading();
                
                // Simulate API call
                setTimeout(() => {
                    OriginariaUtils.hideLoading();
                    OriginariaUtils.showAlert('¡Gracias por suscribirte! Te mantendremos informado.', 'success');
                    emailInput.value = '';
                }, 1500);
            } else {
                OriginariaUtils.showAlert('Por favor ingresa un email válido', 'error');
            }
        });
    }

    // Animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.value-card, .category-card').forEach(el => {
        observer.observe(el);
    });

    // Counter animation for hero stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace('+', ''));
            const increment = target / 50;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target + (counter.textContent.includes('+') ? '+' : '');
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current) + (counter.textContent.includes('+') ? '+' : '');
                }
            }, 30);
        });
    }

    // Trigger counter animation when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    });

    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroObserver.observe(heroSection);
    }

    // Contact page specific functionality
    initContactPage();
});

// Contact page initialization
function initContactPage() {
    // Character counter for message
    const messageField = document.getElementById('message');
    const messageCounter = document.getElementById('messageCount');
    
    if (messageField && messageCounter) {
        messageField.addEventListener('input', function() {
            const count = this.value.length;
            messageCounter.textContent = count;
            
            if (count > 500) {
                messageCounter.style.color = '#F56565';
                this.style.borderColor = '#F56565';
            } else {
                messageCounter.style.color = '#4A5568';
                this.style.borderColor = '#E2E8F0';
            }
        });
    }

    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.startsWith('51')) {
                value = value.substring(2);
            }
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = '+51 ' + value;
                } else if (value.length <= 6) {
                    value = '+51 ' + value.substring(0, 3) + ' ' + value.substring(3);
                } else {
                    value = '+51 ' + value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6, 9);
                }
            }
            
            this.value = value;
        });
    }

    // Form validation
    const form = document.getElementById('contactForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error') && this.value.trim()) {
                    this.classList.remove('error');
                }
            });
        });
    }

    // Header search functionality for contact page
    const headerSearch = document.getElementById('headerSearch');
    if (headerSearch) {
        headerSearch.addEventListener('input', function(e) {
            if (e.target.value.length > 2) {
                console.log('Buscando:', e.target.value);
                // Aquí se implementaría la búsqueda real
            }
        });
    }
}

// Contact form submission
window.handleContactSubmit = function(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    
    // Simulate API call
    setTimeout(() => {
        // Generate reference number
        const refNumber = 'CONT-' + new Date().getFullYear() + '-' + 
                         String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        
        document.getElementById('referenceNumber').textContent = refNumber;
        
        // Show success modal
        showModal('successModal');
        
        // Reset form
        document.getElementById('contactForm').reset();
        const messageCount = document.getElementById('messageCount');
        if (messageCount) messageCount.textContent = '0';
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }, 2000);
};

// Modal functionality
window.showModal = function(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
};

window.closeAllModals = function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
};

// Live chat
window.openLiveChat = function() {
    if (window.OriginariaUtils) {
        OriginariaUtils.showAlert('Funcionalidad de chat en vivo próximamente', 'info');
    } else {
        alert('Abriendo chat en vivo (funcionalidad de demo)');
    }
};

// Directions
window.getDirections = function() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const address = 'Av. Universitaria 1801, San Miguel, Lima, Perú';
    
    if (/android/i.test(userAgent)) {
        window.open(`google.navigation:q=${encodeURIComponent(address)}`);
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.open(`maps://maps.google.com/maps?daddr=${encodeURIComponent(address)}&amp;ll=`);
    } else {
        window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(address)}`);
    }
};

// Cart functionality
window.toggleCart = function() {
    if (window.OriginariaUtils) {
        OriginariaUtils.showAlert('Carrito de compras próximamente', 'info');
    } else {
        alert('Mostrar carrito (funcionalidad de demo)');
    }
};