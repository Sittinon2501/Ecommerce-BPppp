import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { UserOrderService } from '../../services/order.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-order',
  templateUrl: './user-order.component.html',
  styleUrls: ['./user-order.component.css']
})
export class UserOrderComponent implements OnInit {
  orders: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private userOrderService: UserOrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserOrders(this.currentPage);
  }

  // ฟังก์ชันสำหรับโหลดคำสั่งซื้อพร้อม Pagination
  loadUserOrders(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const userId = decoded.id;

        this.userOrderService.getUserOrders(userId, page, 10).subscribe(
          (response: any) => {
            // กรองเฉพาะคำสั่งซื้อที่ไม่ใช่ 'Delivered Successfully' หรือ 'Cancelled'
            this.orders = response.data.filter(
              (order: { Status: string }) => 
                order.Status !== 'Delivered Successfully' && order.Status !== 'Cancelled'
            );
            this.currentPage = response.currentPage;
            this.totalPages = response.totalPages;
          },
          (error) => {
            console.error('Error loading orders:', error);
          }
        );
      } else {
        console.error('No token found');
      }
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าถัดไป
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUserOrders(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าก่อนหน้า
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUserOrders(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับยกเลิกคำสั่งซื้อ
  cancelOrder(orderId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userOrderService.cancelOrder(orderId).subscribe(
          () => {
            Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
            this.loadUserOrders(this.currentPage);  // รีเฟรชรายการคำสั่งซื้อ
          },
          (error) => {
            Swal.fire('Error', 'Could not cancel the order', 'error');
            console.error('Error cancelling order:', error);
          }
        );
      }
    });
  }
}
