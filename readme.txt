# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ORIGINARIA is a marketplace platform for organic and natural products from Peru, connecting local producers with conscious consumers. The platform promotes fair trade, sustainability, and economic development of Peruvian communities.

## Architecture

This is a static HTML/CSS/JavaScript website with the following structure:

- **Frontend**: Vanilla JavaScript with HTML/CSS
- **Assets**: Static files (CSS, JS, images, fonts)
- **Multi-user interfaces**: Public marketplace, vendor dashboard, admin panel
- **Responsive design**: Mobile-first approach

### Key Directories

- `public/` - Public-facing pages (landing, marketplace, product details)
- `vendor/` - Vendor dashboard and management interfaces
- `admin/` - Administrative panel for platform management
- `assets/` - Static assets (CSS, JS, images, fonts)
- `components/` - Reusable HTML components
- `config/` - Configuration files (currently empty)

## Development

### No Build Process
This project uses vanilla HTML/CSS/JavaScript with no build pipeline. Changes are made directly to source files.

### File Organization

#### CSS Architecture
- `main.css` - Global styles and CSS variables
- `public.css` - Public-facing page styles
- `vendor.css` - Vendor dashboard styles
- `admin.css` - Admin panel styles

#### JavaScript Architecture
- `main.js` - Core utilities, API client, notifications, validation
- `public.js` - Public page functionality
- `vendor.js` - Vendor dashboard functionality
- `admin.js` - Admin panel functionality
- `components.js` - Reusable component definitions

### Key JavaScript Features

The main.js file provides:
- **ORIGINARIA global object** with config, cache, state management
- **Utils** - Formatting, validation, DOM utilities
- **API client** with authentication and error handling
- **Notifications system** with toast notifications
- **Validation framework** with form validation
- **Storage wrapper** for localStorage with expiration
- **Components** - Modal, confirm dialogs, loading overlays

### User Types & Interfaces

1. **Public Users**: Browse products, view details, register/login
2. **Vendors**: Product management, sales tracking, analytics
3. **Admins**: Platform management, user moderation, system settings

### Localization
- Primary language: Spanish (Peru)
- Currency: PEN (Peruvian Sol)
- Date/time: Peru timezone
- Phone validation: Peruvian format (+51)

## File Conventions

- HTML files use semantic structure with accessibility considerations
- CSS uses BEM-like naming conventions
- JavaScript follows ES6+ standards
- All files include header comments with purpose and author info
- Placeholder content for images and logos throughout

## Important Notes

- No package.json or build tools - this is a static website
- Configuration files in `/config/` are currently empty
- Images are placeholder divs with descriptive text
- All monetary values should use PEN currency
- Forms include client-side validation with the Validation framework
- API endpoints are prefixed with `/api` (backend not included in this repo)

## Implemented Pages

### Public Interface
- **index.html** - Landing page with hero section, featured products, vendor highlights
- **marketplace.html** - Complete product catalog with filtering, search, and cart functionality
- **product-detail.html** - Detailed product view with gallery, reviews, vendor info, and purchase options
- **login.html** - Authentication page with user type selection (customer/vendor)
- **register.html** - Registration with differentiated forms for customers and vendors
- **about.html** - Company information, mission, team, and impact metrics
- **contact.html** - Contact forms, location info, and support channels

### Vendor Interface
- **vendor/dashboard.html** - Main dashboard with metrics, charts, notifications, and quick actions
- **vendor/products/list.html** - Product management with filtering, bulk actions, and status updates
- **vendor/products/add.html** - Multi-step product creation form with validation and pricing calculator
- **vendor/onboarding/welcome.html** - 5-step onboarding process for new vendors

### Admin Interface
- **admin/dashboard.html** - Administrative panel with platform metrics, user management, and system controls

### Components
- **components/sidebar-vendor.html** - Reusable vendor sidebar with navigation and quick stats

### Stylesheets
- **assets/css/main.css** - Global styles, CSS variables, and utility classes
- **assets/css/public.css** - Public-facing page styles
- **assets/css/vendor.css** - Comprehensive vendor panel styling
- **assets/css/admin.css** - Admin panel specific styles

## Project Status

✅ **Complete Implementation**: All core functionality has been implemented including:
- Public marketplace with full e-commerce features
- Vendor dashboard with product management and analytics
- Admin panel for platform management
- User authentication and registration
- Responsive design for all devices
- Form validation and user interactions
- Shopping cart and product browsing
- Vendor onboarding process

## Key Features Implemented

### E-commerce Functionality
- Product browsing with categories and filters
- Shopping cart with quantity management
- Product detail pages with image galleries
- Wishlist/favorites system
- Advanced search and filtering

### Vendor Tools
- Complete dashboard with sales metrics
- Product management (add, edit, list)
- Inventory tracking
- Multi-step onboarding process
- Vendor profile management

### Admin Features
- Platform overview dashboard
- User and vendor management
- Order tracking and analytics
- System configuration tools

### User Experience
- Responsive mobile-first design
- Smooth animations and transitions
- Form validation with real-time feedback
- Toast notifications and modals
- Accessibility considerations

## Technical Implementation

### Data Simulation
Since this is a frontend prototype, all data is simulated with realistic content:
- Product catalog with authentic Peruvian organic products
- Vendor profiles (especially Roberto Gomez's coffee business)
- Sales metrics and analytics
- User interactions and feedback

### JavaScript Architecture
- Vanilla JavaScript with ES6+ features
- Component-based architecture
- Event delegation for performance
- Local storage for data persistence
- Modular code organization

### CSS Design System
- CSS custom properties for theming
- Consistent spacing and typography
- Responsive grid layouts
- Component-based styling
- Animation and transition library

## Testing

No automated testing framework is configured. Testing should be done manually in browsers.

## Authentication

Uses JWT tokens stored in localStorage with the key `auth_token`. The API client automatically includes this token in requests.