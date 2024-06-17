import { IntegrityCheck } from './integrity-check';
import { combineLatest, Observable, of, timeout } from 'rxjs';
import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { catchError, map, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LodestoneService } from '../../../../core/api/lodestone.service';

export class AllCharactersValidCheck implements IntegrityCheck<number[]> {

  private characterService = inject(LodestoneService)

  getNameKey(): string {
    return 'All_characters_valid';
  }

  check(user: TeamcraftUser): Observable<number[] | null> {
    const idsToCheck = user.lodestoneIds.filter(l => l.id > 0);
    if (idsToCheck.length === 0) {
      return of(null);
    }
    return combineLatest(
      user.lodestoneIds.map(entry => {
        return this.characterService.getCharacter(entry.id).pipe(
          map(() => true),
          timeout(4000),
          catchError(() => of(false))
        );
      })
    ).pipe(
      map(results => {
        const invalidIndexes = results
          .map((res, i) => res ? -1 : i)
          .filter(i => i > -1);
        if (invalidIndexes.length === 0) {
          return null;
        }
        return invalidIndexes;
      })
    );
  }

  fix(user: TeamcraftUser, result: number[]): TeamcraftUser {
    if (result === null) {
      return user;
    }
    result.forEach(index => {
      delete user.lodestoneIds[index];
    });
    user.lodestoneIds = user.lodestoneIds.filter(e => e);
    if (user.lodestoneIds.length === 0) {
      delete user.defaultLodestoneId;
    }
    return user;
  }

}
