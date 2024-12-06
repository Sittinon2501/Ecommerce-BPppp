import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
  getCategoriesWithPagination(page: number, limit: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/pagination?page=${page}&limit=${limit}`
    );
  }

  addCategory(categoryData: FormData): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, categoryData);
  }

  updateCategory(id: number, categoryData: FormData): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
