import { Component, OnInit } from '@angular/core';
import { AdminOrderService } from '../../services/admin-order.service';
import Swal from 'sweetalert2';

interface Order {
  OrderId: number;
  ProductName: string;
  ImageUrl: string;
  Quantity: number;
  Price: number;
  Status: string;
  OrderDate: string;
  formattedDate?: string;
}

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  styleUrls: ['./admin-order.component.css']
})
export class AdminOrderComponent implements OnInit {
  orders: Order[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private adminOrderService: AdminOrderService) {}

  ngOnInit(): void {
    this.loadOrders(this.currentPage);
  }

  // ฟังก์ชันสำหรับโหลดข้อมูลคำสั่งซื้อในหน้าที่ต้องการ
  loadOrders(page: number): void {
    this.adminOrderService.getOrders(page, 10).subscribe(
      (response: any) => {
        this.orders = response.data;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
      },
      (error) => {
        console.error('Error loading orders:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับไปยังหน้าถัดไป
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadOrders(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับไปยังหน้าก่อนหน้า
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrders(this.currentPage);
    }
  }

  // ฟังก์ชันสำหรับอัปเดตสถานะคำสั่งซื้อ
  updateOrderStatus(orderId: number, status: string): void {
    this.adminOrderService.updateOrderStatus(orderId, status).subscribe(
      () => {
        Swal.fire('Success', 'Order status updated successfully!', 'success');
        this.loadOrders(this.currentPage);
      },
      (error) => {
        console.error('Error updating order status:', error);
        Swal.fire('Error', 'Could not update order status', 'error');
      }
    );
  }
}
