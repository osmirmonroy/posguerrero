import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    private activeRequests = 0;
    private safetyTimer: any;

    show() {
        this.activeRequests++;
        if (this.activeRequests === 1) {
            this.loadingSubject.next(true);
            this.startSafetyTimer();
        }
    }

    hide() {
        this.activeRequests--;
        if (this.activeRequests <= 0) {
            this.activeRequests = 0;
            this.forceHide();
        }
    }

    private forceHide() {
        this.loadingSubject.next(false);
        this.clearSafetyTimer();
    }

    private startSafetyTimer() {
        this.clearSafetyTimer();
        // Safety: Hide spinner after 15 seconds even if requests are "pending"
        this.safetyTimer = setTimeout(() => {
            if (this.activeRequests > 0) {
                console.warn('Loading safety timer triggered. Forcing hide.');
                this.activeRequests = 0;
                this.forceHide();
            }
        }, 15000);
    }

    private clearSafetyTimer() {
        if (this.safetyTimer) {
            clearTimeout(this.safetyTimer);
            this.safetyTimer = null;
        }
    }
}
