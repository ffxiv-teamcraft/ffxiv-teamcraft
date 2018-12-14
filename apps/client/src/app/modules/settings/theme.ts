export class Theme {

  public static readonly DEFAULT = new Theme('DEFAULT', '', true);

  public static readonly LIGHT_BLUE = new Theme('LIGHT_BLUE', 'light-blue', false);

  constructor(public name: string, public className: string, public isDark: boolean) {
  }

  public static byName(name: string): Theme {
    return Theme[name] || Theme.DEFAULT;
  }
}
