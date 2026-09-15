<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'sku',
        'description',
        'category',
        'quantity',
        'reorder_level',
        'unit_price',
        'supplier',
    ];

    /**
     * Attribute casting.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'unit_price' => 'decimal:2',
    ];

    /**
     * A product can have many inventory transactions
     * (stock in / stock out records).
     */
    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Business logic: is this product at or below its reorder level?
     */
    public function isLowStock(): bool
    {
        return $this->quantity > 0 && $this->quantity <= $this->reorder_level;
    }

    /**
     * Business logic: is this product completely out of stock?
     */
    public function isOutOfStock(): bool
    {
        return $this->quantity === 0;
    }

    /**
     * Business logic: returns a readable stock status string.
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->isOutOfStock()) {
            return 'out of stock';
        }
        if ($this->isLowStock()) {
            return 'low stock';
        }
        return 'in stock';
    }

    /**
     * Computed total value of this product's current stock.
     */
    public function getTotalValueAttribute(): float
    {
        return $this->quantity * $this->unit_price;
    }

    /**
     * Query scope: only products at or below reorder level.
     * Usage: Product::lowStock()->get()
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'reorder_level')
                      ->where('quantity', '>', 0);
    }

    /**
     * Query scope: only products with zero quantity.
     * Usage: Product::outOfStock()->get()
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', 0);
    }
}