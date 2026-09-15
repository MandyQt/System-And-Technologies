@extends('layouts.app')

@section('title', 'Edit Product')

@section('content')
    <div class="pb-2 mb-3 border-bottom">
        <h2>Edit Product</h2>
    </div>

    <div class="card">
        <div class="card-body">
            <form action="{{ route('products.update', $product) }}" method="POST">
                @method('PUT')
                @include('products._form')
            </form>
        </div>
    </div>
@endsection