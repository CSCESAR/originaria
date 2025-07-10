/*
 * Archivo: assets/js/components.js
 * Descripción: Componentes JavaScript reutilizables para ORIGINARIA
 * Autor: Equipo ORIGINARIA
 * Fecha: 2024
 * Función: Widgets, formularios, tablas y componentes UI comunes
 */

// ===== COMPONENTES REUTILIZABLES =====
const OriginairiaComponents = {
    
    // ===== DATA TABLES =====
    DataTable: class {
        constructor(element, options = {}) {
            this.element = typeof element === 'string' ? document.querySelector(element) : element;
            this.options = {
                searchable: true,
                sortable: true,
                paginate: true,
                perPage: 10,
                columns: [],
                data: [],
                actions: [],
                ...options
            };
            
            this.currentPage = 1;
            this.sortColumn = null;
            this.sortDirection = 'asc';
            this.searchTerm = '';
            this.filteredData = [];
            
            this.init();
        }
        
        init() {
            this.render();
            this.bindEvents();
            this.filterAndSort();
        }
        
        render() {
            this.element.innerHTML = `
                <div class="datatable-container">
                    ${this.options.searchable ? this.renderSearch() : ''}
                    <div class="datatable-wrapper">
                        <table class="datatable">
                            <thead>
                                ${this.renderHeader()}
                            </thead>
                            <tbody class="datatable-body">
                                ${this.renderBody()}
                            </tbody>
                        </table>
                    </div>
                    ${this.options.paginate ? this.renderPagination() : ''}
                </div>
            `;
        }
        
        renderSearch() {
            return `
                <div class="datatable-search">
                    <input type="text" class="datatable-search-input" placeholder="Buscar...">
                </div>
            `;
        }
        
        renderHeader() {
            return `
                <tr>
                    ${this.options.columns.map(column => `
                        <th ${this.options.sortable ? `class="sortable" data-column="${column.key}"` : ''}>
                            ${column.label}
                            ${this.options.sortable ? '<span class="sort-indicator"></span>' : ''}
                        </th>
                    `).join('')}
                    ${this.options.actions.length > 0 ? '<th>Acciones</th>' : ''}
                </tr>
            `;
        }
        
        renderBody() {
            const startIndex = (this.currentPage - 1) * this.options.perPage;
            const endIndex = startIndex + this.options.perPage;
            const pageData = this.filteredData.slice(startIndex, endIndex);
            
            if (pageData.length === 0) {
                return `
                    <tr>
                        <td colspan="${this.options.columns.length + (this.options.actions.length > 0 ? 1 : 0)}" class="datatable-empty">
                            No hay datos para mostrar
                        </td>
                    </tr>
                `;
            }
            
            return pageData.map(row => `
                <tr>
                    ${this.options.columns.map(column => `
                        <td>${this.formatCellValue(row[column.key], column)}</td>
                    `).join('')}
                    ${this.options.actions.length > 0 ? `<td>${this.renderActions(row)}</td>` : ''}
                </tr>
            `).join('');
        }
        
        formatCellValue(value, column) {
            if (column.formatter) {
                return column.formatter(value);
            }
            
            switch (column.type) {
                case 'currency':
                    return Utils.formatCurrency(value);
                case 'date':
                    return Utils.formatDate(value);
                case 'number':
                    return Utils.formatNumber(value);
                case 'badge':
                    return `<span class="status-badge ${value}">${value}</span>`;
                default:
                    return value || '';
            }
        }
        
        renderActions(row) {
            return this.options.actions.map(action => `
                <button class="datatable-action-btn ${action.class || ''}" 
                        onclick="${action.handler}('${row.id || row[action.idField || 'id']}')">
                    ${action.label}
                </button>
            `).join('');
        }
        
        renderPagination() {
            const totalPages = Math.ceil(this.filteredData.length / this.options.perPage);
            
            if (totalPages <= 1) return '';
            
            let paginationHTML = '<div class="datatable-pagination">';
            
            // Previous button
            paginationHTML += `
                <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                        data-page="${this.currentPage - 1}">
                    Anterior
                </button>
            `;
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    paginationHTML += `
                        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                                data-page="${i}">
                            ${i}
                        </button>
                    `;
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    paginationHTML += '<span class="pagination-ellipsis">...</span>';
                }
            }
            
            // Next button
            paginationHTML += `
                <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                        data-page="${this.currentPage + 1}">
                    Siguiente
                </button>
            `;
            
            paginationHTML += '</div>';
            return paginationHTML;
        }
        
        bindEvents() {
            // Search
            if (this.options.searchable) {
                const searchInput = this.element.querySelector('.datatable-search-input');
                searchInput.addEventListener('input', Utils.debounce((e) => {
                    this.searchTerm = e.target.value;
                    this.currentPage = 1;
                    this.filterAndSort();
                }, 300));
            }
            
            // Sort
            if (this.options.sortable) {
                this.element.addEventListener('click', (e) => {
                    if (e.target.matches('.sortable') || e.target.closest('.sortable')) {
                        const th = e.target.closest('.sortable');
                        const column = th.getAttribute('data-column');
                        this.sort(column);
                    }
                });
            }
            
            // Pagination
            if (this.options.paginate) {
                this.element.addEventListener('click', (e) => {
                    if (e.target.matches('.pagination-btn') && !e.target.classList.contains('disabled')) {
                        const page = parseInt(e.target.getAttribute('data-page'));
                        this.goToPage(page);
                    }
                });
            }
        }
        
        filterAndSort() {
            // Filter
            this.filteredData = this.options.data.filter(row => {
                if (!this.searchTerm) return true;
                
                return this.options.columns.some(column => {
                    const value = row[column.key];
                    return value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
                });
            });
            
            // Sort
            if (this.sortColumn) {
                this.filteredData.sort((a, b) => {
                    const aVal = a[this.sortColumn];
                    const bVal = b[this.sortColumn];
                    
                    let comparison = 0;
                    if (aVal > bVal) comparison = 1;
                    if (aVal < bVal) comparison = -1;
                    
                    return this.sortDirection === 'desc' ? -comparison : comparison;
                });
            }
            
            this.updateTable();
        }
        
        sort(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }
            
            this.currentPage = 1;
            this.filterAndSort();
            this.updateSortIndicators();
        }
        
        updateSortIndicators() {
            this.element.querySelectorAll('.sortable').forEach(th => {
                const indicator = th.querySelector('.sort-indicator');
                const column = th.getAttribute('data-column');
                
                if (column === this.sortColumn) {
                    indicator.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
                    th.classList.add('sorted');
                } else {
                    indicator.textContent = '';
                    th.classList.remove('sorted');
                }
            });
        }
        
        goToPage(page) {
            const totalPages = Math.ceil(this.filteredData.length / this.options.perPage);
            if (page >= 1 && page <= totalPages) {
                this.currentPage = page;
                this.updateTable();
            }
        }
        
        updateTable() {
            const tbody = this.element.querySelector('.datatable-body');
            tbody.innerHTML = this.renderBody();
            
            if (this.options.paginate) {
                const paginationContainer = this.element.querySelector('.datatable-pagination');
                if (paginationContainer) {
                    paginationContainer.outerHTML = this.renderPagination();
                }
            }
        }
        
        setData(data) {
            this.options.data = data;
            this.currentPage = 1;
            this.filterAndSort();
        }
        
        refresh() {
            this.filterAndSort();
        }
    },
    
    // ===== FORM BUILDER =====
    FormBuilder: class {
        constructor(element, options = {}) {
            this.element = typeof element === 'string' ? document.querySelector(element) : element;
            this.options = {
                fields: [],
                submitText: 'Guardar',
                cancelText: 'Cancelar',
                onSubmit: null,
                onCancel: null,
                validation: true,
                ...options
            };
            
            this.init();
        }
        
        init() {
            this.render();
            this.bindEvents();
        }
        
        render() {
            this.element.innerHTML = `
                <form class="dynamic-form">
                    ${this.renderFields()}
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">${this.options.submitText}</button>
                        ${this.options.onCancel ? `<button type="button" class="btn btn-outline form-cancel">${this.options.cancelText}</button>` : ''}
                    </div>
                </form>
            `;
        }
        
        renderFields() {
            return this.options.fields.map(field => `
                <div class="form-group">
                    ${this.renderField(field)}
                </div>
            `).join('');
        }
        
        renderField(field) {
            const commonAttrs = `
                name="${field.name}"
                id="${field.name}"
                ${field.required ? 'required' : ''}
                ${field.disabled ? 'disabled' : ''}
                ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                class="form-input ${field.class || ''}"
            `;
            
            let fieldHTML = '';
            
            // Label
            if (field.label) {
                fieldHTML += `<label for="${field.name}" class="form-label">${field.label}${field.required ? ' *' : ''}</label>`;
            }
            
            // Field input
            switch (field.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'number':
                case 'url':
                case 'tel':
                    fieldHTML += `<input type="${field.type}" ${commonAttrs} value="${field.value || ''}">`;
                    break;
                    
                case 'textarea':
                    fieldHTML += `<textarea ${commonAttrs} rows="${field.rows || 4}">${field.value || ''}</textarea>`;
                    break;
                    
                case 'select':
                    fieldHTML += `
                        <select ${commonAttrs}>
                            ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
                            ${field.options.map(option => `
                                <option value="${option.value}" ${option.value === field.value ? 'selected' : ''}>
                                    ${option.label}
                                </option>
                            `).join('')}
                        </select>
                    `;
                    break;
                    
                case 'checkbox':
                    fieldHTML += `
                        <label class="checkbox-label">
                            <input type="checkbox" name="${field.name}" value="${field.value || '1'}" ${field.checked ? 'checked' : ''}>
                            <span class="checkbox-text">${field.text || field.label}</span>
                        </label>
                    `;
                    break;
                    
                case 'radio':
                    fieldHTML += field.options.map(option => `
                        <label class="radio-label">
                            <input type="radio" name="${field.name}" value="${option.value}" ${option.value === field.value ? 'checked' : ''}>
                            <span class="radio-text">${option.label}</span>
                        </label>
                    `).join('');
                    break;
                    
                case 'file':
                    fieldHTML += `
                        <input type="file" ${commonAttrs} ${field.accept ? `accept="${field.accept}"` : ''} ${field.multiple ? 'multiple' : ''}>
                        ${field.preview ? '<div class="file-preview"></div>' : ''}
                    `;
                    break;
                    
                case 'date':
                case 'datetime-local':
                case 'time':
                    fieldHTML += `<input type="${field.type}" ${commonAttrs} value="${field.value || ''}">`;
                    break;
                    
                default:
                    fieldHTML += `<input type="text" ${commonAttrs} value="${field.value || ''}">`;
            }
            
            // Help text
            if (field.help) {
                fieldHTML += `<small class="form-help">${field.help}</small>`;
            }
            
            return fieldHTML;
        }
        
        bindEvents() {
            const form = this.element.querySelector('.dynamic-form');
            
            // Submit
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (this.options.validation && !this.validate()) {
                    return;
                }
                
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                if (this.options.onSubmit) {
                    this.options.onSubmit(data, form);
                }
            });
            
            // Cancel
            const cancelBtn = form.querySelector('.form-cancel');
            if (cancelBtn && this.options.onCancel) {
                cancelBtn.addEventListener('click', () => {
                    this.options.onCancel();
                });
            }
            
            // File preview
            form.addEventListener('change', (e) => {
                if (e.target.type === 'file') {
                    this.handleFilePreview(e.target);
                }
            });
        }
        
        validate() {
            const form = this.element.querySelector('.dynamic-form');
            let isValid = true;
            
            // Clear previous errors
            form.querySelectorAll('.field-error').forEach(el => el.remove());
            form.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
            
            this.options.fields.forEach(field => {
                const input = form.querySelector(`[name="${field.name}"]`);
                if (!input) return;
                
                const errors = this.validateField(field, input.value);
                
                if (errors.length > 0) {
                    isValid = false;
                    this.showFieldError(input, errors[0]);
                }
            });
            
            return isValid;
        }
        
        validateField(field, value) {
            const errors = [];
            
            // Required validation
            if (field.required && (!value || value.trim() === '')) {
                errors.push('Este campo es obligatorio');
            }
            
            if (value && field.validation) {
                // Email validation
                if (field.validation.email && !Utils.isValidEmail(value)) {
                    errors.push('Ingrese un email válido');
                }
                
                // Min length validation
                if (field.validation.minLength && value.length < field.validation.minLength) {
                    errors.push(`Mínimo ${field.validation.minLength} caracteres`);
                }
                
                // Max length validation
                if (field.validation.maxLength && value.length > field.validation.maxLength) {
                    errors.push(`Máximo ${field.validation.maxLength} caracteres`);
                }
                
                // Pattern validation
                if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
                    errors.push(field.validation.message || 'Formato inválido');
                }
                
                // Custom validation
                if (field.validation.custom && typeof field.validation.custom === 'function') {
                    const customResult = field.validation.custom(value);
                    if (customResult !== true) {
                        errors.push(customResult);
                    }
                }
            }
            
            return errors;
        }
        
        showFieldError(input, message) {
            input.classList.add('error');
            
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            errorElement.style.cssText = `
                color: #F56565;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            `;
            
            input.parentNode.appendChild(errorElement);
        }
        
        handleFilePreview(input) {
            const field = this.options.fields.find(f => f.name === input.name);
            if (!field || !field.preview) return;
            
            const previewContainer = input.parentNode.querySelector('.file-preview');
            if (!previewContainer) return;
            
            previewContainer.innerHTML = '';
            
            Array.from(input.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.cssText = 'max-width: 200px; max-height: 200px; margin: 10px;';
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const fileInfo = document.createElement('div');
                    fileInfo.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
                    fileInfo.style.cssText = 'margin: 10px; padding: 10px; background: #f0f0f0; border-radius: 4px;';
                    previewContainer.appendChild(fileInfo);
                }
            });
        }
        
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        setValues(data) {
            const form = this.element.querySelector('.dynamic-form');
            
            Object.entries(data).forEach(([key, value]) => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else if (input.type === 'radio') {
                        const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
                        if (radio) radio.checked = true;
                    } else {
                        input.value = value;
                    }
                }
            });
        }
        
        getValues() {
            const form = this.element.querySelector('.dynamic-form');
            const formData = new FormData(form);
            return Object.fromEntries(formData);
        }
        
        reset() {
            this.element.querySelector('.dynamic-form').reset();
        }
    },
    
    // ===== CHART WIDGET =====
    ChartWidget: class {
        constructor(element, options = {}) {
            this.element = typeof element === 'string' ? document.querySelector(element) : element;
            this.options = {
                type: 'line', // line, bar, pie, doughnut
                title: '',
                data: [],
                labels: [],
                colors: ['#4A7023', '#D97741', '#48BB78', '#ED8936'],
                responsive: true,
                ...options
            };
            
            this.init();
        }
        
        init() {
            this.render();
        }
        
        render() {
            this.element.innerHTML = `
                <div class="chart-widget">
                    ${this.options.title ? `<h3 class="chart-title">${this.options.title}</h3>` : ''}
                    <div class="chart-container">
                        <canvas class="chart-canvas" width="400" height="200"></canvas>
                    </div>
                    <div class="chart-legend"></div>
                </div>
            `;
            
            // Render simple chart placeholder for now
            this.renderPlaceholderChart();
        }
        
        renderPlaceholderChart() {
            const canvas = this.element.querySelector('.chart-canvas');
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw simple placeholder based on type
            switch (this.options.type) {
                case 'line':
                    this.drawLineChart(ctx, canvas);
                    break;
                case 'bar':
                    this.drawBarChart(ctx, canvas);
                    break;
                case 'pie':
                case 'doughnut':
                    this.drawPieChart(ctx, canvas);
                    break;
                default:
                    this.drawLineChart(ctx, canvas);
            }
            
            this.renderLegend();
        }
        
        drawLineChart(ctx, canvas) {
            const { width, height } = canvas;
            const margin = 40;
            const chartWidth = width - 2 * margin;
            const chartHeight = height - 2 * margin;
            
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 1;
            
            // Draw grid
            for (let i = 0; i <= 5; i++) {
                const y = margin + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(margin, y);
                ctx.lineTo(width - margin, y);
                ctx.stroke();
            }
            
            // Draw line
            if (this.options.data.length > 0) {
                ctx.strokeStyle = this.options.colors[0];
                ctx.lineWidth = 3;
                ctx.beginPath();
                
                this.options.data.forEach((value, index) => {
                    const x = margin + (chartWidth / (this.options.data.length - 1)) * index;
                    const y = margin + chartHeight - (value / Math.max(...this.options.data)) * chartHeight;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                
                ctx.stroke();
            }
        }
        
        drawBarChart(ctx, canvas) {
            const { width, height } = canvas;
            const margin = 40;
            const chartWidth = width - 2 * margin;
            const chartHeight = height - 2 * margin;
            
            if (this.options.data.length > 0) {
                const barWidth = chartWidth / this.options.data.length * 0.8;
                const maxValue = Math.max(...this.options.data);
                
                this.options.data.forEach((value, index) => {
                    const x = margin + (chartWidth / this.options.data.length) * index + (chartWidth / this.options.data.length - barWidth) / 2;
                    const barHeight = (value / maxValue) * chartHeight;
                    const y = margin + chartHeight - barHeight;
                    
                    ctx.fillStyle = this.options.colors[index % this.options.colors.length];
                    ctx.fillRect(x, y, barWidth, barHeight);
                });
            }
        }
        
        drawPieChart(ctx, canvas) {
            const { width, height } = canvas;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 20;
            
            if (this.options.data.length > 0) {
                const total = this.options.data.reduce((sum, value) => sum + value, 0);
                let currentAngle = -Math.PI / 2;
                
                this.options.data.forEach((value, index) => {
                    const sliceAngle = (value / total) * 2 * Math.PI;
                    
                    ctx.fillStyle = this.options.colors[index % this.options.colors.length];
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fill();
                    
                    currentAngle += sliceAngle;
                });
                
                // For doughnut chart, draw inner circle
                if (this.options.type === 'doughnut') {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        
        renderLegend() {
            const legendContainer = this.element.querySelector('.chart-legend');
            
            if (this.options.labels.length > 0) {
                legendContainer.innerHTML = this.options.labels.map((label, index) => `
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: ${this.options.colors[index % this.options.colors.length]}"></span>
                        <span class="legend-label">${label}</span>
                    </div>
                `).join('');
            }
        }
        
        updateData(data, labels = null) {
            this.options.data = data;
            if (labels) {
                this.options.labels = labels;
            }
            this.renderPlaceholderChart();
        }
    },
    
    // ===== FILE UPLOADER =====
    FileUploader: class {
        constructor(element, options = {}) {
            this.element = typeof element === 'string' ? document.querySelector(element) : element;
            this.options = {
                maxFiles: 5,
                maxSize: 5 * 1024 * 1024, // 5MB
                acceptedTypes: ['image/*'],
                uploadUrl: '/api/upload',
                onUpload: null,
                onError: null,
                onProgress: null,
                ...options
            };
            
            this.files = [];
            this.init();
        }
        
        init() {
            this.render();
            this.bindEvents();
        }
        
        render() {
            this.element.innerHTML = `
                <div class="file-uploader">
                    <div class="upload-area">
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">
                            <p>Arrastra archivos aquí o <button type="button" class="upload-browse-btn">selecciona archivos</button></p>
                            <small>Máximo ${this.options.maxFiles} archivos, ${this.formatFileSize(this.options.maxSize)} por archivo</small>
                        </div>
                        <input type="file" class="upload-input" multiple 
                               accept="${this.options.acceptedTypes.join(',')}"
                               style="display: none;">
                    </div>
                    <div class="upload-files-list"></div>
                </div>
            `;
        }
        
        bindEvents() {
            const uploadArea = this.element.querySelector('.upload-area');
            const uploadInput = this.element.querySelector('.upload-input');
            const browseBtn = this.element.querySelector('.upload-browse-btn');
            
            // Browse button
            browseBtn.addEventListener('click', () => {
                uploadInput.click();
            });
            
            // File input change
            uploadInput.addEventListener('change', (e) => {
                this.handleFiles(Array.from(e.target.files));
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                this.handleFiles(Array.from(e.dataTransfer.files));
            });
        }
        
        handleFiles(newFiles) {
            const validFiles = newFiles.filter(file => this.validateFile(file));
            
            if (this.files.length + validFiles.length > this.options.maxFiles) {
                Notifications.error(`Máximo ${this.options.maxFiles} archivos permitidos`);
                return;
            }
            
            validFiles.forEach(file => {
                const fileObj = {
                    id: Utils.generateId(),
                    file: file,
                    status: 'pending',
                    progress: 0,
                    url: null
                };
                
                this.files.push(fileObj);
                this.renderFileItem(fileObj);
                this.uploadFile(fileObj);
            });
        }
        
        validateFile(file) {
            // Check file size
            if (file.size > this.options.maxSize) {
                Notifications.error(`El archivo ${file.name} es muy grande. Máximo ${this.formatFileSize(this.options.maxSize)}`);
                return false;
            }
            
            // Check file type
            const isValidType = this.options.acceptedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.replace('/*', ''));
                }
                return file.type === type;
            });
            
            if (!isValidType) {
                Notifications.error(`Tipo de archivo no permitido: ${file.name}`);
                return false;
            }
            
            return true;
        }
        
        renderFileItem(fileObj) {
            const filesList = this.element.querySelector('.upload-files-list');
            
            const fileElement = document.createElement('div');
            fileElement.className = 'upload-file-item';
            fileElement.setAttribute('data-file-id', fileObj.id);
            
            fileElement.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${fileObj.file.name}</div>
                    <div class="file-size">${this.formatFileSize(fileObj.file.size)}</div>
                </div>
                <div class="file-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${fileObj.progress}%"></div>
                    </div>
                    <div class="progress-text">${fileObj.progress}%</div>
                </div>
                <div class="file-actions">
                    <button type="button" class="remove-file-btn" data-file-id="${fileObj.id}">×</button>
                </div>
            `;
            
            filesList.appendChild(fileElement);
            
            // Remove file event
            fileElement.querySelector('.remove-file-btn').addEventListener('click', () => {
                this.removeFile(fileObj.id);
            });
        }
        
        async uploadFile(fileObj) {
            const formData = new FormData();
            formData.append('file', fileObj.file);
            
            try {
                fileObj.status = 'uploading';
                
                const response = await API.upload(this.options.uploadUrl, formData, (progress) => {
                    fileObj.progress = progress;
                    this.updateFileProgress(fileObj.id, progress);
                    
                    if (this.options.onProgress) {
                        this.options.onProgress(fileObj, progress);
                    }
                });
                
                fileObj.status = 'completed';
                fileObj.url = response.url;
                fileObj.progress = 100;
                
                this.updateFileProgress(fileObj.id, 100);
                
                if (this.options.onUpload) {
                    this.options.onUpload(fileObj, response);
                }
                
            } catch (error) {
                fileObj.status = 'error';
                this.updateFileStatus(fileObj.id, 'error');
                
                if (this.options.onError) {
                    this.options.onError(fileObj, error);
                } else {
                    Notifications.error(`Error al subir ${fileObj.file.name}`);
                }
            }
        }
        
        updateFileProgress(fileId, progress) {
            const fileElement = this.element.querySelector(`[data-file-id="${fileId}"]`);
            if (fileElement) {
                const progressFill = fileElement.querySelector('.progress-fill');
                const progressText = fileElement.querySelector('.progress-text');
                
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
            }
        }
        
     //    updateFileStatus(fileId, status) {
     //        const fileElement = this.element.querySelector(`[data-file-id="${fileId}"]`);
     //        if (fileElement) {


    }
}