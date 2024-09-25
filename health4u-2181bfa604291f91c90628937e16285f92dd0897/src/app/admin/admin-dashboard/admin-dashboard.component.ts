import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js'; // Import และ register controllers และ elements
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart', { static: true }) salesChartRef!: ElementRef;
  @ViewChild('topProductsChart', { static: true }) topProductsChartRef!: ElementRef;
  @ViewChild('revenueCategoryChart', { static: true }) revenueCategoryChartRef!: ElementRef;
  @ViewChild('demographicsChart', { static: true }) demographicsChartRef!: ElementRef;
  @ViewChild('lowProductsChart', { static: true }) lowProductsChartRef!: ElementRef;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    // ลงทะเบียน Chart.js controllers และ elements
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    this.loadSalesOverview();
    this.loadTopSellingProducts();
    this.loadRevenueByCategory();
    this.loadCustomerDemographics();
    this.loadLowSellingProducts();
  }

  loadSalesOverview() {
    this.dashboardService.getSalesOverview().subscribe(data => {
      new Chart(this.salesChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: data.map((item: any) => item.OrderDate),
          datasets: [{
            label: 'Sales',
            data: data.map((item: any) => item.TotalSales),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
        }
      });
    });
  }

  loadTopSellingProducts() {
    this.dashboardService.getTopSellingProducts().subscribe(data => {
      new Chart(this.topProductsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map((item: any) => item.ProductName),
          datasets: [{
            label: 'Top Products',
            data: data.map((item: any) => item.TotalSold),
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
        }
      });
    });
  }

  loadRevenueByCategory() {
    this.dashboardService.getRevenueByCategory().subscribe(data => {
      new Chart(this.revenueCategoryChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: data.map((item: any) => item.CategoryName),
          datasets: [{
            label: 'Revenue',
            data: data.map((item: any) => item.TotalRevenue),
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
        }
      });
    });
  }

  loadCustomerDemographics() {
    this.dashboardService.getCustomerDemographics().subscribe(data => {
      new Chart(this.demographicsChartRef.nativeElement, {
        type: 'bar', // ใช้ bar chart เพื่อแสดงข้อมูลตามปีที่สมัคร
        data: {
          labels: data.map((item: any) => item.RegistrationYear), // ใช้ปีที่สมัครเป็น Label
          datasets: [{
            label: 'Total Customers',
            data: data.map((item: any) => item.TotalCustomers), // จำนวนผู้ใช้ที่สมัครในแต่ละปี
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }

  loadLowSellingProducts() {
    this.dashboardService.getLowSellingProducts().subscribe(data => {
      new Chart(this.lowProductsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map((item: any) => item.ProductName),
          datasets: [{
            label: 'Low-Selling Products',
            data: data.map((item: any) => item.TotalSold),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
        }
      });
    });
  }
}
