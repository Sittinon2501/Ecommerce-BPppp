import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
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
            this.orders = data;
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
}
