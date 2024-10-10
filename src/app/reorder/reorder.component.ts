import { Component, Inject } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.component.html',
  styles: [`
    .drag-item {
      padding: 10px;
      border-bottom: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                  0 8px 10px 1px rgba(0,0,0,0.14),
                  0 3px 14px 2px rgba(0,0,0,0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cursor {
      cursor: pointer;
    }
  `]
})
export class ReorderComponent {
  items: { name: string, position: number }[];

  constructor(
    public dialogRef: MatDialogRef<ReorderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: { name: string, position: number }[] }
  ) {
    this.items = [...data.items];
    this.sortItemsByPosition();
    console.log(this.items);
  }

  sortItemsByPosition() {
    this.items.sort((a, b) => a.position - b.position);
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log('test drop')
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    // Update positions after reordering
    this.items.forEach((item, index) => item.position = index + 1);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.items);
  }
}