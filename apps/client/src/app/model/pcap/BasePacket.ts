export interface BasePacket {
  type: string;
  subType: string;
  superType: string;
  opcode: number;
  region: "Global" | "KR" | "CN";
  connection: string;
  operation: "send" | "receive";
  epoch: number;
  packetSize: number;
  segmentType: number;
  data?: Uint8Array;

  [property: string]: any;
}