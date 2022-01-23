import ElectronStore from 'electron-store';

export class Store {
  private store = new ElectronStore();

  public get<T>(key: string, fallback: T): T {
    return this.store.get(key, fallback) as T;
  }

  public set(key: string, value: any): void {
    this.store.set(key, value);
  }

  public delete(key: string): void {
    this.store.delete(key);
  }
}
