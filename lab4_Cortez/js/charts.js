// js/charts.js
// Creates and updates all Chart.js visualizations for the dashboard.
// Charts are created once, then updated in place on later calls
// (rather than destroyed/recreated) for smoother real-time refreshes.

let categoryChart = null;
let stockStatusChart = null;
let topProductsChart = null;

// Matches the site's red/black color scheme (see css/style.css)
const chartColors = {
    primary: '#8b0000',
    secondary: '#c0392b',
    accent: '#e74c3c',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#c0392b',
    palette: ['#8b0000', '#c0392b', '#e74c3c', '#f39c12', '#e67e22', '#d35400']
};

// ---------- Chart 1: Inventory Value by Category (Bar) ----------
function renderCategoryChart(categorySummary) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const labels = Object.keys(categorySummary);
    const values = labels.map(cat => categorySummary[cat].totalValue);

    if (categoryChart) {
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = values;
        categoryChart.update();
        return;
    }

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Inventory Value ($)',
                data: values,
                backgroundColor: chartColors.palette
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// ---------- Chart 2: Stock Status Distribution (Doughnut) ----------
function renderStockStatusChart(stats) {
    const ctx = document.getElementById('stockStatusChart');
    if (!ctx) return;

    const inStockCount = InventoryData.getProducts().filter(
        p => InventoryData.getStockStatus(p) === 'in stock'
    ).length;

    const dataValues = [inStockCount, stats.lowStockCount, stats.outOfStockCount];

    if (stockStatusChart) {
        stockStatusChart.data.datasets[0].data = dataValues;
        stockStatusChart.update();
        return;
    }

    stockStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: dataValues,
                backgroundColor: [chartColors.success, chartColors.warning, chartColors.danger]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ---------- Chart 3: Top 5 Products by Value (Horizontal Bar) ----------
function renderTopProductsChart(products) {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx) return;

    const top5 = [...products]
        .sort((a, b) => (b.quantity * b.unit_price) - (a.quantity * a.unit_price))
        .slice(0, 5);

    const labels = top5.map(p => p.name);
    const values = top5.map(p => p.quantity * p.unit_price);

    if (topProductsChart) {
        topProductsChart.data.labels = labels;
        topProductsChart.data.datasets[0].data = values;
        topProductsChart.update();
        return;
    }

    topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Inventory Value ($)',
                data: values,
                backgroundColor: chartColors.primary
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
        }
    });
}

// ---------- Render all three at once ----------
function renderAllCharts() {
    renderCategoryChart(InventoryData.getCategorySummary());
    renderStockStatusChart(InventoryData.getStockStatistics());
    renderTopProductsChart(InventoryData.getProducts());
}
