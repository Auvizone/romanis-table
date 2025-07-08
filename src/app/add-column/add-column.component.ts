import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TableService } from '../services/table/table.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-column',
  templateUrl: './add-column.component.html',
  styleUrls: ['./add-column.component.scss']
})
export class AddColumnComponent implements OnInit {
  columnFormGroup: UntypedFormGroup;
  submitAttempted = false;

  matriceValue: number;
  lienMatrice: string = '';

  constructor(
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<AddColumnComponent>,
    public tableService: TableService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
    this.initMatrice();
    this.initFormColumn();
  }

  initMatrice() {
    this.matriceValue = this.route.snapshot.data['matrice'];
    if (this.matriceValue == 1) {
      this.lienMatrice = '';
    }
    if (this.matriceValue == 2) {
      this.lienMatrice = '_simulation';
    }
  }

  initFormColumn() {
    this.columnFormGroup = this.fb.group({
      nom: ['', [Validators.required]]
    });
  }

  onCancel(): void {
    // Force close the dialog without validation
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    this.submitAttempted = true;
    if (this.columnFormGroup.invalid) {
      return;
    }

    const data = this.columnFormGroup.value;
    const nomParam: any = {
      params: {
        nom: data.nom
      }
    };
    this.dialogRef.close(nomParam);
  }
}
