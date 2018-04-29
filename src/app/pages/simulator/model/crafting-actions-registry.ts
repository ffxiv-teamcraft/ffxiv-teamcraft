import {CraftingAction} from './actions/crafting-action';
import {BasicSynthesis} from './actions/progression/basic-synthesis';
import {StandardSynthesis} from './actions/progression/standard-synthesis';
import {CarefulSynthesis} from './actions/progression/careful-synthesis';
import {CarefulSynthesisII} from './actions/progression/careful-synthesis-ii';
import {CarefulSynthesisIII} from './actions/progression/careful-synthesis-iii';
import {FlawlessSynthesis} from './actions/progression/flawless-synthesis';
import {PieceByPiece} from './actions/progression/piece-by-piece';
import {RapidSynthesis} from './actions/progression/rapid-synthesis';
import {RapidSynthesisII} from './actions/progression/rapid-synthesis-ii';
import {FocusedSynthesis} from './actions/progression/focused-synthesis';
import {MuscleMemory} from './actions/progression/muscle-memory';
import {BasicTouch} from './actions/quality/basic-touch';
import {StandardTouch} from './actions/quality/standard-touch';
import {AdvancedTouch} from './actions/quality/advanced-touch';
import {ActionType} from './actions/action-type';
import {HastyTouch} from './actions/quality/hasty-touch';
import {HastyTouchII} from './actions/quality/hasty-touch-ii';
import {ByregotsBlessing} from './actions/quality/byregots-blessing';
import {PreciseTouch} from './actions/quality/precise-touch';
import {FocusedTouch} from './actions/quality/focused-touch';
import {PatientTouch} from './actions/quality/patient-touch';
import {PrudentTouch} from './actions/quality/prudent-touch';
import {ComfortZone} from './actions/buff/comfort-zone';
import {Rumination} from './actions/other/rumination';
import {TricksOfTheTrade} from './actions/other/tricks-of-the-trade';
import {MastersMend} from './actions/other/masters-mend';
import {MastersMendII} from './actions/other/masters-mend-ii';
import {Manipulation} from './actions/buff/manipulation';
import {ManipulationII} from './actions/buff/manipulation-ii';
import {InnerQuiet} from './actions/buff/inner-quiet';
import {SteadyHandII} from './actions/buff/steady-hand-ii';
import {SteadyHand} from './actions/buff/steady-hand';
import {Ingenuity} from './actions/buff/ingenuity';
import {IngenuityII} from 'app/pages/simulator/model/actions/buff/ingenuity-ii';
import {GreatStrides} from './actions/buff/great-strides';
import {Innovation} from './actions/buff/innovation';
import {MakersMark} from './actions/buff/makers-mark';
import {InitialPreparations} from './actions/buff/initial-preparations';
import {InnovativeTouch} from './actions/quality/innovative-touch';
import {SpecialtyRefurbish} from './actions/other/specialty-refurbish';
import {SpecialtyReinforce} from './actions/other/specialty-reinforce';
import {SpecialtyReflect} from './actions/other/specialty-reflect';
import {Observe} from './actions/other/observe';
import {Injectable} from '@angular/core';
import {ByregotsMiracle} from './actions/quality/byregots-miracle';
import {ByregotsBrow} from './actions/quality/byregots-brow';

@Injectable()
export class CraftingActionsRegistry {

    private static readonly ALL_ACTIONS: CraftingAction[] = [
        // Progress actions
        new BasicSynthesis(),
        new StandardSynthesis(),
        new FlawlessSynthesis(),
        new CarefulSynthesis(),
        new CarefulSynthesisII(),
        new CarefulSynthesisIII(),
        new PieceByPiece(),
        new RapidSynthesis(),
        new RapidSynthesisII(),
        new FocusedSynthesis(),
        new MuscleMemory(),

        // Quality actions
        new BasicTouch(),
        new StandardTouch(),
        new AdvancedTouch(),
        new HastyTouch(),
        new HastyTouchII(),
        new ByregotsBlessing(),
        new ByregotsBrow(),
        new ByregotsMiracle(),
        new PreciseTouch(),
        new FocusedTouch(),
        new PatientTouch(),
        new PrudentTouch(),
        new InnovativeTouch(),

        // CP recovery
        new ComfortZone(),
        new Rumination(),
        new TricksOfTheTrade(),

        // Repair
        new MastersMend(),
        new MastersMendII(),
        new Manipulation(),
        new ManipulationII(),

        // Buffs
        new InnerQuiet(),
        new SteadyHand(),
        new SteadyHandII(),
        new Ingenuity(),
        new IngenuityII(),
        new GreatStrides(),
        new Innovation(),
        new MakersMark(),
        new InitialPreparations(),

        // Specialties
        new SpecialtyRefurbish(),
        new SpecialtyReinforce(),
        new SpecialtyReflect(),

        // Other
        new Observe(),
    ];

    public getActionsByType(type: ActionType): CraftingAction[] {
        return CraftingActionsRegistry.ALL_ACTIONS.filter(action => action.getType() === type);
    }

}
