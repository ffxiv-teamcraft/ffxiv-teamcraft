import { InjectionToken, NgModule } from '@angular/core';
import { RotationTip } from './rotation-tip';
import { Class } from '@kaiu/serializer';
import { UseObserveBeforeFocused } from './tips/use-observe-before-focused';
import { UseDurabilityRestorationLater } from './tips/use-durability-restoration-later';
import { DoNotOverlapBuffs } from './tips/do-not-overlap-buffs';
import { UseRapidSynthesisEarlier } from './tips/use-rapid-synthesis-earlier';
import { UseMoreQualityActions } from './tips/use-more-quality-actions';
import { UsePrudentTouchManipulation } from './tips/use-prudent-touch-manipulation';
import { AvoidUsingGoodActions } from './tips/avoid-using-good-actions';

export const ROTATION_TIPS = new InjectionToken('ROTATION_TIPS');

const tips: Class<RotationTip>[] = [
  UseObserveBeforeFocused,
  UseDurabilityRestorationLater,
  DoNotOverlapBuffs,
  UseRapidSynthesisEarlier,
  UseMoreQualityActions,
  UsePrudentTouchManipulation,
  AvoidUsingGoodActions
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
