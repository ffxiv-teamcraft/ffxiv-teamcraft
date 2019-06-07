import { Pipe, PipeTransform } from '@angular/core';
import { CharacterService } from '../../core/api/character.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'characterAvatar'
})
export class CharacterAvatarPipe implements PipeTransform {

  constructor(private service: CharacterService) {
  }

  transform(userId: string): Observable<string> {
    return this.service.getCharacter(userId).pipe(
      map(character => character.character.Avatar)
    );
  }

}
