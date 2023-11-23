import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthFacade } from '../../../+state/auth.facade';
import { map } from 'rxjs/operators';
import { Favorites } from '../../../model/other/favorites';
import { NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'app-favorite-button',
    templateUrl: './favorite-button.component.html',
    styleUrls: ['./favorite-button.component.less'],
    standalone: true,
    imports: [NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, AsyncPipe, TranslateModule]
})
export class FavoriteButtonComponent implements OnInit {

  @Input()
  type: keyof Favorites;

  @Input()
  key: string;

  @Input()
  size: NzSizeLDSType;

  isFavorite$: Observable<boolean>;

  private favorites$ = this.authFacade.favorites$;

  constructor(private authFacade: AuthFacade) {
  }

  toggleFavorite(): void {
    this.authFacade.toggleFavorite(this.type, this.key);
  }

  ngOnInit(): void {
    this.isFavorite$ = this.favorites$.pipe(
      map(favorites => {
        return (favorites[this.type] || []).indexOf(this.key) > -1;
      })
    );
  }

}
