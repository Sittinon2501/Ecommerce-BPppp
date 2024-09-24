import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // นำเข้า AuthService

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // ตรวจสอบสถานะล็อกอินและบทบาทผู้ใช้
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isLoggedIn = true;
      this.userRole = user.role;
    }
  }

  logout(): void {
    // ลบ token ออกจาก localStorage
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = null;
    this.router.navigate(['/login']);
  }
}
