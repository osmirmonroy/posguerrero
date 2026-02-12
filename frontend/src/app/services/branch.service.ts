import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
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

    // Selected branch state for admin users
    private selectedBranchSubject: BehaviorSubject<number | null>;
    public selectedBranch$: Observable<number | null>;

    constructor(private http: HttpClient) {
        const savedBranchId = localStorage.getItem('selectedBranchId');
        const initialValue = savedBranchId ? JSON.parse(savedBranchId) : null;
        this.selectedBranchSubject = new BehaviorSubject<number | null>(initialValue);
        this.selectedBranch$ = this.selectedBranchSubject.asObservable();
    }

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

    // Branch selection methods for admin users
    setSelectedBranch(branchId: number | null) {
        if (branchId === null) {
            localStorage.removeItem('selectedBranchId');
        } else {
            localStorage.setItem('selectedBranchId', JSON.stringify(branchId));
        }
        this.selectedBranchSubject.next(branchId);
    }

    getSelectedBranch(): number | null {
        return this.selectedBranchSubject.value;
    }

    clearSelectedBranch() {
        this.setSelectedBranch(null);
    }
}
