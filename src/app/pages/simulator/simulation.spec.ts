import {Simulation} from './simulation/simulation';
import {Craft} from '../../model/garland-tools/craft';
import {CrafterStats} from './model/crafter-stats';
import {BasicSynthesis} from './model/actions/progression/basic-synthesis';
import {SteadyHand} from './model/actions/buff/steady-hand';

const infusionOfMind_Recipe: Craft = {
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

const alc_70_350_stats: CrafterStats = {
    jobId: 14,
    level: 70,
    control: 1450,
    cp: 474,
    craftsmanship: 1468,
    specialist: true,
};

describe('Craft simulator tests', () => {

    it('should be able to predict correct progression on action', () => {
        const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHand(), new BasicSynthesis()], alc_70_350_stats);
        simulation.run();
        expect(simulation.progression).toBeCloseTo(352, 10);
    });

    it('should have a good probability system', () => {
        const results = [];
        // Run simulation 100k times, to be sure with probability
        for (let i = 0; i < 100000; i++) {
            // Basic Synthesis has 90% success rate
            const simulation = new Simulation(infusionOfMind_Recipe, [new BasicSynthesis()], alc_70_350_stats);
            simulation.run();
            results.push(simulation.steps[0].success);
        }
        // Expect around 10k failure, with a 100 precision.
        expect(results.filter(res => !res).length).toBeCloseTo(10000, -2);
    });

    it('should be able to apply steady hand buff properly', () => {
        const results = [];
        // Run simulation 10k times, to be sure with probability
        for (let i = 0; i < 10000; i++) {
            const simulation = new Simulation(infusionOfMind_Recipe, [new SteadyHand(), new BasicSynthesis()], alc_70_350_stats);
            simulation.run();
            results.push(simulation.steps[1].success);
        }
        // Expect no failures, as steady hand ensures 100% success with a 90% skill.
        expect(results.filter(res => !res).length).toBe(0);
    });
});
