export class Theme {

  public static readonly DEFAULT = new Theme('DEFAULT', 'default', true);

  public static readonly GREEN = new Theme('GREEN', 'green', false);

  public static readonly BLUE = new Theme('BLUE', 'blue', false);

  public static readonly RED = new Theme('RED', 'red', false);

  public static readonly PURPLE = new Theme('PURPLE', 'purple', false);

  public static ALL_THEMES = [Theme.DEFAULT, Theme.GREEN, Theme.BLUE, Theme.RED, Theme.PURPLE];

  constructor(public name: string, public className: string, public isDark: boolean) {
  }

  public static byName(name: string): Theme {
    return Theme[name] || Theme.DEFAULT;
  }
}
