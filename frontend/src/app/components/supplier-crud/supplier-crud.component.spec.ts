import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierCrudComponent } from './supplier-crud.component';

describe('SupplierCrudComponent', () => {
  let component: SupplierCrudComponent;
  let fixture: ComponentFixture<SupplierCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierCrudComponent]
    });
    fixture = TestBed.createComponent(SupplierCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
