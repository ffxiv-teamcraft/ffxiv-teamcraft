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
import {WhistleWhileYouWork} from './actions/buff/whistle-while-you-work';
import {Satisfaction} from './actions/other/satisfaction';
import {NymeiasWheel} from './actions/other/nymeias-wheel';
import {TrainedHand} from './actions/other/trained-hand';
import {HeartOfTheCrafter} from './actions/buff/heart-of-the-crafter';
import {BrandOfFire} from './actions/progression/brand-of-fire';
import {BrandOfWind} from './actions/progression/brand-of-wind';
import {BrandOfEarth} from './actions/progression/brand-of-earth';
import {BrandOfIce} from './actions/progression/brand-of-ice';
import {BrandOfLightning} from './actions/progression/brand-of-lightning';
import {BrandOfWater} from './actions/progression/brand-of-water';
import {NameOfEarth} from './actions/buff/name-of-earth';
import {NameOfIce} from './actions/buff/name-of-ice';
import {NameOfFire} from './actions/buff/name-of-fire';
import {NameOfTheWind} from './actions/buff/name-of-the-wind';
import {NameOfLightning} from './actions/buff/name-of-lightning';
import {NameOfWater} from './actions/buff/name-of-water';

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
        new BrandOfWind(),
        new BrandOfFire(),
        new BrandOfIce(),
        new BrandOfEarth(),
        new BrandOfLightning(),
        new BrandOfWater(),

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
        new Satisfaction(),

        // Repair
        new MastersMend(),
        new MastersMendII(),
        new Manipulation(),
        new ManipulationII(),
        new NymeiasWheel(),

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
        new WhistleWhileYouWork(),
        new HeartOfTheCrafter(),
        new NameOfTheWind(),
        new NameOfFire(),
        new NameOfIce(),
        new NameOfEarth(),
        new NameOfLightning(),
        new NameOfWater(),

        // Specialties
        new SpecialtyRefurbish(),
        new SpecialtyReinforce(),
        new SpecialtyReflect(),

        // Other
        new Observe(),
        new TrainedHand(),
    ];

    public getActionsByType(type: ActionType): CraftingAction[] {
        return CraftingActionsRegistry.ALL_ACTIONS.filter(action => action.getType() === type);
    }

    public serializeRotation(rotation: CraftingAction[]): string[] {
        return rotation.map(action => action.getName());
    }

    public deserializeRotation(rotation: string[]): CraftingAction[] {
        return rotation.map(actionName => CraftingActionsRegistry.ALL_ACTIONS.find(el => el.getName() === actionName))
            .filter(action => action !== undefined);
    }
}
