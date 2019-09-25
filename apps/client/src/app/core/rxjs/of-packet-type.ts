import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function ofPacketType(
  type: string
): OperatorFunction<any, any> {
  return filter((packet: any) =>
    type === packet.type
  );
}
