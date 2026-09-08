// js/dashboard.js
// Orchestrates the dashboard: auth check, event wiring, and DOM rendering.
// Data logic lives in dataManager.js; chart logic lives in charts.js.
// This file connects user actions to both of those.

document.addEventListener('DOMContentLoaded', async function () {

    // ---------- Auth Guard ----------
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('user') || 'User';
    updateGreeting(username);

    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) userNameSpan.textContent = username;

    setupLogout();

    // ---------- Load Data (simulated async fetch) ----------
    await InventoryData.initializeData();

    populateCategoryDropdown();
    renderDashboard();

    setupFilterEvents();
    setupSearchEvents();
    setupExportEvents();

    // ---------- Simulated Real-Time Updates ----------
    // Every 8 seconds, nudge a random product's stock level and
    // re-render everything so the dashboard feels "live."
    setInterval(function () {
        const updated = InventoryData.simulateInventoryUpdate();
        renderDashboard();
        showUpdateToast(`Stock updated: ${updated.name} is now ${updated.quantity} units`);
    }, 8000);
});

// ---------- Greeting ----------
function updateGreeting(username) {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let timeOfDay = '';

    if (hour >= 5 && hour < 12) timeOfDay = 'Good Morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'Good Afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'Good Evening';
    else timeOfDay = 'Good Night';

    greetingElement.textContent = `${timeOfDay}, ${username}!`;
}

// ---------- Logout ----------
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutLink = document.getElementById('logoutLink');

    function performLogout(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
    if (logoutLink) logoutLink.addEventListener('click', performLogout);
}

// ---------- Category Dropdown ----------
function populateCategoryDropdown() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const categories = InventoryData.getCategories();
    select.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// ---------- Master Render ----------
// Called any time data or filters change, so every part of the UI
// (stat cards, alerts, table, charts) reflects the current state.
function renderDashboard() {
    const stats = InventoryData.getStockStatistics();
    renderStatCards(stats);
    renderAlerts();
    renderInventoryTable(InventoryData.getVisibleProducts());
    renderAllCharts();
}

// ---------- Stat Cards ----------
function renderStatCards(stats) {
    const cards = [
        { id: 'stat1', title: 'Total Products', value: stats.totalProducts, color: 'text-primary', icon: '📦' },
        { id: 'stat2', title: 'Inventory Value', value: `$${stats.totalValue.toFixed(2)}`, color: 'text-success', icon: '💰' },
        { id: 'stat3', title: 'Low Stock Items', value: stats.lowStockCount, color: 'text-warning', icon: '⚠️' },
        { id: 'stat4', title: 'Out of Stock', value: stats.outOfStockCount, color: 'text-danger', icon: '🚫' }
    ];

    cards.forEach(stat => {
        const titleEl = document.getElementById(`${stat.id}-title`);
        const valueEl = document.getElementById(`${stat.id}-value`);
        if (titleEl) titleEl.textContent = `${stat.icon} ${stat.title}`;
        if (valueEl) {
            valueEl.textContent = stat.value;
            valueEl.className = `card-text fw-bold ${stat.color}`;
        }
    });
}

// ---------- Low Stock Alert Banner ----------
function renderAlerts() {
    const alertSection = document.getElementById('alertSection');
    if (!alertSection) return;

    const lowStockProducts = InventoryData.getLowStockProducts();
    alertSection.innerHTML = '';

    if (lowStockProducts.length === 0) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning d-flex align-items-center';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <div><strong>${lowStockProducts.length} item(s)</strong> are low on stock or out of stock and need reordering.</div>
    `;
    alertSection.appendChild(alertDiv);
}

// ---------- Inventory Table ----------
// Rebuilds the table body from scratch on every render using
// createElement/appendChild, which keeps the DOM in sync with
// whatever the current filtered/searched product list is.
function renderInventoryTable(products) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (products.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="7" class="text-center text-muted py-3">No products match your filters.</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    products.forEach(p => {
        const status = InventoryData.getStockStatus(p);
        const row = document.createElement('tr');

        if (status === 'low stock') row.classList.add('table-warning');
        if (status === 'out of stock') row.classList.add('table-danger');

        let badgeClass = 'bg-success';
        if (status === 'low stock') badgeClass = 'bg-warning text-dark';
        if (status === 'out of stock') badgeClass = 'bg-danger';

        row.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.quantity}</td>
            <td>$${p.unit_price.toFixed(2)}</td>
            <td>$${(p.quantity * p.unit_price).toFixed(2)}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

// ---------- Filter Events ----------
function setupFilterEvents() {
    const categoryFilter = document.getElementById('categoryFilter');
    const stockStatusButtons = document.querySelectorAll('.stock-filter-btn');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyPriceBtn = document.getElementById('applyPriceFilter');
    const resetBtn = document.getElementById('resetFilters');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function () {
            InventoryData.filterByCategory(this.value);
            renderDashboard();
        });
    }

    stockStatusButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            stockStatusButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            InventoryData.filterByStockStatus(this.dataset.status);
            renderDashboard();
        });
    });

    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', function () {
            const min = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
            const max = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
            InventoryData.filterByPriceRange(min, max);
            renderDashboard();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            InventoryData.resetFilters();
            if (categoryFilter) categoryFilter.value = 'all';
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            stockStatusButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('.stock-filter-btn[data-status="all"]')?.classList.add('active');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            renderDashboard();
        });
    }
}

// ---------- Search Events ----------
function setupSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // 'input' fires on every keystroke, giving real-time results
    // as the user types, rather than waiting for a form submit.
    searchInput.addEventListener('input', function () {
        InventoryData.updateSearchResults(this.value);
        renderInventoryTable(InventoryData.getVisibleProducts());
    });
}

// ---------- Export Events ----------
function setupExportEvents() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', function () {
        const data = InventoryData.getVisibleProducts();
        const csvContent = InventoryData.exportToCSV(data);
        const filename = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
        InventoryData.downloadCSV(csvContent, filename);
    });
}

// ---------- Real-Time Update Toast ----------
function showUpdateToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}
