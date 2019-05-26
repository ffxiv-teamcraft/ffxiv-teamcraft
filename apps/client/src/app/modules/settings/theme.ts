export class Theme {

  public static readonly DEFAULT = new Theme(
    'DEFAULT',
    '#7CC6C9',
    '#E5C339',
    'white',
    '#182D49',
    '#386B7F',
    '#4298AC',
    '#292929'
  );

  // public static readonly GREEN = new Theme('GREEN', '#009a4d', '#b77cb3', 'white');
  //
  // public static readonly BLUE = new Theme('BLUE', '#15459a', '#dac900', 'white');
  //
  // public static readonly RED = new Theme('RED', '#921210', '#00da5c', 'white');
  //
  // public static readonly PURPLE = new Theme('PURPLE', '#8e24aa', '#0edac7', 'white');
  //
  // public static readonly CUSTOM = new Theme('CUSTOM', '#8e24aa', '#0edac7', 'white');

  public static ALL_THEMES = [Theme.DEFAULT];//, Theme.GREEN, Theme.BLUE, Theme.RED, Theme.PURPLE];

  constructor(
    public readonly name: string,
    public primary: string,
    public highlight: string,
    public text: string,
    public topbar: string,
    public trigger: string,
    public triggerHover:string,
    public background: string
  ) {
  }

  public static byName(name: string): Theme {
    return Theme[name];
  }
}
