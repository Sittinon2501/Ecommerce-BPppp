import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { UserOrderService } from '../../services/order.service';

@Component({
  selector: 'app-user-order',
  templateUrl: './user-order.component.html',
  styleUrls: ['./user-order.component.css']
})
export class UserOrderComponent implements OnInit {
  orders: any[] = [];

  constructor(
    private userOrderService: UserOrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');  // ดึง userId จาก localStorage
    if (userId) {
      this.loadOrders(+userId);  // ส่ง userId เพื่อดึงคำสั่งซื้อ
    }
  }
  loadOrders(userId: number): void {
    console.log('Loading orders for userId:', userId);  // เพิ่ม log เพื่อดู userId ที่ถูกส่งไป API
    this.userOrderService.getUserOrders(userId).subscribe({
      next: (data) => {
        this.orders = data;
        console.log('Orders loaded from API:', this.orders);  // Log ข้อมูลที่ดึงมาจาก API
      },
      error: (err) => {
        console.error('Error loading user orders:', err);  // Log ข้อผิดพลาด
      }
    });
  }
}