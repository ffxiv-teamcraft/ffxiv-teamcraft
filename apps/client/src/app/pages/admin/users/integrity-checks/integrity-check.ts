import { TeamcraftUser } from '../../../../model/user/teamcraft-user';
import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const INTEGRITY_CHECKS = new InjectionToken('integrity-checks');

export interface IntegrityCheck<T = any> {
  getNameKey(): string;

  check(user: TeamcraftUser): Observable<T | null>;

  fix(user: TeamcraftUser, result: T | null): TeamcraftUser;
}
