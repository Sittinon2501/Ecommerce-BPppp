import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms'; // ใช้ ngModel ใน forms
import { HttpClientModule } from '@angular/common/http'; // เชื่อมต่อ API
import { AppRoutingModule } from './app-routing.module'; // ใช้ AppRoutingModule สำหรับ routing
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // สำหรับใช้กับ Date Picker แบบ native
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// นำเข้า Components ต่าง ๆ
import { AppComponent } from './app.component';
import { ProductListComponent } from './user/product-list/product-list.component';
import { ProductDetailComponent } from './user/product-detail/product-detail.component';


import { ProfileComponent } from './user/profile/profile.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminProductComponent } from './admin/admin-product/admin-product.component';
import { AdminOrderComponent } from './admin/admin-order/admin-order.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoginComponent } from './shared/login/login.component';
import { RegisterComponent } from './shared/register/register.component';
import { ResetPasswordComponent } from './shared/reset-password/reset-password.component';

// นำเข้า Guards สำหรับการตรวจสอบสิทธิ์
import { AdminGuard } from './guards/admin.guard';
import { CategoryComponent } from './user/category/category.component';
import { AdminCategoryComponent } from './admin/admin-category/admin-category.component';
import { BlogsComponent } from './shared/blogs/blogs.component';
import { CartComponent } from './user/cart/cart.component';
import { UserOrderComponent } from './user/user-order/user-order.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductDetailComponent,
    ProfileComponent,
    AdminDashboardComponent,
    AdminProductComponent,
    AdminOrderComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    CategoryComponent,
    AdminCategoryComponent,
    BlogsComponent,
    CartComponent,
    UserOrderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    AdminGuard,
    provideAnimationsAsync(), // เพิ่ม AdminGuard ใน providers
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
