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
  currentPage: number = 1; // หน้าปัจจุบัน
  totalPages: number = 1; // จำนวนหน้าทั้งหมด
  limit: number = 6; // จำนวนรายการต่อหน้า (ปรับเป็น 6)

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

    this.loadCategories(this.currentPage); // โหลดหมวดหมู่สำหรับหน้าปัจจุบัน
  }

  loadCategories(page: number): void {
    this.categoryService.getCategoriesWithPagination(page, this.limit).subscribe((response: any) => {
      this.categories = response.data; // เก็บข้อมูลหมวดหมู่ที่ได้รับ
      this.currentPage = response.currentPage; // อัปเดตหน้าปัจจุบัน
      this.totalPages = response.totalPages; // อัปเดตจำนวนหน้าทั้งหมด
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

  // ฟังก์ชันสำหรับไปยังหน้าถัดไป
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าก่อนหน้า
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories(this.currentPage);
    }
  }
}
