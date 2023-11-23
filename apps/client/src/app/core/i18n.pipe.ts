import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash';
import { combineLatest, isObservable, Observable, of, Subscription } from 'rxjs';
import { I18nName } from '@ffxiv-teamcraft/types';
import { I18nNameLazy } from '../model/common/i18n-name-lazy';
import { I18nToolsService } from './tools/i18n-tools.service';
import { map, switchMap } from 'rxjs/operators';
import { observeInput } from './rxjs/observe-input';

type I18nInput =
  { name: I18nName }
  | I18nName
  | Partial<I18nName>
  | I18nNameLazy
  | Observable<I18nName>
  | Observable<{ name: I18nName }>
  | string
  | Observable<string>;

/**
 * A pipe that coerces an I18nName object into a string matching the user's preferred language.
 * If the input is an I18nNameLazy (where the values are observables instead of raw strings),
 * the value matching the user's language will be asyncronously unwrapped.
 */
@Pipe({
    name: 'i18n',
    pure: false,
    standalone: true
})
export class I18nPipe implements PipeTransform, OnDestroy {
  private currentValue?: string;

  public input?: I18nInput;

  private sub: Subscription = combineLatest([
    observeInput<I18nPipe, 'input'>(this, 'input'),
    this.i18n.currentLang$
  ]).pipe(
    // Ignoring lang here because it's only used to trigger the change anyways
    switchMap(([input]) => {
      if (typeof input === 'string') {
        return of(input);
      } else if (this.isI18nWithName(input)) {
        return of(this.i18n.getName(input.name));
      } else if (this.isI18nEntry(input)) {
        return of(this.i18n.getName(input));
      } else if (this.isI18nLazy(input)) {
        return this.i18n.resolveName(input);
      } else if (isObservable(input)) {
        return (input as Observable<I18nName>).pipe(
          map(i18nName => {
            if (typeof i18nName === 'string') {
              return i18nName;
            } else {
              return this.i18n.getName(i18nName);
            }
          })
        );
      }
      return of(null);
    })
  ).subscribe((value: string) => {
    this.setCurrentValue(value);
  });

  constructor(private readonly i18n: I18nToolsService, private readonly cd: ChangeDetectorRef) {
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  transform<T extends I18nInput>(input?: T | null, fallback?: string): string | undefined {
    if (!this.i18nEquals(this.input, input)) {
      this.input = input;
    }
    return this.currentValue || fallback;
  }

  private isI18nWithName(data: any): data is { name: I18nName } {
    return !isNil(data) && this.isI18nEntry(data.name);
  }

  private isI18nEntry(data: any): data is I18nName {
    if (isNil(data)) {
      return false;
    }
    const isGlobalEntry = typeof data.en === 'string' && typeof data.de === 'string' && typeof data.ja === 'string' && typeof data.fr === 'string';
    const isKorenOrChineseEntry = typeof data.ko === 'string' || typeof data.zh === 'string';
    return isGlobalEntry || isKorenOrChineseEntry;
  }

  private isI18nLazy(data: any): data is I18nNameLazy {
    return !isNil(data) && isObservable(data.en) && isObservable(data.de) && isObservable(data.ja) && isObservable(data.fr);
  }

  private uppercaseFirst(val?: string) {
    if (!val) return undefined;
    return val.charAt(0).toUpperCase() + val.slice(1);
  }

  private i18nEquals(current: any, next: any) {
    if (current === next) return true;
    if ((!current && !!next) || (!!current && !next)) return false;
    if (isObservable(current) && isObservable(next)) {
      return current === next;
    }
    if (this.isI18nWithName(next)) {
      return (
        next?.name?.de === current?.name?.de &&
        next?.name?.en === current?.name?.en &&
        next?.name?.ja === current?.name?.ja &&
        next?.name?.fr === current?.name?.fr &&
        next?.name?.ko === current?.name?.ko &&
        next?.name?.zh === current?.name?.zh
      );
    } else {
      return next?.de === current?.de && next?.en === current?.en && next?.ja === current?.ja
        && next?.fr === current?.fr && next?.ko === current?.ko && next?.zh === current?.zh;
    }
  }

  private setCurrentValue(val?: string): void {
    const next = this.uppercaseFirst(val);
    const didUpdate = this.currentValue !== next;
    this.currentValue = next;
    if (didUpdate) {
      this.cd.markForCheck();
    }
  }
}
