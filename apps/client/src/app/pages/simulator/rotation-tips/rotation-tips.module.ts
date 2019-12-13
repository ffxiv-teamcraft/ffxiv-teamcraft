import { InjectionToken, NgModule } from '@angular/core';
import { RotationTip } from './rotation-tip';
import { Class } from '@kaiu/serializer';
import { UseInnerQuiet } from './tips/use-inner-quiet';
import { UseInnerQuietBeforeQuality } from './tips/use-inner-quiet-before-quality';
import { UseObserveBeforeFocused } from './tips/use-observe-before-focused';
import { UseDurabilityRestorationLater } from './tips/use-durability-restoration-later';
import { UsePatientTouchFaster } from './tips/use-patient-touch-faster';
import { DoNotOverlapBuffs } from './tips/do-not-overlap-buffs';
import { UseIngenuityBeforeByregot } from './tips/use-ingenuity-before-byregot';
import { UseRapidSynthesisEarlier } from './tips/use-rapid-synthesis-earlier';
import { UseMoreQualityActions } from './tips/use-more-quality-actions';
import { UsePrudentTouchManipulation } from './tips/use-prudent-touch-manipulation';
import { AvoidUsingGoodActions } from './tips/avoid-using-good-actions';
import { DoNotUseBrandWithoutName } from './tips/do-not-use-brand-without-name';
import { RequiresReuseToProc } from './tips/requires-reuse-to-proc';

export const ROTATION_TIPS = new InjectionToken('ROTATION_TIPS');

const tips: Class<RotationTip>[] = [
  UseInnerQuiet,
  UseInnerQuietBeforeQuality,
  UseObserveBeforeFocused,
  UseDurabilityRestorationLater,
  UsePatientTouchFaster,
  DoNotOverlapBuffs,
  UseIngenuityBeforeByregot,
  UseRapidSynthesisEarlier,
  UseMoreQualityActions,
  UsePrudentTouchManipulation,
  DoNotUseBrandWithoutName,
  AvoidUsingGoodActions,
  RequiresReuseToProc
];

@NgModule({
  providers: [
    {
      provide: ROTATION_TIPS,
      useValue: tips
    }
  ]
})
export class RotationTipsModule {
}
