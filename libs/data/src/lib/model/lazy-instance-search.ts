export interface LazyInstanceSearch {
  data:  Data;
  de:    string;
  en:    string;
  fr:    string;
  id:    number;
  ja:    string;
  ko:    string;
  lvl:   number;
  patch: number;
  tw?:   string;
  zh?:   string;
}

export interface Data {
  banner: string;
  icon:   Icon;
  id:     number;
  level:  number;
}

export enum Icon {
  APIAssetPathUIIcon061000061801TexFormatPNG = "/api/asset?path=ui/icon/061000/061801.tex&format=png",
  APIAssetPathUIIcon061000061802TexFormatPNG = "/api/asset?path=ui/icon/061000/061802.tex&format=png",
  APIAssetPathUIIcon061000061803TexFormatPNG = "/api/asset?path=ui/icon/061000/061803.tex&format=png",
  APIAssetPathUIIcon061000061804TexFormatPNG = "/api/asset?path=ui/icon/061000/061804.tex&format=png",
  APIAssetPathUIIcon061000061805TexFormatPNG = "/api/asset?path=ui/icon/061000/061805.tex&format=png",
  APIAssetPathUIIcon061000061806TexFormatPNG = "/api/asset?path=ui/icon/061000/061806.tex&format=png",
  APIAssetPathUIIcon061000061808TexFormatPNG = "/api/asset?path=ui/icon/061000/061808.tex&format=png",
  APIAssetPathUIIcon061000061815TexFormatPNG = "/api/asset?path=ui/icon/061000/061815.tex&format=png",
  APIAssetPathUIIcon061000061820TexFormatPNG = "/api/asset?path=ui/icon/061000/061820.tex&format=png",
  APIAssetPathUIIcon061000061823TexFormatPNG = "/api/asset?path=ui/icon/061000/061823.tex&format=png",
  APIAssetPathUIIcon061000061824TexFormatPNG = "/api/asset?path=ui/icon/061000/061824.tex&format=png",
  APIAssetPathUIIcon061000061832TexFormatPNG = "/api/asset?path=ui/icon/061000/061832.tex&format=png",
  APIAssetPathUIIcon061000061836TexFormatPNG = "/api/asset?path=ui/icon/061000/061836.tex&format=png",
  APIAssetPathUIIcon061000061846TexFormatPNG = "/api/asset?path=ui/icon/061000/061846.tex&format=png",
  APIAssetPathUIIcon061000061850TexFormatPNG = "/api/asset?path=ui/icon/061000/061850.tex&format=png",
}
