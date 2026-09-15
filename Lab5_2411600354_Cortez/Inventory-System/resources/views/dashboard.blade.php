@extends('layouts.app')

@section('content')
<div class="container-fluid p-0">
    <h3 class="fw-bold mb-3">Good Day, {{ Auth::user()->name ?? 'User' }}!</h3>

    @if(($lowStockCount ?? 0) > 0 || ($outOfStockCount ?? 0) > 0)
        <div class="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
            <div>
                <strong>Warning:</strong> {{ ($lowStockCount ?? 0) + ($outOfStockCount ?? 0) }} item(s) are low on stock or out of stock. 
                <a href="{{ route('products.index') }}" class="alert-link">View Products</a>
            </div>
        </div>
    @endif

    <!-- Statistics Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center py-3">
                <div class="card-body p-2">
                    <small class="text-muted fw-bold">TOTAL PRODUCTS</small>
                    <h3 class="fw-bold text-dark mt-2 mb-0">{{ $totalProducts ?? 0 }}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center py-3">
                <div class="card-body p-2">
                    <small class="text-muted fw-bold">INVENTORY VALUE</small>
                    <h3 class="fw-bold text-success mt-2 mb-0">${{ number_format($totalInventoryValue ?? 0, 2) }}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center py-3">
                <div class="card-body p-2">
                    <small class="text-muted fw-bold">LOW STOCK ITEMS</small>
                    <h3 class="fw-bold text-warning mt-2 mb-0">{{ $lowStockCount ?? 0 }}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm text-center py-3">
                <div class="card-body p-2">
                    <small class="text-muted fw-bold">OUT OF STOCK</small>
                    <h3 class="fw-bold text-danger mt-2 mb-0">{{ $outOfStockCount ?? 0 }}</h3>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row g-3 mb-4">
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white fw-bold py-3">Inventory Value by Category</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-6">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white fw-bold py-3">Stock Status</div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="stockStatusChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recently Added Products Table -->
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white fw-bold py-3">
            Recently Added Products
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-striped table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-3">SKU</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th class="pe-3">Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentProducts as $product)
                            <tr>
                                <td class="ps-3 fw-bold">{{ $product->sku }}</td>
                                <td>{{ $product->name }}</td>
                                <td><span class="badge bg-secondary">{{ $product->category }}</span></td>
                                <td>{{ $product->quantity }}</td>
                                <td class="pe-3 text-muted">{{ $product->created_at ? $product->created_at->diffForHumans() : 'N/A' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center text-muted py-4">No products added yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
    // Category Value Bar Chart
    const categoryLabels = @json($categorySummary->pluck('category') ?? []);
    const categoryValues = @json($categorySummary->pluck('total_value') ?? []);

    new Chart(document.getElementById('categoryChart'), {
        type: 'bar',
        data: {
            labels: categoryLabels,
            datasets: [{
                label: 'Inventory Value ($)',
                data: categoryValues,
                backgroundColor: ['#8b0000', '#c0392b', '#e74c3c', '#d35400', '#e67e22', '#f39c12']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    // Stock Status Doughnut Chart
    const inStock = {{ max(0, ($totalProducts ?? 0) - (($lowStockCount ?? 0) + ($outOfStockCount ?? 0))) }};
    const lowStock = {{ $lowStockCount ?? 0 }};
    const outStock = {{ $outOfStockCount ?? 0 }};

    new Chart(document.getElementById('stockStatusChart'), {
        type: 'doughnut',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [inStock, lowStock, outStock],
                backgroundColor: ['#28a745', '#ffc107', '#c0392b']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
</script>
@endsection