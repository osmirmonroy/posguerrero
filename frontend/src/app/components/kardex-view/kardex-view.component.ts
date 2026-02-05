import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { InventoryTransaction } from '../../models/taqueria.models';

@Component({
  selector: 'app-kardex-view',
  templateUrl: './kardex-view.component.html',
  styleUrls: ['./kardex-view.component.css']
})
export class KardexViewComponent implements OnInit, OnChanges {
  @Input() supplyId: number | undefined;
  transactions: InventoryTransaction[] = [];
  loading = false;

  constructor(private taqueriaService: TaqueriaService) { }

  ngOnInit(): void {
    if (this.supplyId) {
      this.loadTransactions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplyId'] && this.supplyId) {
      this.loadTransactions();
    }
  }

  loadTransactions() {
    if (!this.supplyId) return;
    this.loading = true;
    this.taqueriaService.getInventoryTransactions(this.supplyId).subscribe(data => {
      this.transactions = data;
      this.loading = false;
    });
  }
}
