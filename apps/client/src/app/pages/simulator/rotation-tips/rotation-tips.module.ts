import { InjectionToken, NgModule } from '@angular/core';
import { RotationTip } from './rotation-tip';
import { Class } from '@kaiu/serializer';
import { UseInnerQuiet } from './tips/use-inner-quiet';
import { UseInnerQuietBeforeQuality } from './tips/use-inner-quiet-before-quality';
import { UseIngenuityIInstead } from './tips/use-ingenuity-I-instead';

export const ROTATION_TIPS = new InjectionToken('ROTATION_TIPS');

const tips: Class<RotationTip>[] = [
  UseInnerQuiet,
  UseInnerQuietBeforeQuality,
  UseIngenuityIInstead
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
