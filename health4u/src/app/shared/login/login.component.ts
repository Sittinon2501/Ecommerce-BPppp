import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    // ตรวจสอบว่ามีการใส่ email และ password หรือไม่
    if (!this.email || !this.password) {
      Swal.fire('Error', 'Please fill in both email and password', 'error');
      return; // หยุดการทำงานถ้าไม่ได้ใส่ข้อมูล
    }

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        const userRole = response.user.role;
        console.log(response);

        // เก็บ token ใน localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.user.name);
        localStorage.setItem('userEmail', response.user.email);
        localStorage.setItem('id', response.user.id);

        // แสดงข้อความ SweetAlert ก่อน และรอให้ผู้ใช้กดปุ่ม OK แล้วค่อยเปลี่ยนหน้า
        Swal.fire({
          icon: 'success',
          title: 'Login successful!',
          text: 'Welcome back!',
          confirmButtonText: 'OK',
        }).then(() => {
          // หลังจากผู้ใช้กดปุ่ม OK แล้วค่อยทำการเปลี่ยนเส้นทาง
          if (userRole === 'Admin') {
            this.router.navigate(['/admin/dashboard']); // ถ้าเป็น Admin เปลี่ยนเส้นทางไปหน้า admin-dashboard
          } else {
            this.router.navigate(['/categories']); // เปลี่ยนเส้นทางไปหน้า categories
          }
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        Swal.fire('Error', 'Invalid email or password', 'error');
      },
    });
  }
}
