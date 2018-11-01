import { Component, Input, OnInit } from '@angular/core';
import { Character } from '@xivapi/angular-client';
import { Observable, of } from 'rxjs';
import { CharacterService } from '../../../core/api/character.service';
import { catchError, filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.less']
})
export class UserAvatarComponent implements OnInit {

  @Input()
  userId: string;

  @Input()
  width = 48;

  @Input()
  messageKey: string;

  @Input()
  flex = true;

  character$: Observable<Character>;

  status$: Observable<'success' | 'error'>;

  constructor(private characterService: CharacterService) {
  }

  ngOnInit(): void {
    const character$ = this.characterService.getCharacter(this.userId).pipe(
      catchError(() => {
        return of(null);
      }),
      filter(c => c !== null)
    );
    this.character$ = character$.pipe(map(res => res.character));
    this.status$ = character$.pipe(map(res => res.verified ? 'success' : 'error'));
  }

}
