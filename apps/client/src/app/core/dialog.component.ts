import { inject } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

export class DialogComponent {
  protected data = inject(NZ_MODAL_DATA, { optional: true });

  patchData(): void {
    if (this.data) {
      Object.assign(this, this.data);
    }
  }
}
