export class Theme {

  public static readonly DEFAULT = new Theme('DEFAULT', '#006d46', '#009688', 'white');

  public static readonly GREEN = new Theme('GREEN', '#009a4d', '#b77cb3', 'white');

  public static readonly BLUE = new Theme('BLUE', '#15459a', '#dac900', 'white');

  public static readonly RED = new Theme('RED', '#921210', '#00da5c', 'white');

  public static readonly PURPLE = new Theme('PURPLE', '#8e24aa', '#0edac7', 'white');

  public static readonly CUSTOM = new Theme('CUSTOM', '#8e24aa', '#0edac7', 'white');

  public static ALL_THEMES = [Theme.DEFAULT, Theme.GREEN, Theme.BLUE, Theme.RED, Theme.PURPLE];

  constructor(public readonly name: string, public primary: string, public highlight: string, public text: string) {
  }

  public static byName(name: string): Theme {
    return Theme[name] || Theme.DEFAULT;
  }
}
