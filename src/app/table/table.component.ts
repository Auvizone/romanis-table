import { Component, ElementRef, Injectable, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TableService } from '../services/table/table.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { find, debounceTime, distinctUntilChanged } from 'rxjs';
import { Pricings } from '../Models/pricing.interface';
import { Produits } from '../Models/produits.interface';
import { ModaleEditComponent } from '../modale-edit/modale-edit.component';
import { ReorderComponent } from '../reorder/reorder.component';
import { ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ActivatedRoute } from '@angular/router';

export interface TableRow {
  id: number;
  name: string;
}

export interface GroupBy {
  category: string;
  isGroupBy: boolean;
}

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit {

  dataSource: any = [];
  prixProduits: any[] = [];
  customerColumns: string[] = [];
  customerForms: UntypedFormGroup[] = [];
  @ViewChild('TABLE') table: ElementRef | any;
  
  ExportTOExcel()
  {
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    /* save to file */
    XLSX.writeFile(wb, 'Matrice_tarifaire.xlsx');
    
  }
  
  columnFormGroup: UntypedFormGroup;
  
  nameControls: { [key: number]: UntypedFormControl } = {};

  deleteActivated: Boolean = false;
  
  transformedData: any[] = [];

  selectedClientId: number | null = null;

  matriceValue: number;
  lienMatrice: string;
  
  products: any[] = [];
  pricings: any[] = [];
  values: any[] = [];
  clients: any[] = [];
  
  displayedColumns: any[] = []
  columnNames: string[] = []

  groupedData: any = {};
  categoryVisibility: any = {};

  clientFilterControl = new UntypedFormControl();
  filteredClients: any[] = [];

  dialogConfig = new MatDialogConfig()

  loading: boolean = false;

  pageSize = 50;
  currentPage = 0;

  public rowVisibility: {[designation: string]: boolean} = {};

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    public tableService: TableService,
    private cdr: ChangeDetectorRef
  ) {
      this.columnFormGroup = this.fb.group({
        columns: this.fb.array([])
      })
    }

  // GENERE FORM AJOUT COLONNE
  initFormColumn() {
    console.log('loading started')
    this.loading = true;
    this.columnFormGroup = this.fb.group({
      nom: ['']
    })
  }

  initFilterControl() {
    this.clientFilterControl.valueChanges.subscribe(val => {
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(val.toLowerCase())
      );
    });
  }

  openReorderDialog(): void {
    const dialogRef = this.dialog.open(ReorderComponent, {
      width: '400px',
      data: { items: this.pricings.map(p => ({ name: p.name, position: p.position })) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('loading started')
        this.loading = true;
        this.updateColumnOrder(result);
      }
    });
  }

  updateColumnOrder(newOrder: { name: string, position: number }[]): void {
    this.tableService.updateColumnOrder(newOrder).subscribe(
      response => {
        this.getPricings();
      },
      error => {
      }
    );
  }

  selectClient(selectedClientId: number) {
    this.selectedClientId = selectedClientId;
  }

  trackByFn(index: number, item: any): any {
    return item.product || item.name || index;
  }

  // FONCTION AJOUT COLONNE AVEC TEXTE VENANT DU FORM
//   addColumn() {
//     const colonneNom = this.columnFormGroup.value.nom; 
//     const nomParam: any = {
//       params: {
//         nom: colonneNom
//       }
//     };
//     this.tableService.createPricings(nomParam).subscribe((data) => {
//     })
// }

addColumn() {
  if (this.selectedClientId) {
    const selectedClient = this.clients.find(client => client.id === this.selectedClientId);
    if (selectedClient) {
      const nomParam: any = {
        params: {
          nom: selectedClient.name,
          customer_id: this.selectedClientId
        }
      };
      this.tableService.createPricingsTwo(nomParam, this.lienMatrice).subscribe(() => {
        this.getPricings();
        // this.getClients();
      });
    }
  }
  else {
    let data = this.columnFormGroup.value;
    const nomParam: any = {
      params: {
        nom : data.nom
      }
    }
    this.tableService.createPricings(nomParam).subscribe(() => {
      this.getPricings();
      this.columnFormGroup.reset();
    })
  }
}

