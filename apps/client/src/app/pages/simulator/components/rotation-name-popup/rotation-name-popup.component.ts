import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';

@Component({
  selector: 'app-rotation-name-popup',
  templateUrl: './rotation-name-popup.component.html',
  styleUrls: ['./rotation-name-popup.component.scss']
})
export class RotationNamePopupComponent {

  public form: FormControl;

  constructor(private ref: MatDialogRef<RotationNamePopupComponent>, @Inject(MAT_DIALOG_DATA) private rotation: CraftingRotation) {
    this.form = new FormControl(rotation.getName(), Validators.required);
  }

  submit() {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    }
  }
}
