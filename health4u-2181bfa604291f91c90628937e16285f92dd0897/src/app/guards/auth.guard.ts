import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          return true; // ถ้า login แล้ว ให้เข้าถึงหน้าได้
        } else {
          this.router.navigate(['/login']); // ถ้ายังไม่ login ให้ redirect ไปที่หน้า login
          return false; // ห้ามเข้าถึงหน้าอื่น
        }
      })
    );
  }
}
