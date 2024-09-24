import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import {jwtDecode} from 'jwt-decode'; // ใช้ jwt-decode สำหรับถอดรหัส JWT

interface DecodedToken {
  id: number;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken()); // ตรวจสอบ token ใน localStorage
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ตรวจสอบว่ามี token หรือไม่
  private hasToken(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;  // ถ้าอยู่ในฝั่ง Server ให้คืนค่า false
  }

  // ฟังก์ชันสำหรับลงทะเบียนผู้ใช้
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, password });
  }

  // ฟังก์ชันสำหรับเข้าสู่ระบบ
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('token', response.token);
          this.isLoggedInSubject.next(true); // อัปเดตสถานะการเข้าสู่ระบบเป็น true
          // เก็บ role ของผู้ใช้ (เช่น 'Admin' หรือ 'User') ลงใน localStorage
          localStorage.setItem('userRole', response.user.role);
        }
      })
    );
  }

  // ฟังก์ชันดึงข้อมูลผู้ใช้ปัจจุบันจาก token
  getCurrentUser(): DecodedToken | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          return jwtDecode(token) as DecodedToken;
        } catch (e) {
          console.error('Error decoding token:', e);
          return null;
        }
      }
    }
    return null;
  }

  // ฟังก์ชันสำหรับออกจากระบบ
  logout(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token'); // ลบ token
      localStorage.removeItem('userRole'); // ลบ role ของผู้ใช้
      this.isLoggedInSubject.next(false); // อัปเดตสถานะการออกจากระบบเป็น false
    }
  }
}
