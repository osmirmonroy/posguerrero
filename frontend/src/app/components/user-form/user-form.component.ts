import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaqueriaService, User } from '../../services/taqueria.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  user: User = { username: '', role: 'USER' };
  isEditMode = false;

  roles = [
    { label: 'Cajero (User)', value: 'USER' },
    { label: 'Administrador', value: 'ADMIN' }
  ];

  constructor(
    private taqueriaService: TaqueriaService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taqueriaService.getUser(+id).subscribe(user => {
        this.user = user;
        // clear password for security, require new one only if changing
        this.user.password = '';
      });
    }
  }

  onSubmit(): void {
    this.taqueriaService.saveUser(this.user).subscribe(() => {
      this.router.navigate(['/users']);
    });
  }
}

