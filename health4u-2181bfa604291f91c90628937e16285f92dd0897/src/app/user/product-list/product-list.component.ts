import { Component, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
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

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute, 
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID เพื่อตรวจสอบสภาพแวดล้อม
  ) {}

  ngOnInit(): void {
    // ตรวจสอบว่าอยู่ในเบราว์เซอร์หรือไม่ก่อนใช้ localStorage
    if (isPlatformBrowser(this.platformId)) {
      this.userRole = localStorage.getItem('userRole');
      console.log('User Role:', this.userRole);
    }

    this.route.queryParams.subscribe(params => {
      this.category = params['category'] ? +params['category'] : null;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Raw data from API:', data); // ตรวจสอบข้อมูลที่ส่งกลับมาจาก API
        this.products = data;
        this.filterProducts();
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
  }

  filterProducts(): void {
    // กรองสินค้าตามหมวดหมู่และคำค้นหา
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.category === null || product.CategoryId === this.category;
      const matchesSearchTerm = product.ProductName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearchTerm;
    });
  }

  onSearch(): void {
    this.filterProducts(); // เรียกใช้ฟังก์ชันกรองเมื่อค้นหา
  }
}
