export interface LazyFate {
  name:        Description;
  description: Description;
  icon:        Icon;
  level:       number;
  location:    number;
  position?:   Position;
}

export interface Description {
  en: string;
  ja: string;
  de: string;
  fr: string;
}

export enum Icon {
  Empty = "",
  I060000060501PNG = "/i/060000/060501.png",
  I060000060502PNG = "/i/060000/060502.png",
  I060000060503PNG = "/i/060000/060503.png",
  I060000060504PNG = "/i/060000/060504.png",
  I060000060505PNG = "/i/060000/060505.png",
  I060000060506PNG = "/i/060000/060506.png",
  I060000060508PNG = "/i/060000/060508.png",
  I060000060801PNG = "/i/060000/060801.png",
  I060000060802PNG = "/i/060000/060802.png",
  I060000060803PNG = "/i/060000/060803.png",
  I060000060804PNG = "/i/060000/060804.png",
  I060000060958PNG = "/i/060000/060958.png",
  I060000060994PNG = "/i/060000/060994.png",
  I063000063926PNG = "/i/063000/063926.png",
}

export interface Position {
  map:    number;
  zoneid: number;
  x:      number;
  y:      number;
  z:      number;
}
