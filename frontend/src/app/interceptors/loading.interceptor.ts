import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
    private activeRequests = 0;

    constructor(private loadingService: LoadingService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Incrementar contador y mostrar spinner si es la primera solicitud
        if (this.activeRequests === 0) {
            this.loadingService.show();
        }
        this.activeRequests++;

        return next.handle(request).pipe(
            finalize(() => {
                // Decrementar contador y ocultar spinner si no hay solicitudes activas
                this.activeRequests--;
                if (this.activeRequests === 0) {
                    this.loadingService.hide();
                }
            })
        );
    }
}