hiddenGroups: Set<string> = new Set();

toggleRowVisibility(groupName: string): void {
}

  // FONCTIONS LANCEES AU CHARGEMENT DE LA PAGE
  ngOnInit(): void {
    this.initMatrice();
    this.initFormColumn(),
    // this.getClients(),
    this.getPricings(),
    this.getPrix(),
    this.initFilterControl()
  }

  initMatrice() {
    this.matriceValue = this.route.snapshot.data['matrice'];
    console.log('Matrice value:', this.matriceValue);
    if (this.matriceValue == 1) {
      this.lienMatrice = ''
    }
    if (this.matriceValue == 2) {
      this.lienMatrice = '_simulation'
    }
  }

  transformData() {
    console.log('loading started');
    this.loading = true;
    
    const chunkSize = 100;
    let currentIndex = 0;
    
    const processChunk = () => {
      const chunk = this.products.slice(currentIndex, currentIndex + chunkSize);
      
      chunk.forEach(product => {
        if (product.designation_2 == false) {
          product.designation_2 = '';
        };
        const productData = {
          product: product.id,
          name: product.name,
          designation_2: product.designation_2,
          designation1: product.designation1 || 'Unknown',
          customer_id: null,
          gamme: product.gamme[1]
        };
        
        // Find all prices for this product
        const productPrices = this.prixProduits.filter(prix => 
          prix.designation_id[0] === product.id
        );
        
        productPrices.forEach(prix => {
          productData[prix.custom_pricing_id[1]] = prix.value;
          productData.customer_id = prix.custom_pricing_id[0];
        });
        
        if (!this.groupedData[productData.gamme]) {
          this.groupedData[productData.gamme] = [];
        }
        this.groupedData[productData.gamme].push(productData);
      });
      
      currentIndex += chunkSize;
      
      if (currentIndex < this.products.length) {
        requestAnimationFrame(processChunk);
      } else {
        this.finalizeTransformation();
      }
    };
    
    requestAnimationFrame(processChunk);
  }
  
  finalizeTransformation() {
    let groupedData: any[] = [];
    
    Object.keys(this.groupedData).forEach(gamme => {
      groupedData.push({ isGroup: true, name: gamme });
      groupedData.push(...this.groupedData[gamme]);
    });
    
    this.transformedData = groupedData;
    this.updateDisplayedColumns();
    this.loading = false;
    this.cdr.detectChanges();
  }
  
  // Debounced update for input changes
  debouncedUpdate(value: any, element: any, column: string) {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      this.updatePricings(element, column);
    }, 300);
  }
  
  private updateTimeout: any;

  // MET A JOUR LES COLONNES AFFICHEES
  updateDisplayedColumns(): void {
    const specialColumns = ['name', 'designation_2'];
    const pricingNames = this.pricings.map(pricing => pricing.name);
    pricingNames.sort((a, b) => {
      const pricingA = this.pricings.find(pricing => pricing.name === a);
      const pricingB = this.pricings.find(pricing => pricing.name === b);
      if (pricingA && pricingB) {
        return pricingA.position - pricingB.position;
      }
      return 0;
    });
  
  
    this.displayedColumns = [...specialColumns, ...pricingNames.filter(name => !specialColumns.includes(name))];
  }  
  
  // FONCTION FETCH DE MES PRODUITS ODOO
  getProducts() {
    this.tableService.readAllDesignation().subscribe((data) => {
      this.products = data.filter((product: any) => product.matrice);
    });
  }

  // FONCTION FETCH DE MES CLIENTS ODOO
  getClients() {
    this.tableService.readAllClients(this.lienMatrice).subscribe((data) => {
      console.log("🚀 ~ file: table.component.ts:313 ~ data:", data)
      this.clients = data;
    })
  }

