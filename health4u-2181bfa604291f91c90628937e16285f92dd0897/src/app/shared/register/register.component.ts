import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';  // นำเข้า SweetAlert

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.name, this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Response:', response);

          if (response && response.user) {
            const userRole = response.user.role;

            Swal.fire('ลงทะเบียนสำเร็จ', 'ยินดีต้อนรับ!', 'success');  // แจ้งเตือนเมื่อการลงทะเบียนสำเร็จ

            if (userRole === 'Admin') {
              this.router.navigate(['/admin/dashboard']); // เปลี่ยนเส้นทางไปหน้า admin-dashboard
            } else {
              this.router.navigate(['/products']);  // เปลี่ยนเส้นทางไปหน้า home สำหรับผู้ใช้ทั่วไป
            }
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลงทะเบียนได้', 'error');  // แจ้งเตือนเมื่อการลงทะเบียนไม่สำเร็จ
        }
      });
  }
}
