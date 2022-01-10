export interface CraftedBy {
    itemId: number | string;
    lvl: number;
    stars_tooltip: string;
    id: string;
    job: number;
    yield: number;
    masterbook?: { id: number | string };
    rlvl?: number;
    durability?: number;
    progression?: number;
    quality?: number;
    hq?: 1 | 0;
    quickSynth?: 1 | 0;
    controlReq?: number;
    craftsmanshipReq?: number;
    unlockId?: number;
}

export interface GatheringNode {
    id: number;
    items: number[];
    hiddenItems?: number[];
    limited?: boolean;
    level: number;
    type: number;
    zoneId: number;
}

export interface GatheredBy {
    type: number;
    level: number;
    nodes: GatheringNode[];
    stars_tooltip: string;
    folklore?: number;
}

export interface Vendor {
    npcId: number;
    price: number;
}

export interface TradeEntry {
    id: number | string;
    icon?: number | string;
    amount?: number;
    hq?: boolean;
}

export interface Trade {
    items: TradeEntry[];
    currencies: TradeEntry[];
    requiredGCRank?: number;
    requiredFateRank?: number;
}

export interface TradeSource {
    type?: string;
    trades: Trade[];
}

export interface Ingredient {
    id: number | string;
    amount: number;
}

export interface Item {
    id: number;
    crafting?: CraftedBy[];
    gathering?: GatheredBy;
    vendors?: Vendor[];
    trades?: TradeSource[];
    reduction?: number[];
    requirements?: Ingredient[]
}