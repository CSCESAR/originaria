/*
 * Archivo: assets/js/vendor.js
 * Descripción: JavaScript específico para el panel de vendedor/productor de ORIGINARIA
 * Autor: Equipo ORIGINARIA
 * Fecha: 2024
 * Función: Dashboard vendedor, gestión de productos, ventas, marketing y servicios
 */

// ===== CONFIGURACIÓN PANEL VENDEDOR =====
const VendorApp = {
    currentUser: null,
    
    init() {
        this.checkAuthentication();
        this.initSidebar();
        this.initDashboard();
        this.initProductManagement();
        this.initSalesManagement();
        this.initMarketingTools();
        this.initServicesPanel();
        this.initNotifications();
        this.initCharts();
        this.initFileUploads();
        this.initDataTables();
        
        console.log('Vendor App initialized');
    },
    
    // ===== AUTENTICACIÓN =====
    checkAuthentication() {
        const token = Storage.get('auth_token');
        const user = Storage.get('user');
        
        if (!token || !user || user.type !== 'vendor') {
            window.location.href = '/public/login.html';
            return;
        }
        
        this.currentUser = user;
        this.updateUserInfo();
    },
    
    updateUserInfo() {
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElements = document.querySelectorAll('.user-email');
        const userAvatarElements = document.querySelectorAll('.profile-avatar');
        
        userNameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });
        
        userEmailElements.forEach(el => {
            el.textContent = this.currentUser.email;
        });
        
        userAvatarElements.forEach(el => {
            el.textContent = this.currentUser.name.charAt(0).toUpperCase();
        });
    },
    
    // ===== SIDEBAR =====
    initSidebar() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.vendor-sidebar');
        const mainContent = document.querySelector('.vendor-main');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent?.classList.toggle('sidebar-collapsed');
                
                // Guardar estado
                Storage.set('sidebar_collapsed', sidebar.classList.contains('collapsed'));
            });
            
            // Restaurar estado
            const isCollapsed = Storage.get('sidebar_collapsed');
            if (isCollapsed) {
                sidebar.classList.add('collapsed');
                mainContent?.classList.add('sidebar-collapsed');
            }
        }
        
        // Marcar enlace activo
        this.updateActiveNavLink();
        
        // Mobile sidebar
        this.initMobileSidebar();
    },
    
    updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    initMobileSidebar() {
        const mobileToggle = document.querySelector('.mobile-sidebar-toggle');
        const sidebar = document.querySelector('.vendor-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
                document.body.classList.toggle('sidebar-open');
            });
            
            overlay?.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                document.body.classList.remove('sidebar-open');
            });
        }
    },
    
    // ===== DASHBOARD =====
    initDashboard() {
        this.loadDashboardStats();
        this.loadRecentOrders();
        this.loadTopProducts();
        this.initQuickActions();
    },
    
    async loadDashboardStats() {
        try {
            const stats = await API.get('/vendor/dashboard/stats');
            this.updateStatsCards(stats);
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    },
    
    updateStatsCards(stats) {
        const statsMapping = {
            'total-sales': { value: stats.totalSales, format: 'currency' },
            'total-orders': { value: stats.totalOrders, format: 'number' },
            'total-products': { value: stats.totalProducts, format: 'number' },
            'monthly-revenue': { value: stats.monthlyRevenue, format: 'currency' }
        };
        
        Object.entries(statsMapping).forEach(([key, data]) => {
            const card = document.querySelector(`[data-stat="${key}"]`);
            if (card) {
                const valueElement = card.querySelector('.stat-value');
                const changeElement = card.querySelector('.stat-change');
                
                if (valueElement) {
                    valueElement.textContent = data.format === 'currency' 
                        ? Utils.formatCurrency(data.value)
                        : Utils.formatNumber(data.value);
                }
                
                if (changeElement && data.change !== undefined) {
                    const isPositive = data.change > 0;
                    changeElement.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
                    changeElement.innerHTML = `
                        <span class="stat-change-icon">${isPositive ? '↗' : '↘'}</span>
                        ${Math.abs(data.change)}%
                    `;
                }
            }
        });
    },
    
    async loadRecentOrders() {
        try {
            const orders = await API.get('/vendor/orders', { limit: 5, status: 'recent' });
            this.renderRecentOrders(orders);
        } catch (error) {
            console.error('Error loading recent orders:', error);
        }
    },
    

    renderRecentOrders(orders) {
        const container = document.querySelector('#recent-orders-list');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay pedidos recientes</p>';
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <div class="order-id">#${order.id}</div>
                    <div class="order-customer">${order.customer_name}</div>
                    <div class="order-date">${Utils.formatDate(order.created_at)}</div>
                </div>
                <div class="order-details">
                    <div class="order-amount">${Utils.formatCurrency(order.total)}</div>
                    <div class="order-status">
                        <span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-sm btn-outline" onclick="VendorApp.viewOrder('${order.id}')">Ver</button>
                </div>
            </div>
        `).join('');
    },
    
    getStatusText(status) {
        const statusMap = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return statusMap[status] || status;
    },
    
    async loadTopProducts() {
        try {
            const products = await API.get('/vendor/products/top', { limit: 5 });
            this.renderTopProducts(products);
        } catch (error) {
            console.error('Error loading top products:', error);
        }
    },
    
    renderTopProducts(products) {
        const container = document.querySelector('#top-products-list');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay datos de productos</p>';
            return;
        }
        
        container.innerHTML = products.map(product => `
            <div class="product-item">
                <div class="product-image">
                    <img src="${product.image || '/assets/images/products/placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-sales">${product.sales_count} ventas</div>
                </div>
                <div class="product-revenue">
                    ${Utils.formatCurrency(product.revenue)}
                </div>
            </div>
        `).join('');
    },
    
    initQuickActions() {
        const quickActions = document.querySelectorAll('.quick-action-card');
        
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                e.preventDefault();
                const actionType = action.getAttribute('data-action');
                this.handleQuickAction(actionType);
            });
        });
    },
    
    handleQuickAction(actionType) {
        const actions = {
            'add-product': () => window.location.href = '/vendor/products/add.html',
            'view-orders': () => window.location.href = '/vendor/sales/orders.html',
            'create-campaign': () => window.location.href = '/vendor/marketing/campaigns.html',
            'view-analytics': () => window.location.href = '/vendor/products/analytics.html',
            'contact-support': () => this.openSupportChat(),
            'view-payments': () => window.location.href = '/vendor/sales/payments.html'
        };
        
        const action = actions[actionType];
        if (action) {
            action();
        }
    },
    
    // ===== GESTIÓN DE PRODUCTOS =====
    initProductManagement() {
        this.initProductForm();
        this.initProductList();
        this.initProductSearch();
        this.initBulkActions();
    },
    
    initProductForm() {
        const productForm = document.getElementById('productForm');
        if (!productForm) return;
        
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct(productForm);
        });
        
        // Auto-save draft
        const autoSave = Utils.debounce(() => {
            this.saveDraft(productForm);
        }, 2000);
        
        productForm.addEventListener('input', autoSave);
        
        // Slug generation
        const nameInput = productForm.querySelector('input[name="name"]');
        const slugInput = productForm.querySelector('input[name="slug"]');
        
        if (nameInput && slugInput) {
            nameInput.addEventListener('input', (e) => {
                if (!slugInput.value || slugInput.getAttribute('data-auto') !== 'false') {
                    slugInput.value = Utils.generateSlug(e.target.value);
                    slugInput.setAttribute('data-auto', 'true');
                }
            });
            
            slugInput.addEventListener('input', () => {
                slugInput.setAttribute('data-auto', 'false');
            });
        }
    },
    
    async saveProduct(form) {
        const formData = new FormData(form);
        const productId = form.getAttribute('data-product-id');
        const isEdit = !!productId;
        
        // Validaciones
        const validation = this.validateProductForm(formData);
        if (!validation.valid) {
            Notifications.error(validation.errors.join(', '));
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = isEdit ? 'Actualizando...' : 'Guardando...';
            submitBtn.disabled = true;
            
            const endpoint = isEdit ? `/vendor/products/${productId}` : '/vendor/products';
            const method = isEdit ? 'PUT' : 'POST';
            
            let response;
            if (method === 'PUT') {
                response = await API.put(endpoint, Object.fromEntries(formData));
            } else {
                response = await API.post(endpoint, Object.fromEntries(formData));
            }
            
            Notifications.success(isEdit ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
            
            // Limpiar draft
            this.clearDraft();
            
            // Redirigir o actualizar
            setTimeout(() => {
                if (!isEdit) {
                    window.location.href = `/vendor/products/edit.html?id=${response.product.id}`;
                }
            }, 1000);
            
        } catch (error) {
            Notifications.error(error.message || 'Error al guardar el producto');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },
    
    validateProductForm(formData) {
        const errors = [];
        const data = Object.fromEntries(formData);
        
        if (!data.name?.trim()) errors.push('El nombre es obligatorio');
        if (!data.description?.trim()) errors.push('La descripción es obligatoria');
        if (!data.price || parseFloat(data.price) <= 0) errors.push('El precio debe ser mayor a 0');
        if (!data.category) errors.push('La categoría es obligatoria');
        if (!data.stock || parseInt(data.stock) < 0) errors.push('El stock no puede ser negativo');
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },
    
    saveDraft(form) {
        const formData = new FormData(form);
        const draft = Object.fromEntries(formData);
        Storage.set('product_draft', draft, 60); // 1 hora
        
        // Mostrar indicador
        const draftIndicator = document.querySelector('.draft-indicator');
        if (draftIndicator) {
            draftIndicator.textContent = `Borrador guardado a las ${Utils.formatDate(new Date(), { timeStyle: 'short' })}`;
            draftIndicator.style.display = 'block';
        }
    },
    
    loadDraft(form) {
        const draft = Storage.get('product_draft');
        if (!draft) return;
        
        Object.entries(draft).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
        
        Notifications.info('Se cargó un borrador guardado anteriormente');
    },
    
    clearDraft() {
        Storage.remove('product_draft');
        const draftIndicator = document.querySelector('.draft-indicator');
        if (draftIndicator) {
            draftIndicator.style.display = 'none';
        }
    },
    
    initProductList() {
        this.loadProducts();
        this.initProductFilters();
    },
    
    async loadProducts(filters = {}) {
        try {
            const products = await API.get('/vendor/products', filters);
            this.renderProductList(products);
        } catch (error) {
            console.error('Error loading products:', error);
            Notifications.error('Error al cargar los productos');
        }
    },
    
    renderProductList(products) {
        const container = document.querySelector('#products-list');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="vendor-empty-state">
                    <div class="empty-icon">📦</div>
                    <div class="empty-title">No tienes productos aún</div>
                    <div class="empty-description">Agrega tu primer producto para empezar a vender</div>
                    <a href="/vendor/products/add.html" class="btn btn-primary">Agregar Producto</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => `
            <tr>
                <td>
                    <div class="product-cell">
                        <div class="product-image">
                            <img src="${product.image || '/assets/images/products/placeholder.jpg'}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-sku">SKU: ${product.sku || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${product.category_name}</td>
                <td>${Utils.formatCurrency(product.price)}</td>
                <td>
                    <span class="stock-indicator ${product.stock <= product.min_stock ? 'low' : ''}">${product.stock}</span>
                </td>
                <td>
                    <span class="status-badge ${product.status}">${this.getProductStatusText(product.status)}</span>
                </td>
                <td>${Utils.formatDate(product.updated_at)}</td>
                <td>
                    <div class="table-actions-cell">
                        <button class="table-action-btn view" onclick="VendorApp.viewProduct('${product.id}')">Ver</button>
                        <button class="table-action-btn edit" onclick="VendorApp.editProduct('${product.id}')">Editar</button>
                        <button class="table-action-btn delete" onclick="VendorApp.deleteProduct('${product.id}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    getProductStatusText(status) {
        const statusMap = {
            active: 'Activo',
            inactive: 'Inactivo',
            pending: 'Pendiente',
            rejected: 'Rechazado'
        };
        return statusMap[status] || status;
    },
    
    initProductFilters() {
        const filterForm = document.querySelector('#product-filters');
        if (!filterForm) return;
        
        filterForm.addEventListener('change', () => {
            const formData = new FormData(filterForm);
            const filters = Object.fromEntries(formData);
            this.loadProducts(filters);
        });
        
        // Reset filters
        const resetBtn = filterForm.querySelector('.reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterForm.reset();
                this.loadProducts();
            });
        }
    },
    
    initProductSearch() {
        const searchInput = document.querySelector('#product-search');
        if (!searchInput) return;
        
        const debouncedSearch = Utils.debounce((query) => {
            this.loadProducts({ search: query });
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });
    },
    
    // ===== ACCIONES DE PRODUCTOS =====
    viewProduct(productId) {
        window.location.href = `/vendor/products/view.html?id=${productId}`;
    },
    
    editProduct(productId) {
        window.location.href = `/vendor/products/edit.html?id=${productId}`;
    },
    
    async deleteProduct(productId) {
        const confirmed = await Components.confirm(
            '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.',
            'Eliminar Producto'
        );
        
        if (!confirmed) return;
        
        try {
            await API.delete(`/vendor/products/${productId}`);
            Notifications.success('Producto eliminado correctamente');
            this.loadProducts(); // Recargar lista
        } catch (error) {
            Notifications.error('Error al eliminar el producto');
        }
    },
    
    async duplicateProduct(productId) {
        try {
            const response = await API.post(`/vendor/products/${productId}/duplicate`);
            Notifications.success('Producto duplicado correctamente');
            window.location.href = `/vendor/products/edit.html?id=${response.product.id}`;
        } catch (error) {
            Notifications.error('Error al duplicar el producto');
        }
    },
    
    initBulkActions() {
        const selectAllCheckbox = document.querySelector('#select-all-products');
        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        const bulkActionsBar = document.querySelector('#bulk-actions-bar');
        
        if (!selectAllCheckbox || !bulkActionsBar) return;
        
        // Select all
        selectAllCheckbox.addEventListener('change', (e) => {
            productCheckboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            this.updateBulkActionsBar();
        });
        
        // Individual selections
        productCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateBulkActionsBar();
            });
        });
        
        // Bulk actions
        const bulkActionSelect = bulkActionsBar.querySelector('#bulk-action-select');
        const applyBulkAction = bulkActionsBar.querySelector('#apply-bulk-action');
        
        if (bulkActionSelect && applyBulkAction) {
            applyBulkAction.addEventListener('click', () => {
                const action = bulkActionSelect.value;
                const selectedIds = this.getSelectedProductIds();
                
                if (selectedIds.length === 0) {
                    Notifications.warning('Selecciona al menos un producto');
                    return;
                }
                
                this.executeBulkAction(action, selectedIds);
            });
        }
    },
    
    updateBulkActionsBar() {
        const selectedCount = this.getSelectedProductIds().length;
        const bulkActionsBar = document.querySelector('#bulk-actions-bar');
        const selectedCountSpan = bulkActionsBar?.querySelector('#selected-count');
        
        if (bulkActionsBar) {
            if (selectedCount > 0) {
                bulkActionsBar.style.display = 'flex';
                if (selectedCountSpan) {
                    selectedCountSpan.textContent = selectedCount;
                }
            } else {
                bulkActionsBar.style.display = 'none';
            }
        }
    },
    
    getSelectedProductIds() {
        const checkboxes = document.querySelectorAll('.product-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    },
    
    async executeBulkAction(action, productIds) {
        const actions = {
            'activate': () => this.bulkUpdateStatus(productIds, 'active'),
            'deactivate': () => this.bulkUpdateStatus(productIds, 'inactive'),
            'delete': () => this.bulkDelete(productIds),
            'update-category': () => this.showBulkCategoryModal(productIds),
            'export': () => this.exportProducts(productIds)
        };
        
        const actionFunction = actions[action];
        if (actionFunction) {
            await actionFunction();
        }
    },
    
    async bulkUpdateStatus(productIds, status) {
        try {
            await API.post('/vendor/products/bulk-update', {
                product_ids: productIds,
                status: status
            });
            
            Notifications.success(`${productIds.length} productos actualizados`);
            this.loadProducts();
        } catch (error) {
            Notifications.error('Error al actualizar los productos');
        }
    },
    
    async bulkDelete(productIds) {
        const confirmed = await Components.confirm(
            `¿Estás seguro de que quieres eliminar ${productIds.length} productos? Esta acción no se puede deshacer.`,
            'Eliminar Productos'
        );
        
        if (!confirmed) return;
        
        try {
            await API.post('/vendor/products/bulk-delete', {
                product_ids: productIds
            });
            
            Notifications.success(`${productIds.length} productos eliminados`);
            this.loadProducts();
        } catch (error) {
            Notifications.error('Error al eliminar los productos');
        }
    },
    
    // ===== GESTIÓN DE VENTAS =====
    initSalesManagement() {
        this.loadSalesData();
        this.initOrderManagement();
        this.initPaymentsTracking();
        this.initSalesReports();
    },
    
    async loadSalesData() {
        try {
            const salesData = await API.get('/vendor/sales/overview');
            this.updateSalesOverview(salesData);
        } catch (error) {
            console.error('Error loading sales data:', error);
        }
    },
    
    updateSalesOverview(data) {
        // Actualizar métricas de ventas
        const metricsMap = {
            'daily-sales': Utils.formatCurrency(data.dailySales),
            'weekly-sales': Utils.formatCurrency(data.weeklySales),
            'monthly-sales': Utils.formatCurrency(data.monthlySales),
            'pending-orders': data.pendingOrders,
            'completed-orders': data.completedOrders
        };
        
        Object.entries(metricsMap).forEach(([key, value]) => {
            const element = document.querySelector(`[data-metric="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    },
    
    initOrderManagement() {
        this.loadOrders();
        this.initOrderFilters();
        this.initOrderActions();
    },
    
    async loadOrders(filters = {}) {
        try {
            const orders = await API.get('/vendor/orders', filters);
            this.renderOrdersList(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    },
    
    renderOrdersList(orders) {
        const container = document.querySelector('#orders-list');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="vendor-empty-state">
                    <div class="empty-icon">📋</div>
                    <div class="empty-title">No hay pedidos</div>
                    <div class="empty-description">Los pedidos aparecerán aquí cuando los clientes compren tus productos</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${order.customer_name}</td>
                <td>${Utils.formatDate(order.created_at)}</td>
                <td>${Utils.formatCurrency(order.total)}</td>
                <td>
                    <span class="status-badge ${order.status}">${this.getStatusText(order.status)}</span>
                </td>
                <td>${order.items_count} items</td>
                <td>
                    <div class="table-actions-cell">
                        <button class="table-action-btn view" onclick="VendorApp.viewOrder('${order.id}')">Ver</button>
                        <button class="table-action-btn edit" onclick="VendorApp.updateOrderStatus('${order.id}')">Actualizar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    viewOrder(orderId) {
        window.location.href = `/vendor/sales/order-detail.html?id=${orderId}`;
    },
    
    async updateOrderStatus(orderId) {
        // Mostrar modal para actualizar estado
        const content = `
            <form id="updateOrderStatusForm">
                <div class="form-group">
                    <label for="order_status">Nuevo Estado:</label>
                    <select id="order_status" name="status" class="form-select" required>
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="status_note">Nota (opcional):</label>
                    <textarea id="status_note" name="note" class="form-textarea" placeholder="Información adicional sobre el cambio de estado"></textarea>
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Actualizar</button>
                </div>
            </form>
        `;
        
        const modal = Components.createModal('Actualizar Estado del Pedido', content);
        
        const form = modal.element.querySelector('#updateOrderStatusForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                await API.put(`/vendor/orders/${orderId}/status`, data);
                Notifications.success('Estado del pedido actualizado correctamente');
                modal.close();
                this.loadOrders(); // Recargar lista
            } catch (error) {
                Notifications.error('Error al actualizar el estado del pedido');
            }
        });
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    VendorApp.init();
});

// Exportar para uso global
window.VendorApp = VendorApp;