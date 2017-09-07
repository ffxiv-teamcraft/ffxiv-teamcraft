import {Complexity} from './complexity';
import {Ingredient} from './ingredient';

export interface Craft {
    id: number;
    job: number;
    rlvl: number;
    durability: number;
    quality: number;
    progress: number;
    lvl: number;
    stars: number;
    controlReq: number;
    craftsmanshipReq: number;
    unlockId: number;
    ingredients: Ingredient[];
    complexity: Complexity;
}
