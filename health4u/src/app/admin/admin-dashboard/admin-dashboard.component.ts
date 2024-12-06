import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js'; // Import และ register controllers และ elements
import * as ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin สำหรับแสดงเปอร์เซ็นต์
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart', { static: true }) salesChartRef!: ElementRef;
  @ViewChild('topProductsChart', { static: true })
  topProductsChartRef!: ElementRef;
  @ViewChild('revenueCategoryChart', { static: true })
  revenueCategoryChartRef!: ElementRef;
  @ViewChild('demographicsChart', { static: true })
  demographicsChartRef!: ElementRef;
  @ViewChild('lowProductsChart', { static: true })
  lowProductsChartRef!: ElementRef;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    // ลงทะเบียน Chart.js controllers และ elements
    Chart.register(...registerables);
    Chart.register(ChartDataLabels); // ลงทะเบียน plugin
  }

  ngAfterViewInit(): void {
    this.loadSalesOverview();
    this.loadTopSellingProducts();
    this.loadRevenueByCategory();
    this.loadCustomerDemographics();
    this.loadLowSellingProducts();
  }

  loadSalesOverview() {
    this.dashboardService.getSalesOverview().subscribe((data) => {
      new Chart(this.salesChartRef.nativeElement, {
        type: 'line', // ใช้ line chart แล้วเติมพื้นที่ใต้เส้น
        data: {
          labels: data.map((item: any) => item.OrderMonth), // แสดงเดือน
          datasets: [
            {
              label: 'Monthly Sales',
              data: data.map((item: any) => item.TotalSales),
              backgroundColor: 'rgba(75, 192, 192, 0.2)', // เติมพื้นที่ใต้เส้น
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: true, // เติมพื้นที่ใต้เส้น
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                color: '#333',
                font: {
                  size: 12,
                  weight: 'bold',
                },
                maxRotation: 0, // ไม่ให้เอียงตัวอักษร
                minRotation: 0,
              },
            },
            y: {
              beginAtZero: true, // ย้าย beginAtZero ไปที่นี่
              ticks: {
                color: '#333',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
          },
          plugins: {
            legend: {
              display: true, // แสดง label 'Monthly Sales'
            },
            tooltip: {
              enabled: true, // แสดง tooltip เมื่อ hover
            },
          },
          layout: {
            padding: {
              bottom: 30,
            },
          },
        },
      });
    });
  }

  loadTopSellingProducts() {
    this.dashboardService.getTopSellingProducts().subscribe((data) => {
      new Chart(this.topProductsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map((item: any) => item.ProductName),
          datasets: [
            {
              label: 'Top Products',
              data: data.map((item: any) => item.TotalSold),
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                color: '#333',
                font: {
                  size: 12,
                  weight: 'bold',
                },
                maxRotation: 30,
                minRotation: 30,
              },
            },
            y: {
              ticks: {
                color: '#333',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
          },
          layout: {
            padding: {
              bottom: 30,
            },
          },
        },
      });
    });
  }

  loadRevenueByCategory() {
    this.dashboardService.getRevenueByCategory().subscribe((data) => {
      new Chart(this.revenueCategoryChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels: data.map((item: any) => item.CategoryName),
          datasets: [
            {
              label: 'Revenue',
              data: data.map((item: any) => item.TotalRevenue),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              formatter: (value, ctx) => {
                // กำหนดตัวแปรชนิดข้อมูลที่รองรับเฉพาะ number
                const sum = (a: number | any): number => {
                  if (typeof a === 'number') {
                    return a;
                  } else if (Array.isArray(a)) {
                    // ตรวจสอบว่าเป็น tuple [number, number] แล้วนำมาคำนวณ
                    return a.reduce(
                      (acc, val) => acc + (typeof val === 'number' ? val : 0),
                      0
                    );
                  } else if (typeof a === 'object' && 'x' in a && 'y' in a) {
                    // ตรวจสอบว่าเป็น Point และนำ x และ y มาคำนวณ
                    return (a.x as number) + (a.y as number);
                  } else if (
                    typeof a === 'object' &&
                    'r' in a &&
                    'x' in a &&
                    'y' in a
                  ) {
                    // ตรวจสอบว่าเป็น BubbleDataPoint และนำค่า x และ y มาคำนวณ
                    return (a.x as number) + (a.y as number);
                  }
                  return 0; // คืนค่า 0 ถ้าชนิดข้อมูลไม่ตรง
                };

                // ใช้งาน
                const result = sum(data);
              },
              color: '#fff',
              font: {
                size: 14,
                weight: 'bold',
              },
            },
          },
        },
      });
    });
  }

  loadCustomerDemographics() {
    this.dashboardService.getCustomerDemographics().subscribe((data) => {
      new Chart(this.demographicsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map((item: any) => item.RegistrationYear),
          datasets: [
            {
              label: 'Total Customers',
              data: data.map((item: any) => item.TotalCustomers),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                color: '#333',
                font: {
                  size: 12,
                  weight: 'bold',
                },
                maxRotation: 30,
                minRotation: 30,
              },
            },
            y: {
              ticks: {
                color: '#333',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
          },
          layout: {
            padding: {
              bottom: 30,
            },
          },
        },
      });
    });
  }

  loadLowSellingProducts() {
    this.dashboardService.getLowSellingProducts().subscribe((data) => {
      new Chart(this.lowProductsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map((item: any) => item.ProductName),
          datasets: [
            {
              label: 'Low-Selling Products',
              data: data.map((item: any) => item.TotalSold),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                color: '#333',
                font: {
                  size: 12,
                  weight: 'bold',
                },
                maxRotation: 30,
                minRotation: 30,
              },
            },
            y: {
              ticks: {
                color: '#333',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
          },
          layout: {
            padding: {
              bottom: 30,
            },
          },
        },
      });
    });
  }
}
