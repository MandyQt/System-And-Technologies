// js/dataManager.js
// Handles all data operations for the Inventory Management Dashboard.
// Organized as a module (IIFE) so internal state (products, filters) stays
// private and is only accessed through the returned public functions.

const InventoryData = (function () {

    let products = [];

    let activeFilters = {
        category: 'all',
        stockStatus: 'all',
        minPrice: null,
        maxPrice: null
    };

    let searchQuery = '';

    // ---------- Initialize Data ----------
    // Simulates an async fetch (e.g., from an API or JSON file) using a
    // resolved Promise, so the rest of the app can use async/await the
    // same way it would with a real backend call.
    function initializeData() {
        return new Promise((resolve) => {
            products = [
                { id: 1, name: 'Wireless Bluetooth Earbuds', sku: 'ELEC-1001', category: 'Electronics', quantity: 45, unit_price: 29.99, reorder_level: 15, supplier: 'TechSource Inc.' },
                { id: 2, name: '4K Action Camera', sku: 'ELEC-1002', category: 'Electronics', quantity: 8, unit_price: 89.99, reorder_level: 10, supplier: 'TechSource Inc.' },
                { id: 3, name: 'USB-C Fast Charger 65W', sku: 'ELEC-1003', category: 'Electronics', quantity: 0, unit_price: 24.99, reorder_level: 20, supplier: 'PowerGrid Supplies' },
                { id: 4, name: 'Smart Fitness Watch', sku: 'ELEC-1004', category: 'Electronics', quantity: 32, unit_price: 59.99, reorder_level: 12, supplier: 'TechSource Inc.' },
                { id: 5, name: 'Portable Bluetooth Speaker', sku: 'ELEC-1005', category: 'Electronics', quantity: 60, unit_price: 34.99, reorder_level: 20, supplier: 'SoundWave Co.' },
                { id: 6, name: "Men's Cotton T-Shirt", sku: 'APRL-2001', category: 'Apparel', quantity: 120, unit_price: 12.99, reorder_level: 30, supplier: 'FabricWorld' },
                { id: 7, name: "Women's Denim Jacket", sku: 'APRL-2002', category: 'Apparel', quantity: 5, unit_price: 45.99, reorder_level: 10, supplier: 'FabricWorld' },
                { id: 8, name: 'Unisex Hoodie', sku: 'APRL-2003', category: 'Apparel', quantity: 0, unit_price: 32.99, reorder_level: 15, supplier: 'FabricWorld' },
                { id: 9, name: 'Slim Fit Chino Pants', sku: 'APRL-2004', category: 'Apparel', quantity: 75, unit_price: 28.99, reorder_level: 20, supplier: 'ThreadHouse' },
                { id: 10, name: 'Ceramic Coffee Mug Set', sku: 'HOME-3001', category: 'Home & Living', quantity: 40, unit_price: 18.99, reorder_level: 15, supplier: 'HomeStyle Ltd.' },
                { id: 11, name: 'Scented Soy Candle', sku: 'HOME-3002', category: 'Home & Living', quantity: 10, unit_price: 14.99, reorder_level: 12, supplier: 'HomeStyle Ltd.' },
                { id: 12, name: 'Memory Foam Pillow', sku: 'HOME-3003', category: 'Home & Living', quantity: 25, unit_price: 22.99, reorder_level: 10, supplier: 'ComfortLine' },
                { id: 13, name: 'Non-Stick Frying Pan', sku: 'HOME-3004', category: 'Home & Living', quantity: 0, unit_price: 27.99, reorder_level: 8, supplier: 'ComfortLine' },
                { id: 14, name: 'Running Shoes - Men', sku: 'SHOE-4001', category: 'Footwear', quantity: 55, unit_price: 49.99, reorder_level: 20, supplier: 'StrideFit' },
                { id: 15, name: 'Running Shoes - Women', sku: 'SHOE-4002', category: 'Footwear', quantity: 6, unit_price: 49.99, reorder_level: 20, supplier: 'StrideFit' },
                { id: 16, name: 'Casual Canvas Sneakers', sku: 'SHOE-4003', category: 'Footwear', quantity: 38, unit_price: 34.99, reorder_level: 15, supplier: 'StrideFit' },
                { id: 17, name: 'Leather Wallet', sku: 'ACC-5001', category: 'Accessories', quantity: 90, unit_price: 19.99, reorder_level: 25, supplier: 'CraftGoods' },
                { id: 18, name: 'Polarized Sunglasses', sku: 'ACC-5002', category: 'Accessories', quantity: 3, unit_price: 15.99, reorder_level: 10, supplier: 'CraftGoods' },
                { id: 19, name: 'Canvas Tote Bag', sku: 'ACC-5003', category: 'Accessories', quantity: 65, unit_price: 11.99, reorder_level: 20, supplier: 'CraftGoods' },
                { id: 20, name: 'Stainless Steel Water Bottle', sku: 'ACC-5004', category: 'Accessories', quantity: 12, unit_price: 16.99, reorder_level: 15, supplier: 'HydroLife' }
            ];
            resolve(products);
        });
    }

    // ---------- Basic Getters ----------
    function getProducts() {
        return products;
    }

    function getProductById(id) {
        return products.find(p => p.id === Number(id));
    }

    function getProductsByCategory(category) {
        if (category === 'all') return products;
        return products.filter(p => p.category === category);
    }

    function getStockStatus(product) {
        if (product.quantity === 0) return 'out of stock';
        if (product.quantity <= product.reorder_level) return 'low stock';
        return 'in stock';
    }

    function getLowStockProducts() {
        return products.filter(p => {
            const status = getStockStatus(p);
            return status === 'low stock' || status === 'out of stock';
        });
    }

    function getCategories() {
        return [...new Set(products.map(p => p.category))];
    }

    // ---------- Aggregated Statistics ----------
    function getStockStatistics() {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.unit_price), 0);
        const lowStockCount = products.filter(p => getStockStatus(p) === 'low stock').length;
        const outOfStockCount = products.filter(p => getStockStatus(p) === 'out of stock').length;
        return { totalProducts, totalValue, lowStockCount, outOfStockCount };
    }

    function getCategorySummary() {
        const summary = {};
        products.forEach(p => {
            if (!summary[p.category]) {
                summary[p.category] = { totalValue: 0, totalQuantity: 0 };
            }
            summary[p.category].totalValue += p.quantity * p.unit_price;
            summary[p.category].totalQuantity += p.quantity;
        });
        return summary;
    }

    // ---------- Filtering ----------
    function filterByCategory(category) {
        activeFilters.category = category;
    }

    function filterByStockStatus(status) {
        activeFilters.stockStatus = status;
    }

    function filterByPriceRange(min, max) {
        activeFilters.minPrice = min;
        activeFilters.maxPrice = max;
    }

    function resetFilters() {
        activeFilters = { category: 'all', stockStatus: 'all', minPrice: null, maxPrice: null };
        searchQuery = '';
    }

    function applyFilters() {
        return products.filter(p => {
            if (activeFilters.category !== 'all' && p.category !== activeFilters.category) return false;
            if (activeFilters.stockStatus !== 'all' && getStockStatus(p) !== activeFilters.stockStatus) return false;
            if (activeFilters.minPrice !== null && p.unit_price < activeFilters.minPrice) return false;
            if (activeFilters.maxPrice !== null && p.unit_price > activeFilters.maxPrice) return false;
            return true;
        });
    }

    // ---------- Search ----------
    function searchProducts(query) {
        searchQuery = query.trim().toLowerCase();
        const filtered = applyFilters();
        if (searchQuery === '') return filtered;
        return filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.sku.toLowerCase().includes(searchQuery)
        );
    }

    function updateSearchResults(query) {
        return searchProducts(query);
    }

    // Returns whatever should currently be visible in the table
    // (filters + search combined), used by the UI layer to render.
    function getVisibleProducts() {
        return searchQuery ? searchProducts(searchQuery) : applyFilters();
    }

    // ---------- Export ----------
    function exportToCSV(data) {
        const headers = ['ID', 'Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Stock Status', 'Supplier'];
        const rows = data.map(p => [
            p.id,
            `"${p.name}"`,
            p.sku,
            p.category,
            p.quantity,
            p.unit_price.toFixed(2),
            (p.quantity * p.unit_price).toFixed(2),
            getStockStatus(p),
            `"${p.supplier}"`
        ]);
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    function downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ---------- Simulated Real-Time Updates ----------
    // Mimics a live system by randomly nudging one product's quantity up
    // or down, similar to how a real API might push live stock changes.
    function simulateInventoryUpdate() {
        const index = Math.floor(Math.random() * products.length);
        const product = products[index];
        const change = Math.floor(Math.random() * 6) - 3; // range: -3 to +2
        product.quantity = Math.max(0, product.quantity + change);
        return product;
    }

    return {
        initializeData,
        getProducts,
        getProductById,
        getProductsByCategory,
        getStockStatus,
        getLowStockProducts,
        getCategories,
        getStockStatistics,
        getCategorySummary,
        filterByCategory,
        filterByStockStatus,
        filterByPriceRange,
        resetFilters,
        applyFilters,
        searchProducts,
        updateSearchResults,
        getVisibleProducts,
        exportToCSV,
        downloadCSV,
        simulateInventoryUpdate
    };

})();
