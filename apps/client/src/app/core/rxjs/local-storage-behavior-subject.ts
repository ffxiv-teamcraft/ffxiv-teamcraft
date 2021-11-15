import { BehaviorSubject } from 'rxjs';

export class LocalStorageBehaviorSubject<T> extends BehaviorSubject<T> {

  private readonly key: string;
  private readonly defaultValue: T;

  constructor(key: string, defaultValue: T) {
    const LSvalue = localStorage.getItem(key);
    if (LSvalue) {
      super(JSON.parse(LSvalue));
    } else {
      super(defaultValue);
    }
    this.key = key;
    this.defaultValue = defaultValue;
  }

  next(value: T): void {
    super.next(value);
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  reset(): void {
    this.next(this.defaultValue);
  }
}
