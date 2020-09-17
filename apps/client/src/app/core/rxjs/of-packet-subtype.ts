import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BasePacket } from '../../model/pcap/BasePacket';

export function ofPacketSubType(
  subType: string
): OperatorFunction<any, any> {
  return filter((packet: BasePacket) => {
      return subType === packet.subType;
    }
  );
}
