// src/app/models/cart.ts
export interface CartItem {
  ProductId: number;
  Quantity: number;
}

// interface สำหรับ Cart
export interface Cart {
  CartId: number;
  UserId: number;
  CreatedDate: Date;
  items: CartItem[]; // รายการสินค้าในตะกร้า
}
