import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Response:', response);

        if (response && response.user) {
          const userRole = response.user.role;

          Swal.fire('Registration Successful', 'Welcome!', 'success'); // Alert when registration is successful

          if (userRole === 'Admin') {
            this.router.navigate(['/admin/dashboard']); // Redirect to admin-dashboard
          } else {
            this.router.navigate(['/products']); // Redirect to home for regular users
          }
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        Swal.fire('Error', 'Registration failed', 'error'); // Alert when registration fails
      },
    });
  }
}
