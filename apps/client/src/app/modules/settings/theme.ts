export class Theme {

  public static readonly DEFAULT = new Theme(
    'DEFAULT',
    '#1e88e5',
    '#26c6da',
    'white',
    '#272c33',
    '#747d8a',
    '#1e88e5',
    '#525860'
  );

  public static readonly GREEN = new Theme('GREEN', '#009a4d', '#b77cb3', 'white');

  public static readonly BLUE = new Theme('BLUE', '#15459a', '#dac900', 'white');

  public static readonly RED = new Theme('RED', '#921210', '#00da5c', 'white');

  public static readonly PURPLE = new Theme('PURPLE', '#8e24aa', '#0edac7', 'white');

  // This is just a placeholder
  public static readonly CUSTOM = new Theme('CUSTOM', '#8e24aa', '#0edac7', 'white');

  public static ALL_THEMES = [Theme.DEFAULT, Theme.GREEN, Theme.BLUE, Theme.RED, Theme.PURPLE];

  constructor(
    public readonly name: string,
    public primary: string,
    public highlight: string,
    public text: string,
    public topbar: string = '#001529',
    public trigger: string = '#002140',
    public triggerHover: string = '#2A3948',
    public background: string = '#292929'
  ) {
  }

  public static byName(name: string): Theme {
    return Theme[name];
  }
}
