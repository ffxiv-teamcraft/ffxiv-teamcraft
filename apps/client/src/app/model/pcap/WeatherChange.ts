import { BasePacket } from './BasePacket';

export interface WeatherChange extends BasePacket {
  weatherID: number;
  delay: number;
}