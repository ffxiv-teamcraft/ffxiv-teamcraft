import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BasePacket } from '../../model/pcap/BasePacket';

export function ofPacketType(
  type: string,
  subType?: string
): OperatorFunction<any, any> {
  return filter((packet: BasePacket) => {
      let matches = type === packet.type;
      if (packet.superType) {
        matches = matches || type === packet.superType;
      }
      if (subType) {
        matches = matches && packet.subType === subType;
      }
      return matches;
    }
  );
}
