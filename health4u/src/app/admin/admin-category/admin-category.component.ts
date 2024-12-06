import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-category',
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css']
})
export class AdminCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  categories: any[] = [];
  editCategoryId: number | null = null;
  selectedImage: File | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      CategoryName: ['', Validators.required],
      image: [null]
    });
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((data: any[]) => {
      this.categories = data;
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  submitForm(): void {
    if (!this.categoryForm.valid) {
      Swal.fire('Error', 'Please fill out all required fields', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('CategoryName', this.categoryForm.get('CategoryName')?.value);

    if (this.selectedImage) {
      formData.append('image', this.selectedImage, this.selectedImage.name);
    } else {
      Swal.fire('Error', 'Category image is required', 'error');
      return;
    }

    if (this.editCategoryId) {
      this.categoryService.updateCategory(this.editCategoryId, formData).subscribe({
        next: (res: any) => {
          Swal.fire('Success', 'Category updated successfully', 'success');
          this.loadCategories();
          this.editCategoryId = null;
          this.categoryForm.reset();
          this.selectedImage = null;
        },
        error: (err: any) => {
          console.error('Update category error:', err);
          Swal.fire('Error', 'Update category failed', 'error');
        }
      });
    } else {
      this.categoryService.addCategory(formData).subscribe({
        next: (res: any) => {
          Swal.fire('Success', 'Category added successfully', 'success');
          this.loadCategories();
          this.categoryForm.reset();
          this.selectedImage = null;
        },
        error: (err: any) => {
          console.error('Add category error:', err);
          Swal.fire('Error', 'Add category failed', 'error');
        }
      });
    }
  }

  editCategory(category: any): void {
    this.editCategoryId = category.CategoryId;
    this.categoryForm.patchValue({
      CategoryName: category.CategoryName
    });
    this.selectedImage = null; // reset image
  }

  deleteCategory(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.deleteCategory(id).subscribe({
          next: (res: any) => {
            Swal.fire('Deleted!', 'Category has been deleted.', 'success');
            this.loadCategories();
          },
          error: (err: any) => {
            console.error('Delete category error:', err);
            Swal.fire('Error', 'Delete category failed', 'error');
          }
        });
      }
    });
  }
}
