export class Theme {

  public static readonly DEFAULT = new Theme('DEFAULT', 'default', true);

  public static readonly GREEN = new Theme('GREEN', 'green', false);

  public static readonly BLUE = new Theme('BLUE', 'blue', false);

  public static ALL_THEMES = [Theme.DEFAULT, Theme.GREEN, Theme.BLUE];

  constructor(public name: string, public className: string, public isDark: boolean) {
  }

  public static byName(name: string): Theme {
    return Theme[name] || Theme.DEFAULT;
  }
}
