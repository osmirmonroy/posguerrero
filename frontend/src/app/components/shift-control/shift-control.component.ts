import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { Shift } from '../../models/taqueria.models';

@Component({
  selector: 'app-shift-control',
  templateUrl: './shift-control.component.html',
  styleUrls: ['./shift-control.component.css']
})
export class ShiftControlComponent implements OnInit {
  currentShift: Shift | null = null;
  loading = false;
  error = '';

  // Open Shift Form
  initialCash: number = 0;

  // Close Shift Form
  finalCashDeclared: number = 0;
  comments: string = '';

  constructor(private taqueriaService: TaqueriaService) { }

  ngOnInit(): void {
    this.loadCurrentShift();
  }

  loadCurrentShift(): void {
    this.loading = true;
    this.taqueriaService.getCurrentShift().subscribe({
      next: (shift) => {
        this.currentShift = shift; // Shift or null
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.currentShift = null; // Assume no shift on 404 or other error for now, ideally handle 404 specifically
        this.loading = false;
      }
    });
  }

  onOpenShift(): void {
    if (this.initialCash < 0) return;
    this.loading = true;
    this.taqueriaService.openShift(this.initialCash).subscribe({
      next: (shift) => {
        this.currentShift = shift;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to open shift';
        this.loading = false;
      }
    });
  }

  onCloseShift(): void {
    if (this.finalCashDeclared < 0) return;
    this.loading = true;
    this.taqueriaService.closeShift(this.finalCashDeclared, this.comments).subscribe({
      next: (shift) => {
        this.currentShift = null; // Shift closed, so no current open shift
        this.loading = false;
        // Maybe show a summary dialog?
        alert(`Shift Closed. System Calculated: ${shift.finalCashSystem}, Declared: ${shift.finalCashDeclared}, Diff: ${shift.finalCashDeclared! - shift.finalCashSystem!}`);
      },
      error: (err) => {
        this.error = 'Failed to close shift';
        this.loading = false;
      }
    });
  }
}
