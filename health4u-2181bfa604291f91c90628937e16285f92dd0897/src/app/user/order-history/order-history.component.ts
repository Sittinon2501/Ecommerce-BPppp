import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserOrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orderHistory: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private userOrderService: UserOrderService) {}

  ngOnInit(): void {
    this.loadOrderHistory(this.currentPage);
  }

  // ฟังก์ชันสำหรับโหลดประวัติคำสั่งซื้อพร้อม Pagination
  loadOrderHistory(page: number): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      this.userOrderService.getOrderHistory(userId, page, 10).subscribe(
        (response: any) => {
          this.orderHistory = response.data;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
        },
        (error) => {
          console.error('Error loading order history:', error);
        }
      );
    } else {
      console.error('No token found');
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าถัดไป
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrderHistory(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าก่อนหน้า
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrderHistory(this.currentPage);
    }
  }
}
