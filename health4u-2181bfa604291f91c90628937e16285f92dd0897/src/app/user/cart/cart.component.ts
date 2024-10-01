import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { CartService } from '../../services/cart.service';
import QRCode from 'qrcode';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = []; // เก็บข้อมูลสินค้าทั้งหมดในตะกร้า
  totalAmount: number = 0; // เก็บยอดรวมราคาสินค้าในตะกร้า
  selectedItems: any[] = []; // เก็บสินค้าที่ถูกเลือกเพื่อ checkout
  currentPage: number = 1; // หน้าปัจจุบันสำหรับ pagination
  totalPages: number = 1; // จำนวนหน้าทั้งหมด
  limit: number = 10; // จำนวนรายการต่อหน้า

  constructor(
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ฟังก์ชันที่จะเรียกใช้เมื่อ component ถูกโหลด
  ngOnInit(): void {
    this.loadCart(this.currentPage); // เรียกใช้ฟังก์ชันการโหลดสินค้าในตะกร้าสำหรับหน้าปัจจุบัน
  }

  // ฟังก์ชันสำหรับโหลดข้อมูลตะกร้าพร้อมกับ Pagination
  loadCart(page: number): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: any = jwtDecode(token); // ถอดรหัส token เพื่อดึงข้อมูล userId
        const userId = decoded.id;

        // ดึงข้อมูลตะกร้าจาก backend
        this.cartService.getCart(userId, page, this.limit).subscribe(
          (response: any) => {
            this.cartItems = response.data; // เก็บสินค้าที่ได้จาก backend ใน cartItems
            this.currentPage = response.currentPage; // อัปเดตหน้าปัจจุบัน
            this.totalPages = response.totalPages; // อัปเดตจำนวนหน้าทั้งหมด
            this.calculateTotal(); // คำนวณยอดรวมของสินค้าในตะกร้า
          },
          (error) => {
            console.error('Error loading cart:', error);
          }
        );
      } else {
        console.error('No token found');
      }
    }
  }

  // ฟังก์ชันสำหรับเปลี่ยนไปยังหน้าถัดไป
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCart(this.currentPage); // โหลดสินค้าสำหรับหน้าถัดไป
    }
  }

  // ฟังก์ชันสำหรับเปลี่ยนไปยังหน้าก่อนหน้า
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCart(this.currentPage); // โหลดสินค้าสำหรับหน้าก่อนหน้า
    }
  }

  // ฟังก์ชันสำหรับลบสินค้าจากตะกร้า
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
            this.loadCart(this.currentPage); // โหลดข้อมูลตะกร้าใหม่หลังจากลบสินค้าออกแล้ว
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

  // ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้า
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
          this.loadCart(this.currentPage); // โหลดข้อมูลตะกร้าใหม่หลังจากอัปเดตจำนวนสินค้า
        },
        (error) => {
          console.error('Error updating cart quantity:', error);
        }
      );
    }
  }

  // ฟังก์ชันคำนวณยอดรวมสินค้าในตะกร้า
  calculateTotal(): void {
    this.totalAmount = this.selectedItems.reduce((sum, item) => {
      const price = parseFloat(item.Price) || 0;
      const quantity = parseInt(item.Quantity, 10) || 0;
      return sum + price * quantity;
    }, 0);
  }

  // ฟังก์ชันสำหรับเลือกหรือยกเลิกการเลือกสินค้าในตะกร้า
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

  // ฟังก์ชันสำหรับ Checkout สินค้าที่เลือก
  checkout(): void {
    if (this.selectedItems.length === 0) {
      Swal.fire(
        'Error',
        'Please select at least one item to checkout.',
        'error'
      );
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'Please log in to proceed with checkout.', 'error');
      return;
    }

    const decoded: any = jwtDecode(token); // ดึง userId จาก token
    const userId = decoded.id;

    let outOfStockItems = [];
    let stockChecked = 0;

    for (let item of this.selectedItems) {
      this.cartService.checkStock(item.ProductId).subscribe(
        (product) => {
          stockChecked++;
          if (product.Stock < item.Quantity) {
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
              const totalAmount = this.totalAmount * 100; // แปลงเป็นหน่วยสตางค์
              const qrData = `00020101021129370016${userId}000000010${totalAmount}0103${userId}0000`;

              // ทำการ checkout
              this.cartService
                .checkout({
                  items: this.selectedItems,
                  total: this.totalAmount,
                  userId: userId,
                })
                .subscribe(() => {
                  // สร้าง QR Code สำหรับการชำระเงิน
                  QRCode.toDataURL(qrData)
                    .then((url) => {
                      Swal.fire({
                        title: 'Scan QR Code',
                        html: `<img src="${url}" alt="QR Code" style="width: 200px; height: 200px;" />`,
                        showCloseButton: true,
                        confirmButtonText: 'Confirm Payment',
                      }).then((result) => {
                        if (result.isConfirmed) {
                          Swal.fire(
                            'Payment Confirmed',
                            'Thank you for your payment!',
                            'success'
                          );
                          // ลบสินค้าที่ถูก checkout ออกจาก cartItems
                          this.cartItems = this.cartItems.filter(
                            (item) => !this.selectedItems.includes(item)
                          );
                          this.selectedItems = [];
                          this.calculateTotal();
                        }
                      });
                    })
                    .catch((err) => {
                      console.error('Error generating QR Code:', err);
                    });
                });
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
