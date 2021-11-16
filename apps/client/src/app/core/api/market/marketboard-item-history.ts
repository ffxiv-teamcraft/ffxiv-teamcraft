export interface MarketboardItemHistory {
  Item: {
    ID: number;
    Icon: string;
    Name: string;
    Name_de: string;
    Name_fr: string;
    Name_en: string;
    Name_ja: string;
    Rarity: number;
    Url: string;
  };
  History: {
    CharacterName: string;
    IsHQ: number;
    PricePerUnit: number;
    PriceTotal: number;
    PurchaseDate: string;
    Quantity: number;
  }[];
}
