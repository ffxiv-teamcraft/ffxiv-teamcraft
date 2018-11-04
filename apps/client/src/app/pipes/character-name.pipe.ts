import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../core/data/localized-data.service';
import { I18nName } from '../model/common/i18n-name';
import { CharacterService } from '../core/api/character.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'characterName'
})
export class CharacterNamePipe implements PipeTransform {

  constructor(private service: CharacterService) {
  }

  transform(lodestoneId: string): Observable<string> {
    return this.service.getCharacter(lodestoneId).pipe(
      map(character => character.character.Name)
    );
  }

}
