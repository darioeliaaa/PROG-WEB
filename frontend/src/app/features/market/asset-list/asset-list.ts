import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importalo
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MarketService, MarketAsset } from '../market.service';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-list.html',
  styleUrls: ['./asset-list.css']
})
export class AssetListComponent implements OnInit {

  assets: MarketAsset[] = [];
  currentType: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private marketService: MarketService,
    private cd: ChangeDetectorRef // <--- 2. Iniettalo qui
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.currentType = data['type'];
      this.loadAssets();
    });
  }

  loadAssets() {
    this.loading = true;
    this.assets = [];

    this.marketService.getAssetsByType(this.currentType).subscribe({
      next: (res) => {
        this.assets = res;
        this.loading = false;

        // <--- 3. FORZA L'AGGIORNAMENTO GRAFICO
        this.cd.detectChanges();

        console.log(`Dati caricati per ${this.currentType}:`, this.assets);
      },
      error: (err) => {
        console.error("Errore download market:", err);
        this.loading = false;
        this.cd.detectChanges(); // Anche in caso di errore
      }
    });
  }
}
