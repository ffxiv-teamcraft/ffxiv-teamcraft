import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function ofPacketSubType(
  subType: string
): OperatorFunction<any, any> {
  return filter((packet: any) => {
      return subType === packet.subType;
    }
  );
}
