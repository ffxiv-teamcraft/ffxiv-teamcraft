export interface LazyQuest {
  action?: number;
  icon:    Icon;
  name:    Name;
}

export enum Icon {
  I071000071221PNG = "/i/071000/071221.png",
}

export interface Name {
  de: string;
  en: string;
  fr: string;
  ja: string;
}
