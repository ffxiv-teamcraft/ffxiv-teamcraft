import { InjectionToken, NgModule } from '@angular/core';
import { RotationTip } from './rotation-tip';
import { Class } from '@kaiu/serializer';
import { UseInnerQuiet } from './tips/use-inner-quiet';
import { UseInnerQuietBeforeQuality } from './tips/use-inner-quiet-before-quality';
import { UseIngenuityIInstead } from './tips/use-ingenuity-I-instead';
import { UseCzEarlier } from './tips/use-cz-earlier';
import { UseReclaim } from './tips/use-reclaim';
import { UseByregotBrowLowIqStacks } from './tips/use-byregot-brow-low-iq-stacks';
import { UseByregotBlessingHighIqStacks } from './tips/use-byregot-blessing-high-iq-stacks';
import { UseSh1Instead } from './tips/use-sh1-instead';
import { UseSh2Instead } from './tips/use-sh2-instead';
import { UsePbpFirst } from './tips/use-pbp-first';
import { UseMumeIfPbp } from './tips/use-mume-if-pbp';
import { UseObserveBeforeFocused } from './tips/use-observe-before-focused';

export const ROTATION_TIPS = new InjectionToken('ROTATION_TIPS');

const tips: Class<RotationTip>[] = [
  UseInnerQuiet,
  UseInnerQuietBeforeQuality,
  UseIngenuityIInstead,
  UseCzEarlier,
  UseReclaim,
  UseByregotBrowLowIqStacks,
  UseByregotBlessingHighIqStacks,
  UseSh1Instead,
  UseSh2Instead,
  UsePbpFirst,
  UseMumeIfPbp,
  UseObserveBeforeFocused
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
