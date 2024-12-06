import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:3000/api/reports'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับดึงรายงานสินค้าขายดี
  getTopSellingProducts(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-selling-products`, {
      params: { startDate, endDate }
    });
  }

  // ฟังก์ชันสำหรับดึงรายงานสินค้าที่ขายไม่ดี
  getLowSellingProducts(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/low-selling-products`, {
      params: { startDate, endDate }
    });
  }

  // ฟังก์ชันสำหรับดึงรายงานรายได้
  getRevenueReport(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue-report`, {
      params: { startDate, endDate }
    });
  }
}
