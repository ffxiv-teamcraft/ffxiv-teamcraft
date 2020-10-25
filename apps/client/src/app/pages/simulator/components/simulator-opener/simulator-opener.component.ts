import { Component, OnInit } from '@angular/core';
import { RecipeChoicePopupComponent } from '../recipe-choice-popup/recipe-choice-popup.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-simulator-opener',
  templateUrl: './simulator-opener.component.html',
  styleUrls: ['./simulator-opener.component.less']
})
export class SimulatorOpenerComponent implements OnInit {

  constructor(private dialog: NzModalService,
              private translate: TranslateService,
              private router: Router) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.dialog.create({
        nzFooter: null,
        nzContent: RecipeChoicePopupComponent,
        nzComponentParams: {
          showCustom: true
        },
        nzTitle: this.translate.instant('Pick_a_recipe')
      }).afterClose
        .subscribe(pickedRecipe => {
          if (!pickedRecipe) {
            this.router.navigate(['/search']);
          }
        });
    });
  }

}
