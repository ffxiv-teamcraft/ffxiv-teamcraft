import { CraftingAction } from './actions/crafting-action';
import { BasicSynthesis } from './actions/progression/basic-synthesis';
import { StandardSynthesis } from './actions/progression/standard-synthesis';
import { CarefulSynthesis } from './actions/progression/careful-synthesis';
import { CarefulSynthesisII } from './actions/progression/careful-synthesis-ii';
import { CarefulSynthesisIII } from './actions/progression/careful-synthesis-iii';
import { FlawlessSynthesis } from './actions/progression/flawless-synthesis';
import { PieceByPiece } from './actions/progression/piece-by-piece';
import { RapidSynthesis } from './actions/progression/rapid-synthesis';
import { RapidSynthesisII } from './actions/progression/rapid-synthesis-ii';
import { FocusedSynthesis } from './actions/progression/focused-synthesis';
import { MuscleMemory } from './actions/progression/muscle-memory';
import { BasicTouch } from './actions/quality/basic-touch';
import { StandardTouch } from './actions/quality/standard-touch';
import { AdvancedTouch } from './actions/quality/advanced-touch';
import { ActionType } from './actions/action-type';
import { HastyTouch } from './actions/quality/hasty-touch';
import { HastyTouchII } from './actions/quality/hasty-touch-ii';
import { ByregotsBlessing } from './actions/quality/byregots-blessing';
import { PreciseTouch } from './actions/quality/precise-touch';
import { FocusedTouch } from './actions/quality/focused-touch';
import { PatientTouch } from './actions/quality/patient-touch';
import { PrudentTouch } from './actions/quality/prudent-touch';
import { ComfortZone } from './actions/buff/comfort-zone';
import { Rumination } from './actions/other/rumination';
import { TricksOfTheTrade } from './actions/other/tricks-of-the-trade';
import { MastersMend } from './actions/other/masters-mend';
import { MastersMendII } from './actions/other/masters-mend-ii';
import { Manipulation } from './actions/buff/manipulation';
import { ManipulationII } from './actions/buff/manipulation-ii';
import { InnerQuiet } from './actions/buff/inner-quiet';
import { SteadyHandII } from './actions/buff/steady-hand-ii';
import { SteadyHand } from './actions/buff/steady-hand';
import { Ingenuity } from './actions/buff/ingenuity';
import { GreatStrides } from './actions/buff/great-strides';
import { Innovation } from './actions/buff/innovation';
import { MakersMark } from './actions/buff/makers-mark';
import { InitialPreparations } from './actions/buff/initial-preparations';
import { InnovativeTouch } from './actions/quality/innovative-touch';
import { SpecialtyRefurbish } from './actions/other/specialty-refurbish';
import { SpecialtyReinforce } from './actions/other/specialty-reinforce';
import { SpecialtyReflect } from './actions/other/specialty-reflect';
import { Observe } from './actions/other/observe';
import { Injectable } from '@angular/core';
import { ByregotsMiracle } from './actions/quality/byregots-miracle';
import { ByregotsBrow } from './actions/quality/byregots-brow';
import { WhistleWhileYouWork } from './actions/buff/whistle-while-you-work';
import { Satisfaction } from './actions/other/satisfaction';
import { NymeiasWheel } from './actions/other/nymeias-wheel';
import { TrainedHand } from './actions/other/trained-hand';
import { HeartOfTheCrafter } from './actions/buff/heart-of-the-crafter';
import { BrandOfFire } from './actions/progression/brand-of-fire';
import { BrandOfWind } from './actions/progression/brand-of-wind';
import { BrandOfEarth } from './actions/progression/brand-of-earth';
import { BrandOfIce } from './actions/progression/brand-of-ice';
import { BrandOfLightning } from './actions/progression/brand-of-lightning';
import { BrandOfWater } from './actions/progression/brand-of-water';
import { NameOfEarth } from './actions/buff/name-of-earth';
import { NameOfIce } from './actions/buff/name-of-ice';
import { NameOfFire } from './actions/buff/name-of-fire';
import { NameOfTheWind } from './actions/buff/name-of-the-wind';
import { NameOfLightning } from './actions/buff/name-of-lightning';
import { NameOfWater } from './actions/buff/name-of-water';
import { WasteNot } from './actions/buff/waste-not';
import { WasteNotII } from './actions/buff/waste-not-ii';
import { IngenuityII } from './actions/buff/ingenuity-ii';
import { Reclaim } from './actions/buff/reclaim';

