import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับดึงข้อมูลตะกร้าสินค้า
  getCart(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  // ฟังก์ชันสำหรับเพิ่มสินค้าในตะกร้า
  addToCart(cartItem: any): Observable<any> {
    return this.http.post(this.apiUrl, cartItem);
  }

  // ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้า
  updateQuantity(cartId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cartId}`, { quantity });
  }

  // ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
  removeFromCart(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartId}`);
  }

  // ฟังก์ชันสำหรับ checkout
  checkout(cartData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.post(`${this.apiUrl}/checkout`, cartData, { headers });
  }
  // ฟังก์ชันสำหรับตรวจสอบ stock
  checkStock(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-stock/${productId}`);
  }
}
