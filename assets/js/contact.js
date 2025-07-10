/*
 * Archivo: assets/js/contact.js
 * Descripción: JavaScript específico para la página de contacto
 * Autor: Equipo ORIGINARIA
 * Fecha: 2024
 */

document.addEventListener('DOMContentLoaded', function() {
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
});

// Form submission
function handleContactSubmit(event) {
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
        document.getElementById('messageCount').textContent = '0';
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }, 2000);
}

// Modal functionality
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// Live chat
function openLiveChat() {
    if (window.OriginariaUtils) {
        OriginariaUtils.showAlert('Funcionalidad de chat en vivo próximamente', 'info');
    } else {
        alert('Abriendo chat en vivo (funcionalidad de demo)');
    }
}

// Directions
function getDirections() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const address = 'Av. Universitaria 1801, San Miguel, Lima, Perú';
    
    if (/android/i.test(userAgent)) {
        window.open(`google.navigation:q=${encodeURIComponent(address)}`);
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.open(`maps://maps.google.com/maps?daddr=${encodeURIComponent(address)}&amp;ll=`);
    } else {
        window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(address)}`);
    }
}

// Mobile menu and cart functionality
function toggleMobileMenu() {
    if (window.toggleMobileMenu && typeof window.toggleMobileMenu === 'function') {
        window.toggleMobileMenu();
    } else {
        console.log('Mobile menu function not available');
    }
}

function toggleCart() {
    if (window.OriginariaUtils) {
        OriginariaUtils.showAlert('Carrito de compras próximamente', 'info');
    } else {
        alert('Mostrar carrito (funcionalidad de demo)');
    }
}
