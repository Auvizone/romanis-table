import { Component, ElementRef, Injectable, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TableService } from '../services/table/table.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { find } from 'rxjs';
import { Pricings } from '../Models/pricing.interface';
import { Produits } from '../Models/produits.interface';
import { ModaleEditComponent } from '../modale-edit/modale-edit.component';
import { ReorderComponent } from '../reorder/reorder.component';
import { ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';


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
})
export class TableComponent implements OnInit {

  dataSource: any = [];
  prixProduits: any[] = [];
  customerColumns: string[] = [];
  customerForms: UntypedFormGroup[] = [];
  @ViewChild('TABLE') table: ElementRef | any;
  
  ExportTOExcel()
  {
    console.log('table:', this.table.nativeElement)
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



  public rowVisibility: {[designation: string]: boolean} = {};

  constructor(
    private http: HttpClient,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    public tableService: TableService,
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
        console.log('Column order updated successfully', response);
        this.getPricings();
      },
      error => {
        console.error('Error updating column order', error);
      }
    );
  }

  selectClient(selectedClientId: number) {
    this.selectedClientId = selectedClientId;
  }

  trackByFn(index: number, item: any): any {
    return item.product || item.name;
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
      console.log('npmParam:', nomParam);
      this.tableService.createPricingsTwo(nomParam).subscribe(() => {
        this.getPricings();
        this.getClients();
      });
    }
  }
  else {
    let data = this.columnFormGroup.value;
    console.log('data:', data);
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
    this.initFormColumn(),
    this.getClients(),
    this.getPricings(),
    this.getPrix(),
    this.initFilterControl()
  }

  // transformData() {

  //   let productsMap: { [productIds: number]: any } = {};
  
  //   this.prixProduits.forEach(prix => {
  //     const productDetails = this.products.find(p => p.id === prix.product_id[0]);
  //     let pricing_name = prix.custom_pricing_id[1];
  //     let product_id = prix.product_id[0];
  //     let product_name = prix.product_id[1];
  //     let product_designation = productDetails ? productDetails.designation1 : 'Unknown'; // Add a fallback value as needed
  //     let customer_id = prix.custom_pricing_id[0];
  //     let value = prix.value;
  
  //     if (!productsMap[product_id]) {
  //       productsMap[product_id] = {
  //         product: product_id,
  //         name: product_name,
  //         designation1: product_designation, // Store designation1 here
  //         customer_id: customer_id,
  //         [pricing_name]: value,
  //       };
  //     } else {
  //       productsMap[product_id][pricing_name] = value;
  //     }
  //   });
  
  //   // Convert productsMap to an array, then sort by designation1
  //   const sortedData = Object.values(productsMap).sort((a: any, b: any) => {
  //     if (a.designation1 < b.designation1) return -1;
  //     if (a.designation1 > b.designation1) return 1;
  //     return 0;
  //   });

  //   let groupedData: any[] = [];
  // const groupedMap: { [designation: string]: any[] } = {};

  // Object.values(productsMap).forEach(product => {
  //   if (!groupedMap[product.designation1]) {
  //     groupedMap[product.designation1] = [];
  //   }
  //   groupedMap[product.designation1].push(product);
  // });

  // // Convert groupedMap to an array, including group headers
  // Object.keys(groupedMap).forEach(designation => {
  //   groupedData.push({ isGroup: true, name: designation }); // Group header row
  //   groupedData.push(...groupedMap[designation]); // Product rows for this group
  // });
  
  //   this.transformedData = groupedData;
  //   this.updateDisplayedColumns();
  // }

  transformData() {
    let productsMap: { [productIds: number]: any } = {};



    this.products.forEach(product => {
      if (product.designation_2 == false) {
        product.designation_2 = '';
      };
      productsMap[product.id] = {
        product: product.id,
        name: product.name,
        designation_2: product.designation_2,
        designation1: product.designation1 || 'Unknown',
        customer_id: null,
        gamme: product.gamme[1]
      };
      
    });
    
    console.log(this.prixProduits)
    this.prixProduits.forEach(prix => {
      const pricing_name = prix.custom_pricing_id[1];
      const designation_id = prix.designation_id[0];
      const value = prix.value;
  
      if (productsMap[designation_id]) {
        productsMap[designation_id][pricing_name] = value;
        productsMap[designation_id]['customer_id'] = prix.custom_pricing_id[0];
      }
    });
  
    // Convert productsMap to an array and sort by designation1
    const sortedData = Object.values(productsMap).sort((a: any, b: any) => {
      if (a.designation1 < b.designation1) return -1;
      if (a.designation1 > b.designation1) return 1;
      return 0;
    });

    let groupedData: any[] = [];
    const groupedMap: { [designation: string]: any[]} = {}

    Object.values(productsMap).forEach(product => {
      if (!groupedMap[product.gamme]) {
        groupedMap[product.gamme] = []
      }
      groupedMap[product.gamme].push(product)
    });

    Object.keys(groupedMap).forEach(gamme => {
      groupedData.push({ isGroup: true, name: gamme});
      groupedData.push(...groupedMap[gamme]);
    })

    // Group the data by 'designation1'
    this.transformedData = groupedData;
    this.updateDisplayedColumns();

    console.log('loading finished')
    this.loading = false;
  }
  
  
  

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
  
    console.log(specialColumns, pricingNames);
  
    this.displayedColumns = [...specialColumns, ...pricingNames.filter(name => !specialColumns.includes(name))];
  }  
  
  // FONCTION FETCH DE MES PRODUITS ODOO
  getProducts() {
    this.tableService.readAllDesignation().subscribe((data) => {
      this.products = data.filter((product: any) => product.matrice);
      console.log('data:', data);
      this.transformData();
    });
  }

  // FONCTION FETCH DE MES CLIENTS ODOO
  getClients() {
    this.tableService.readAllClients().subscribe((data) => {
      this.clients = data;
    })
  }

