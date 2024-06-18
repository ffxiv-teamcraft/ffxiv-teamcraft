export interface LazyQuestsText {
  Dialogue?: Dialogue[];
  Journal?:  Journal[];
  ToDo?:     Journal[];
}

export interface Dialogue {
  npc:   number | null;
  order: number;
  text:  Text;
}

export interface Text {
  de?: string;
  en?: string;
  fr?: string;
  ja?: string;
}

export interface Journal {
  order: number;
  text:  Text;
}
