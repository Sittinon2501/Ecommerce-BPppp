import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './shared/login/login.component';
import { RegisterComponent } from './shared/register/register.component';
import { ProductListComponent } from './user/product-list/product-list.component';
import { ProductDetailComponent } from './user/product-detail/product-detail.component';
import { ProfileComponent } from './user/profile/profile.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminProductComponent } from './admin/admin-product/admin-product.component';
import { AdminOrderComponent } from './admin/admin-order/admin-order.component';
import { CategoryComponent } from './user/category/category.component';
import { AdminCategoryComponent } from './admin/admin-category/admin-category.component'; // Add the AdminCategoryComponent
import { FooterComponent } from './shared/footer/footer.component';
import { BlogsComponent } from './shared/blogs/blogs.component'; // Add the BlogsComponent
import { AdminGuard } from './guards/admin.guard'; // Ensure the guard is applied correctly
import { CartComponent } from './user/cart/cart.component';
import { UserOrderComponent } from './user/user-order/user-order.component';
import { AuthGuard } from './guards/auth.guard';
import { OrderHistoryComponent } from './user/order-history/order-history.component';

// Define all routes here
const routes: Routes = [
  { path: '', redirectTo: '/categories', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductListComponent,canActivate: [AuthGuard] },
  { path: 'products/:id', component: ProductDetailComponent,canActivate: [AuthGuard] },

  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard] },
  { path: 'categories', component: CategoryComponent ,canActivate: [AuthGuard]},
  { path: 'products/category/:category', component: ProductListComponent ,canActivate: [AuthGuard]}, // ใช้สำหรับกรณีที่มี URL แบบนี้
  { path: 'footer', component: FooterComponent,canActivate: [AuthGuard] },
  { path: 'blogs', component: BlogsComponent,canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent,canActivate: [AuthGuard] },
  { path: 'orders', component: UserOrderComponent,canActivate: [AuthGuard] },
  {path : 'order-history', component: OrderHistoryComponent,canActivate: [AuthGuard]},
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/products',
    component: AdminProductComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/orders',
    component: AdminOrderComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/categories',
    component: AdminCategoryComponent,
    canActivate: [AdminGuard],
  },
  { path: '**', redirectTo: '/categories' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
