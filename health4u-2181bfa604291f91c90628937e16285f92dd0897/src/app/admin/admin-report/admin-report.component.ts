import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/report.service';
import * as XLSX from 'xlsx'; // นำเข้าไลบรารี xlsx
import { saveAs } from 'file-saver'; // นำเข้าไลบรารี file-saver สำหรับบันทึกไฟล์

@Component({
  selector: 'app-admin-report',
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.css']
})
export class AdminReportComponent implements OnInit {
  topSellingProducts: any[] = [];
  lowSellingProducts: any[] = [];
  revenueReport: any[] = [];
  startDate: string = '';  // วันที่เริ่มต้น
  endDate: string = '';    // วันที่สิ้นสุด

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {}

  // ฟังก์ชันสำหรับดึงรายงานสินค้าขายดี
  loadTopSellingProducts(): void {
    this.reportService.getTopSellingProducts(this.startDate, this.endDate).subscribe(
      (data) => {
        this.topSellingProducts = data;
      },
      (error) => {
        console.error('Error loading top-selling products:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับดึงรายงานสินค้าที่ขายไม่ดี
  loadLowSellingProducts(): void {
    this.reportService.getLowSellingProducts(this.startDate, this.endDate).subscribe(
      (data) => {
        this.lowSellingProducts = data;
      },
      (error) => {
        console.error('Error loading low-selling products:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับดึงรายงานรายได้
  loadRevenueReport(): void {
    this.reportService.getRevenueReport(this.startDate, this.endDate).subscribe(
      (data) => {
        this.revenueReport = data;
      },
      (error) => {
        console.error('Error loading revenue report:', error);
      }
    );
  }

  // ฟังก์ชันสำหรับ export ข้อมูลเป็น Excel
  exportToExcel(reportType: string): void {
    let dataToExport: any[] = [];

    switch (reportType) {
      case 'top-selling':
        dataToExport = this.topSellingProducts;
        break;
      case 'low-selling':
        dataToExport = this.lowSellingProducts;
        break;
      case 'revenue':
        dataToExport = this.revenueReport;
        break;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport); // แปลงข้อมูล JSON เป็น worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType);

    // บันทึกไฟล์ Excel
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, reportType);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }
}

// MIME type สำหรับ Excel
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
