import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenDashboardComponent } from './kitchen-dashboard.component';

describe('KitchenDashboardComponent', () => {
  let component: KitchenDashboardComponent;
  let fixture: ComponentFixture<KitchenDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KitchenDashboardComponent]
    });
    fixture = TestBed.createComponent(KitchenDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
