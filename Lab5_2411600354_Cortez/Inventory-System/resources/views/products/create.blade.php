@extends('layouts.app')

@section('title', 'Add Product')

@section('content')
    <div class="pb-2 mb-3 border-bottom">
        <h2>Add New Product</h2>
    </div>

    <div class="card">
        <div class="card-body">
            <form action="{{ route('products.store') }}" method="POST">
                @include('products._form')
            </form>
        </div>
    </div>
@endsection