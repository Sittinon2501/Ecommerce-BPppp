import { Component, OnInit } from '@angular/core';
import { PromotionService } from '../../services/promotion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-promotion',
  templateUrl: './admin-promotion.component.html',
  styleUrls: ['./admin-promotion.component.css'],
})
export class AdminPromotionComponent implements OnInit {
  promotions: any[] = [];
  selectedFile: File | null = null;
  previewImageUrl: string | null = null;
  newPromotion: any = {
    id: null,
    name: '',
    description: '',
    discount: 0,
    startDate: '',
    endDate: '',
  };

  constructor(private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionService.getPromotions().subscribe((data) => {
      this.promotions = data;
    });
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  addPromotion(): void {
    if (
      !this.newPromotion.name ||
      !this.newPromotion.description ||
      !this.newPromotion.startDate ||
      !this.newPromotion.endDate
    ) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.newPromotion.name);
    formData.append('description', this.newPromotion.description);
    formData.append('discount', (this.newPromotion.discount || 0).toString());
    formData.append('startDate', this.newPromotion.startDate);
    formData.append('endDate', this.newPromotion.endDate);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.newPromotion.id) {
      this.promotionService
        .updatePromotion(this.newPromotion.id, formData)
        .subscribe({
          next: () => {
            Swal.fire(
              'แก้ไขเรียบร้อย!',
              'โปรโมชั่นถูกแก้ไขเรียบร้อยแล้ว',
              'success'
            );
            this.loadPromotions();
            this.resetForm();
          },
          error: (err) => {
            console.error('Error updating promotion:', err);
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถแก้ไขโปรโมชั่นได้', 'error');
          },
        });
    } else {
      this.promotionService.addPromotion(formData).subscribe({
        next: () => {
          Swal.fire('เพิ่มเรียบร้อย!', 'เพิ่มโปรโมชั่นสำเร็จ', 'success');
          this.loadPromotions();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error adding promotion:', err);
          Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถเพิ่มโปรโมชั่นได้', 'error');
        },
      });
    }
  }

  editPromotion(promotion: any): void {
    this.newPromotion = { ...promotion };
    this.previewImageUrl = promotion.imageUrl;
    this.selectedFile = null;
  }

  deletePromotion(id: number): void {
    this.promotionService.deletePromotion(id).subscribe({
      next: () => {
        Swal.fire('ลบเรียบร้อย!', 'ลบโปรโมชั่นสำเร็จ', 'success');
        this.loadPromotions();
      },
      error: (err) =>
        Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบโปรโมชั่นได้', 'error'),
    });
  }

  resetForm(): void {
    this.newPromotion = {
      id: null,
      name: '',
      description: '',
      discount: 0,
      startDate: '',
      endDate: '',
    };
    this.selectedFile = null;
    this.previewImageUrl = null;
  }
}
