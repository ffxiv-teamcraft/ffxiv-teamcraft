import { RouterModule, Routes } from "@angular/router";
import { CactpotSolverComponent } from "./cactpot-solver/cactpot-solver.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CoreModule, FlexLayoutModule } from "@angular/flex-layout";
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from "../../pipes/pipes.module";
import { BoardAreaComponent } from './board-area/board-area.component';
import { PayoutAreaComponent } from './payout-area/payout-area.component';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';

const routes: Routes = [{
  path: '',
  component: CactpotSolverComponent,
  data: {
    title: 'TITLE.Cactpot_Solver'
  }
}];

@NgModule({
  declarations: [
    CactpotSolverComponent,
    BoardAreaComponent,
    PayoutAreaComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    FlexLayoutModule,
    TranslateModule,
    NzButtonModule,
    PipesModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CactpotSolverModule {}