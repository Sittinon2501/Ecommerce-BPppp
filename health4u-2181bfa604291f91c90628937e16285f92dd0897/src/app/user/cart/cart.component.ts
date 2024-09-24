import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalAmount: number = 0;
  selectedItems: any[] = [];

  constructor(
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // เรียกใช้ทุกครั้งที่โหลดหน้าเว็บใหม่ เพื่อดึงข้อมูลจาก backend
  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token); // ใช้ jwtDecode เพื่อแยกข้อมูล userId จาก token
        const userId = decoded.id;
  
        // ดึงข้อมูล cart จาก backend
        this.cartService.getCart(userId).subscribe(
          (data) => {
            this.cartItems = data;
            this.calculateTotal();  // คำนวณยอดรวมของสินค้าใน cart
          },
          (error) => {
            console.error('Error loading cart:', error);
          }
        );
      } else {
        console.error('No token found');
      }
    } else {
      console.error('Not in browser environment');
    }
  }
  
  

  removeFromCart(cartId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to remove this item from the cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.removeFromCart(cartId).subscribe(
          () => {
            Swal.fire(
              'Removed!',
              'The item has been removed from your cart.',
              'success'
            );
            this.loadCart(); // เรียกใช้ loadCart หลังจากลบสินค้าออกจากตะกร้า
          },
          (error) => {
            console.error('Error removing item from cart:', error);
            Swal.fire(
              'Error',
              'There was a problem removing the item.',
              'error'
            );
          }
        );
      }
    });
  }

  updateQuantity(cartId: number, quantity: number, stock: number): void {
    if (quantity > stock) {
      Swal.fire({
        icon: 'error',
        title: 'Stock Limit Exceeded',
        text: `You can't add more than ${stock} items.`,
      });

      this.cartItems = this.cartItems.map((item) =>
        item.CartId === cartId ? { ...item, Quantity: stock } : item
      );
    } else if (quantity < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quantity',
        text: 'Quantity must be at least 1.',
      });

      this.cartItems = this.cartItems.map((item) =>
        item.CartId === cartId ? { ...item, Quantity: 1 } : item
      );
    } else {
      this.cartService.updateQuantity(cartId, quantity).subscribe(
        () => {
          this.loadCart();
        },
        (error) => {
          console.error('Error updating cart quantity:', error);
        }
      );
    }
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedItems.reduce((sum, item) => {
      const price = parseFloat(item.Price) || 0;
      const quantity = parseInt(item.Quantity, 10) || 0;
      return sum + price * quantity;
    }, 0);
  }

  toggleItemSelection(item: any): void {
    const index = this.selectedItems.findIndex(
      (selected) => selected.CartId === item.CartId
    );
    if (index > -1) {
      this.selectedItems.splice(index, 1); // ยกเลิกการเลือกสินค้า
    } else {
      this.selectedItems.push(item); // เพิ่มสินค้าเข้าในรายการที่เลือก
    }
    this.calculateTotal(); // อัปเดตราคาทั้งหมดตามสินค้าที่เลือก
  }

  checkout(): void {
    if (this.selectedItems.length === 0) {
      Swal.fire(
        'Error',
        'Please select at least one item to checkout.',
        'error'
      );
      return;
    }

    let outOfStockItems = [];
    let stockChecked = 0;

    for (let item of this.selectedItems) {
      this.cartService.checkStock(item.ProductId).subscribe(
        (product) => {
          stockChecked++;
          if (product.stock < item.Quantity) {
            outOfStockItems.push(item);
          }

          if (stockChecked === this.selectedItems.length) {
            if (outOfStockItems.length > 0) {
              Swal.fire(
                'Error',
                `Some items are out of stock. Please adjust your cart.`,
                'error'
              );
            } else {
              const cartData = {
                items: this.selectedItems,
                total: this.totalAmount,
              };

              this.cartService.checkout(cartData).subscribe(
                () => {
                  Swal.fire(
                    'Success',
                    'Checkout completed successfully',
                    'success'
                  );

                  // ลบเฉพาะรายการที่ถูก checkout ออกจาก cartItems
                  this.cartItems = this.cartItems.filter(
                    (item) => !this.selectedItems.includes(item) // เก็บรายการที่ยังไม่ได้เลือก
                  );

                  this.selectedItems = []; // ล้างรายการที่เลือก
                  this.calculateTotal(); // คำนวณราคาใหม่
                },
                (error) => {
                  console.error('Error during checkout:', error);
                  Swal.fire(
                    'Error',
                    error.error.message || 'Checkout failed',
                    'error'
                  );
                }
              );
            }
          }
        },
        (error) => {
          console.error('Error checking stock:', error);
        }
      );
    }
  }
}