dynamicColumnIds: { [key: string]: Number } = {};

// ALLER CHERCHER LES COLONNES DU TABLEAU 
getPricings() {
  this.tableService.readAllPricings().subscribe((data) => {
    console.log("🚀 ~ file: table.component.ts:322 ~ data:", data)
    this.pricings = data;
    this.dynamicColumnIds = {};
    this.displayedColumns = ['name']; 

    data.forEach(pricing => {
      this.displayedColumns.push(pricing.name);
      this.dynamicColumnIds[pricing.name] = pricing.customer_id;
    });

    this.getProducts();
  });
}

logColumnName(name: any) {
  if (name.isGroup) {
}
}
  

  // PERMET D'EDITER LES COLONNES
  isPricingColumn(columnName: string): boolean {
    return this.pricings.some(pricing => pricing.name === columnName);
  }

  test(value: any) {
    console.log('test', value);
  }

  // MET A JOUR LES CASES DU TABLEAU UNE FOIS QU'IL EST DESELECTIONNE
  // SI RENTRE SUR UNE CASE VIDE, PASSE A LA CREATION POUR QUE TOUT SE FASSE AU MEME ENDROIT
  updatePricings(element: any, pricingName: string): void {
    let findPricingEntry = this.prixProduits.find(prix => 
      prix.designation_id[0] === element.product && prix.custom_pricing_id[1] === pricingName);
  
    if (findPricingEntry) {
      let updatedValue = element[pricingName]
      if (updatedValue === '') {
        const pricingParam: any = {
          params: {
            id: findPricingEntry.id
          }
        }
        this.tableService.deletePrix(pricingParam, this.lienMatrice).subscribe((data) => {
        });
      } else {

      
      const pricingParam: any = {
          params: {
            id: findPricingEntry.id,
            name: findPricingEntry.name,
            custom_pricing_id: findPricingEntry.custom_pricing_id,
            designation_id: findPricingEntry.designation_id,
            value: updatedValue
          }
      }
      this.tableService.updatePrix(pricingParam, this.lienMatrice).subscribe((data) => {
      });
    }
    } else {
      let correctPricingId = this.pricings.find(x => x.name == pricingName)
      const newPricingParam: any = {
        params: {
          custom_pricing_id: correctPricingId.id, 
          designation_id: element.product, 
          value: element[pricingName],
          matrice: this.lienMatrice
        }
      };
      console.log('lien matrice', this.lienMatrice)
      this.tableService.createPrix(newPricingParam, this.lienMatrice).subscribe((data) => {
      });
    }
  }
  
  // FETCH DES PRIX LIES AU PRODUIT ET A LA REGLE DE PRIX
  getPrix() {
    this.tableService.readAllPrix(this.lienMatrice).subscribe((data) => {
      console.log('data ici prix produits', data)
      this.prixProduits = data;
      this.transformData();
    })
  }

  showDelete() {
    if (this.deleteActivated == false) {
      this.deleteActivated = true;
    }
    else {
      this.deleteActivated = false;
    }
  }

  openModaleEdit(data: any) {
    const column = this.pricings.find((x) => x.name == data)
    this.dialogConfig.data = {
      nom: data,
      id : column.id
    }
    this.dialogConfig.position = {
      left: '40%'
    }
    this.dialogConfig.width = '20%';
    this.dialogConfig.height = '220px';
    
    const dia = this.dialog.open(ModaleEditComponent, this.dialogConfig)
    dia.afterClosed().subscribe((res) => {
      // this.getClients();
    })
  }

  updateColumn(name: any) {
    const column = this.pricings.find((x) => x.name == name)
  }

  get visibleColumns(): string[] {
    // Implementation depends on your viewport size and scroll position
    return this.displayedColumns;
  }
}