@Injectable()
export class CraftingActionsRegistry {

  private static ACTION_IMPORT_NAMES: { short: string, full: string }[] = [
    { short: 'observe', full: 'Observe' },
    { short: 'basicSynth', full: 'BasicSynthesis' },
    { short: 'standardSynthesis', full: 'StandardSynthesis' },
    { short: 'carefulSynthesis', full: 'CarefulSynthesis' },
    { short: 'carefulSynthesis2', full: 'CarefulSynthesisII' },
    { short: 'rapidSynthesis', full: 'RapidSynthesis' },
    { short: 'flawlessSynthesis', full: 'FlawlessSynthesis' },
    { short: 'pieceByPiece', full: 'PieceByPiece' },
    { short: 'basicTouch', full: 'BasicTouch' },
    { short: 'standardTouch', full: 'StandardTouch' },
    { short: 'advancedTouch', full: 'AdvancedTouch' },
    { short: 'hastyTouch', full: 'HastyTouch' },
    { short: 'byregotsBlessing', full: 'ByregotsBlessing' },
    { short: 'mastersMend', full: 'MastersMend' },
    { short: 'mastersMend2', full: 'MastersMendII' },
    { short: 'rumination', full: 'Rumination' },
    { short: 'tricksOfTheTrade', full: 'TricksOfTheTrade' },
    { short: 'innerQuiet', full: 'InnerQuiet' },
    { short: 'manipulation', full: 'Manipulation' },
    { short: 'comfortZone', full: 'ComfortZone' },
    { short: 'steadyHand', full: 'SteadyHand' },
    { short: 'steadyHand2', full: 'SteadyHandII' },
    { short: 'wasteNot', full: 'WasteNot' },
    { short: 'wasteNot2', full: 'WasteNotII' },
    { short: 'innovation', full: 'Innovation' },
    { short: 'greatStrides', full: 'GreatStrides' },
    { short: 'ingenuity', full: 'Ingenuity' },
    { short: 'ingenuity2', full: 'IngenuityII' },
    { short: 'byregotsBrow', full: 'ByregotsBrow' },
    { short: 'preciseTouch', full: 'PreciseTouch' },
    { short: 'makersMark', full: 'MakersMark' },
    { short: 'muscleMemory', full: 'MuscleMemory' },
    { short: 'whistle', full: 'WhistleWhileYouWork' },
    { short: 'satisfaction', full: 'Satisfaction' },
    { short: 'innovativeTouch', full: 'InnovativeTouch' },
    { short: 'nymeiasWheel', full: 'NymeiasWheel' },
    { short: 'byregotsMiracle', full: 'ByregotsMiracle' },
    { short: 'trainedHand', full: 'TrainedHand' },
    { short: 'brandOfEarth', full: 'BrandOfEarth' },
    { short: 'brandOfFire', full: 'BrandOfFire' },
    { short: 'brandOfIce', full: 'BrandOfIce' },
    { short: 'brandOfLightning', full: 'BrandOfLightning' },
    { short: 'brandOfWater', full: 'BrandOfWater' },
    { short: 'brandOfWind', full: 'BrandOfWind' },
    { short: 'nameOfEarth', full: 'NameOfEarth' },
    { short: 'nameOfFire', full: 'NameOfFire' },
    { short: 'nameOfIce', full: 'NameOfIce' },
    { short: 'nameOfLightning', full: 'NameOfLightning' },
    { short: 'nameOfWater', full: 'NameOfWater' },
    { short: 'nameOfWind', full: 'NameOfTheWind' },
    { short: 'hastyTouch2', full: 'HastyTouchII' },
    { short: 'carefulSynthesis3', full: 'CarefulSynthesisIII' },
    { short: 'rapidSynthesis2', full: 'RapidSynthesisII' },
    { short: 'patientTouch', full: 'PatientTouch' },
    { short: 'manipulation2', full: 'ManipulationII' },
    { short: 'prudentTouch', full: 'PrudentTouch' },
    { short: 'focusedSynthesis', full: 'FocusedSynthesis' },
    { short: 'focusedTouch', full: 'FocusedTouch' },
    { short: 'initialPreparations', full: 'InitialPreparations' },
    { short: 'specialtyReinforce', full: 'SpecialtyReinforce' },
    { short: 'specialtyRefurbish', full: 'SpecialtyRefurbish' },
    { short: 'specialtyReflect', full: 'SpecialtyReflect' },
    { short: 'strokeOfGenius', full: 'StrokeOfGenius' },
    { short: 'finishingTouches', full: 'FinishingTouches' },
    { short: 'reclaim', full: 'Reclaim' }
  ];

