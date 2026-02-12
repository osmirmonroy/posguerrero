import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Branch {
    id?: number;
    name: string;
    location?: string;
    phone?: string;
    isActive?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class BranchService {
    private apiUrl = `${environment.apiUrl}/branches`;

    constructor(private http: HttpClient) { }

    getAllBranches(): Observable<Branch[]> {
        return this.http.get<Branch[]>(this.apiUrl);
    }

    getBranchById(id: number): Observable<Branch> {
        return this.http.get<Branch>(`${this.apiUrl}/${id}`);
    }

    createBranch(branch: Branch): Observable<Branch> {
        return this.http.post<Branch>(this.apiUrl, branch);
    }

    updateBranch(id: number, branch: Branch): Observable<Branch> {
        return this.http.put<Branch>(`${this.apiUrl}/${id}`, branch);
    }

    deleteBranch(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
