import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TableService } from '../services/table/table.service';

@Component({
  selector: 'app-modale-edit',
  templateUrl: './modale-edit.component.html',
  styleUrls: ['./modale-edit.component.scss']
})
export class ModaleEditComponent implements OnInit {

  data: any;
  colonneName : string = '';

  nameFormGroup: FormGroup;

  constructor(
    public dialog: MatDialog,
    public tableService: TableService,
    @Inject(MAT_DIALOG_DATA) data: any,
    private fb: FormBuilder,
  ) { 
    this.data = data;
    this.nameFormGroup = this.fb.group({
      name: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.colonneName = this.data.nom;
    this.initFormName();
  }

  initFormName() {
    this.nameFormGroup = this.fb.group({
      nom: ['']
    })
  }

  updateName() {
    const pricingUpdate: any = {
      params: {
        id : this.data.id,
        nom : this.nameFormGroup.value.nom
      }
    }
    console.log("🚀 ~ ModaleEditComponent ~ updateName ~ pricingUpdate:", pricingUpdate)
    this.tableService.updatePricings(pricingUpdate).subscribe((res) => {
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
    this.tableService.deletePricings(pricingDelete).subscribe((res) => {
      console.log('res', res)
      this.dialog.closeAll();
    })
  }

}
