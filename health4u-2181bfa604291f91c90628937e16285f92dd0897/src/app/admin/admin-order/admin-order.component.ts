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
  OrderDate: string;  // เพิ่มฟิลด์ OrderDate
  formattedDate?: string;
}

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  styleUrls: ['./admin-order.component.css']
})
export class AdminOrderComponent implements OnInit {
  orders: Order[] = [];

  constructor(private adminOrderService: AdminOrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.adminOrderService.getOrders().subscribe(
      (data: Order[]) => {  // กำหนดประเภทให้ข้อมูลที่ได้รับจาก API
        this.orders = data.map(order => ({
          ...order,
          formattedDate: new Date(order.OrderDate).toLocaleDateString()
        }));
      },
      (error) => {
        console.error('Error loading orders:', error);
      }
    );
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.adminOrderService.updateOrderStatus(orderId, status).subscribe(
      () => {
        Swal.fire('Success', 'Order status updated successfully!', 'success');
        this.loadOrders();
      },
      (error) => {
        console.error('Error updating order status:', error);
        Swal.fire('Error', 'Could not update order status', 'error');
      }
    );
  }
}
