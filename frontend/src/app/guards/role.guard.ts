import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const expectedRole = route.data['expectedRole'];

        if (this.authService.isLoggedIn() && this.authService.hasRole(expectedRole)) {
            return true;
        }

        // role not authorized so redirect to home page
        this.router.navigate(['/']);
        return false;
    }
}
