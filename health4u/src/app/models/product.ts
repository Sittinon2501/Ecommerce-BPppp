// src/app/models/product.ts
export interface Product {
Stock: any;
Price: string|number;
Description: any;
  ImageUrl: boolean;
  ProductName: any;
  ProductId: number;
  id: number;
  name: string;
  price: any;
  stock: number;
  imageUrl: string; // ใช้ 'imageUrl' ให้สอดคล้อง
  description?: string;

  CreatedDate: string;
  CategoryId: number;
 
}
