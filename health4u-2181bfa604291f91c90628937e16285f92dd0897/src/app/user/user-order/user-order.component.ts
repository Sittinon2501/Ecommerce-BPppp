import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { UserOrderService } from '../../services/order.service';
import Swal from 'sweetalert2';  // ใช้ SweetAlert เพื่อแสดงการยืนยันและผลลัพธ์

@Component({
  selector: 'app-user-order',
  templateUrl: './user-order.component.html',
  styleUrls: ['./user-order.component.css']
})
export class UserOrderComponent implements OnInit {
  orders: any[] = [];

  constructor(
    private userOrderService: UserOrderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  loadUserOrders(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const userId = decoded.id;

        this.userOrderService.getUserOrders(userId).subscribe(
          (data) => {
            // กรองคำสั่งซื้อที่ไม่ใช่ 'Delivered Successfully' หรือ 'Cancelled'
            this.orders = data
              .filter((order: { Status: string }) => 
                order.Status !== 'Delivered Successfully' && order.Status !== 'Cancelled'
              )
              .map((order: { OrderDate: string | number | Date }) => ({
                ...order,
                formattedDate: new Date(order.OrderDate).toLocaleDateString(),
              }));
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
            this.loadUserOrders();  // รีเฟรชรายการคำสั่งซื้อหลังจากยกเลิกสำเร็จ
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
