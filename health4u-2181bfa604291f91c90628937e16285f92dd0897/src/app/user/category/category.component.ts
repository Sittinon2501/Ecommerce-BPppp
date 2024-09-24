import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories: any[] = [];
  userEmail: string = '';

  constructor(
    private categoryService: CategoryService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID เพื่อตรวจสอบแพลตฟอร์ม
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // เช็คว่าอยู่บนเบราว์เซอร์ก่อนเรียกใช้งาน localStorage
      this.userEmail = localStorage.getItem('userEmail') || '';
      console.log(localStorage.getItem('token'));
      console.log(localStorage.getItem('username'));
      console.log(localStorage.getItem('id'));
      console.log(this.userEmail);
    }

    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe((data: any[]) => {
      this.categories = data;
      console.log('Categories:', this.categories); // ตรวจสอบค่าของ categories
    });
  }

  viewProducts(categoryId: number): void {
    console.log('View Products clicked for category ID:', categoryId); // ตรวจสอบค่า categoryId
    if (categoryId) {
      this.router.navigate(['/products'], { queryParams: { category: categoryId } });
    } else {
      console.error('Invalid category ID');
    }
  }
}
