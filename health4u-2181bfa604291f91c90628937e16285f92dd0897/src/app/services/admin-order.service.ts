import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  // ฟังก์ชันดึงข้อมูลคำสั่งซื้อพร้อม pagination (ส่ง page และ limit)
  getOrders(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin?page=${page}&limit=${limit}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${orderId}/status`, { status });
  }
}
