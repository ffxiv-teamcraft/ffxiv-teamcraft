export interface LinkConverter {
  type: 'link',
  target: string;
}

interface ComplexLinkLink {
  when: {
    key: string;
    value: string | number;
  };
  sheet?: string
  sheets?: string[]
}

export interface ComplexLinkConverter {
  type: 'complexlink';
  links: ComplexLinkLink[];
}

export interface MultiRefConverter {
  type: 'multiref',
  targets: string[];
}

export interface TomestoneConverter {
  type: 'tomestone'
}

export interface GenericConverter {
  type: 'generic'
}

export interface ColorConverter {
  type: 'color'
}

export interface IconConverter {
  type: 'icon'
}

export interface QuadConverter {
  type: 'quad'
}

export type SaintConverter =
  LinkConverter
  | ComplexLinkConverter
  | MultiRefConverter
  | TomestoneConverter
  | GenericConverter
  | ColorConverter
  | IconConverter
  | QuadConverter;
