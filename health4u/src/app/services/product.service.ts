// product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // ดึงสินค้าทั้งหมด
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  getProductsWithPagination(
    page: number,
    limit: number,
    categoryId: number | null
  ): Observable<any> {
    const categoryParam =
      categoryId !== null ? `&categoryId=${categoryId}` : '';
    return this.http.get<any>(
      `${this.apiUrl}/pagination?page=${page}&limit=${limit}${categoryParam}`
    );
  }
  // ดึงสินค้าตามหมวดหมู่
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?categoryId=${categoryId}`);
  }

  // เพิ่มสินค้าใหม่
  addProduct(productData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, productData);
  }

  // แก้ไขสินค้า
  updateProduct(id: number, productData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData);
  }

  // ลบสินค้า
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ดึงข้อมูลสินค้าตาม ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
