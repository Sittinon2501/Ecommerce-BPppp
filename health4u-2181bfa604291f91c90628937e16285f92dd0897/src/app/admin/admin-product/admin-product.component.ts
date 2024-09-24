import { Component, OnInit } from '@angular/core';

import { CategoryService } from '../../services/category.service'; // Import CategoryService
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { Product } from '../../models/product';
import { Category } from '../../models/category'; // Import Category model
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.css'],
})
export class AdminProductComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = []; // Array to hold categories
  product = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0, // Add categoryId
  };
  selectedFile: File | null = null;
  isEditing = false; // Flag for editing mode
  editingProductId: number | null = null; // Store the product being edited

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts(); // Load all products on initialization
    this.loadCategories(); // Load categories on initialization
  }

  // Fetch all products
  fetchProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((product: Product) => {
          if (product.imageUrl && product.imageUrl.trim() !== '') {
            product.imageUrl = `http://localhost:3000${product.imageUrl}`;
          } else {
            product.imageUrl = 'assets/default-image.jpg'; // Default image
          }
          product.description = product.description || ''; // Default to empty string if undefined
          return product;
        });
        console.log('Products:', this.products); // Debug
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      },
    });
  }

  // Load categories
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  // File selection
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      console.log('Selected file:', this.selectedFile);
    } else {
      this.selectedFile = null;
      console.log('No file selected');
    }
  }

  // Add or Update product
  onSubmit(): void {
    const formData = new FormData();
    formData.append('ProductName', this.product.name); // ให้ตรงกับที่ Controller คาดหวัง
    formData.append('Description', this.product.description || '');
    formData.append('Price', this.product.price.toString());
    formData.append('Stock', this.product.stock.toString());
    formData.append('CategoryId', this.product.categoryId.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditing && this.editingProductId !== null) {
      // Update product
      this.productService
        .updateProduct(this.editingProductId, formData)
        .subscribe({
          next: () => {
            Swal.fire('Updated!', 'Product updated successfully.', 'success');
            this.resetForm();
            this.fetchProducts();
          },
          error: (err) => {
            console.error('Error updating product:', err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: `Error updating product: ${err.message || 'Unknown error'}`,
            });
          },
        });
    } else {
      // Add product
      this.productService.addProduct(formData).subscribe({
        next: () => {
          Swal.fire('Added!', 'Product added successfully!', 'success');
          this.resetForm();
          this.fetchProducts();
        },
        error: (err) => {
          console.error('Error adding product:', err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Error adding product: ${err.message || 'Unknown error'}`,
          });
        },
      });
    }
  }

  // Edit product
  editProduct(product: Product): void {
    Swal.fire({
      title: 'Edit Product',
      text: 'Make sure to fill all fields.',
    });
    this.isEditing = true;
    this.editingProductId = product.ProductId;
    this.product = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.CategoryId, // Pre-fill categoryId
    };
  }

  // Delete product
  deleteProduct(productId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(productId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Product has been deleted.', 'success');
            this.fetchProducts(); // Reload product list after deletion
          },
          error: (err) => {
            console.error('Error deleting product:', err);
          },
        });
      }
    });
  }

  // Reset the form after adding/updating
  resetForm(): void {
    this.product = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: 0, // Reset categoryId
    };
    this.selectedFile = null;
    this.isEditing = false;
    this.editingProductId = null;
  }
}
