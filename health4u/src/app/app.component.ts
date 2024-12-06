import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  checkLoginStatus() {
    throw new Error('Method not implemented.');
  }
  isLoggedIn = false;
  userRole: string | null = null;
  showNavbar = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        const user = this.authService.getCurrentUser();
        this.userRole = user?.role || null;
      } else {
        this.userRole = null;
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;
        // ซ่อน navbar ในหน้า login และ register
        this.showNavbar = !(currentUrl.includes('/login') || currentUrl.includes('/register'));
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
