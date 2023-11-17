import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../model/project';
import { Employee } from '../model/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private empUrl: string = 'https://localhost:7099/api';

  constructor(private http: HttpClient) {}

  public getEmployees(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.empUrl}/Employee`);
  }

  public searchEmployees(
    searchText: String
  ): Observable<Employee[]> {
    return this.http.get<Employee[]>(
      `${this.empUrl}/Employee/search?searchText=${searchText}`
    );
  }
}
