export interface LazyFatesDatabasePage {
  de:          string;
  description: Description;
  en:          string;
  fr:          string;
  icon:        Icon;
  id:          number;
  items?:      number[];
  ja:          string;
  lvl:         number;
  lvlMax:      number;
  map?:        number;
  patch:       number;
  x?:          number;
  y?:          number;
  z?:          number;
  zoneid?:     number;
}

export interface Description {
  de: string;
  en: string;
  fr: string;
  ja: string;
}

export enum Icon {
  APIAssetPathUIIcon060000060501TexFormatPNG = "/api/asset?path=ui/icon/060000/060501.tex&format=png",
  APIAssetPathUIIcon060000060502TexFormatPNG = "/api/asset?path=ui/icon/060000/060502.tex&format=png",
  APIAssetPathUIIcon060000060503TexFormatPNG = "/api/asset?path=ui/icon/060000/060503.tex&format=png",
  APIAssetPathUIIcon060000060504TexFormatPNG = "/api/asset?path=ui/icon/060000/060504.tex&format=png",
  APIAssetPathUIIcon060000060505TexFormatPNG = "/api/asset?path=ui/icon/060000/060505.tex&format=png",
  APIAssetPathUIIcon060000060506TexFormatPNG = "/api/asset?path=ui/icon/060000/060506.tex&format=png",
  APIAssetPathUIIcon060000060508TexFormatPNG = "/api/asset?path=ui/icon/060000/060508.tex&format=png",
  APIAssetPathUIIcon060000060801TexFormatPNG = "/api/asset?path=ui/icon/060000/060801.tex&format=png",
  APIAssetPathUIIcon060000060802TexFormatPNG = "/api/asset?path=ui/icon/060000/060802.tex&format=png",
  APIAssetPathUIIcon060000060803TexFormatPNG = "/api/asset?path=ui/icon/060000/060803.tex&format=png",
  APIAssetPathUIIcon060000060804TexFormatPNG = "/api/asset?path=ui/icon/060000/060804.tex&format=png",
  APIAssetPathUIIcon060000060958TexFormatPNG = "/api/asset?path=ui/icon/060000/060958.tex&format=png",
  APIAssetPathUIIcon060000060994TexFormatPNG = "/api/asset?path=ui/icon/060000/060994.tex&format=png",
  APIAssetPathUIIcon063000063926TexFormatPNG = "/api/asset?path=ui/icon/063000/063926.tex&format=png",
  Empty = "",
}
