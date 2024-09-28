import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  getUserOrders(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }
  
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${orderId}/status`, { status });
  }
   // ฟังก์ชันสำหรับยกเลิกคำสั่งซื้อ
   cancelOrder(orderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancel/${orderId}`, { status: 'Cancelled' });
  }
   // ฟังก์ชันสำหรับดึงประวัติคำสั่งซื้อ
   getOrderHistory(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/history/${userId}`);
  }
}
