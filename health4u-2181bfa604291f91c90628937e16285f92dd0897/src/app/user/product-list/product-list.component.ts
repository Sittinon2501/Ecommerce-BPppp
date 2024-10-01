import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = ''; // คำที่ใช้ค้นหา
  category: number | null = null;
  userRole: string | null = null;
  currentPage: number = 1; // หน้าปัจจุบัน
  totalPages: number = 1; // จำนวนหน้าทั้งหมด

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID เพื่อตรวจสอบแพลตฟอร์ม
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = localStorage.getItem('userRole');
      console.log('User Role:', this.userRole);
    }

    this.route.queryParams.subscribe(params => {
      this.category = params['category'] ? +params['category'] : null;
      this.loadProducts(this.currentPage); // เรียกใช้ฟังก์ชันดึงข้อมูลสินค้าพร้อมหน้าเริ่มต้น
    });
  }

  loadProducts(page: number): void {
    this.productService.getProductsWithPagination(page, 8, this.category).subscribe({
      next: (data) => {
        console.log('Raw data from API:', data);
        this.products = data.data.map((product: Product) => {
          product.imageUrl = product.imageUrl ? `http://localhost:3000${product.imageUrl}` : 'assets/default-image.jpg';
          return product;
        });
        this.filteredProducts = this.products; // กำหนดให้ filteredProducts เริ่มต้นเท่ากับ products
        this.currentPage = data.currentPage; // อัปเดตหน้าปัจจุบัน
        this.totalPages = data.totalPages; // อัปเดตจำนวนหน้าทั้งหมด
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.category === null || product.CategoryId === this.category;
      const matchesSearchTerm = product.ProductName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearchTerm;
    });
  }

  onSearch(): void {
    this.filterProducts(); // เรียกใช้ฟังก์ชันกรองเมื่อค้นหา
  }

  // ฟังก์ชันสำหรับไปยังหน้าถัดไป
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าก่อนหน้า
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts(this.currentPage);
    }
  }
}