  private static readonly ALL_ACTIONS: { name: string, action: CraftingAction }[] = [
    // Progress actions
    { name: 'BasicSynthesis', action: new BasicSynthesis() },
    { name: 'StandardSynthesis', action: new StandardSynthesis() },
    { name: 'FlawlessSynthesis', action: new FlawlessSynthesis() },
    { name: 'CarefulSynthesis', action: new CarefulSynthesis() },
    { name: 'CarefulSynthesisII', action: new CarefulSynthesisII() },
    { name: 'CarefulSynthesisIII', action: new CarefulSynthesisIII() },
    { name: 'PieceByPiece', action: new PieceByPiece() },
    { name: 'RapidSynthesis', action: new RapidSynthesis() },
    { name: 'RapidSynthesisII', action: new RapidSynthesisII() },
    { name: 'FocusedSynthesis', action: new FocusedSynthesis() },
    { name: 'MuscleMemory', action: new MuscleMemory() },
    { name: 'BrandOfWind', action: new BrandOfWind() },
    { name: 'BrandOfFire', action: new BrandOfFire() },
    { name: 'BrandOfIce', action: new BrandOfIce() },
    { name: 'BrandOfEarth', action: new BrandOfEarth() },
    { name: 'BrandOfLightning', action: new BrandOfLightning() },
    { name: 'BrandOfWater', action: new BrandOfWater() },

    // Quality actions
    { name: 'BasicTouch', action: new BasicTouch() },
    { name: 'StandardTouch', action: new StandardTouch() },
    { name: 'AdvancedTouch', action: new AdvancedTouch() },
    { name: 'HastyTouch', action: new HastyTouch() },
    { name: 'HastyTouchII', action: new HastyTouchII() },
    { name: 'ByregotsBlessing', action: new ByregotsBlessing() },
    { name: 'ByregotsBrow', action: new ByregotsBrow() },
    { name: 'ByregotsMiracle', action: new ByregotsMiracle() },
    { name: 'PreciseTouch', action: new PreciseTouch() },
    { name: 'FocusedTouch', action: new FocusedTouch() },
    { name: 'PatientTouch', action: new PatientTouch() },
    { name: 'PrudentTouch', action: new PrudentTouch() },
    { name: 'InnovativeTouch', action: new InnovativeTouch() },

    // CP recovery
    { name: 'ComfortZone', action: new ComfortZone() },
    { name: 'Rumination', action: new Rumination() },
    { name: 'TricksOfTheTrade', action: new TricksOfTheTrade() },
    { name: 'Satisfaction', action: new Satisfaction() },

    // Repair
    { name: 'MastersMend', action: new MastersMend() },
    { name: 'MastersMendII', action: new MastersMendII() },
    { name: 'Manipulation', action: new Manipulation() },
    { name: 'ManipulationII', action: new ManipulationII() },
    { name: 'NymeiasWheel', action: new NymeiasWheel() },

    // Buffs
    { name: 'InnerQuiet', action: new InnerQuiet() },
    { name: 'SteadyHand', action: new SteadyHand() },
    { name: 'SteadyHandII', action: new SteadyHandII() },
    { name: 'WasteNot', action: new WasteNot() },
    { name: 'WasteNotII', action: new WasteNotII() },
    { name: 'Ingenuity', action: new Ingenuity() },
    { name: 'IngenuityII', action: new IngenuityII() },
    { name: 'GreatStrides', action: new GreatStrides() },
    { name: 'Innovation', action: new Innovation() },
    { name: 'MakersMark', action: new MakersMark() },
    { name: 'InitialPreparations', action: new InitialPreparations() },
    { name: 'WhistleWhileYouWork', action: new WhistleWhileYouWork() },
    { name: 'HeartOfTheCrafter', action: new HeartOfTheCrafter() },
    { name: 'NameOfTheWind', action: new NameOfTheWind() },
    { name: 'NameOfFire', action: new NameOfFire() },
    { name: 'NameOfIce', action: new NameOfIce() },
    { name: 'NameOfEarth', action: new NameOfEarth() },
    { name: 'NameOfLightning', action: new NameOfLightning() },
    { name: 'NameOfWater', action: new NameOfWater() },

    // Specialties
    { name: 'SpecialtyRefurbish', action: new SpecialtyRefurbish() },
    { name: 'SpecialtyReinforce', action: new SpecialtyReinforce() },
    { name: 'SpecialtyReflect', action: new SpecialtyReflect() },

    // Other
    { name: 'Observe', action: new Observe() },
    { name: 'TrainedHand', action: new TrainedHand() },
    { name: 'Reclaim', action: new Reclaim() }
  ];

