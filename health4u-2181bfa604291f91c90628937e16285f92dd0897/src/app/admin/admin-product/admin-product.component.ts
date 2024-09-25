import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service'; 
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; 
import { Product } from '../../models/product';
import { Category } from '../../models/category'; 
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-product',
  templateUrl: './admin-product.component.html',
  styleUrls: ['./admin-product.component.css'],
})
export class AdminProductComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = []; 

  product = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0, 
    imageUrl: '' // ต้องแน่ใจว่า imageUrl เป็น string
  };
  selectedFile: File | null = null;
  isEditing = false; 
  editingProductId: number | null = null; 

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts(); 
    this.loadCategories(); 
  }

  // Fetch all products
  fetchProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data.map((product: Product) => {
          if (product.imageUrl && product.imageUrl.trim() !== '') {
            product.imageUrl = `http://localhost:3000${product.imageUrl}`;
          } else {
            product.imageUrl = 'assets/default-image.jpg'; 
          }
          product.description = product.description || ''; 
          return product;
        });
        console.log('Products:', this.products); 
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
    formData.append('ProductName', this.product.name);
    formData.append('Description', this.product.description || '');
    formData.append('Price', this.product.price.toString());
    formData.append('Stock', this.product.stock.toString());
    formData.append('CategoryId', this.product.categoryId.toString());

    // Check if a new file is selected, otherwise use the existing image
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.product.imageUrl) {
      formData.append('imageUrl', this.product.imageUrl); // Send existing image URL as string
    }

    if (this.isEditing && this.editingProductId !== null) {
      this.productService.updateProduct(this.editingProductId, formData).subscribe({
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
    this.isEditing = true; 
    this.editingProductId = product.ProductId; 

    // Pre-fill the form with the existing product details, including image URL
    this.product = {
      name: product.ProductName,       
      description: product.Description || '',  
      price: parseFloat(product.Price.toString()),  
      stock: parseInt(product.Stock.toString(), 10),  
      categoryId: product.CategoryId,
      imageUrl: typeof product.ImageUrl === 'string' ? product.ImageUrl : ''
    };

    this.selectedFile = null; 
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
            this.fetchProducts(); 
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
      categoryId: 0, 
      imageUrl: '' // Reset image URL
    };
    this.selectedFile = null;
    this.isEditing = false;
    this.editingProductId = null;
  }
}
