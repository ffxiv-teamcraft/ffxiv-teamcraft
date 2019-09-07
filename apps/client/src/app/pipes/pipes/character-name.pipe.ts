import { Pipe, PipeTransform } from '@angular/core';
import { CharacterService } from '../../core/api/character.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'characterName'
})
export class CharacterNamePipe implements PipeTransform {

  constructor(private service: CharacterService, private translate: TranslateService) {
  }

  transform(lodestoneId: string): Observable<string> {
    return this.service.getCharacter(lodestoneId).pipe(
      map(character => character ? character.character.Name : this.translate.instant('COMMON.Anonymous'))
    );
  }

}