  public getActionsByType(type: ActionType): CraftingAction[] {
    return CraftingActionsRegistry.ALL_ACTIONS.filter(row => row.action.getType() === type)
      .map(row => row.action);
  }

  public importFromCraftOpt(importArray: string[]): CraftingAction[] {
    return importArray.map(row => {
      const found = CraftingActionsRegistry.ACTION_IMPORT_NAMES
        .find(action => action.short === row);
      if (found === undefined) {
        return undefined;
      }
      return CraftingActionsRegistry.ALL_ACTIONS
        .find(el => {
          return el.name === found.full;
        });
    })
      .filter(action => action !== undefined)
      .map(row => row.action);
  }

  public exportToCraftOpt(actionNames: string[]): string {
    return JSON.stringify(actionNames.map(actionName => {
      return CraftingActionsRegistry.ACTION_IMPORT_NAMES
        .find(el => {
          return el.full === actionName;
        });
    })
      .filter(action => action !== undefined)
      .map(row => row.short));
  }

  public createFromIds(ids: number[]): CraftingAction[] {
    return ids.map(id => {
      const found = CraftingActionsRegistry.ALL_ACTIONS.find(row => row.action.getIds().indexOf(id) > -1);
      if (found !== undefined) {
        return found.action;
      }
      return undefined;
    })
      .filter(action => action !== undefined);
  }

  public serializeRotation(rotation: CraftingAction[]): string[] {
    return rotation.map(action => {
      const actionRow = CraftingActionsRegistry.ALL_ACTIONS.find(row => row.action === action);
      if (actionRow !== undefined) {
        return actionRow.name;
      }
      return undefined;
    }).filter(action => action !== undefined);
  }

  public deserializeRotation(rotation: string[]): CraftingAction[] {
    return rotation.map(actionName => CraftingActionsRegistry.ALL_ACTIONS.find(row => row.name === actionName))
      .filter(action => action !== undefined)
      .map(row => row.action);
  }
}
