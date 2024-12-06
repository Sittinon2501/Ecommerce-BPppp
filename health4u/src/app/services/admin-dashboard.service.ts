// src/app/services/admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'http://localhost:3000/api/charts'; // แก้เป็น URL backend ของคุณ

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับดึงข้อมูลแต่ละกราฟ
  getSalesOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sales-overview`);
  }

  getTopSellingProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-selling-products`);
  }

  getRevenueByCategory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue-by-category`);
  }

  getCustomerDemographics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer-demographics`);
  }

  getLowSellingProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/low-selling-products`);
  }
}
