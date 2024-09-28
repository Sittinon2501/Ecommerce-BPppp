import { Component, OnInit } from '@angular/core';
import { UserOrderService } from '../../services/order.service';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orderHistory: any[] = [];

  constructor(private userOrderService: UserOrderService) {}

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      this.userOrderService.getUserOrders(userId).subscribe(
        (data) => {
          // กรองเฉพาะคำสั่งซื้อที่มีสถานะ 'Delivered Successfully' หรือ 'Cancelled'
          this.orderHistory = data.filter((order: { Status: string }) => 
            order.Status === 'Delivered Successfully' || order.Status === 'Cancelled'
          );
        },
        (error) => {
          console.error('Error loading order history:', error);
        }
      );
    } else {
      console.error('No token found');
    }
  }
}