// At the class level, to store dynamic column IDs for deletion
dynamicColumnIds: { [key: string]: Number } = {};

getPricings() {
  this.tableService.readAllPricings().subscribe((data) => {
    this.pricings = data;
    // Resetting dynamicColumnIds for fresh mapping
    this.dynamicColumnIds = {};
    this.displayedColumns = ['name']; // Assuming 'name' is a static column you always want to show

    // Dynamically add pricing columns and map their IDs for deletion
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
    console.log("🚀 ~ TableComponent ~ updatePricings ~ findPricingEntry:", findPricingEntry)
  
    if (findPricingEntry) {
      let updatedValue = element[pricingName]
      console.log("🚀 ~ TableComponent ~ updatePricings ~ updatedValue:", updatedValue)
      if (updatedValue === '') {
        console.log('delete pricing entry');
        const pricingParam: any = {
          params: {
            id: findPricingEntry.id
          }
        }
        this.tableService.deletePrix(pricingParam).subscribe((data) => {
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
      this.tableService.updatePrix(pricingParam).subscribe((data) => {
      });
    }
    } else {
      let correctPricingId = this.pricings.find(x => x.name == pricingName)
      const newPricingParam: any = {
        params: {
          custom_pricing_id: correctPricingId.id, 
          designation_id: element.product, 
          value: element[pricingName]
        }
      };
      console.log('newPricingParam:', newPricingParam);
      this.tableService.createPrix(newPricingParam).subscribe((data) => {
        console.log('DATA DU CREATE PRIX ICI:', data);
      });
    }
  }
  
  // FETCH DES PRIX LIES AU PRODUIT ET A LA REGLE DE PRIX
  getPrix() {
    this.tableService.readAllPrix().subscribe((data) => {
      this.prixProduits = data;
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

  // deleteColumn(name: any) {
  //   const column = this.pricings.find((x) => x.name == name)
  //   const pricingDelete: any = {
  //     params: {
  //       nom: column.id
  //     }
  //   }
  //   this.tableService.deletePricings(pricingDelete).subscribe((data) => {
  //     this.getPricings();
  //     this.getClients();
  //   })
  // }

  openModaleEdit(data: any) {
    console.log("🚀 ~ TableComponent ~ openModaleEdit ~ data:", data)
    const column = this.pricings.find((x) => x.name == data)
    console.log(column.id)
    this.dialogConfig.data = {
      nom: data,
      id : column.id
    }
    this.dialogConfig.position = {
      left: '40%'
    }
    this.dialogConfig.width = '20%';
    this.dialogConfig.height = 'auto';
    
    const dia = this.dialog.open(ModaleEditComponent, this.dialogConfig)
    dia.afterClosed().subscribe((res) => {
      this.getClients();
    })
  }

  updateColumn(name: any) {
    const column = this.pricings.find((x) => x.name == name)
    console.log(column.id)
  }

}