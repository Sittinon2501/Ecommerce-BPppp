import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // นำเข้าการทดสอบ Routing
import { AuthService } from './services/auth.service'; // นำเข้า AuthService ที่ใช้ใน AppComponent
import { AppComponent } from './app.component';
import { of } from 'rxjs'; // นำเข้า of สำหรับจำลอง Observable

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceStub: Partial<AuthService>;

  beforeEach(async () => {
    // Mock AuthService
    authServiceStub = {
      getCurrentUser: () => ({ id: 1, role: 'User' }), // จำลองข้อมูลผู้ใช้
      logout: jasmine.createSpy('logout') // จำลองฟังก์ชัน logout
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule], // นำเข้า RouterTestingModule เพื่อใช้ในการทดสอบ routing
      declarations: [AppComponent],
      providers: [{ provide: AuthService, useValue: authServiceStub }] // ใช้ mock AuthService
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have as title "Skincare E-Commerce"', () => {
    expect(component.title).toEqual('Skincare E-Commerce');
  });

  it('should check login status and set isLoggedIn to true', () => {
    component.checkLoginStatus();
    expect(component.isLoggedIn).toBeTrue();
    expect(component.userRole).toEqual('User');
  });

  it('should call AuthService.logout() when logout is called', () => {
    component.logout();
    expect(authServiceStub.logout).toHaveBeenCalled();
    expect(component.isLoggedIn).toBeFalse();
    expect(component.userRole).toBeNull();
  });
});
