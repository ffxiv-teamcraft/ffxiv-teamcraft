import { Component, Input, OnInit } from '@angular/core';
import { Character } from '@xivapi/angular-client';
import { Observable, of } from 'rxjs';
import { CharacterService } from '../../../core/api/character.service';
import { catchError, filter, map, shareReplay, startWith, tap } from 'rxjs/operators';

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

  @Input()
  ignoreVerification = false;

  character$: Observable<Character>;

  status$: Observable<{ verified: boolean }>;

  constructor(private characterService: CharacterService) {
  }

  ngOnInit(): void {
    const character$ = this.characterService.getCharacter(this.userId).pipe(
      catchError(() => {
        return of(null);
      }),
      filter(c => c !== null),
      shareReplay(1)
    );
    this.character$ = character$.pipe(map(res => res.character));
    this.status$ = character$.pipe(map(res => ({ verified: res.verified })), startWith({ verified: false }));
  }

}
