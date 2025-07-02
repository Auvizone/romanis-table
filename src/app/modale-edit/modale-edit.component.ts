import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TableService } from '../services/table/table.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modale-edit',
  templateUrl: './modale-edit.component.html',
  styleUrls: ['./modale-edit.component.scss']
})
export class ModaleEditComponent implements OnInit {

  data: any;
  colonneName : string = '';

  nameFormGroup: UntypedFormGroup;

  matriceValue: number;
  lienMatrice: string;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public tableService: TableService,
    @Inject(MAT_DIALOG_DATA) data: any,
    private fb: UntypedFormBuilder,
  ) { 
    this.data = data;
    this.nameFormGroup = this.fb.group({
      name: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.initMatrice();
    this.colonneName = this.data.nom;
    this.initFormName();
  }

  initFormName() {
    this.nameFormGroup = this.fb.group({
      nom: ['']
    })
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

  updateName() {
    const pricingUpdate: any = {
      params: {
        id : this.data.id,
        nom : this.nameFormGroup.value.nom
      }
    }
    console.log("🚀 ~ ModaleEditComponent ~ updateName ~ pricingUpdate:", pricingUpdate)
    this.tableService.updatePricings(pricingUpdate, this.lienMatrice).subscribe((res) => {
      console.log('res', res)
      this.dialog.closeAll();
    })
  }

  deleteColumn() {
    const pricingDelete: any = {
      params: {
        nom : this.data.id
      }
    }
    console.log("🚀 ~ ModaleEditComponent ~ deleteColumn ~ pricingDelete:", pricingDelete)
    this.tableService.deletePricings(pricingDelete, this.lienMatrice).subscribe((res) => {
      console.log('res', res)
      this.dialog.closeAll();
    })
  }

}
