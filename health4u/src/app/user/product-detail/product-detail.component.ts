import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import {jwtDecode} from 'jwt-decode'; // Ensure you have installed jwt-decode
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  productId: number | null = null;
  product: any;
  quantity: number = 1; // Default quantity to 1
  userRole: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Get user role from LocalStorage
    this.userRole = localStorage.getItem('userRole');
    console.log('User Role:', this.userRole);

    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      this.loadProductDetails();
    });
  }

  loadProductDetails(): void {
    if (this.productId) {
      this.productService.getProductById(this.productId).subscribe({
        next: (data) => {
          this.product = data;
        },
        error: (error) => {
          console.error('Error fetching product details:', error);
        }
      });
    }
  }

  addToCart(): void {
    const token = localStorage.getItem('token');
    let userId = null;
    
    if (token) {
      const decoded: any = jwtDecode(token); // Ensure you have imported jwtDecode
      userId = decoded.id;
    }
  
    if (!userId) {
      Swal.fire('Error', 'User ID not found', 'error');
      return;
    }
  
    // Prepare the cart item
    const cartItem = {
      userId: userId,
      productId: this.productId,
      quantity: this.quantity,
      price: this.product.Price * this.quantity
    };
  
    console.log('Cart Item:', cartItem); // Debugging: ตรวจสอบว่า cartItem มีข้อมูลครบถ้วนหรือไม่
  
    // Call CartService to add the product to cart
    this.cartService.addToCart(cartItem).subscribe(() => {
      Swal.fire('Added to Cart', `${this.product.ProductName} has been added to the cart.`, 'success');
    }, error => {
      console.error('Error adding item to cart:', error);
      Swal.fire('Error', 'Failed to add item to cart', 'error');
    });
  }
}