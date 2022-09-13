import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { isNil } from 'lodash';
import { isObservable, Observable, Subscription } from 'rxjs';
import { I18nName } from '../model/common/i18n-name';
import { I18nNameLazy } from '../model/common/i18n-name-lazy';
import { I18nToolsService } from './tools/i18n-tools.service';

type I18nInput = { name: I18nName } | I18nName | I18nNameLazy | Observable<I18nName> | Observable<{ name: I18nName }> | string | Observable<string>;

/**
 * A pipe that coerces an I18nName object into a string matching the user's preferred language.
 * If the input is an I18nNameLazy (where the values are observables instead of raw strings),
 * the value matching the user's language will be asyncronously unwrapped.
 */
@Pipe({
  name: 'i18n',
  pure: false
})
export class I18nPipe implements PipeTransform, OnDestroy {
  private currentValue?: string;

  private input?: I18nInput;

  private sub?: Subscription;

  constructor(private readonly i18n: I18nToolsService, private readonly cd: ChangeDetectorRef) {
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  transform<T extends I18nInput>(input?: T | null, fallback?: string): string | undefined {
    if (!this.i18nEquals(this.input, input)) {
      this.sub?.unsubscribe();
      if (typeof input === 'string') {
        this.setCurrentValue(input);
      } else if (this.isI18nWithName(input)) {
        this.setCurrentValue(this.i18n.getName(input.name));
      } else if (this.isI18nEntry(input)) {
        this.setCurrentValue(this.i18n.getName(input));
      } else if (this.isI18nLazy(input)) {
        this.sub = this.i18n.resolveName(input).subscribe(this.setCurrentValue);
      } else if (isObservable(input)) {
        this.sub = (input as Observable<I18nName>).subscribe(i18nName => {
          if (typeof i18nName === 'string') {
            this.setCurrentValue(i18nName);
          } else {
            this.setCurrentValue(this.i18n.getName(i18nName));
          }
        });
      }
      this.input = input;
    }
    return this.currentValue || fallback;
  }

  private isI18nWithName(data: any): data is { name: I18nName } {
    return !isNil(data) && this.isI18nEntry(data.name);
  }

  private isI18nEntry(data: any): data is I18nName {
    return !isNil(data) && typeof data.en === 'string' && typeof data.de === 'string' && typeof data.ja === 'string' && typeof data.fr === 'string';
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
        next?.name?.fr === current?.name?.fr
      );
    } else {
      return next?.de === current?.de && next?.en === current?.en && next?.ja === current?.ja && next?.fr === current?.fr;
    }
  }

  private setCurrentValue = (val?: string) => {
    const next = this.uppercaseFirst(val);
    const didUpdate = this.currentValue !== next;
    this.currentValue = next;
    if (didUpdate) {
      this.cd.markForCheck();
    }
  };
}
