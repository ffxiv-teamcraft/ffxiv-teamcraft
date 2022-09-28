import { Component, OnInit } from '@angular/core';
import { AuthFacade } from '../../../../+state/auth.facade';
import { first, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-masterbooks-popup',
  templateUrl: './masterbooks-popup.component.html',
  styleUrls: ['./masterbooks-popup.component.less']
})
export class MasterbooksPopupComponent implements OnInit {

  private static BOOKS: { [index: number]: number[] } = {
    //CRP
    8: [8135, 7778, 9336, 12244, 14126, 17869, 22309, 24266, 7786, 29484, 35618, 37734],
    //BSM
    9: [8136, 7779, 9337, 12245, 14127, 17870, 22310, 24267, 7787, 29485, 35619, 37735],
    //ARM
    10: [8137, 7780, 9338, 12246, 14128, 17871, 22311, 24268, 7788, 29486, 35620, 37736],
    //GSM
    11: [8138, 7781, 9339, 12247, 14129, 17872, 22312, 24269, 7789, 29487, 35621, 37737],
    //LTW
    12: [8139, 7782, 9340, 12248, 14130, 17873, 22313, 24270, 7790, 29488, 35622, 37738],
    //WVR
    13: [8140, 7783, 9341, 12249, 14131, 17874, 22314, 24271, 7791, 29489, 35623, 37739],
    //ALC
    14: [8141, 7784, 9342, 12250, 14132, 17875, 22315, 24272, 7792, 29490, 35624, 37740],
    //CUL
    15: [7785, 9343, 12251, 14133, 17876, 22316, 24273, 29491, 35625, 37741],
    //MIN
    16: [12238, 12239, 12240, 17838, 17839, 26808, 36598, 36600, 36601],
    //BTN
    17: [12698, 12699, 12700, 17840, 17841, 26809, 36602, 36604, 36605],
    //FSH
    18: [12701, 12702, 12703, 17842, 17843, 26810, 36606, 36608, 36609]
  };

  masterbooks$: Observable<{ id: number, checked: boolean }[]>;

  public jobId: number;

  constructor(private authFacade: AuthFacade, private modalRef: NzModalRef) {
  }

  ngOnInit(): void {
    this.masterbooks$ = this.authFacade.mainCharacterEntry$.pipe(
      map(entry => {
        const books = MasterbooksPopupComponent.BOOKS[this.jobId];
        return books.map(book => {
          return {
            id: book,
            checked: (entry.masterbooks || []).indexOf(book) > -1
          };
        });
      }),
      first()
    );
  }

  checkAll(books: { id: number, checked: boolean }[]): void {
    books.forEach(book => book.checked = true);
  }

  save(books: { id: number, checked: boolean }[]): void {
    this.authFacade.saveMasterbooks(books);
    this.modalRef.close();
  }

  cancel(): void {
    this.modalRef.close();
  }
}
