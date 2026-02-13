import { Component, OnInit } from '@angular/core';
import { TaqueriaService, User } from '../../services/taqueria.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(private taqueriaService: TaqueriaService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.taqueriaService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  deleteUser(id: number | undefined): void {
    if (id && confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.taqueriaService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
