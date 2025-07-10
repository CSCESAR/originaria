/*
 * Archivo: assets/js/main.js
 * Descripción: JavaScript principal y utilidades globales para ORIGINARIA
 * Autor: Equipo ORIGINARIA
 * Fecha: 2024
 */

// Utilidades globales para toda la aplicación
window.OriginariaUtils = {
    // Mostrar overlay de carga
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    },

    // Ocultar overlay de carga
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    },

    // Mostrar alerta
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} fixed-alert`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 18px; margin-left: 10px; color: inherit; cursor: pointer;">&times;</button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    },

    // Validar email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Formatear moneda peruana
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    }
};

// Inicialización global
document.addEventListener('DOMContentLoaded', function() {
    console.log('ORIGINARIA - Sistema iniciado');
    
    // Ocultar loading inicial después de un breve delay
    setTimeout(() => {
        if (window.OriginariaUtils) {
            OriginariaUtils.hideLoading();
        }
    }, 500);
});