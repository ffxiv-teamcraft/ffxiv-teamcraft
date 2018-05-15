import {Craft} from '../../../model/garland-tools/craft';
import {CrafterStats} from '../model/crafter-stats';

export const gradeII_infusion_of_str_Recipe: Craft = {
    'id': '32644',
    'job': 14,
    'rlvl': 350,
    'durability': 70,
    'quality': 25881,
    'progress': 3548,
    'lvl': 70,
    'stars': 3,
    'yield': 3,
    'hq': 1,
    'quickSynth': 1,
    'controlReq': 1350,
    'craftsmanshipReq': 1500,
    'unlockId': 22315,
    'ingredients': [
        {
            'id': 21085,
            'amount': 1,
            'quality': 2680
        },
        {
            'id': 19907,
            'amount': 1,
            'quality': 2573
        },
        {
            'id': 19911,
            'amount': 2,
            'quality': 2546
        },
        {
            'id': 20014,
            'amount': 1,
            'quality': 2591
        },
        {
            'id': 19,
            'amount': 2
        },
        {
            'id': 18,
            'amount': 2
        }
    ],
    'complexity': {
        'nq': 165,
        'hq': 170
    }
};

export const infusionOfMind_Recipe: Craft = {
    'id': '3595',
    'job': 14,
    'rlvl': 288,
    'durability': 80,
    'quality': 12913,
    'progress': 2854,
    'lvl': 69,
    'yield': 3,
    'hq': 1,
    'quickSynth': 1,
    'ingredients': [
        {
            'id': 19872,
            'amount': 1,
            'quality': 1244
        },
        {
            'id': 19907,
            'amount': 1,
            'quality': 1313
        },
        {
            'id': 19915,
            'amount': 2,
            'quality': 1313
        },
        {
            'id': 20013,
            'amount': 1,
            'quality': 1272
        },
        {
            'id': 19,
            'amount': 2
        },
        {
            'id': 18,
            'amount': 1
        }
    ],
    'complexity': {
        'nq': 155,
        'hq': 160
    }
};

export const alc_70_350_stats: CrafterStats = new CrafterStats(
    14,
    1467,
    1468,
    474,
    true,
    70);

export const acchan_stats: CrafterStats = new CrafterStats(
    14,
    1500,
    1536,
    539,
    true,
    70);
