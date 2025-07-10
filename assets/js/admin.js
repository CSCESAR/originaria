/*
 * Archivo: assets/js/admin.js
 * Descripción: JavaScript específico para el panel de administración de ORIGINARIA
 * Autor: Equipo ORIGINARIA
 * Fecha: 2024
 * Función: Dashboard admin, gestión de usuarios, productos, pedidos y configuración del sistema
 */

// ===== CONFIGURACIÓN PANEL ADMIN =====
const AdminApp = {
    currentUser: null,
    
    init() {
        this.checkAuthentication();
        this.initSidebar();
        this.initAdminDashboard();
        this.initUserManagement();
        this.initVendorManagement();
        this.initProductModeration();
        this.initOrderManagement();
        this.initAnalytics();
        this.initSystemSettings();
        this.initReports();
        this.initNotifications();
        
        console.log('Admin App initialized');
    },
    
    // ===== AUTENTICACIÓN =====
    checkAuthentication() {
        const token = Storage.get('auth_token');
        const user = Storage.get('user');
        
        if (!token || !user || user.type !== 'admin') {
            window.location.href = '/public/login.html';
            return;
        }
        
        this.currentUser = user;
        this.updateAdminInfo();
    },
    
    updateAdminInfo() {
        const adminNameElements = document.querySelectorAll('.admin-name');
        const adminRoleElements = document.querySelectorAll('.admin-role');
        const adminAvatarElements = document.querySelectorAll('.admin-profile-avatar');
        
        adminNameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });
        
        adminRoleElements.forEach(el => {
            el.textContent = this.currentUser.role || 'Administrador';
        });
        
        adminAvatarElements.forEach(el => {
            el.textContent = this.currentUser.name.charAt(0).toUpperCase();
        });
    },
    
    // ===== SIDEBAR ADMIN =====
    initSidebar() {
        const sidebarToggle = document.querySelector('.admin-sidebar-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const mainContent = document.querySelector('.admin-main');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent?.classList.toggle('sidebar-collapsed');
                
                // Guardar estado
                Storage.set('admin_sidebar_collapsed', sidebar.classList.contains('collapsed'));
            });
            
            // Restaurar estado
            const isCollapsed = Storage.get('admin_sidebar_collapsed');
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                mainContent?.classList.add('sidebar-collapsed');
            }
        }
        
        // Marcar enlace activo
        this.updateActiveNavLink();
        
        // Mobile sidebar
        this.initMobileAdminSidebar();
    },
    
    updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.admin-nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href)) {
                link.classList.add('active');
                // Expandir sección padre si existe
                const section = link.closest('.admin-nav-section');
                if (section) {
                    section.classList.add('expanded');
                }
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    initMobileAdminSidebar() {
        const mobileToggle = document.querySelector('.mobile-admin-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.admin-sidebar-overlay');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                document.body.classList.toggle('admin-sidebar-open');
            });
            
            overlay?.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                document.body.classList.remove('admin-sidebar-open');
            });
        }
    },
    
    // ===== DASHBOARD ADMIN =====
    initAdminDashboard() {
        this.loadAdminStats();
        this.loadSystemHealth();
        this.loadRecentActivity();
        this.loadPendingApprovals();
        this.initAdminCharts();
    },
    
    async loadAdminStats() {
        try {
            const stats = await API.get('/admin/dashboard/stats');
            this.updateAdminStatsCards(stats);
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    },
    
    updateAdminStatsCards(stats) {
        const statsMapping = {
            'total-users': { value: stats.totalUsers, change: stats.usersChange },
            'total-vendors': { value: stats.totalVendors, change: stats.vendorsChange },
            'total-orders': { value: stats.totalOrders, change: stats.ordersChange },
            'total-revenue': { value: stats.totalRevenue, change: stats.revenueChange }
        };
        
        Object.entries(statsMapping).forEach(([key, data]) => {
            const card = document.querySelector(`[data-admin-stat="${key}"]`);
            if (card) {
                const valueElement = card.querySelector('.admin-stat-value');
                const trendElement = card.querySelector('.admin-stat-trend');
                
                if (valueElement) {
                    if (key === 'total-revenue') {
                        valueElement.textContent = Utils.formatCurrency(data.value);
                    } else {
                        valueElement.textContent = Utils.formatNumber(data.value);
                    }
                }
                
                if (trendElement && data.change !== undefined) {
                    const isPositive = data.change > 0;
                    trendElement.className = `admin-stat-trend ${isPositive ? 'positive' : 'negative'}`;
                    trendElement.innerHTML = `
                        <span class="admin-stat-trend-icon">${isPositive ? '↗' : '↘'}</span>
                        ${Math.abs(data.change).toFixed(1)}% vs mes anterior
                    `;
                }
            }
        });
    },
    
    async loadSystemHealth() {
        try {
            const health = await API.get('/admin/system/health');
            this.updateSystemHealth(health);
        } catch (error) {
            console.error('Error loading system health:', error);
        }
    },
    
    updateSystemHealth(health) {
        const healthContainer = document.querySelector('#system-health');
        if (!healthContainer) return;
        
        const healthItems = [
            { label: 'Estado del Sistema', value: health.status, type: 'status' },
            { label: 'Uso de CPU', value: `${health.cpu}%`, type: 'percentage' },
            { label: 'Uso de Memoria', value: `${health.memory}%`, type: 'percentage' },
            { label: 'Espacio en Disco', value: `${health.disk}%`, type: 'percentage' },
            { label: 'Base de Datos', value: health.database, type: 'status' }
        ];
        
        healthContainer.innerHTML = healthItems.map(item => `
            <div class="health-item">
                <div class="health-label">${item.label}</div>
                <div class="health-value ${this.getHealthClass(item.value, item.type)}">${item.value}</div>
            </div>
        `).join('');
    },
    
    getHealthClass(value, type) {
        if (type === 'status') {
            return value === 'healthy' ? 'success' : 'danger';
        } else if (type === 'percentage') {
            const percentage = parseFloat(value);
            if (percentage < 70) return 'success';
            if (percentage < 85) return 'warning';
            return 'danger';
        }
        return '';
    },
    
    async loadRecentActivity() {
        try {
            const activities = await API.get('/admin/activity/recent', { limit: 10 });
            this.renderRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    },
    
    renderRecentActivity(activities) {
        const container = document.querySelector('#recent-activity-list');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="admin-empty-state">No hay actividad reciente</p>';
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-meta">
                        <span class="activity-user">${activity.user_name}</span>
                        <span class="activity-time">${Utils.timeAgo(activity.created_at)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    getActivityIcon(type) {
        const icons = {
            'user_registered': '👤',
            'vendor_approved': '✅',
            'product_added': '📦',
            'order_placed': '🛒',
            'payment_received': '💰',
            'system_update': '⚙️'
        };
        return icons[type] || '📋';
    },
    
    async loadPendingApprovals() {
        try {
            const pending = await API.get('/admin/pending/summary');
            this.updatePendingApprovals(pending);
        } catch (error) {
            console.error('Error loading pending approvals:', error);
        }
    },
    
    updatePendingApprovals(pending) {
        const approvalItems = [
            { label: 'Vendedores Pendientes', count: pending.vendors, url: '/admin/users/vendors.html?status=pending' },
            { label: 'Productos Pendientes', count: pending.products, url: '/admin/products/pending.html' },
            { label: 'Reportes Pendientes', count: pending.reports, url: '/admin/reports/pending.html' },
            { label: 'Reembolsos Pendientes', count: pending.refunds, url: '/admin/orders/refunds.html' }
        ];
        
        const container = document.querySelector('#pending-approvals');
        if (!container) return;
        
        container.innerHTML = approvalItems.map(item => `
            <div class="approval-item">
                <div class="approval-count ${item.count > 0 ? 'has-pending' : ''}">${item.count}</div>
                <div class="approval-label">${item.label}</div>
                ${item.count > 0 ? `<a href="${item.url}" class="approval-link">Revisar</a>` : ''}
            </div>
        `).join('');
    },
    
    // ===== GESTIÓN DE USUARIOS =====
    initUserManagement() {
        this.loadUsers();
        this.initUserFilters();
        this.initUserActions();
    },
    
    async loadUsers(filters = {}) {
        try {
            const users = await API.get('/admin/users', filters);
            this.renderUsersList(users);
        } catch (error) {
            console.error('Error loading users:', error);
            Notifications.error('Error al cargar los usuarios');
        }
    },
    
    renderUsersList(users) {
        const container = document.querySelector('#users-list');
        if (!container) return;
        
        if (users.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="admin-empty-state">
                        <div class="empty-icon">👥</div>
                        <div class="empty-title">No hay usuarios</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="user-type-badge ${user.type}">${this.getUserTypeText(user.type)}</span>
                </td>
                <td>
                    <span class="admin-status-badge ${user.status}">${this.getUserStatusText(user.status)}</span>
                </td>
                <td>${Utils.formatDate(user.created_at)}</td>
                <td>${Utils.formatDate(user.last_login_at)}</td>
                <td>${user.orders_count || 0}</td>
                <td>
                    <div class="admin-table-actions-cell">
                        <button class="admin-table-action-btn view" onclick="AdminApp.viewUser('${user.id}')">Ver</button>
                        <button class="admin-table-action-btn edit" onclick="AdminApp.editUser('${user.id}')">Editar</button>
                        ${user.status === 'active' ? 
                            `<button class="admin-table-action-btn delete" onclick="AdminApp.suspendUser('${user.id}')">Suspender</button>` :
                            `<button class="admin-table-action-btn approve" onclick="AdminApp.activateUser('${user.id}')">Activar</button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    getUserTypeText(type) {
        const typeMap = {
            'customer': 'Cliente',
            'vendor': 'Vendedor',
            'admin': 'Administrador'
        };
        return typeMap[type] || type;
    },
    
    getUserStatusText(status) {
        const statusMap = {
            'active': 'Activo',
            'inactive': 'Inactivo',
            'pending': 'Pendiente',
            'suspended': 'Suspendido'
        };
        return statusMap[status] || status;
    },
    
    initUserFilters() {
        const filterForm = document.querySelector('#user-filters');
        if (!filterForm) return;
        
        filterForm.addEventListener('change', () => {
            const formData = new FormData(filterForm);
            const filters = Object.fromEntries(formData);
            this.loadUsers(filters);
        });
        
        // Reset filters
        const resetBtn = filterForm.querySelector('.reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterForm.reset();
                this.loadUsers();
            });
        }
    },
    
    initUserActions() {
        // Search users
        const searchInput = document.querySelector('#user-search');
        if (searchInput) {
            const debouncedSearch = Utils.debounce((query) => {
                this.loadUsers({ search: query });
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value.trim());
            });
        }
    },
    
    viewUser(userId) {
        window.location.href = `/admin/users/view.html?id=${userId}`;
    },
    
    editUser(userId) {
        window.location.href = `/admin/users/edit.html?id=${userId}`;
    },
    
    async suspendUser(userId) {
        const confirmed = await Components.confirm(
            '¿Estás seguro de que quieres suspender este usuario?',
            'Suspender Usuario'
        );
        
        if (!confirmed) return;
        
        try {
            await API.put(`/admin/users/${userId}/status`, { status: 'suspended' });
            Notifications.success('Usuario suspendido correctamente');
            this.loadUsers();
        } catch (error) {
            Notifications.error('Error al suspender el usuario');
        }
    },
    
    async activateUser(userId) {
        try {
            await API.put(`/admin/users/${userId}/status`, { status: 'active' });
            Notifications.success('Usuario activado correctamente');
            this.loadUsers();
        } catch (error) {
            Notifications.error('Error al activar el usuario');
        }
    },
    
    // ===== GESTIÓN DE VENDEDORES =====
    initVendorManagement() {
        this.loadVendors();
        this.initVendorApproval();
    },
    
    async loadVendors(filters = {}) {
        try {
            const vendors = await API.get('/admin/vendors', filters);
            this.renderVendorsList(vendors);
        } catch (error) {
            console.error('Error loading vendors:', error);
        }
    },
    
    renderVendorsList(vendors) {
        const container = document.querySelector('#vendors-list');
        if (!container) return;
        
        if (vendors.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="admin-empty-state">
                        <div class="empty-icon">🏪</div>
                        <div class="empty-title">No hay vendedores</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = vendors.map(vendor => `
            <tr>
                <td>
                    <div class="vendor-cell">
                        <div class="vendor-avatar">${vendor.name.charAt(0).toUpperCase()}</div>
                        <div class="vendor-info">
                            <div class="vendor-name">${vendor.name}</div>
                            <div class="vendor-business">${vendor.business_name || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${vendor.business_type || 'N/A'}</td>
                <td>
                    <span class="admin-status-badge ${vendor.status}">${this.getUserStatusText(vendor.status)}</span>
                </td>
                <td>${vendor.products_count || 0}</td>
                <td>${vendor.orders_count || 0}</td>
                <td>${Utils.formatCurrency(vendor.total_sales || 0)}</td>
                <td>${Utils.formatDate(vendor.created_at)}</td>
                <td>
                    <div class="admin-table-actions-cell">
                        <button class="admin-table-action-btn view" onclick="AdminApp.viewVendor('${vendor.id}')">Ver</button>
                        ${vendor.status === 'pending' ? 
                            `<button class="admin-table-action-btn approve" onclick="AdminApp.approveVendor('${vendor.id}')">Aprobar</button>
                             <button class="admin-table-action-btn delete" onclick="AdminApp.rejectVendor('${vendor.id}')">Rechazar</button>` :
                            `<button class="admin-table-action-btn edit" onclick="AdminApp.editVendor('${vendor.id}')">Editar</button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    async approveVendor(vendorId) {
        const confirmed = await Components.confirm(
            '¿Aprobar este vendedor? Podrá empezar a vender productos inmediatamente.',
            'Aprobar Vendedor'
        );
        
        if (!confirmed) return;
        
        try {
            await API.put(`/admin/vendors/${vendorId}/approve`);
            Notifications.success('Vendedor aprobado correctamente');
            this.loadVendors();
        } catch (error) {
            Notifications.error('Error al aprobar el vendedor');
        }
    },
    
    async rejectVendor(vendorId) {
        const confirmed = await Components.confirm(
            '¿Rechazar este vendedor? Se le enviará una notificación.',
            'Rechazar Vendedor'
        );
        
        if (!confirmed) return;
        
        try {
            await API.put(`/admin/vendors/${vendorId}/reject`);
            Notifications.success('Vendedor rechazado');
            this.loadVendors();
        } catch (error) {
            Notifications.error('Error al rechazar el vendedor');
        }
    },
    
    viewVendor(vendorId) {
        window.location.href = `/admin/users/vendors.html?id=${vendorId}`;
    },
    
    editVendor(vendorId) {
        window.location.href = `/admin/users/edit.html?id=${vendorId}`;
    },
    
    // ===== MODERACIÓN DE PRODUCTOS =====
    initProductModeration() {
        this.loadPendingProducts();
        this.initProductApproval();
    },
    
    async loadPendingProducts() {
        try {
            const products = await API.get('/admin/products/pending');
            this.renderPendingProducts(products);
        } catch (error) {
            console.error('Error loading pending products:', error);
        }
    },
    
    renderPendingProducts(products) {
        const container = document.querySelector('#pending-products-list');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="admin-empty-state">
                    <div class="empty-icon">📦</div>
                    <div class="empty-title">No hay productos pendientes</div>
                    <div class="empty-description">Todos los productos están aprobados</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="pending-product-card">
                <div class="product-image">
                    <img src="${product.image || '/assets/images/products/placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="product-details">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-vendor">Por: ${product.vendor_name}</p>
                    <p class="product-description">${Utils.truncateText(product.description, 100)}</p>
                    <div class="product-meta">
                        <span class="product-price">${Utils.formatCurrency(product.price)}</span>
                        <span class="product-category">${product.category_name}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="AdminApp.approveProduct('${product.id}')">Aprobar</button>
                    <button class="btn btn-outline" onclick="AdminApp.viewProductDetail('${product.id}')">Ver Detalle</button>
                    <button class="btn btn-danger" onclick="AdminApp.rejectProduct('${product.id}')">Rechazar</button>
                </div>
            </div>
        `).join('');
    },
    
    async approveProduct(productId) {
        try {
            await API.put(`/admin/products/${productId}/approve`);
            Notifications.success('Producto aprobado correctamente');
            this.loadPendingProducts();
        } catch (error) {
            Notifications.error('Error al aprobar el producto');
        }
    },
    
    async rejectProduct(productId) {
        // Mostrar modal para motivo del rechazo
        const content = `
            <form id="rejectProductForm">
                <div class="form-group">
                    <label for="reject_reason">Motivo del rechazo:</label>
                    <textarea id="reject_reason" name="reason" class="form-textarea" required placeholder="Explica por qué se rechaza este producto..."></textarea>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-danger">Rechazar Producto</button>
                </div>
            </form>
        `;
        
        const modal = Components.createModal('Rechazar Producto', content);
        
        const form = modal.element.querySelector('#rejectProductForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const reason = form.querySelector('textarea[name="reason"]').value;
            
            try {
                await API.put(`/admin/products/${productId}/reject`, { reason });
                Notifications.success('Producto rechazado');
                modal.close();
                this.loadPendingProducts();
            } catch (error) {
                Notifications.error('Error al rechazar el producto');
            }
        });
    },
    
    viewProductDetail(productId) {
        window.location.href = `/admin/products/view.html?id=${productId}`;
    },
    
    // ===== ANALYTICS ADMIN =====
    initAdminCharts() {
        this.loadSalesChart();
        this.loadUsersChart();
        this.loadTopCategories();
    },
    
    async loadSalesChart() {
        try {
            const data = await API.get('/admin/analytics/sales-chart');
            this.renderSalesChart(data);
        } catch (error) {
            console.error('Error loading sales chart:', error);
        }
    },
    
    renderSalesChart(data) {
        const container = document.querySelector('#sales-chart');
        if (!container) return;
        
        // Por ahora, mostrar placeholder
        container.innerHTML = `
            <div class="admin-chart-placeholder">
                <p>Gráfico de Ventas</p>
                <small>Datos: ${data.total_sales} ventas totales</small>
            </div>
        `;
    },
    
    async loadUsersChart() {
        try {
            const data = await API.get('/admin/analytics/users-chart');
            this.renderUsersChart(data);
        } catch (error) {
            console.error('Error loading users chart:', error);
        }
    },
    
    renderUsersChart(data) {
        const container = document.querySelector('#users-chart');
        if (!container) return;
        
        container.innerHTML = `
            <div class="admin-chart-placeholder">
                <p>Crecimiento de Usuarios</p>
                <small>Total: ${data.total_users} usuarios</small>
            </div>
        `;
    },
    
    // ===== CONFIGURACIÓN DEL SISTEMA =====
    initSystemSettings() {
        this.loadSystemSettings();
        this.initSettingsForm();
    },
    
    async loadSystemSettings() {
        try {
            const settings = await API.get('/admin/settings');
            this.populateSettingsForm(settings);
        } catch (error) {
            console.error('Error loading system settings:', error);
        }
    },
    
    populateSettingsForm(settings) {
        const form = document.querySelector('#system-settings-form');
        if (!form) return;
        
        Object.entries(settings).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
            }
        });
    },
    
    initSettingsForm() {
        const form = document.querySelector('#system-settings-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const settings = Object.fromEntries(formData);
            
            try {
                await API.put('/admin/settings', settings);
                Notifications.success('Configuración actualizada correctamente');
            } catch (error) {
                Notifications.error('Error al actualizar la configuración');
            }
        });
    },
    
    // ===== REPORTES =====
    initReports() {
        this.initReportGeneration();
        this.loadAvailableReports();
    },
    
    initReportGeneration() {
        const generateBtn = document.querySelector('#generate-report-btn');
        if (!generateBtn) return;
        
        generateBtn.addEventListener('click', () => {
            this.showReportGenerationModal();
        });
    },
    
    showReportGenerationModal() {
        const content = `
            <form id="generateReportForm">
                <div class="form-group">
                    <label for="report_type">Tipo de Reporte:</label>
                    <select id="report_type" name="type" class="form-select" required>
                        <option value="">Seleccionar...</option>
                        <option value="sales">Ventas</option>
                        <option value="users">Usuarios</option>
                        <option value="products">Productos</option>
                        <option value="vendors">Vendedores</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="date_from">Desde:</label>
                    <input type="date" id="date_from" name="date_from" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="date_to">Hasta:</label>
                    <input type="date" id="date_to" name="date_to" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="format">Formato:</label>
                    <select id="format" name="format" class="form-select">
                        <option value="xlsx">Excel (.xlsx)</option>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Generar Reporte</button>
                </div>
            </form>
        `;
        
        const modal = Components.createModal('Generar Reporte', content);
        
        const form = modal.element.querySelector('#generateReportForm');
        
        // Establecer fechas por defecto
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        form.querySelector('#date_from').value = firstDayOfMonth.toISOString().split('T')[0];
        form.querySelector('#date_to').value = today.toISOString().split('T')[0];
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const reportData = Object.fromEntries(formData);
            
            try {
                modal.close();
                Components.showLoading('Generando reporte...');
                
                const response = await API.post('/admin/reports/generate', reportData);
                
                Components.hideLoading();
                Notifications.success('Reporte generado correctamente');
                
                // Descargar archivo
                if (response.download_url) {
                    window.open(response.download_url, '_blank');
                }
                
                this.loadAvailableReports();
                
            } catch (error) {
                Components.hideLoading();
                Notifications.error('Error al generar el reporte');
            }
        });
    },
    
    async loadAvailableReports() {
        try {
            const reports = await API.get('/admin/reports');
            this.renderAvailableReports(reports);
        } catch (error) {
            console.error('Error loading available reports:', error);
        }
    },
    
    renderAvailableReports(reports) {
        const container = document.querySelector('#available-reports-list');
        if (!container) return;
        
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="admin-empty-state">
                    <div class="empty-icon">📊</div>
                    <div class="empty-title">No hay reportes disponibles</div>
                    <div class="empty-description">Genera tu primer reporte para verlo aquí</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = reports.map(report => `
            <div class="report-item">
                <div class="report-info">
                    <div class="report-name">${report.name}</div>
                    <div class="report-meta">
                        <span class="report-type">${this.getReportTypeText(report.type)}</span>
                        <span class="report-date">${Utils.formatDate(report.created_at)}</span>
                        <span class="report-size">${this.formatFileSize(report.file_size)}</span>
                    </div>
                </div>
                <div class="report-actions">
                    <button class="btn btn-sm btn-outline" onclick="AdminApp.downloadReport('${report.id}')">Descargar</button>
                    <button class="btn btn-sm btn-danger" onclick="AdminApp.deleteReport('${report.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    },
    
    getReportTypeText(type) {
        const typeMap = {
            'sales': 'Ventas',
            'users': 'Usuarios',
            'products': 'Productos',
            'vendors': 'Vendedores'
        };
        return typeMap[type] || type;
    },
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    async downloadReport(reportId) {
        try {
            const response = await API.get(`/admin/reports/${reportId}/download`);
            window.open(response.download_url, '_blank');
        } catch (error) {
            Notifications.error('Error al descargar el reporte');
        }
    },
    
    async deleteReport(reportId) {
        const confirmed = await Components.confirm(
            '¿Estás seguro de que quieres eliminar este reporte?',
            'Eliminar Reporte'
        );
        
        if (!confirmed) return;
        
        try {
            await API.delete(`/admin/reports/${reportId}`);
            Notifications.success('Reporte eliminado correctamente');
            this.loadAvailableReports();
        } catch (error) {
            Notifications.error('Error al eliminar el reporte');
        }
    },
    
    // ===== NOTIFICACIONES ADMIN =====
    initNotifications() {
        this.loadAdminNotifications();
        this.initNotificationCenter();
        this.initBroadcastNotifications();
    },
    
    async loadAdminNotifications() {
        try {
            const notifications = await API.get('/admin/notifications');
            this.updateNotificationBadge(notifications.unread_count);
            this.renderNotificationsList(notifications.items);
        } catch (error) {
            console.error('Error loading admin notifications:', error);
        }
    },
    
    updateNotificationBadge(count) {
        const badges = document.querySelectorAll('.admin-notification-badge');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    },
    
    renderNotificationsList(notifications) {
        const container = document.querySelector('#admin-notifications-list');
        if (!container) return;
        
        if (notifications.length === 0) {
            container.innerHTML = '<p class="admin-empty-state">No hay notificaciones</p>';
            return;
        }
        
        container.innerHTML = notifications.map(notification => `
            <div class="admin-notification-item ${notification.read ? 'read' : 'unread'}">
                <div class="notification-icon ${notification.type}">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${Utils.timeAgo(notification.created_at)}</div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? 
                        `<button class="btn btn-sm btn-outline" onclick="AdminApp.markNotificationAsRead('${notification.id}')">Marcar como leída</button>` : 
                        ''
                    }
                    <button class="btn btn-sm btn-danger" onclick="AdminApp.deleteNotification('${notification.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    },
    
    getNotificationIcon(type) {
        const icons = {
            'user_registered': '👤',
            'vendor_pending': '🏪',
            'product_pending': '📦',
            'order_issue': '⚠️',
            'payment_issue': '💳',
            'system_alert': '🚨'
        };
        return icons[type] || '📢';
    },
    
    async markNotificationAsRead(notificationId) {
        try {
            await API.put(`/admin/notifications/${notificationId}/read`);
            this.loadAdminNotifications();
        } catch (error) {
            Notifications.error('Error al marcar la notificación como leída');
        }
    },
    
    async deleteNotification(notificationId) {
        try {
            await API.delete(`/admin/notifications/${notificationId}`);
            this.loadAdminNotifications();
        } catch (error) {
            Notifications.error('Error al eliminar la notificación');
        }
    },
    
    initNotificationCenter() {
        const notificationTrigger = document.querySelector('.admin-notification-center');
        const notificationDropdown = document.querySelector('#admin-notifications-dropdown');
        
        if (notificationTrigger && notificationDropdown) {
            notificationTrigger.addEventListener('click', () => {
                notificationDropdown.classList.toggle('show');
            });
            
            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!notificationTrigger.contains(e.target) && !notificationDropdown.contains(e.target)) {
                    notificationDropdown.classList.remove('show');
                }
            });
        }
    },
    
    initBroadcastNotifications() {
        const broadcastBtn = document.querySelector('#broadcast-notification-btn');
        if (!broadcastBtn) return;
        
        broadcastBtn.addEventListener('click', () => {
            this.showBroadcastModal();
        });
    },
    
    showBroadcastModal() {
        const content = `
            <form id="broadcastNotificationForm">
                <div class="form-group">
                    <label for="broadcast_title">Título:</label>
                    <input type="text" id="broadcast_title" name="title" class="form-input" required>
                </div>
                <div class="form-group">
                    <label for="broadcast_message">Mensaje:</label>
                    <textarea id="broadcast_message" name="message" class="form-textarea" required></textarea>
                </div>
                <div class="form-group">
                    <label for="broadcast_type">Tipo:</label>
                    <select id="broadcast_type" name="type" class="form-select">
                        <option value="info">Información</option>
                        <option value="warning">Advertencia</option>
                        <option value="success">Éxito</option>
                        <option value="error">Error</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="broadcast_recipients">Destinatarios:</label>
                    <select id="broadcast_recipients" name="recipients" class="form-select">
                        <option value="all">Todos los usuarios</option>
                        <option value="vendors">Solo vendedores</option>
                        <option value="customers">Solo clientes</option>
                        <option value="admins">Solo administradores</option>
                    </select>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Enviar Notificación</button>
                </div>
            </form>
        `;
        
        const modal = Components.createModal('Enviar Notificación Masiva', content);
        
        const form = modal.element.querySelector('#broadcastNotificationForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const notificationData = Object.fromEntries(formData);
            
            try {
                await API.post('/admin/notifications/broadcast', notificationData);
                Notifications.success('Notificación enviada correctamente');
                modal.close();
            } catch (error) {
                Notifications.error('Error al enviar la notificación');
            }
        });
    },
    
    // ===== GESTIÓN DE PEDIDOS ADMIN =====
    initOrderManagement() {
        this.loadAllOrders();
        this.initOrderFilters();
        this.initDisputeManagement();
    },
    
    async loadAllOrders(filters = {}) {
        try {
            const orders = await API.get('/admin/orders', filters);
            this.renderAllOrdersList(orders);
        } catch (error) {
            console.error('Error loading all orders:', error);
        }
    },
    
    renderAllOrdersList(orders) {
        const container = document.querySelector('#all-orders-list');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="admin-empty-state">
                        <div class="empty-icon">📋</div>
                        <div class="empty-title">No hay pedidos</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${order.customer_name}</td>
                <td>${order.vendor_name}</td>
                <td>${Utils.formatDate(order.created_at)}</td>
                <td>${Utils.formatCurrency(order.total)}</td>
                <td>
                    <span class="admin-status-badge ${order.status}">${this.getStatusText(order.status)}</span>
                </td>
                <td>${order.payment_status ? `<span class="payment-status ${order.payment_status}">${order.payment_status}</span>` : 'N/A'}</td>
                <td>
                    <div class="admin-table-actions-cell">
                        <button class="admin-table-action-btn view" onclick="AdminApp.viewOrderDetail('${order.id}')">Ver</button>
                        ${order.has_dispute ? 
                            `<button class="admin-table-action-btn edit" onclick="AdminApp.viewDispute('${order.id}')">Disputa</button>` : 
                            ''
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    viewOrderDetail(orderId) {
        window.location.href = `/admin/orders/view.html?id=${orderId}`;
    },
    
    viewDispute(orderId) {
        window.location.href = `/admin/orders/disputes.html?order_id=${orderId}`;
    },
    
    initOrderFilters() {
        const filterForm = document.querySelector('#order-filters');
        if (!filterForm) return;
        
        filterForm.addEventListener('change', () => {
            const formData = new FormData(filterForm);
            const filters = Object.fromEntries(formData);
            this.loadAllOrders(filters);
        });
    },
    
    initDisputeManagement() {
        this.loadDisputedOrders();
    },
    
    async loadDisputedOrders() {
        try {
            const disputes = await API.get('/admin/orders/disputes');
            this.renderDisputesList(disputes);
        } catch (error) {
            console.error('Error loading disputed orders:', error);
        }
    },
    
    renderDisputesList(disputes) {
        const container = document.querySelector('#disputes-list');
        if (!container) return;
        
        if (disputes.length === 0) {
            container.innerHTML = `
                <div class="admin-empty-state">
                    <div class="empty-icon">⚖️</div>
                    <div class="empty-title">No hay disputas</div>
                    <div class="empty-description">Todas las órdenes están sin problemas</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = disputes.map(dispute => `
            <div class="dispute-card">
                <div class="dispute-header">
                    <div class="dispute-order">Pedido #${dispute.order_id}</div>
                    <div class="dispute-status">
                        <span class="admin-status-badge ${dispute.status}">${dispute.status}</span>
                    </div>
                </div>
                <div class="dispute-content">
                    <div class="dispute-reason">${dispute.reason}</div>
                    <div class="dispute-description">${dispute.description}</div>
                </div>
                <div class="dispute-meta">
                    <span>Reportado por: ${dispute.reported_by}</span>
                    <span>${Utils.timeAgo(dispute.created_at)}</span>
                </div>
                <div class="dispute-actions">
                    <button class="btn btn-primary" onclick="AdminApp.resolveDispute('${dispute.id}')">Resolver</button>
                    <button class="btn btn-outline" onclick="AdminApp.viewDisputeDetail('${dispute.id}')">Ver Detalle</button>
                </div>
            </div>
        `).join('');
    },
    
    async resolveDispute(disputeId) {
        const content = `
            <form id="resolveDisputeForm">
                <div class="form-group">
                    <label for="resolution">Resolución:</label>
                    <select id="resolution" name="resolution" class="form-select" required>
                        <option value="">Seleccionar...</option>
                        <option value="refund_customer">Reembolsar al cliente</option>
                        <option value="favor_vendor">A favor del vendedor</option>
                        <option value="partial_refund">Reembolso parcial</option>
                        <option value="replace_product">Reemplazar producto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="resolution_notes">Notas de la resolución:</label>
                    <textarea id="resolution_notes" name="notes" class="form-textarea" required></textarea>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Resolver Disputa</button>
                </div>
            </form>
        `;
        
        const modal = Components.createModal('Resolver Disputa', content);
        
        const form = modal.element.querySelector('#resolveDisputeForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const resolutionData = Object.fromEntries(formData);
            
            try {
                await API.put(`/admin/disputes/${disputeId}/resolve`, resolutionData);
                Notifications.success('Disputa resuelta correctamente');
                modal.close();
                this.loadDisputedOrders();
            } catch (error) {
                Notifications.error('Error al resolver la disputa');
            }
        });
    },
    
    viewDisputeDetail(disputeId) {
        window.location.href = `/admin/orders/dispute-detail.html?id=${disputeId}`;
    },
    
    // ===== UTILIDADES ADMIN =====
    async exportData(type, filters = {}) {
        try {
            Components.showLoading('Exportando datos...');
            
            const response = await API.post('/admin/export', {
                type: type,
                filters: filters,
                format: 'xlsx'
            });
            
            Components.hideLoading();
            
            if (response.download_url) {
                window.open(response.download_url, '_blank');
                Notifications.success('Exportación completada');
            }
            
        } catch (error) {
            Components.hideLoading();
            Notifications.error('Error al exportar los datos');
        }
    },
    
    async backupDatabase() {
        const confirmed = await Components.confirm(
            '¿Crear una copia de seguridad de la base de datos? Este proceso puede tomar varios minutos.',
            'Crear Backup'
        );
        
        if (!confirmed) return;
        
        try {
            Components.showLoading('Creando backup...');
            
            const response = await API.post('/admin/system/backup');
            
            Components.hideLoading();
            Notifications.success('Backup creado correctamente');
            
            if (response.download_url) {
                window.open(response.download_url, '_blank');
            }
            
        } catch (error) {
            Components.hideLoading();
            Notifications.error('Error al crear el backup');
        }
    },
    
    async clearCache() {
        const confirmed = await Components.confirm(
            '¿Limpiar la caché del sistema? Esto puede afectar temporalmente el rendimiento.',
            'Limpiar Caché'
        );
        
        if (!confirmed) return;
        
        try {
            await API.post('/admin/system/clear-cache');
            Notifications.success('Caché limpiada correctamente');
        } catch (error) {
            Notifications.error('Error al limpiar la caché');
        }
    },
    
    // ===== LOGOUT =====
    async logout() {
        const confirmed = await Components.confirm(
            '¿Cerrar sesión?',
            'Confirmar'
        );
        
        if (!confirmed) return;
        
        try {
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            Storage.clear();
            window.location.href = '/public/login.html';
        }
    }
};

// ===== UTILIDADES ESPECÍFICAS ADMIN =====
const AdminUtils = {
    // Formato especial para métricas admin
    formatMetric(value, type) {
        switch (type) {
            case 'currency':
                return Utils.formatCurrency(value);
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'number':
                return Utils.formatNumber(value);
            default:
                return value;
        }
    },
    
    // Generar colores para gráficos
    generateChartColors(count) {
        const colors = [
            '#4A7023', '#D97741', '#48BB78', '#ED8936',
            '#4299E1', '#9F7AEA', '#38B2AC', '#F56565'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    },
    
    // Validar permisos admin
    hasPermission(permission) {
        const user = AdminApp.currentUser;
        return user && user.permissions && user.permissions.includes(permission);
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    AdminApp.init();
    
    // Configurar logout global
    document.addEventListener('click', (e) => {
        if (e.target.matches('.admin-logout-btn')) {
            e.preventDefault();
            AdminApp.logout();
        }
    });
    
    // Actualizar notificaciones cada 30 segundos
    setInterval(() => {
        AdminApp.loadAdminNotifications();
    }, 30000);
});

// Exportar para uso global
window.AdminApp = AdminApp;
window.AdminUtils = AdminUtils;